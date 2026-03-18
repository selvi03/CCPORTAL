import React, { useState, useEffect,useRef } from 'react';
import axios from 'axios';
import { CollegeUserImportAPI,Update_NonDB_PlacementAPI, getcollegeApi } from '../../api/endpoints';
import Upload from '../../assets/images/upload.png';
import ErrorModal from '../../components/auth/errormodal';
import Update from '../../assets/images/update-icon.png';
function Importuser({ collegeName,institute }) {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
  const [collegeId, setCollegeId] = useState(null);
const fileInputRef = useRef(null);
const resetFileInput = () => {
  setFile(null);
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};

  
  const handleCloseError = () => {
    setShowError(false);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file');
      return;
    }
  
   
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      await CollegeUserImportAPI(institute, formData);
      setErrorMessage('Data uploaded successfully');
      resetFileInput();
      setShowError(true);
    } catch (error) {
      let errorMsg = 'An unexpected error occurred.';
  
      if (error.response) {
        const errorData = error.response.data;
  
        if (Array.isArray(errorData) && errorData.length > 0) {
          errorMsg = errorData[0].user_name[0] || 'Error message not found.';
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        } else if (errorData.error) {
          errorMsg = errorData.error;
        } else if (Array.isArray(errorData)) {
          errorMsg = errorData.map(err => err.message).join(', ');
        } else if (typeof errorData === 'object') {
          errorMsg = Object.values(errorData).flat().join(', ');
        }
      } else {
        errorMsg = 'Error uploading file. Please try again.';
      }
  
      setErrorMessage(errorMsg);
      setShowError(true);
      resetFileInput(); 
    }
  };
  const handleUpdate = async () => {
    if (!file) {
      setErrorMessage('Please select a file');
      return;
    }
  
    
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      await Update_NonDB_PlacementAPI(institute, formData);
      setErrorMessage('Data updated successfully');
      setShowError(true);
      resetFileInput(); 
    } catch (error) {
      let errorMsg = 'An unexpected error occurred.';
  
      if (error.response) {
        const errorData = error.response.data;
  
        if (Array.isArray(errorData) && errorData.length > 0) {
          errorMsg = errorData[0].user_name[0] || 'Error message not found.';
        } else if (typeof errorData === 'string') {
          errorMsg = errorData;
        } else if (errorData.error) {
          errorMsg = errorData.error;
        } else if (Array.isArray(errorData)) {
          errorMsg = errorData.map(err => err.message).join(', ');
        } else if (typeof errorData === 'object') {
          errorMsg = Object.values(errorData).flat().join(', ');
        }
      } else {
        errorMsg = 'Error uploading file. Please try again.';
      }
  
      setErrorMessage(errorMsg);
      setShowError(true);
      resetFileInput(); 
    }
  };
  

  return (
    <div className='sp-inner-div'>
     <input
  ref={fileInputRef}
  className='file-chosen'
  type="file"
  onChange={handleFileChange}
/>

      <button onClick={handleUpload} className="button-data upload-button" style={{ width: "114px" }}>
        <img className='nextarrow' src={Upload} alt="Upload Icon" />
        <span>Upload</span>
      </button>
      <button onClick={handleUpdate} className="button-data  update-button-db"  ><img className='nextarrow' src={Update}></img><span>Update</span></button>
   
      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />
    </div>
  );
}

export default Importuser;
