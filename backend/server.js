const {chacha20Crypt, fromHex} = require('./chacha20.js')
const {eccDecrypt, eccEncrypt} = require('./ecc.js')
const { PassThrough } = require('stream');

const express = require("express")
const https = require('https');
const fs = require("fs");
const cors = require("cors")
const multer = require('multer')
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
require('dotenv').config();
const path = require('path')
const crypto = require('crypto');
//import { Auth } from 'aws-amplify';


const app = express()
app.use(bodyParser.json());

// SSL/TLS certificates
const options = {
    key: fs.readFileSync(path.join(__dirname, 'ssl', 'Local.key')),
    cert: fs.readFileSync(path.join(__dirname, 'ssl', 'Local.crt'))
};



// Configure AWS SDK
AWS.config.update({
    accessKeyId: 'AKIASICVM7JBMRCV35AP',
    secretAccessKey: '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',
    region: 'us-east-1'
});

AWS.config.update({
    logger: console
});
  
  // Create S3 instance
const s3 = new AWS.S3();

// Create DynamoDB instance
const docClient = new AWS.DynamoDB.DocumentClient();
const dynamodb = new AWS.DynamoDB();

// Enable CORS for all routes
app.use(cors())
app.use(express.json())
let currentUserEmail; // Variable to store the currently logged in user's email


const cognito = new AWS.CognitoIdentityServiceProvider({
    apiVersion: '2016-04-18',
    region: 'us-east-1'
  });
app.use(bodyParser.json());

async function createTableForUser(email) {
    const tableName = email.replace(/[^a-zA-Z0-9]/g, "_"); // Replace non-alphanumeric characters with underscore
    const params = {
        TableName: tableName,
        KeySchema: [{ AttributeName: 'fileId', KeyType: 'HASH' }],
        AttributeDefinitions: [
            { AttributeName: 'fileId', AttributeType: 'S' }
        ],
        ProvisionedThroughput: { ReadCapacityUnits: 5, WriteCapacityUnits: 5 }
    };

    // Check if table already exists
    try {
        await dynamodb.describeTable({ TableName: tableName }).promise();
        console.log(`Table already exists for user ${email}`);
        return; // Exit function if table already exists
    } catch (error) {
        if (error.code !== 'ResourceNotFoundException') {
            console.error(`Error describing table for user ${email}:`, error);
            throw error; // Rethrow error if it's not a ResourceNotFoundException
        }
    }

    // Create table if it doesn't exist
    try {
        await dynamodb.createTable(params).promise();
        console.log(`Table created for user ${email}`);
    } catch (error) {
        console.error(`Error creating table for user ${email}:`, error);
        throw error;
    }
}



app.post('/signup', async (req, res) => {
    const { name, email, password, publicX, publicY} = req.body;

    const params = {
        ClientId: '2po0vi3m62h4gehm0ea1fp7brb',
        Password: password,
        Username: email,
        UserAttributes: [
        {
            Name: 'email',
            Value: email
        },
        {
            Name: 'name',
            Value: name
        },
        {
            Name: 'custom:pubX',
            Value: publicX
        },
        {
            Name: 'custom:pubY',
            Value: publicY
        }
        ]
    };

    try {
        const data = await cognito.signUp(params).promise();
        console.log('User signup successful:', data);

        // Send a success response
        res.json({ success: true, message: 'User signed up successfully' });

        /* Check if the user has already been confirmed
        const userParams = {
            UserPoolId: 'us-east-1_QiFJYT6YJ',
            Username: email
        };

        const userData = await cognito.adminGetUser(userParams).promise();
        const userConfirmed = userData.UserStatus === 'CONFIRMED';

        // Send verification code to user's email only if the user has not been confirmed
        if (!userConfirmed) {
            const verificationParams = {
                ClientId: '2po0vi3m62h4gehm0ea1fp7brb',
                Username: email
            };

            await cognito.resendConfirmationCode(verificationParams).promise();
            console.log('Verification code sent to user email:', email);
        } else {
            console.log('User email is already confirmed');
        }*/
    } catch (error) {
        console.error('User signup error:', error);
        // Send an error response
        res.status(400).json({ success: false, message: error.message });
    }
});

