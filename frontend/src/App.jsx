// App.jsx
import React, {useEffect, useState} from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignUp from './Components/LS/LoginSignUp.jsx';
import HomePage from './Components/Home/HomePage.jsx';
import Verify from './Components/Verification/Verify.jsx';
import ChangePassword from './Components/Otp/ChangePassword.jsx';
import ForgotPassword from './Components/Forgetps/ForgotPassword.jsx';
import FileUpload from './Components/Upload/FileUpload.jsx';
import FileRetrieve from './Components/Retrieve/FileRetrieve.jsx';
import CopyKeyToClipboard from './Components/key/key.jsx';


import './App.css';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignUp/>} exact></Route>
        <Route path="home" element={<HomePage/>}  ></Route>
        <Route path="verify" element={<Verify/>}  ></Route>   
        <Route path="key" element={<CopyKeyToClipboard/>}  ></Route>     
        <Route path="forget" element={<ForgotPassword/>}  ></Route>
        <Route path="otp" element={<ChangePassword/>}  ></Route>
        <Route path="file-upload" element={<FileUpload/>}  ></Route>
        <Route path="file-retrieve" element={<FileRetrieve/>}  ></Route>
      </Routes>
    </Router>
  );
}
export default App;

//export default App;
