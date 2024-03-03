import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faFileAlt, faImage, faFilePdf } from '@fortawesome/free-solid-svg-icons';
//import { Auth } from 'aws-amplify';
//import { listEncryptedFiles } from './aws-api'; // Function to fetch encrypted files
import './FileRetrieve.css'

function FileRetrieve() {
  //const [encryptedFiles, setEncryptedFiles] = useState([]);

  /*useEffect(() => {
    async function fetchFiles() {
      try {
        // Fetch encrypted files from AWS database
        const files = await listEncryptedFiles();
        setEncryptedFiles(files);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    }

    fetchFiles();
  }, []);*/

  /*const handleDecryptAndDownload = async (encryptedFile) => {
    try {
      // Decrypt the file
      const decryptedFile = await decryptFile(encryptedFile);

      // Trigger file download
      // Implement this part based on the decrypted file type (image, pdf, text)
      // For example, for a PDF file, you can use Blob and createObjectURL to initiate download
    } catch (error) {
      console.error('Error decrypting file:', error);
    }
  };*/

  

function getFileIcon(fileType) {
  switch (fileType) {
    case 'application/pdf':
      return <FontAwesomeIcon icon={faFilePdf} size='6x' color='red'/>;
    case 'image/png':
      return <FontAwesomeIcon icon={faImage} size='6x' color='blue'/>;
    case 'text/plain':
      return <FontAwesomeIcon icon={faFileAlt} size='6x' color='green'/>;
    default:
      return <FontAwesomeIcon icon={faFile} size='6x' color='#000'/>;
  }
}

  const encryptedFiles = [
    {
      id: 1,
      name: 'encrypted_image1.png',
      type: 'image/png',
    },
    {
      id: 2,
      name: 'encrypted_document1.pdf',
      type: 'application/pdf',
    },
    {
      id: 3,
      name: 'encrypted_text1.txt',
      type: 'text/plain',
    },
  ];

  return (
    <div className="file-container">
      <h2>Encrypted Files</h2>
      <div className="file-grid">
        {encryptedFiles.map((file) => (
          <div key={file.id} className="file-item">
            <div className="file-thumbnail">
              {getFileIcon(file.type)}
            </div>
            <div className="file-name">{file.name}</div>
            <div className="file-actions">
              <button className="file-download-btn" onClick={() => handleDecryptAndDownload(file)}>Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FileRetrieve;
