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
  const handleSignOut = () => {
    // Clear the token from localStorage upon sign out
    localStorage.removeItem('authToken'); // Assuming you store the token as 'authToken'
    setToken(null); // Reset the token in the parent component
      
      // After clearing the token, navigate to the login page
      navigateTo('/');
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
        <button className='sign-out' onClick={handleSignOut}>
          Sign Out
        </button>

      </div>
    </div>
  );
};

export default HomePage;
