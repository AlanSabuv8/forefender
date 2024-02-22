import React, { useState } from 'react';
import { MdCloudUpload, MdDelete } from 'react-icons/md';
import { AiFillFileImage } from 'react-icons/ai';
import './FileUpload.css';

const FileUpload = ({ onFileSelect }) => {

  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("No file selected");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if(file){
      setFileName(file.name);

      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = () => {
          setImage(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImage(AiFillFileImage);
      }
    }
  };

  


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

    </main>
  );
};

export default FileUpload;