app.post('/forgotpassword', async (req, res) => {
    const { email } = req.body;
    const params = {
        ClientId: '2po0vi3m62h4gehm0ea1fp7brb',
        Username: email,
    };
    try {
        // Initiate the forgot password request
        await cognito.forgotPassword(params).promise();
        console.log('Forgot password request initiated successfully');
        // Send a success response
        res.json({ success: true, message: 'Password reset request initiated successfully. Please check your email for further instructions.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        if (error.code === 'UserNotFoundException') {
            res.status(400).json({ success: false, message: 'The provided email address is not registered. Please try again with a valid email address.' });
        } else {
            // For other errors, send a generic error message
            res.status(400).json({ success: false, message: 'Failed to initiate password reset. Please try again later.' });
        }
    }
});

app.post("/verifypassword", async (req, res) => {
    const { email, otp, newPassword } = req.body;
  
    const params = {
      ClientId: "2po0vi3m62h4gehm0ea1fp7brb",
      ConfirmationCode: otp,
      Username: email,
      Password: newPassword,
    };
  
    try {
      const data = await cognito.confirmForgotPassword(params).promise();
      console.log("Password changed successfully:", data);
      res.json({
        success: true,
        message: "Password changed successfully.",
      });
    } catch (error) {
      console.error("Password change error:", error);
      res.status(400).json({
        success: false,
        message: "Failed to change password. Please try again later.",
      });
    }
  });

app.post("/verifyotp", async (req, res) => {
    const { otp, email } = req.body; // Extract email from the request body
    const params = {
        ClientId: '2po0vi3m62h4gehm0ea1fp7brb',
        ConfirmationCode: otp,
        Username: email, // Use the provided email instead of a hard-coded value
    };

    try {
        // Confirm the sign-up with the OTP
        const data = await cognito.confirmSignUp(params).promise();
        console.log("Email verification successful:", data);

        

        // Send response based on confirmation status
        res.status(200).json({
            success: true,
            message: "OTP verification successful",
            confirmed: 'CONFIRMED'
        });
    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(400).json({
            success: false,
            message: "Failed to verify OTP. Please try again later.",
        });
    }
});





  // Endpoint for user login
app.post('/login', async (req, res) => {
const { email, password } = req.body;

const params = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: '2po0vi3m62h4gehm0ea1fp7brb',
    AuthParameters: {
    USERNAME: email,
    PASSWORD: password
    }
};

try {
    const data = await cognito.initiateAuth(params).promise();
    console.log('Authentication successful:', data);
    currentUserEmail = email; // Store the currently logged in user's email
    createTableForUser(email);
    // You can send a success response with user token or any other necessary data
    res.json({ success: true, token: data.AuthenticationResult.AccessToken });
} catch (error) {
    console.error('Authentication error:', error);
    // Send an error response
    res.status(400).json({ success: false, message: 'Invalid email or password' });
}
});

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        return cb(null, "public/files")
    },
    filename: function(req, file, cb){
        return cb(null, `${file.originalname}`)
    }
})


const upload = multer({storage})

function readFileAsUint8Array(filePath) {
    try{
        return fs.readFileSync(filePath);
    }
    catch(error){
        console.error('Error writing data to file:', error);
    }
}
  
  // Function to write a Uint8Array to a file
function writeUint8ArrayToFile(uint8Array, filePath) {
    try{
        fs.writeFileSync(filePath, uint8Array);
    }
    catch(error){
        console.error('Error writing data to file:', error);
    }
}

