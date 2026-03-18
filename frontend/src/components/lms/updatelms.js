import React, { useState, useEffect } from 'react';

import './dummy.css';
import Nextarrow from '../../assets/images/nextarrow.png';
import back from '../../assets/images/backarrow.png';
import { useNavigate } from 'react-router-dom';

import 'react-datepicker/dist/react-datepicker.css';
import ErrorModal from '../auth/errormodal';
import { button, Table, Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import {
   
    getLMSIDApi,
   getFoldersByQuestionSkillApi,
    updatecontentApi,

   
} from '../../api/endpoints';
import PropTypes from 'prop-types';
import { parse, format } from 'date-fns';
const customStyles = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: '#39444e',
        color: '#fff', // Text color
        borderColor: state.isFocused ? '' : '#ffff', // Border color on focus
        boxShadow: 'none', // Remove box shadow
        '&:hover': {
            borderColor: state.isFocused ? '#ffff' : '#ffff' // Border color on hover
        },
        '&.css-1a1jibm-control': {
            // Additional styles for the specific class
        },
        '@media (max-width: 768px)': { // Adjust for mobile devices
            fontSize: '12px', // Smaller font size

            width: '70%'
        }
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#ffff', // Text color for selected value
        '@media (max-width: 768px)': { // Adjust for mobile devices
            fontSize: '12px' // Smaller font size
        }
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#39444e' : state.isFocused ? '#39444e' : '#39444e',
        color: '#ffff', // Text color
        '&:hover': {
            backgroundColor: '#39444e', // Background color on hover
            color: '#ffff' // Text color on hover
        },
        '@media (max-width: 768px)': { // Adjust for mobile devices
            fontSize: '12px',// Smaller font size
            width: '70%'
        }
    }),
    input: (provided) => ({
        ...provided,
        color: '#ffff' // Text color inside input when typing
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#39444e',
        '@media (max-width: 768px)': { // Adjust for mobile devices
            fontSize: '12px' // Smaller font size
        }
    })

};
const UpdateLMS = ({ lmsId, onNextButtonClick }) => {
    const [updateDataLms, setUpdateDataLms] = useState([]);
    const [dtmValidity, setDtmValidity] = useState(null);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [topicOptions, setTopicOptions] = useState([]);
const [selectedTopic, setSelectedTopic] = useState(null);
const [isManualTopic, setIsManualTopic] = useState(false);

const navigate = useNavigate();

    const handleCloseError = () => {
        setShowError(false);
    };

   useEffect(() => {
    getLMSIDApi(lmsId)
        .then(data => {
            console.log('API Response:', data);

            // Just set LMS data; no date parsing
            setUpdateDataLms([data]);
        })
        .catch(error => console.error('Error fetching update IDs:', error));
}, [lmsId]);


    const handleInputChange = (index, field, value) => {
        const updatedLMSData = [...updateDataLms];
        updatedLMSData[index][field] = value;
        setUpdateDataLms(updatedLMSData);
    };
useEffect(() => {
    if (!updateDataLms.length) return;

    const lms = updateDataLms[0];
    if (!lms.question_type_id || !lms.skill_type_id) return;

    console.log('🔄 Fetching folders for question_type_id:', lms.question_type_id, 'skill_type_id:', lms.skill_type_id);

    getFoldersByQuestionSkillApi(lms.question_type_id, lms.skill_type_id)
        .then(res => {
            console.log('✅ Folder API response:', res);

            const allOptions = res.map(item => ({
                label: item.folder_name,
                value: item.folder_name,
                folder_id: item.id
            }));

            // Add LMS topic if missing
            if (lms.topic && !allOptions.find(o => o.value === lms.topic)) {
                allOptions.push({
                    label: lms.topic,
                    value: lms.topic,
                    folder_id: lms.folder_id || null
                });
            }

            setTopicOptions(allOptions);

            // Auto-select LMS topic **only on initial load**
            if (!selectedTopic) {
                const matched = allOptions.find(o => o.value === lms.topic);
                if (matched) {
                    setSelectedTopic(matched);
                    handleInputChange(0, 'folder_id', matched.folder_id);
                }
            }
        })
        .catch(err => console.error('❌ Folder fetch error:', err));
}, [updateDataLms]); // keep dependency only on LMS data

    const handleUpdateLMS = async (e, index) => {
        e.preventDefault();
        const lms = updateDataLms[index];
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

        // Adjusted width and height for iframe
        const width = "1100px";
        const height = "450px";

        // Get the content from the form
        const content = lms.actual_content;

        // Replace existing width and height attributes and add scrolling attribute in iframe HTML
        const adjustedContent = content
            .replace(/width="\d+"/, `width="${width}"`)
            .replace(/height="\d+"/, `height="${height}"`)
            .replace(/<iframe([^>]*?)>/, `<iframe$1 scrolling="yes">`);

        const contentmaster = {
            worksheet_link: lms.worksheet_link||'',
            content_url: lms.content_url || '',
            actual_content: adjustedContent,
           folder_id: lms.folder_id || null, 
            topic: lms.topic, // Now a plain text field
           
        };

        console.log('contentmaster: ', contentmaster);

        updatecontentApi(lmsId, contentmaster)
            .then((result) => {
                console.log('Result:', result);
                console.log('Content master:', contentmaster);
                setErrorMessage('Data Updated Successfully');
               
                setShowError(true);
                 
                navigate('/lms/');
    
            })
            .catch((error) => {
                console.error("Failed to update data", error);
                alert("Failed to update. Check console for details.");
            });
    };

    return (
        <div className="form-ques-training">
            <div className="header"><h6>Update Content</h6></div><br />
            <div >
                {Array.isArray(updateDataLms) && updateDataLms.map((lms, index) => (
                    <form key={index} onSubmit={(e) => handleUpdateLMS(e, index)}>
                        <Row>
                            <Col md={6}>
                               <Form.Group className='lms-update'>
    <label className='label6-ques'>Topic</label><p></p>

    {!isManualTopic ? (
       <Select
    options={topicOptions}
    value={selectedTopic}
    onChange={(option) => {
        console.log('🔹 Topic selected:', option);

        // Immediately update local state for dropdown
        setSelectedTopic(option);

        // Update LMS data with both topic string and folder_id
        handleInputChange(index, 'topic', option.value);
        handleInputChange(index, 'folder_id', option.folder_id);
    }}
    styles={customStyles}
    isClearable
    placeholder="Select Topic"
/>

    ) : (
        <input
            type="text"
            className="input-ques"
            value={lms.topic || ''}
            onChange={(e) => {
                handleInputChange(index, 'topic', e.target.value);
                handleInputChange(index, 'folder_id', null);
            }}
        />
    )}

    <small
        style={{ cursor: 'pointer', color: '' }}
        onClick={() => {
            setIsManualTopic(!isManualTopic);
            setSelectedTopic(null);
            handleInputChange(index, 'folder_id', null);
        }}
    >
        {isManualTopic ? '-' : '+'}
    </small>
</Form.Group>

                            </Col>
                            <Col md={6}>
                                <Form.Group className='lms-update' controlId='worksheet_link'>
                                    <label className='label6-ques'>Worksheet Link</label><p></p>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        className="input-ques"
                                        value={lms.worksheet_link}
                                        onChange={(e) => handleInputChange(index, 'worksheet_link', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <p></p>

                        <Row>
                           
                            <Col md={6}>
                                <Form.Group className='lms-update' controlId='content_url'>
                                    <label className='label6-ques'>Video URL</label><p></p>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        className="input-ques"
                                        value={lms.content_url}
                                        onChange={(e) => handleInputChange(index, 'content_url', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                       
                            <Col >
                                <Form.Group className='lms-update' controlId='actual_content'>
                                    <label className='label6-ques'>Content Url</label><p></p>
                                    <input
                                        type="text"
                                        autoComplete="off"
                                        className="input-ques"
                                        value={lms.actual_content}
                                        onChange={(e) => handleInputChange(index, 'actual_content', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                           
                        </Row>

                      
                       
                        <p style={{ height: "50px" }}></p>

                        <Row>
                            <Col>
                                <div className="button-container-lms">
                                    <button
                                        type="button"
                                        className='button-ques-save back-button-lms'
                                        onClick={(e) => {
                                            e.preventDefault();
                                            if (typeof onNextButtonClick === 'function') {
                                                onNextButtonClick();
                                            } else {
                                                console.error('onNextButtonClick is not a function');
                                            }
                                        }}
                                        style={{ width: "100px" }}
                                    >
                                        <img src={back} className='nextarrow' alt="Back" />
                                        <span className="button-text">Back</span>
                                    </button>
                                    <button type="submit" className='button-ques-save save-button-lms' style={{ width: "100px" }}>
                                        Update
                                    </button>
                                    <button className="button-ques-next btn btn-secondary next-button-lms" disabled style={{ float: "right", backgroundColor: "#F1A128", cursor: 'not-allowed',height:"50px", width: "100px", color: 'black' }}>
                                        <span className="button-text">Next</span>
                                        <img src={Nextarrow} className='nextarrow' alt="Next" />
                                    </button>
                                </div>
                            </Col>
                        </Row>
                       

                        <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />
                    </form>
                    
                ))}
            </div>
            <p style={{height:"40px"}}></p>
        </div>
    );
};

UpdateLMS.propTypes = {
    lmsId: PropTypes.string.isRequired,
    onNextButtonClick: PropTypes.func.isRequired
};

export default UpdateLMS;

