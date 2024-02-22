// App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginSignUp from './Components/LS/LoginSignUp.jsx';
import HomePage from './Components/Home/HomePage.jsx';
import FileUpload from './Components/Upload/FileUpload.jsx';
import FileRetrieve from './Components/Retrieve/FileRetrieve.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginSignUp/>} exact></Route>
        <Route path="/home" element={<HomePage/>}  ></Route>
        <Route path="file-upload" element={<FileUpload/>}  ></Route>
        <Route path="file-retrieve" element={<FileRetrieve/>}  ></Route>
      </Routes>
    </Router>
  );
}
export default App;

//export default App;
