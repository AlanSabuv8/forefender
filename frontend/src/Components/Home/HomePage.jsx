// HomePage.jsx

import './HomePage.css';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {

  const navigateTo = useNavigate();

  const handleUpload = () => {
    
    navigateTo('/file-upload');
  };

  const handleRetrieve = () => {
    
    navigateTo('/file-retrieve');
  };


  return (
    <div className="home-page">
      <div className="welcome">Hi, Welcome user 123fd...</div>
      <div className="options-container">
        <button className='file-upload' onClick={() => {handleUpload()}}>
          File Upload
        </button>
        <button className='file-retrieval' onClick={() => {handleRetrieve()}}>
          File Retrieval
        </button>
      </div>
    </div>
  );
};

export default HomePage;
