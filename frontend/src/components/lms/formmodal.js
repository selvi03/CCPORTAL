import React, { useState, useEffect, useContext } from 'react';
import { Col, Row, Form, Button } from 'react-bootstrap';
import Select from 'react-select';
import Nextarrow from '../../assets/images/nextarrow.png'
import back from '../../assets/images/backarrow.png'

import 'react-datepicker/dist/react-datepicker.css';
import ErrorModal from '../auth/errormodal';
import { addcontentApi, getSkilltypeApi,  getqstntypeApi,
getFoldersByQuestionSkillApi } from '../../api/endpoints';
import { TestTypeContext, TestTypeCategoriesContext, QuestionTypeContext, SkillTypeContext } from '../test/context/testtypecontext';
import Footer from '../../footer/footer';
import { useNavigate } from 'react-router-dom';
import CustomOption from '../test/customoption';
import { Modal } from 'react-bootstrap';

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

const FormModal = ({ onNextButtonClick }) => {
    const navigate = useNavigate();
    const { selectedQuestionType } = useContext(QuestionTypeContext);
    const { selectedSkillType } = useContext(SkillTypeContext);
 const [selectedTopics, setSelectedTopics] = useState([]);

    const [skilltype, setskilltype] = useState([]);
    const [questtionTypes, setQuestionTypes] = useState([]);
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    console.log('SelectedQuest Type: ', selectedQuestionType);
    console.log('SelectedSkill Type: ', selectedSkillType);
    const [showInputFieldTopic, setShowInputFieldTopic] = useState(false);
const [selectedQuestionTypeId, setSelectedQuestionTypeId] = useState(null);
const [selectedSkillTypeId, setSelectedSkillTypeId] = useState(null);

    const [manualTopic, setManualTopic] = useState(""); // For <input />
    const [topicOptions, setTopicOptions] = useState([]);

  useEffect(() => {
  if (!selectedQuestionType || !selectedSkillType) return;

  const mapIds = async () => {
    const qstnTypes = await getqstntypeApi();
    const skillTypes = await getSkilltypeApi();

    const qType = qstnTypes.find(
      (q) => q.question_type === selectedQuestionType
    );

    const sType = skillTypes.find(
      (s) =>
        s.skill_type === selectedSkillType &&
        s.question_type_id === qType?.id
    );

    setSelectedQuestionTypeId(qType?.id || null);
    setSelectedSkillTypeId(sType?.id || null);
  };

  mapIds();
}, [selectedQuestionType, selectedSkillType]);

useEffect(() => {
  if (!selectedQuestionTypeId || !selectedSkillTypeId) {
    setTopicOptions([]);
    return;
  }

  const fetchTopics = async () => {
    try {
      const response = await getFoldersByQuestionSkillApi(
        selectedQuestionTypeId,
        selectedSkillTypeId
      );

      console.log("Folder API response:", response);

      const options = response.map((item) => ({
        label: item.folder_name,   // dropdown text
        value: item.folder_name,   // stored in topic column (string)
        folder_id: item.id         // FK (for future use)
      }));

      setTopicOptions(options);
    } catch (error) {
      console.error("Error fetching folder topics", error);
      setTopicOptions([]);
    }
  };

  fetchTopics();
}, [selectedQuestionTypeId, selectedSkillTypeId]);

    const handleSelectionChange = (selectedOptions) => {
        setSelectedTopics(selectedOptions || []);
    };



   
    const handleCloseError = () => {
        setShowError(false);
    };
    const [dtmValidity, setDtmValidity] = useState(null);
    useEffect(() => {

        getqstntypeApi()
            .then(data => {
                setQuestionTypes(data.map(item => ({ value: item.id, label: item.question_type })));
            })
            .catch(error => console.error('Error fetching question types:', error));

        getSkilltypeApi()
            .then(data => {
                setskilltype(data.map(item => ({ value: item.id, label: item.skill_type })));
            })
            .catch(error => console.error('Error fetching skill types:', error));
    }, []);


    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSubmitting) return;
