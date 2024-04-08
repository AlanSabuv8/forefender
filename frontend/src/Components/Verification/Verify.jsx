import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Axios from "axios";

const Verify = () => {
  const [otp, setOtp] = useState('');
  //const [email, setEmail] = useState('');
  const navigateTo = useNavigate();

  const handleOtpChange = (event) => {
    setOtp(event.target.value);
  };

  const handleSubmit = async () => {
    // Call your backend API to verify the OTP
    const email = localStorage.getItem('email');
    try {
      const response = await Axios.post('https://localhost:443/verifyotp', {
        otp,
        email
      });

      // Check if verification was successful
      if (response.data.success) {
        if (response.data.confirmed) {
          alert('OTP verification successful and email confirmed.');
        } else {
          alert('OTP verification successful but email not confirmed yet.');
        }
        navigateTo('/key');
        // Redirect to the next page or perform any other action
      } else {
        alert('OTP verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Error verifying OTP. Please try again later.');
    }
  };

  return (
    <div>
      <h1>Verification Page</h1>
      <p>Please enter the OTP sent to your Email</p>
      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={handleOtpChange}
      />
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}

export default Verify;
