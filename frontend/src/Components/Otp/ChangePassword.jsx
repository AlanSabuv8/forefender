import React, { useState } from "react";
import { Link } from "react-router-dom";
import Axios from "axios";
import "./ChangePassword.css";

const ChangePassword = () => {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const email = sessionStorage.getItem("mail");
      const response = await Axios.post("http://localhost:5000/verifyotp", {
        email,
        otp,
        newPassword,
      });
      console.log(response.data);
      setSuccess(true);
      setError("");
    } catch (error) {
      console.error(error);
      setError("Failed to change password. Please try again later.");
      setSuccess(false);
    }
  };

  return (
    <div className="change-password-container">
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="otp">OTP:</label>
          <input
            type="text"
            id="otp"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">New Password:</label>
          <input
            type="password"
            id="newPassword"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Change Password</button>
        {error && <p className="error-message">{error}</p>}
        {success && (
          <p className="success-message">Password changed successfully.</p>
        )}
      </form>
      <div className="back-to-login">
        <Link to="/">Back to Login</Link>
      </div>
    </div>
  );
};

export default ChangePassword;