app.post('/upload', upload.single('file'), async (req, res) => {
    // Fetch the user's attributes from Amazon Cognito
    let pubX, pubY;
    try {
        const userData = await cognito.adminGetUser({
            UserPoolId: 'us-east-1_QiFJYT6YJ',
            Username: currentUserEmail
        }).promise();

        // Extract pubX and pubY attributes from user data
        pubX = userData.UserAttributes.find(attr => attr.Name === 'custom:pubX')?.Value;
        pubY = userData.UserAttributes.find(attr => attr.Name === 'custom:pubY')?.Value;
    } catch (error) {
        console.error('Error fetching user attributes from Cognito:', error);
        return res.status(500).send('Error fetching user attributes from Cognito');
    }

    const publicKey = {
        x: BigInt(pubX),
        y: BigInt(pubY)
    };

    const rkey = crypto.randomBytes(32).toString('hex');
    const rnonce = crypto.randomBytes(12).toString('hex');
    const key = fromHex(rkey);
    const nonce = fromHex(rnonce);
    
    // Read file as Uint8Array
    const fileData = readFileAsUint8Array(req.file.path);
    if (!fileData) {
        return res.status(500).send("Error reading uploaded file");
    }
    // Create promises for eccEncrypt and chacha20Crypt
    const eccEncryptPromise = eccEncrypt(rkey, publicKey);
    const chacha20CryptPromise = chacha20Crypt(fileData, key, nonce);

    try {
        // Run both promises in parallel
        const [eccEncryptResult, encryptedData] = await Promise.all([
            eccEncryptPromise,
            chacha20CryptPromise
        ]);

        console.log("Encryption complete...");

        const { ephemeralPublicKey, ciphertext } = eccEncryptResult;


        // Write encrypted data to temporary file
        writeUint8ArrayToFile(encryptedData, req.file.path);
        //awsData = hexToText(uint8ArrayToHex(encryptedData));

        const params = {
            Bucket: 'amplify-forefender-dev-20309-deployment',
            Key: req.file.originalname,
            Body: encryptedData // Upload the encrypted data
        };

        // Upload encrypted file to S3
        s3.upload(params, (s3Err, s3Data) => {
            if (s3Err) {
                console.error(s3Err);
                return res.status(500).send("Error uploading encrypted file to S3");
            }

            console.log('Encrypted file uploaded to S3:', s3Data.Location);

            // Delete the temporary file after processing
            fs.unlink(req.file.path, (unlinkErr) => {
                if (unlinkErr) {
                    console.error("Error deleting local file:", unlinkErr);
                }
                console.log('Local file deleted successfully.');
            });

            // Store S3 data information in DynamoDB
            const dynamoDBParams = {
                TableName: currentUserEmail.replace(/[^a-zA-Z0-9]/g, "_"),
                Item: {
                    fileId: req.file.originalname,
                    s3Location: s3Data.Location,
                    filetype: req.file.mimetype,
                    Cnonce: rnonce,
                    Ckey: ciphertext.toString(),
                    ePublicX: ephemeralPublicKey.x.toString(),
                    ePublicY: ephemeralPublicKey.y.toString()
                    // Add more attributes as needed
                }
            };

            docClient.put(dynamoDBParams, (dynamoErr, dynamoData) => {
                if (dynamoErr) {
                    console.error(dynamoErr);
                    return res.status(500).send("Error storing S3 data information in DynamoDB");
                }

                console.log('S3 data information stored in DynamoDB:', dynamoData);
                // Send a response indicating success
                res.status(200).send("Encrypted file uploaded to S3 and data information stored in DynamoDB successfully");
            });
         });
    } catch (error) {
        console.error('Error during encryption:', error);
        res.status(500).send('Error during encryption');
    }
});

// Function to perform DynamoDB scan operation
function scanEpisodesTable(callback) {
    
    // Create DynamoDB service object.
    //const ddb = new AWS.DynamoDB({ apiVersion: "2012-08-10" });
  
    const params = {
        TableName: currentUserEmail.replace(/[^a-zA-Z0-9]/g, "_"),
        ProjectionExpression: "fileId, s3Location, filetype", // Define the attributes that you want to retrieve
    };
  
    docClient.scan(params, function (err, data) {
        if (err) {
            console.error("Error scanning episodes table:", err);
            callback(err, null);
        } else {
            console.log("Success", data);
            callback(null, data.Items);
        }
    });
}

