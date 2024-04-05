import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './key.css';

const CopyKeyToClipboard = () => {
    const navigateTo = useNavigate();
    const [keyValue, setKeyValue] = useState('');

    // Function to generate a random private key
    
    useEffect(() => {
        const getPrivateKey = () => {
            const privateKey = localStorage.getItem('privateKey');
            if (keyValue === ''){  
                console.log(privateKey);
                setKeyValue(privateKey);
            }
        };
    
        getPrivateKey();
    }, []); // Call the function once when the component mounts

    // Function to copy the key value to the clipboard
    const copyToClipboard = () => {
        localStorage.removeItem('privateKey');
        navigator.clipboard.writeText(keyValue)
            .then(() => alert('Key copied to clipboard'))
            .catch(error => console.error('Error copying to clipboard:', error));
    };

    return (
        <div>
            <h1 className='head'>Copy Key to Clipboard</h1>
            <p>{keyValue}</p>
            <button onClick={copyToClipboard}>Copy Key</button>
            <br />
            <button onClick={() => navigateTo('/home')}>Go to Home</button>
        </div>
    );
};

export default CopyKeyToClipboard;
