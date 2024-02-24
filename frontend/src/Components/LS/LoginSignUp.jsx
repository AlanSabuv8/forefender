import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginSignup.css';
import Axios from 'axios';

import user_icon from "../Assets/person.png";
import email_icon from "../Assets/email.png";
import password_icon from "../Assets/password.png";
import phone_icon from "../Assets/phone.png";

const LoginSignUp = () => {
  const navigateTo = useNavigate();
  const [action,setAction] = useState("Login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLoginSignup = async () => {
    try {
      if (action === "Login") {
        const response = await Axios.post('http://localhost:5000/login', {
          email,
          password,
        });
        // Handle successful login response
        console.log(response.data);
        navigateTo('/home');
      } else {
        // If action is "Sign Up"
        const response = await Axios.post('http://localhost:5000/signup', {
          name,
          email,
          password,
        });
        // Handle successful signup response
        console.log(response.data);
        navigateTo('/home');
      }
    } catch (error) {
      // Handle login/signup error
      console.error('Login/signup error:', error);
    }
  };

  
  

  return (
    <div className="container">
      <div className="header">
        <div className="text">{action}</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        {action === "Sign Up" &&
          <div className='input'>
            <img src={user_icon} alt="" />
            <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        }
        
        <div className='input'>
          <img src={email_icon} alt="" />
          <input type="email" placeholder="Email Id" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className='input'>
          <img src={password_icon} alt="" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {action==="Login"?<div></div>:<div className='input'>
          <img src={password_icon} alt="" />
          <input type="password" placeholder="Cfm Password"/>
        </div>}
      </div>
      {action==="Sign Up"?<div></div>:<div className="forgot-password">Lost Password? <span>Click Here!</span></div>}    
      {action === "Login" ? <div className="submit" onClick={handleLoginSignup}>Login</div> : <div className="submit" onClick={handleLoginSignup}>Sign Up</div>}
      {action === "Sign Up" ? <div className="forgot-password">Already have an account? <span onClick={() => { setAction("Login") }}>Login Here!</span></div> : <div className="forgot-password">New User? <span onClick={() => { setAction("Sign Up") }}>Sign Up Here!</span></div>}
    </div>
  )
}

export default LoginSignUp;