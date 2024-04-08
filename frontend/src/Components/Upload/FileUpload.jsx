import React, { useState } from 'react';
import { MdCloudUpload, MdDelete } from 'react-icons/md';
import { useNavigate } from 'react-router-dom'; 
import { AiFillFileImage } from 'react-icons/ai';
import './FileUpload.css';
import axios from 'axios'

const FileUpload = ({ onFileSelect }) => {
  const navigateTo = useNavigate();
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("No file selected");
  const [file, setFile] = useState()
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const pfile = e.target.files[0]
    setFile(pfile)
    if(pfile){
      setFileName(pfile.name);

      if (pfile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setImage(reader.result);
        };
        reader.readAsDataURL(pfile);
      } else {
        setImage(AiFillFileImage);
      }
    }
  };

  const upload = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    axios.post('https://localhost:443/upload', formData)
      .then(res => {
        setLoading(false);
        navigateTo('/home');
      })
      .catch(err => {
        setLoading(false);
        console.log(err);
      });
  };
  

  


  return (
    <main>
      <form className= "uploadForm" action=""
      onClick={() => document.querySelector(".input-field").click()}
      >
        <input type="file" className='input-field' hidden 
          onChange={handleFileChange}
        />

        {image? (
          <img src={image} width={60} height={60} alt={fileName} />
        ) : (
          <>
            <MdCloudUpload color='#1475cf' size={60} />
            <p>Browse Files to Upload</p>
          </>
        )}
      </form>

      <section className= 'uploaded-row' >
        <AiFillFileImage color='#1475cf'/>
        <span>
          {fileName}
          <MdDelete
          onClick={()=>{
            setFileName("No selected File")
            setImage(null)
          }}
          />
        </span>
      </section>
      <button type="button" onClick={upload}>Encrypt</button>
      {loading && <div className="loading">Encrypting...</div>}

    </main>
  );
};

export default FileUpload;