if (!showInputFieldTopic && selectedTopics.length === 0) {
    alert("Please select a topic");
    setIsSubmitting(false);
    return;
}

        setIsSubmitting(true);
        const formData = new FormData(e.target);
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

        // Adjusted width and height for iframe
        const width = "1100px";
        const height = "450px";

        // Get the content from the form
        const content = formData.get('actual_content');
        const link = formData.get('worksheet_link');

        const adjustedContent = content
            ? content
                .replace(/width="\d+"/, `width="${width}"`)
                .replace(/height="\d+"/, `height="${height}"`)
                .replace(/<iframe([^>]*?)>/, `<iframe$1 scrolling="yes">`)
            : '';
        const adjustedlink = link
            ? link
                .replace(/width="\d+"/, `width="${width}"`)
                .replace(/height="\d+"/, `height="${height}"`)
                .replace(/<iframe([^>]*?)>/, `<iframe$1 scrolling="yes">`)
            : '';

        let questypeID = null;
        let skillTypeID = null;

        const fetchData = async () => {
            try {

                const qstnTypes = await getqstntypeApi();
                const skillTypes = await getSkilltypeApi();

                const questionTypeData = qstnTypes.find(item => item.question_type === selectedQuestionType);
                const skillTypeData = skillTypes.find(item => item.skill_type === selectedSkillType);

                questypeID = questionTypeData ? questionTypeData.id : null;
                skillTypeID = skillTypeData ? skillTypeData.id : null;

const topicsSub = showInputFieldTopic
  ? manualTopic?.trim() || ''
  : selectedTopics.length > 0
    ? selectedTopics.map((t) => t.value).join(', ')
    : '';

let topicValue = '';
let folderIdValue = null;

if (showInputFieldTopic) {
    // Manual topic entry
    topicValue = manualTopic?.trim() || '';
    folderIdValue = null; // No folder_id for manual topic
} else if (selectedTopics.length > 0) {
    // Dropdown selection
    topicValue = selectedTopics.map(t => t.value).join(', ');
    folderIdValue = selectedTopics[0].folder_id; 
    // assuming single-select topic
}
const contentmaster = {
    question_type_id: questypeID,
    skill_type_id: skillTypeID,
    folder_id: folderIdValue,   // ✅ STORED
    content_url: formData.get('content_url') || '',
    actual_content: adjustedContent,
    topic: topicValue,          // ✅ STRING STORED
    worksheet_link: adjustedlink,
};

                console.log('contentmaster: ', contentmaster);

                addcontentApi(contentmaster)
                    .then((result) => {
                        console.log('Result:', result);
                        console.log('Content master:', contentmaster);
                        setErrorMessage('Data Added Successfully');
                        setShowError(true);
                        setDtmValidity(null);

                        e.target.reset();
                        navigate('/lms/');
                    })
                    .catch((error) => {
                        console.error("Failed to add data", error);
                        alert("Failed to add. Check console for details.");
                    });
            } catch (error) {
                console.error("Failed to fetch data", error);
                alert("Failed to fetch data. Check console for details.");
            }
            setIsSubmitting(false);
        };

        fetchData();
    };

    const [selectedDocEmbed, setSelectedDocEmbed] = useState("");
    const [selectedWorksheetEmbed, setSelectedWorksheetEmbed] = useState("");
    const [selectedVideoUrl, setSelectedVideoUrl] = useState("");

    // Handles Content URL (Embedded HTML)
    const handleContentChange = (e) => {
        setSelectedDocEmbed(e.target.value.trim());
    };

    // Handles Worksheet Link (Embedded HTML)
    const handleWorksheetChange = (e) => {
        setSelectedWorksheetEmbed(e.target.value.trim());
    };

    // Handles Video URL
    const handleVideoChange = (e) => {
        let videoUrl = e.target.value.trim();

        if (videoUrl.includes("watch?v=")) {
            videoUrl = videoUrl.replace("watch?v=", "embed/");
        }

        setSelectedVideoUrl(videoUrl);
    };


    return (
        <div className='start'>
            <div className='form-ques'>
                <div >
                    <Form onSubmit={handleSubmit} className='form-ques-LMS'>
                        <Row>
                            <div><p></p></div>

                            <Row md={12}>
                                <Col >
                                    <div className='topic' controlId='topic'>
                                        <label className='label6-ques'>Topic
                                            <Button
                                                variant="link"
                                                onClick={() => setShowInputFieldTopic(!showInputFieldTopic)}
                                                style={{ color: '#fff', marginLeft: '10px', padding: 0 }}
                                            >
                                                {showInputFieldTopic ? (
                                                    <i className="bi bi-x-circle"></i> // Use 'x' for close
                                                ) : (
                                                    <i className="bi bi-plus-circle"></i> // Use plus for open
                                                )}
                                            </Button>
                                        </label><p></p>
                                        {!showInputFieldTopic ? (
<Select
  isMulti
  options={topicOptions}
  value={selectedTopics}
  onChange={handleSelectionChange}
  styles={customStyles}
  closeMenuOnSelect={false}
  placeholder="Select Topic(s)"
/>


                                        ) : (
                                            <input
                                                type="text"
                                                className="input-ques"
                                                placeholder="Enter new topic"
                                                value={manualTopic}
                                                onChange={(e) => {
                                                    setManualTopic(e.target.value);
                                                }}
                                            />
                                        )}



                                    </div>

                                </Col>
                                <Col >
                                    <div className='url' controlId='worksheet_link'>
                                        <label className='label6-ques'>WorkSheet Link</label><p></p>
                                        <input
                                            type="text"
                                            name="worksheet_link"
                                            className="input-ques"
                                            autoComplete="off"
                                            onChange={handleWorksheetChange}
                                        />
                                        {/* Live Preview for WorkSheet Link */}
                                    </div>
                                </Col>
                            </Row>


                        </Row>
                        <p></p>
                        <Row md={12}>
                            <Col>
                                <div className='actual' controlId='actual_content'>
                                    <label className='label6-ques'> Content Url</label><p></p>
                                    <input
                                        type="text"
                                        name="actual_content"
                                        className="input-ques"
                                        autoComplete="off"
                                        onChange={handleContentChange}

                                    />
                                </div>
                            </Col>


                            <Col >
                                <div className='url' controlId='content_url'>
                                    <label className='label6-ques'>Video URL</label><p></p>
                                    <input type="text" name="content_url" onChange={handleVideoChange} placeholder="" className="input-ques" autocomplete="off" />
                                </div>
                            </Col>
                        </Row>
                        <p></p>
                        <Row style={{ display: "flex", justifyContent: "space-between", gap: "20px" }}>
                            <div style={{ flex: 1, maxWidth: "20%", marginLeft: "-20px" }}>
                                {selectedDocEmbed && (
                                    <div
                                        className="embedded-document"
                                        dangerouslySetInnerHTML={{ __html: selectedDocEmbed }}
                                    />
                                )}
                            </div>

                            <div style={{ flex: 1, maxWidth: "20%", marginLeft: "3px" }}>
                                {selectedWorksheetEmbed && (
                                    <div
                                        className="embedded-document"
                                        dangerouslySetInnerHTML={{ __html: selectedWorksheetEmbed }}
                                    />
                                )}
                            </div>

                            <div style={{ flex: 1, maxWidth: "30%", marginRight: "-20px" }}>
                                {selectedVideoUrl && (
                                    <iframe
                                        src={selectedVideoUrl}
                                        width="100%"
                                        height="315"
                                        frameBorder="0"
                                        allowFullScreen
                                        allow="autoplay; encrypted-media"
                                        sandbox="allow-same-origin allow-scripts allow-presentation"
                                        title="Video Player"
                                    ></iframe>
                                )}
                            </div>
                        </Row>


                        <p><p></p></p>
                        <br />
                        <Row>
                            <Col>
                                <div className="button-container-lms">
                                    <button
                                        className="button-ques-save1 btn btn-secondary back-button-lms"
                                        style={{
                                            width: "100px",
                                            color: 'black',
                                            height: '50px',
                                            backgroundColor: '#F1A128',
                                            cursor: 'not-allowed'
                                        }}
                                        disabled
                                    >
                                        <img src={back} className='nextarrow' alt="Back" />
                                        <span className="button-text">Back</span>
                                    </button>

                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className='button-ques-save save-button-lms'
                                        style={{ width: "100px" }}
                                    >
                                        Save
                                    </button>

                                    <button

                                        className="button-ques-save1 btn btn-secondary back-button-lms"

                                        style={{
                                            width: "100px",
                                            color: 'black',
                                            height: '50px',
                                            backgroundColor: '#F1A128',
                                            cursor: 'not-allowed'
                                        }}
                                        disabled
                                    >
                                        <span className="button-text">Next</span>
                                        <img src={Nextarrow} className='nextarrow' alt="Next" />
                                    </button>
                                </div>
                            </Col>
                        </Row>
                        <p></p>
                    </Form>


                </div>
                <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

            </div><p style={{ height: "50px" }}></p>
            {/*  <Footer></Footer>*/}</div>
    );

};

export default FormModal;
