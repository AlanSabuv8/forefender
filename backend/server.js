const {chacha20Crypt, fromHex, uint8ArrayToHex, hexToText} = require('./chacha20.js')

const express = require("express")
const fs = require("fs");
const cors = require("cors")
const multer = require('multer')
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
require('dotenv').config();
//const path = require('path')
const crypto = require('crypto');
//import { Auth } from 'aws-amplify';


const app = express()
app.use(bodyParser.json());


// Configure AWS SDK
AWS.config.update({
    accessKeyId: 'AKIASICVM7JBMRCV35AP',
    secretAccessKey: '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',
    region: 'us-east-1'
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
        AttributeDefinitions: [{ AttributeName: 'fileId', AttributeType: 'S' }],
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

app.post("/verifyotp", async (req, res) => {
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
 
app.post('/signup', async (req, res) => {
const { name, email, password } = req.body;

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
    }
    ]
};

try {
    const data = await cognito.signUp(params).promise();
    console.log('User signup successful:', data);

    // Send a success response
    res.json({ success: true, message: 'User signed up successfully' });

    // Check if the user has already been confirmed
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
    }
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

app.post("/verifotp", async (req, res) => {
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

        // Check confirmation status after OTP verification
        const userParams = {
            UserPoolId: 'us-east-1_QiFJYT6YJ',
            Username: email
        };

        const userData = await cognito.adminGetUser(userParams).promise();
        const userConfirmed = userData.UserStatus === 'CONFIRMED';

        // Send response based on confirmation status
        res.status(200).json({
            success: true,
            message: "OTP verification successful",
            confirmed: userConfirmed
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

app.post('/upload', upload.single('file'), (req, res) => {
    console.log(req.body);
    console.log(req.file);
    const rkey = crypto.randomBytes(32).toString('hex');
    const rnonce = crypto.randomBytes(12).toString('hex');
    console.log(rkey);
    console.log(rnonce);
    const key = fromHex(rkey);
    const nonce = fromHex(rnonce);

    // Read file as Uint8Array
    const fileData = readFileAsUint8Array(req.file.path);
    if (!fileData) {
        return res.status(500).send("Error reading uploaded file");
    }

    // Encrypt the file data
    const encryptedData = chacha20Crypt(fileData, key, nonce);

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
                filetype: req.file.mimetype
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
// Endpoint to handle file download
app.get('/download/:key', (req, res) => {
    const key = req.params.key; // File key in S3 bucket
    const params = {
      Bucket: 'amplify-forefender-dev-20309-deployment',
      Key: key,
    };
  
    s3.getObject(params, (err, data) => {
      if (err) {
        console.error('Error downloading file from S3:', err);
        return res.status(500).send('Error downloading file from S3');
      }
  
      res.setHeader('Content-Disposition', `attachment; filename=${key}`);
      res.setHeader('Content-Type', data.ContentType);
      res.send(data.Body);
    });
  });
    /*try {
        // Retrieve data from DynamoDB based on the logged-in user's email
        const tableName = currentUserEmail.replace(/[^a-zA-Z0-9]/g, "_");
        const params = {
            TableName: tableName
        };*/

       


app.listen(5000, () => {console.log("Server started on port 5000")})