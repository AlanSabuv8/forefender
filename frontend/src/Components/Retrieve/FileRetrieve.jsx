import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FileRetrieve.css';

const ScanEpisodes = () => {
  const [episodes, setEpisodes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleDownload = async (key) => {
    try {
      const response = await axios.get(`http://localhost:5000/download/${key}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', key);
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up the dynamically created link
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleConfirmDownload = (fileId, s3Location, fileType) => {
    const confirmed = window.confirm('Are you sure you want to download this file?');
    if (confirmed) {
      handleDownload(fileId);
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
                <button onClick={() => handleConfirmDownload(episode.fileId, episode.s3Location, episode.filetype)}>Download</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScanEpisodes;
