/* global google */
import React, { useState, useEffect } from 'react';
import { Col, Row, Form, Button } from 'react-bootstrap';
import Select from 'react-select';
import {
    addQuestionpaperApi,

    addQuestionpaperApi_place,getSkilltypeApi,  getqstntypeApi,
getFoldersByQuestionSkillApi
} from '../../api/endpoints';
import ExcelJS from 'exceljs';
import physico from '../../assets/sample_physico.xlsx';

import { FiDownload } from "react-icons/fi";
import Word from '../../assets/sample_mcq_word_questions.docx';
import Wordpsy from '../../assets/word_psycho.docx';
import MCQForm from './mcqform';
import ImportFuncode from './importcode';
import ImportMCQ from './importmcq';
import '../../styles/trainingadmin.css'
import Nextarrow from '../../assets/images/nextarrow.png'
import back from '../../assets/images/backarrow.png';
import Fooer from '../../footer/footer';
import ErrorModal from '../auth/errormodal';
import ImportMCQWord from './importmcqword';
import { gapi } from "gapi-script";

import { useNavigate } from "react-router-dom";
import { useTestQuesContext } from '../../placementofficer/test/context/testquescontext';
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

            width: '99%'
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
            width: '99%'
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

const exportMCQToExcel = (questions) => {
    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Questions');


    const header = [
        { header: 'Questions**', key: 'question_text', width: 40 },
        { header: 'Option A', key: 'option_a', width: 20 },
        { header: 'Option B', key: 'option_b', width: 20 },
        { header: 'Option C', key: 'option_c', width: 20 },
        { header: 'Option D', key: 'option_d', width: 20 },
        { header: 'Answer**', key: 'answer', width: 15 },
        { header: 'Mark**', key: 'mark', width: 15 },
        { header: 'Difficulty Level', key: 'difficulty_level', width: 40 },
        { header: 'Explain Answer', key: 'explain_answer', width: 40 },
    ];


    // Add the header row
    worksheet.columns = header;

    // Apply orange background color and black text color to header cells
    worksheet.getRow(1).eachCell(cell => {
        cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFA500' } // Orange color
        };
        cell.font = {
            color: { argb: '00000000' }, // Black color
            bold: true
        };
        cell.border = {
            top: { style: 'thin', color: { argb: 'FF000000' } }, // Black border
            left: { style: 'thin', color: { argb: 'FF000000' } },
            bottom: { style: 'thin', color: { argb: 'FF000000' } },
            right: { style: 'thin', color: { argb: 'FF000000' } }
        };
    });

    // Filter out unwanted fields and add rows to the worksheet
    questions.forEach(({ id, input_format, view_hint, question_id, negative_mark, ...rest }) => {
        worksheet.addRow(rest);
    });

    // Save workbook as Excel file
    workbook.xlsx.writeBuffer().then(buffer => {
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Sample_MCQ_Questions.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
    }).catch(error => {
        console.error('Error exporting to Excel:', error);
    });

};

// Define a constant sample question
const sampleQuestion = [
    {
        question_text: 'What is the capital of France?',
        option_a: 'Paris',
        option_b: 'Berlin',
        option_c: 'Madrid',
        option_d: 'Rome',
        answer: 'A',
        mark: '1',
        difficulty_level: "Challenging",
        explain_answer: 'Paris is the capital city of France.'
    }
];