// Endpoint to trigger the DynamoDB scan operation
app.get("/scanEpisodes", async (req, res) => {
    try {
        scanEpisodesTable((err, items) => {
            if (err) {
                console.error("Error scanning episodes table:", err);
                res.status(500).json({ success: false, message: "Failed to scan episodes table" });
            } else {
                res.status(200).json(items);
            }
        });
    } catch (error) {
        console.error("Error scanning episodes table:", error);
        res.status(500).json({ success: false, message: "Failed to scan episodes table" });
    }
});

app.get('/getEphemeralPublicKey', async (req, res) => {
    const fileId  = req.query.fileId;
    const dynamoParams = {
        TableName: currentUserEmail?.replace(/[^a-zA-Z0-9]/g, "_"),
        Key: { fileId: fileId }
    };
    console.log("par: ", dynamoParams);
    try {
        const dynamoData = await docClient.get(dynamoParams).promise();
        console.log("item: ", dynamoData.Item);
        // Check if data was retrieved successfully
        if (!dynamoData.Item) {
            return res.status(404).send('File metadata not found in DynamoDB');
        }

        const { ePublicX, ePublicY } = dynamoData.Item;
        
        res.json({ ePublicX, ePublicY});
    }
    catch(error) {
        console.error('Error fetching ephemeral key:', error);
        res.status(500).send('Error ephemeral key retrieval');
    }
  });

// Endpoint to handle file download
app.post('/downloadAndStore', async (req, res) => {
    const { fileId, keyX, keyY } = req.body; // Extract fileId from request body

    // Construct the S3 download parameters
    const params = {
        Bucket: 'amplify-forefender-dev-20309-deployment',
        Key: fileId,
    };

    try {
        // Download file from S3
        const data = await s3.getObject(params).promise();
        //console.log("content: ", data.Body);

        // Retrieve nonce and key from DynamoDB based on fileId
        const dynamoParams = {
            TableName: currentUserEmail?.replace(/[^a-zA-Z0-9]/g, "_"), // Optional chaining used here
            Key: { fileId: fileId }
        };

        const dynamoData = await docClient.get(dynamoParams).promise();

        // Check if data was retrieved successfully
        if (!dynamoData.Item) {
            return res.status(404).send('File metadata not found in DynamoDB');
        }

        const { Ckey, Cnonce } = dynamoData.Item;
        const cipherKey = BigInt(Ckey);
        const sharedSecret = {
            x: BigInt(keyX),
            y: BigInt(keyY)
        }
        const key = eccDecrypt(cipherKey, sharedSecret )
        // Decrypt the file data using ChaCha20
        const decryptedData = chacha20Crypt(data.Body, fromHex(key), fromHex(Cnonce));

        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename=${fileId}`, // Specify the filename for download
            'Content-Length': decryptedData.length
        });

        // Create a stream from the decrypted data
        const stream = new PassThrough();
        stream.end(decryptedData);

        // Pipe the stream to the response
        stream.pipe(res);

    } catch (error) {
        console.error('Error downloading and storing file:', error);
        res.status(500).send('Error downloading and storing file');
    }
});

app.post('/deleteFile', async (req, res) => {
    const { fileId } = req.body;
  
    try {/*
      //Delete file from S3 bucket
      const s3Params = {
        Bucket: 'amplify-forefender-dev-20309-deployment',
        Key: fileId,
      };
      await s3.deleteObject(s3Params).promise();
    */
      // Delete file metadata from DynamoDB
      const dynamoParams = {
        TableName: currentUserEmail.replace(/[^a-zA-Z0-9]/g, "_"),
        Key: { fileId: fileId },
      };
      await docClient.delete(dynamoParams).promise();

      const s3Params = {
        Bucket: 'amplify-forefender-dev-20309-deployment',
        Key: fileId,
      };
      await s3.deleteObject(s3Params).promise();
  
      res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Error deleting file:', error);
      res.status(500).send('Error deleting file');
    }
          });


https.createServer(options, app).listen(443, () => {
    console.log('HTTPS server running on port 443');
});