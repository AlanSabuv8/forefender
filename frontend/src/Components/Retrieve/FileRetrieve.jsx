import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FileRetrieve.css';
import { multiply } from '../MyFunctions';

const ScanEpisodes = () => {
  const [episodes, setEpisodes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  //const [privateKey, setPrivateKey] = useState('');

  useEffect(() => {
    const fetchEpisodes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/scanEpisodes');
        setEpisodes(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch episodes. Please try again later.');
        setLoading(false);
      }
    };

    fetchEpisodes();
  }, []);

  const handleDownload = async (fileId, privateKey) => {
    try {
      // Fetch ephemeral public key from server
      const Kresponse = await axios.get('http://localhost:5000/getEphemeralPublicKey', {
        params: {
          fileId: fileId
        }
      });
      const ephemeralPublicKey = {
        x: BigInt(Kresponse.data.ePublicX),
        y: BigInt(Kresponse.data.ePublicY)
      };
      console.log("pr", privateKey);
      console.log("eph", ephemeralPublicKey);
      const sharedKey = multiply(ephemeralPublicKey, BigInt(privateKey));
      console.log(sharedKey);
      const keyX = sharedKey.x.toString();
      const keyY = sharedKey.y.toString();
      

      // Perform download and store with private key and ephemeral public key
      const downloadResponse = await axios.post('http://localhost:5000/downloadAndStore', { fileId, keyX, keyY }, {
        responseType: 'blob' // Specify the response type as blob
      });

      // Create a URL for the blob response
      const url = window.URL.createObjectURL(new Blob([downloadResponse.data]));

      // Create a temporary anchor element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileId); // Set the filename for download
      document.body.appendChild(link);
      link.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading and storing file:', error);
    }
  };
  const handleDelete = async (fileId) => {
    try {
      const response = await axios.post('http://localhost:5000/deleteFile', { fileId });
      console.log('File deleted:', response.data);
      // Assuming you want to update the UI after deletion, you can refetch the episodes
      const updatedEpisodes = episodes.filter((episode) => episode.fileId !== fileId);
      setEpisodes(updatedEpisodes);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };
  
  const handleConfirmDownload = async (fileId) => {
    const confirmed = window.confirm('Are you sure you want to download this file?');
    if (confirmed) {
      const userPrivateKey = prompt('Please enter your private key:');
      if (userPrivateKey) {
        await handleDownload(fileId, userPrivateKey);
      }
    }
  };
  const handleConfirmDelete = (fileId) => {
    const confirmed = window.confirm('Are you sure you want to delete this file?');
    if (confirmed) {
      handleDelete(fileId);
    }
  };


  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <h2>FILES</h2>
      <table className="episodes-table">
        <thead>
          <tr>
            <th>File ID</th>
            <th>File Type</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {episodes.map((episode) => (
            <tr key={episode.fileId}>
              <td>{episode.fileId}</td>
              <td>{episode.filetype}</td>
              <td>
                <button onClick={() => handleConfirmDownload(episode.fileId)}>Download</button>
                <button onClick={() => handleConfirmDelete(episode.fileId)}>Delete</button> 
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScanEpisodes;