const QuestionPaperMCQTest = ({ userRole, collegeName }) => {
    console.log("userrole check", userRole)

    const {
        setQuestionPaperCon,
        topicCon,
        subTopicCon,
        setSubtopicCon,
        // isTestAddQues
    } = useTestQuesContext();

    const [topic, setTopic] = useState(topicCon);
    const [showMCQForm, setShowMCQForm] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    // const [uploadType, setUploadType] = useState(true); // State to track the selected upload type
    const [showError, setShowError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [uploadType, setUploadType] = useState('Manual');
    const navigate = useNavigate();
    const [showInputField, setShowInputField] = useState(false);
    const [showInputFieldSubTopic, setShowInputFieldSupTopic] = useState(false);
    const [showInputFieldTopic, setShowInputFieldTopic] = useState(false);
const [topics, setTopics] = useState([]);
const [subtopics, setSubtopics] = useState([]);
const [folders, setFolders] = useState([]);
// For topic
const [selectedTopic, setSelectedTopic] = useState(null); // { id, name }
const [questionTypeId, setQuestionTypeId] = useState(null); // store id separately

// For subtopic
const [selectedSubtopic, setSelectedSubtopic] = useState(null); // { id, name }
const [skillTypeId, setSkillTypeId] = useState(null); // store id separately

// Folder already done
const [selectedFolder, setSelectedFolder] = useState(null);
const [selectedFolderName, setSelectedFolderName] = useState('');
const [selectedFolderId, setSelectedFolderId] = useState(null);



useEffect(() => {
    getqstntypeApi()
        .then((res) => {
            console.log("1. Raw response:", res);
            console.log("2. typeof res:", typeof res);
            console.log("3. res.data:", res?.data);

            let list = [];

            if (Array.isArray(res)) {
                console.log("4. Response is direct array");
                list = res;
            } else if (Array.isArray(res?.data)) {
                console.log("4. Response is inside res.data");
                list = res.data;
            } else if (Array.isArray(res?.data?.data)) {
                console.log("4. Response is inside res.data.data");
                list = res.data.data;
            } else {
                console.error("❌ Unknown response format:", res);
            }

            console.log("5. Final topic list:", list);

            setTopics(list.map(t => ({
                id: t.id,
                name: t.question_type
            })));
        })
        .catch((err) => console.error("Error fetching topics:", err));
}, []);

const handleTopicChange = (e) => {
   const topicId = e.target.value;
    const topicName = topics.find(t => t.id.toString() === topicId)?.name || '';

    setSelectedTopic({ id: topicId, name: topicName });
    setQuestionTypeId(topicId);   // store ID separately
    setSelectedSubtopic(null);
    setSkillTypeId(null);
    setSelectedFolder(null);
    setSelectedFolderName('');
    setSelectedFolderId(null);

    setFormData(prev => ({
        ...prev,
        topic: topicName,
        sub_topic: '',         // only string mandatory
        folder_name: '',       // only string mandatory
    }));
    // Fetch subtopics for this topic
    getSkilltypeApi()
    .then((res) => {
        console.log("Subtopic raw:", res);
        console.log("Subtopic res.data:", res?.data);

        let list = [];
        if (Array.isArray(res)) list = res;
        else if (Array.isArray(res?.data)) list = res.data;
        else if (Array.isArray(res?.data?.data)) list = res.data.data;

        console.log("Subtopic final list:", list);

        const filteredSubtopics = list
            .filter(sub => String(sub.question_type_id) === String(topicId))
            .map(sub => ({ id: sub.id, name: sub.skill_type }));

        console.log("Filtered subtopics:", filteredSubtopics);
        setSubtopics(filteredSubtopics);
    })
    .catch(err => console.error("Error fetching subtopics:", err));

    setFolders([]);
};
const handleSubtopicChange = (e) => {
   const subId = e.target.value;
    const subName = subtopics.find(s => String(s.id) === subId)?.name || '';

    setSelectedSubtopic({ id: subId, name: subName });
    setSkillTypeId(subId);   // store ID separately

    setFormData(prev => ({
        ...prev,
        sub_topic: subName  // string only for form
    }));
    
    if (selectedTopic?.id && subId) {
        console.log("Calling folder API with:", selectedTopic.id, subId);

        getFoldersByQuestionSkillApi(selectedTopic.id, subId)
          .then(res => {
              console.log("Folder API raw response:", res);

              const list = Array.isArray(res) ? res : res?.data || [];

              console.log("Final folder list:", list);

              setFolders(list.map(f => ({
                  id: f.id,
                  name: f.folder_name
              })));
          })
          .catch(err => console.error("Error fetching folders:", err));
    }
};


const handleFolderChange = (selectedOption) => {
    if (selectedOption) {
        setSelectedFolder({ id: selectedOption.id, name: selectedOption.name });
        setSelectedFolderName(selectedOption.name);
        setSelectedFolderId(selectedOption.id);

        setFormData(prev => ({
            ...prev,
            folder_name: selectedOption.name
        }));
    } else {
        setSelectedFolder(null);
        setSelectedFolderName('');
        setSelectedFolderId(null);

        setFormData(prev => ({
            ...prev,
            folder_name: ''
        }));
    }
};



    const handleUploadTypeChange = (type) => {
        setUploadType(type);
    };
 const initialFormData = userRole === 'Placement Officer'
        ? {
            question_paper_name: '',
            duration_of_test: '',
            topic: '',
            sub_topic: '',
            folder_name: '',
            no_of_questions: 0, // Initialize with appropriate default value
            upload_type: '', // Initialize with appropriate default value
            created_by: collegeName,
            remarks: ''   // ✅ new field
        }
        : {
            question_paper_name: '',
            duration_of_test: '',
            topic: '',
            sub_topic: '',
            folder_name: '',
            no_of_questions: 0, // Initialize with appropriate default value
            upload_type: '', // Initialize with appropriate default value
            remarks: ''   // ✅ new field
        };

    // Initialize formData with the computed initial state
    const [formData, setFormData] = useState(initialFormData);

    const handleCloseError = () => {
        setShowError(false);
    };
    const handleGoBackClick = () => {
        setShowMCQForm(false);
    };
    const handleNextButtonClick = () => {
        setShowMCQForm(true);
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    useEffect(() => {
        if (formData.topic === 'HDFC') {
            setFormData(prev => ({
                ...prev,
                sub_topic: 'Sample'
            }));
        }
    }, [formData.topic]);

    const isFormValid = () => {
        return (
            formData.question_paper_name !== '' &&
            formData.duration_of_test !== '' &&
            formData.topic !== '' &&
            (
                (formData.topic === 'Softskills' && true) || // sub_topic is optional for Softskills
                ((formData.topic === 'Aptitude' || formData.topic === 'Technical') && formData.sub_topic !== '') || // sub_topic is mandatory for Aptitude and Technical
                (formData.topic === 'HDFC' && formData.sub_topic !== '')  // sub_topic is mandatory for HDFC
            )
            // formData.folder_name !== ""
        );
    };


    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = (e, formData) => {
        if (e && e.preventDefault) e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        const MCQTest = "MCQ Test";
        console.log("📌 Validating Form Data...");

        // Check for missing required fields
        const requiredFields = [
            "question_paper_name",
            "duration_of_test",
            "topic",
            "sub_topic",
            "no_of_questions",
            "upload_type"
        ];

        const missingFields = requiredFields.filter((field) => !formData[field]);

        if (missingFields.length > 0) {
            console.error("❌ Missing Fields:", missingFields);
            alert(`Please fill all required fields: ${missingFields.join(", ")}`);
            return;
        }

        // Construct the question data
        const question = {
            test_type: MCQTest,
          topic: selectedTopic?.name || formData.topic,      // string for display
    sub_topic: selectedSubtopic?.name || formData.sub_topic,  // string
    folder_name: selectedFolderName || formData.folder_name,   // string
    folder_name_id: selectedFolderId || null,   // ID mandatory
    question_type_id: questionTypeId || null,  // ID optional
    skill_type_id: skillTypeId || null,  
            question_paper_name: formData.question_paper_name,
            no_of_questions: formData.no_of_questions,
            upload_type: formData.upload_type,
           
            duration_of_test: formData.duration_of_test,
            remarks: formData.remarks,
            ...(userRole === 'Placement Officer' && { created_by: collegeName }), // Conditionally add `created_by`
        };

        console.log('Question Paper Data: ', question);


        setQuestionPaperCon(formData.question_paper_name);
        setSubtopicCon(formData.sub_topic);

        // Select the appropriate API function based on userRole
        const apiFunction =
            userRole === 'Placement Officer' ? addQuestionpaperApi_place : addQuestionpaperApi;

        // Call the selected API function
        apiFunction(question)
            .then((result) => {
                console.log('Question Paper Added Successfully');
                setTimeout(() => {
                    setFormSubmitted(true);
                    if (formData.upload_type === 'Manual') {
                        handleNextButtonClick();
                    }
                }, 1000);
            })
            .catch((error) => {
                console.error('Failed to Add Data', error);
                alert('Failed to Add. Check console for details.');
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    };  
    useEffect(() => {
        console.log("Selected Topic in useEffect:", selectedTopic);
    }, [selectedTopic]);

   

    const handleExportMCQword = () => {
        // Path to the document in the public/assets directory
        const documentUrl = Word;

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = documentUrl;
        link.download = 'sample_mcq_word_questions.docx';

        // Append the link to the body
        document.body.appendChild(link);

        // Trigger a click on the link to start the download
        link.click();

        // Remove the link from the body
        document.body.removeChild(link);
    };
    const handleExportMCQwordpsyho = () => {
        // Path to the document in the public/assets directory
        const documentUrl = Wordpsy;

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = documentUrl;
        link.download = 'Sample_MCQ_Psyhometry.docx';

        // Append the link to the body
        document.body.appendChild(link);

        // Trigger a click on the link to start the download
        link.click();

        // Remove the link from the body
        document.body.removeChild(link);
    };
    const handleExportMCQ = async () => {
        try {
            exportMCQToExcel(sampleQuestion); // Use sampleQuestion for export
        } catch (error) {
            console.error('Error exporting code:', error);
        }
    };

    const handleExportmcqpsyo = () => {
        // Path to the document in the public/assets directory
        const documentUrl = physico;

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = documentUrl;
        link.download = 'Sample_physicometry.xlsx';

        // Append the link to the body
        document.body.appendChild(link);

        // Trigger a click on the link to start the download
        link.click();

        // Remove the link from the body
        document.body.removeChild(link);
    };
    const handleDownloadTemplate = () => {
        if (uploadType === 'Excel') {
            if (selectedTopic === 'Psychometry') {
                handleExportmcqpsyo();
            } else {
                handleExportMCQ();
            }
        } else if (uploadType === 'Word') {
            if (selectedTopic === 'Psychometry') {
                handleExportMCQwordpsyho();
            } else {
                handleExportMCQword();
            }
        } else {
            alert('Please select a valid Upload Type');
        }
    };

    return (

        <div className="form-ques-composite">
            {!showMCQForm ? (
                <div>
                    <div>
                        <Row>
                            <Col>
                                <Form onSubmit={(e) => handleSubmit(e, formData)} >

                                    <Row md={12}>

                                        <Col>
                                            <div className='ts' controlId='question_paper_name'>
                                                <label className='label5-ques'>Question Paper Name**</label><p></p>
                                                <input
                                                    type="text"
                                                    autocomplete="off"
                                                    className='input-ques'
                                                    name="question_paper_name"
                                                    required
                                                    placeholder=""
                                                    onChange={handleInputChange}
                                                //  readOnly={!uploadType}
                                                />   </div>
                                        </Col>

                                        <Col>
                                            <div className='duration' controlId='duration_of_test'>
                                                <label className='label5-ques' >Duration of the Test**</label><p></p>
                                                <input
                                                    type="number"
                                                    autocomplete="off"
                                                    name="duration_of_test"
                                                    required
                                                    placeholder=""
                                                    className='input-ques-dur'
                                                    min="0"
                                                    onChange={handleInputChange}
                                                //  readOnly={!uploadType}
                                                />

                                            </div>
                                        </Col>
                                    </Row><p></p><p></p>

                                    <Row md={12}>
                                        <Col>
                                            <div controlId='topic'>
                                                <label className='label5-ques'>Topic**
                                                 </label>  <p></p>
                                                  <select value={selectedTopic?.id || ''} onChange={handleTopicChange} className='input-ques-topic'>
    <option value="">Select Topic</option>
    {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
</select>                                   </div>
                                        </Col>

                                        
                                            <Col >
                                                <div controlId='selectedSubTopic'>
                                                    <label className='label5-ques'>  Sub Topic**
                                                        </label><p></p>
                                                   
<select
    value={selectedSubtopic?.id || ''}
    onChange={handleSubtopicChange}
    className='input-ques-topic'
    disabled={!subtopics.length}
>
    <option value="">Select Subtopic</option>
    {subtopics.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
</select>
                                                   
                                                </div>
                                            </Col>
                                      


                                    </Row>
                                    <p></p> <p></p>


                                    <Row>
                                       
                                            <Col>
                                                <div
                                                    className="questionName"
                                                    controlId="folder_name"
                                                >
                                                    <label className="label5-ques">
                                                        Folder Name**
                                                        
                                                    </label>
                                                    <p></p>

                                         
<select  className='input-ques-topic' onChange={(e) => {
    const f = folders.find(x => x.id.toString() === e.target.value);
    handleFolderChange(f);
}}>
    <option value="">Select Folder</option>
    {folders.map(f => (
        <option key={f.id} value={f.id}>{f.name}</option>
    ))}
</select>
         </div>                                     
                                              

                                                
                                            </Col>




                                       

                                        <Col>
                                            <div controlId="remarks">
                                                <label className="label5-ques">Test Type</label><p></p>
                                                <select name="remarks" value={formData.remarks} onChange={handleInputChange} className="input-ques-topic" required>
                                                    <option value="Select Test Type">Select Test Type</option>
                                                    {userRole === 'Placement Officer' ? (
                                                        <>
                                                            <option value="College">College</option>
                                                            <option value="Assessment">Assessment</option>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <option value="Pre-Assessment">Pre-Assessment</option>
                                                            <option value="Post-Assessment">Post-Assessment</option>
                                                            <option value="Mock/Interview">Mock/Interview</option>
                                                            <option value="College">College</option>
                                                            <option value="Assessment">Assessment</option>
                                                        </>
                                                    )}
                                                </select>

                                            </div>
                                        </Col>

                                    </Row><p></p>

                                    <Row md={12}>
                                        <Col>
                                            {uploadType === 'Manual' && (
                                                <React.Fragment>
                                                    < Col >
                                                        <div className='status' controlId='no_of_questions'>
                                                            <label className='label5-ques'>No of Questions</label><p></p>
                                                            <input
                                                                type="number"
                                                                autocomplete="off"
                                                                name="no_of_questions"
                                                                required
                                                                placeholder=""
                                                                className='input-no'
                                                                min="0"
                                                                onChange={handleInputChange}
                                                            />

                                                        </div>
                                                    </Col>


                                                </React.Fragment>


                                            )}
                                            {(uploadType === 'Excel' || uploadType === 'Word') && selectedTopic && (
                                                <div
                                                    onClick={handleDownloadTemplate}
                                                    title="Download Template"
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        backgroundColor: 'transparent',
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                        cursor: 'pointer',
                                                        color: '#fff',
                                                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                                    }}
                                                >
                                                    <FiDownload size={20} />
                                                </div>
                                            )}</Col>


                                        <Col >
                                            <div controlId='upload_type'>
                                                <label className='label5-ques'>Upload Questions</label><p></p><p></p>
                                                <div className="custom-radio-group">
                                                    <label className="custom-radio" style={{ marginLeft: "10px" }}>
                                                        <input
                                                            type="radio"
                                                            name="upload_type"
                                                            value="Manual"
                                                            // onChange={() => handleUploadTypeChange('Manual')}
                                                            onChange={(e) => {
                                                                handleUploadTypeChange('Manual');  // Call handleUploadTypeChange with the value 'Manual'
                                                                handleInputChange(e);  // Call handleInputChange with the event object e
                                                            }}
                                                            required
                                                        />
                                                        <span className="custom-radio-label" style={{ color: "white", marginLeft: "10px" }}>Manual</span>
                                                    </label>
                                                    <label className="custom-radio" style={{ marginLeft: "10px" }}>
                                                        <input
                                                            type="radio"
                                                            name="upload_type"
                                                            value="Excel"
                                                            onChange={(e) => {
                                                                handleUploadTypeChange('Excel');  // Call handleUploadTypeChange with the value 'Manual'
                                                                handleInputChange(e);
                                                                /*  if (selectedTopic === 'Psychometry') {
                                                                    handleExportmcqpsyo();
                                                                  }
                                                                  else {
                                                                      handleExportMCQ();
                                                                  }*/

                                                            }}
                                                            required
                                                        //  disabled={!isFormValid()}
                                                        />
                                                        <span className="custom-radio-label" style={{ color: "white", marginLeft: "10px" }}>Excel</span>
                                                    </label>
                                                    <label className="custom-radio" style={{ marginLeft: "10px" }}>
                                                        <input
                                                            type="radio"
                                                            name="upload_type"
                                                            value="Word"
                                                            onChange={(e) => {

                                                                handleUploadTypeChange('Word');  // Call handleUploadTypeChange with the value 'Manual'
                                                                handleInputChange(e);
                                                                       }}
                                                            required
                                                        //  disabled={!isFormValid()}
                                                        />
                                                        <span className="custom-radio-label" style={{ color: "white", marginLeft: "10px" }}>Word / Pdf</span>
                                                    </label>
                                                   
                                                </div>
                                            </div>
                                        </Col>

                                    </Row>
                                    <p></p>


                                    <Row>
                                        <Col>

                                            {uploadType === 'Manual' && (
                                                <React.Fragment>
                                                    <p ></p>

                                                    <div className="button-container-lms">
                                                        <button

                                                            className="button-ques-save btn btn-secondary back-button-lms"
                                                            style={{ float: "left", width: "100px", color: 'black', height: '50px', backgroundColor: '#F1A128', cursor: 'not-allowed' }}
                                                            disabled
                                                        ><img src={back} className='nextarrow' ></img>
                                                            <span className="button-text">Back</span>
                                                        </button>
                                                        <button type="submit" disabled={isSubmitting} className="button-ques-save save-button-lms" style={{ width: "100px" }}  >
                                                            Save
                                                        </button>


                                                        {/* <button className="button-ques-save save-button-lms" style={{ width: "100px" }} onClick={() => navigate("/test/test-schedules/")} >
                                                            AddTest
                                                        </button> */}
                                                    </div>
                                                </React.Fragment>
                                            )}

                                        </Col>
                                    </Row>

                                </Form>
                                <p></p><p></p>
                            </Col>

                        </Row>
                    </div>


                    {uploadType === 'Excel' && (
                        <div style={{ marginLeft: '0px' }}>
                            <div style={{ height: "140px" }}>
               <ImportMCQ
  isFormValid={isFormValid}
  selectedTopic={selectedTopic?.name}
  selectedSubtopic={selectedSubtopic?.name}
 
  selectedFolderName={selectedFolderName}
  selectedFolderId={selectedFolderId} // only ID
  formData={formData}
  handleSubmit={handleSubmit}
  collegeName={collegeName}
  userRole={userRole}
/>

            </div>
                            <p style={{ height: "50px" }}></p>
                        </div>
                    )}

                    {uploadType === 'Word' && (
                        <div style={{ marginLeft: '0px' }}>
                            <div style={{ height: "140px" }}>
                                <ImportMCQWord selectedTopic={selectedTopic} isFormValid={isFormValid} formData={formData} selectedFolderName={selectedFolderName} collegeName={collegeName} userRole={userRole} />
                            </div>
                            <p style={{ height: "50px" }}></p>
                        </div>
                    )}

                </div>) : (
                <div>
                    {userRole === 'Placement Officer' ? (
                        <MCQForm collegeName={collegeName} userRole={userRole}  selectedTopic={selectedTopic?.name}
  selectedSubtopic={selectedSubtopic?.name}
 
  selectedFolderName={selectedFolderName}
  selectedFolderId={selectedFolderId}  />
                    ) : (
                        <MCQForm  selectedTopic={selectedTopic?.name}
  selectedSubtopic={selectedSubtopic?.name}
 
  selectedFolderName={selectedFolderName}
  selectedFolderId={selectedFolderId} />
                    )}
                </div>
            )}

            <ErrorModal show={showError} handleClose={handleCloseError} errorMessage={errorMessage} />

        </div>
    );

};

export default QuestionPaperMCQTest;