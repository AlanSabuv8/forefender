const {enc, fromHex, chacha20Crypt} = require('./chacha20.js')

const express = require("express")
const fs = require("fs");
const cors = require("cors")
const multer = require('multer')
const AWS = require('aws-sdk');
require('dotenv').config();
//import { Auth } from 'aws-amplify';
const path = require('path')
const crypto = require('crypto');


const app = express()

// Enable CORS for all routes
app.use(cors())
app.use(express.json())

const key = fromHex(crypto.randomBytes(32).toString('hex'));
const nonce = fromHex(crypto.randomBytes(12).toString('hex'));

const cognito = new AWS.CognitoIdentityServiceProvider({
    apiVersion: '2016-04-18',
    region: 'us-east-1'
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
} catch (error) {
    console.error('User signup error:', error);
    // Send an error response
    res.status(400).json({ success: false, message: error.message });
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

// Function to read a file as a Uint8Array
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
  


function addSuffixToFileName(filePath, suffix) {
    const extension = path.extname(filePath);
    const fileNameWithoutExtension = path.basename(filePath, extension);
    const directory = path.dirname(filePath);
    return path.join(directory, `${fileNameWithoutExtension}${suffix}${extension}`);
}

app.post('/upload', upload.single('file'), (req, res) => {
    //console.log(req.body);
    //console.log(req.file);
    console.log(req.file.mimetype);
    

    //if (type == 'application/pdf'){
        const pdfData = readFileAsUint8Array(req.file.path);
        //console.log(pdfData)
        const modifiedData = chacha20Crypt(pdfData, key, nonce);
        //console.log(modifiedData)
        const newFilePath = true ? addSuffixToFileName(req.file.path, '_encrypted') : addSuffixToFileName(req.file.path, '_decrypted');
        writeUint8ArrayToFile(modifiedData, newFilePath);
        res.json({ success: true, message: 'File encrypted and replaced successfully' });

    //}
    /*else{
        fs.readFile(req.file.path, "utf-8", (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error reading uploaded file");
        }

        //console.log(data)


        const newData = enc(data, key, nonce, type)

        //console.log(newData)

        // Alternatively, convert data to hexadecimal
        //const hexadecimalData = data.toString("hex");

        // Send the converted data back to the client or do further processing
        //res.send({ uint8ArrayData, hexadecimalData });

        // Delete the temporary file after processing
        fs.writeFile(req.file.path, newData, (err) => {
            if (err) {
                console.error(`Error writing file: ${err}`);
                return;
            }
            res.json({ success: true, message: 'File encrypted and replaced successfully' });
            //return;
            //console.log('File encrypted and replaced successfully.');
        });
        });
    }*/
})

app.listen(5000, () => {console.log("Server started on port 5000")})