import React, { useState } from 'react';
import { enc, fromHex, uint8ArrayToText } from './chacha20.jsx';
import './FileRetrieve.css';

function FileRetrieve() {
  const key = fromHex('000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f');
  const nonce = fromHex('0001020304050607');
  
  const [inputValue, setInputValue] = useState('');
  const [encryptedData, setEncryptedData] = useState('');
  const [decryptedData, setDecryptedData] = useState('');


  const handleChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleEncrypt = () => {
    const plaintext = inputValue;
    const encryptedText = uint8ArrayToText(enc(plaintext, key, nonce));
    
    setEncryptedData(encryptedText);
    
    console.log(encryptedText);
  };

  const handleDecrypt = () => {
    const decryptedText = uint8ArrayToText(enc(encryptedData, key, nonce));
    setDecryptedData(decryptedText);
  };

  return (
    <div>
      <div className="input">
        <input 
          type="text"
          value={inputValue}
          placeholder='Plaintext'
          onChange={handleChange}
        />
      </div>
      <div className="submit" onClick={handleEncrypt}>
        Encrypt
      </div>
      <div>{encryptedData}</div>
      <div>{decryptedData}</div>
      <div className="submit" onClick={handleDecrypt}>
        Decrypt
      </div>
    </div>
  );
}

export default FileRetrieve;
