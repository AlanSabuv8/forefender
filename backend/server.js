const {enc, fromHex} = require('./chacha20.js')

const express = require("express")
const fs = require("fs");
const cors = require("cors")
const multer = require('multer')
const bodyParser = require('body-parser');
const AWS = require('aws-sdk');
require('dotenv').config();
//import { Auth } from 'aws-amplify';


const app = express()

const key = fromHex('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
const nonce = fromHex('0001020304050607');

// Enable CORS for all routes
app.use(cors())
app.use(express.json())


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

app.post('/upload', upload.single('file'), (req, res) => {
    console.log(req.body)
    console.log(req.file)

    fs.readFile(req.file.path, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error reading uploaded file");
        }

        // Convert data to Uint8Array
        const uint8ArrayData = new Uint8Array(data);

        const text = enc(uint8ArrayData, key, nonce)

        // Alternatively, convert data to hexadecimal
        //const hexadecimalData = data.toString("hex");

        // Send the converted data back to the client or do further processing
        //res.send({ uint8ArrayData, hexadecimalData });

        // Delete the temporary file after processing
        fs.writeFile(req.file.path, text, (err) => {
            if (err) {
                console.error(`Error writing file: ${err}`);
                return;
            }
            console.log('File encrypted and replaced successfully.');
        });
    });
})

app.listen(5000, () => {console.log("Server started on port 5000")})