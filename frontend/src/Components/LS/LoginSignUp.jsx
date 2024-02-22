import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css';

import user_icon from "../Assets/person.png";
import email_icon from "../Assets/email.png";
import password_icon from "../Assets/password.png";
import phone_icon from "../Assets/phone.png";

const LoginSignUp = () => {
  const navigateTo = useNavigate();
  const [action,setAction] = useState("Login");

  const handleLoginSignup = () => {
    // Your login/signup logic

    // After successful login/signup, navigate to the file-upload page
    navigateTo('/home');
  };
  

  return (
    <div className="container">
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        {action==="Login"?<div></div>:<div className='input'>
          <img src={user_icon} alt="" />
          <input type="text" placeholder="Name"/>
        </div>}
        
        <div className='input'>
          <img src={email_icon} alt="" />
          <input type="email" placeholder="Email Id"/>
        </div>
        {action==="Login"?<div></div>:<div className='input'>
          <img src={phone_icon} alt="" />
          <input type="number" placeholder="Phone No."/>
        </div>}
        <div className='input'>
          <img src={password_icon} alt="" />
          <input type="password" placeholder="Password"/>
        </div>
        {action==="Login"?<div></div>:<div className='input'>
          <img src={password_icon} alt="" />
          <input type="password" placeholder="Cfm Password"/>
        </div>}
      </div>
      {action==="Sign Up"?<div></div>:<div className="forgot-password">Lost Password? <span>Click Here!</span></div>}    
      {action==="Login"?<div className="submit" onClick={()=>{handleLoginSignup()}}>Login</div>:<div className="submit" onClick={()=>{handleLoginSignup()}}>Sign Up</div>} 
      {action==="Sign Up"?<div className="forgot-password">Already have an account? <span onClick={()=>{setAction("Login")}}>Login Here!</span></div>:<div className="forgot-password">New User? <span onClick={()=>{setAction("Sign Up")}}>Sign Up Here!</span></div>}
      
    </div>
  )
}

export default LoginSignUp;