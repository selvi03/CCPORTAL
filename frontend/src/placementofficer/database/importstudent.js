import React, { useState, useEffect,useRef } from 'react';

import { CollegeImportAPI, getcollegeApi,Update_DB_API_placement } from '../../api/endpoints';
import Upload from '../../assets/images/upload.png';
import ErrorModal from '../../components/auth/errormodal';
import Update from '../../assets/images/update-icon.png';
function ImportCandidate({ collegeName, institute }) {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);
 
  const [isSubmitting, setIsSubmitting] = useState(false);
const fileInputRef = useRef(null);

 
  const handleCloseError = () => {
    setShowError(false);
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };
const resetFileInput = () => {
  setFile(null);
  if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
};

 const handleUpload = async () => {
  if (!file) {
    setErrorMessage('Please select a file');
    setShowError(true);
    return;
  }

  if (isSubmitting) return;
  setIsSubmitting(true);


  const formData = new FormData();
  formData.append('file', file);

  try {
    await CollegeImportAPI(institute, formData);

    // ✅ SUCCESS
    setErrorMessage('Data uploaded successfully');
    setShowError(true);
    resetFileInput();

  } catch (error) {
    let errorMsg = 'Error uploading file. Please try again.';

    if (error.response && error.response.data) {
      const errorData = error.response.data;

      // 🔹 Case 1: { error: "message" }
      if (typeof errorData === 'object' && errorData.error) {
        errorMsg = errorData.error;
      }

      // 🔹 Case 2: Serializer errors
      else if (typeof errorData === 'object') {
        errorMsg = Object.values(errorData)
          .flatMap(err =>
            typeof err === 'string'
              ? err
              : Array.isArray(err)
              ? err.map(e => e.message || e)
              : err?.message || JSON.stringify(err)
          )
          .join(', ');
      }

      // 🔹 Case 3: Plain string
      else if (typeof errorData === 'string') {
        errorMsg = errorData;
      }
    }

    setErrorMessage(errorMsg);
    setShowError(true);
    resetFileInput();
  }

  setIsSubmitting(false);
};

  const handleUpdate = async () => {
    if (!file) {
      setErrorMessage('Please select a file');
      return;
    }

     if (!institute) {
    setErrorMessage('Institute ID not found.');
    setShowError(true);
    return;
  }


    const formData = new FormData();
    formData.append('file', file);

    try {
      await Update_DB_API_placement(formData, institute); // Pass collegeId here
      setErrorMessage('Data Updated Successfully');
      resetFileInput();
      setShowError(true);
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'An unexpected error occurred.';
      setErrorMessage(errorMsg);
      setShowError(true);
      resetFileInput();
    }
  };
  

  return (
    <div className='sp-inner-div'>
     <input
  ref={fileInputRef}
  className='file-chosen-officer'
  type="file"
  onChange={handleFileChange}
/>

      <button onClick={handleUpload} disabled={isSubmitting} className="button-data-officer upload-button" >
        <img className='nextarrow' src={Upload} alt="Upload Icon" />
        <span>Upload</span>
      </button>
      <button onClick={handleUpdate} className="button-data-officer  update-button-db"  ><img className='nextarrow' src={Update}></img><span>Update</span></button>
    
      <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />
    </div>
  );
}

export default ImportCandidate;
