import React, { useState } from "react";
import { Link } from "react-router-dom";
import Axios from "axios";
function Verify() {
  const [otp, setOtp] = useState('');

  const handleOtpChange = (event) => {
    setOtp(event.target.value);
  };

  const handleSubmit = async () => {
    // Call your backend API to verify the OTP
    try {
      const response = await fetch('/verifotp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otp }),
      });

      const data = await response.json();
      console.log(data);

      // Check if verification was successful
      if (data.success) {
        if (data.confirmed) {
          alert('OTP verification successful and email confirmed.');
        } else {
          alert('OTP verification successful but email not confirmed yet.');
        }
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
