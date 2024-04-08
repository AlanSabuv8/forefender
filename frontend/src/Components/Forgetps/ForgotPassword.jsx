import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Axios from 'axios'; // Import axios for making HTTP requests
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Make an HTTP POST request to your backend endpoint
      sessionStorage.setItem('mail', email);
      const response = await Axios.post('https://localhost:443/forgotpassword', { email });
      console.log(response.data);
      setSuccess(true);
      navgateTo("/"); // Set success to true upon successful request
      // Optionally, you can handle cases where the email is correct but the reset password request failed
      // For example, display an error message indicating that the reset password request failed
    } catch (error) {
      console.error(error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(error.response.data.message); // Set specific error message from server
      } else if (error.request) {
        // The request was made but no response was received
        setError('No response received from the server.'); // Set generic error message
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('An unexpected error occurred. Please try again later.'); // Set generic error message
      }
    }
  };

  return (
    <div className="forgot-password-container">
      <h2>Forgot Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <button type="submit">Reset Password</button>
        {error && <p className="error-message">{error}</p>} {/* Display error message if exists */}
        {success && (
          <p className="success-message">
            Password reset link sent to your email.{' '}
            <Link to="/otp">Click here</Link> to change your password.
          </p>
        )} {/* Display success message if reset link sent */}
      </form>
      <div className="back-to-login">
        <Link to="/">Back to Login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
