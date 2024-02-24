import React, { useState } from 'react';
import { MdCloudUpload, MdDelete } from 'react-icons/md';
import { AiFillFileImage } from 'react-icons/ai';
import './FileUpload.css';
import axios from 'axios'

const FileUpload = ({ onFileSelect }) => {

  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("No file selected");
  const [file, setFile] = useState()

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
    const formData = new FormData()
    formData.append('file', file)
    axios.post('http://localhost:5000/upload', formData)
    .then(res => {})
    .catch(er => console.log(er))
  }

  


  return (
    <main>
      <form action=""
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

    </main>
  );
};

export default FileUpload;
