import React, { useState, useEffect } from "react";
import { Col, Row, Form, Button } from "react-bootstrap";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import {
  addQuestionpaperApi,

  addQuestionpaperApi_place,getSkilltypeApi,  getqstntypeApi,
  getFoldersByQuestionSkillApi
} from "../../api/endpoints";
import ExcelJS from 'exceljs';
import allWord from '../../assets/all-languages-coding.docx'
import allWordtestcase from '../../assets/all-languages-coding.docx'
import alllang from '../../assets/all languages.xlsx'
import testcase from '../../assets/testcase_coding_questions.xlsx'
import testcaseword from '../../assets/testcase_question.docx'
import testcaseAll from '../../assets/testcaseall.xlsx'
import Word from '../../assets/sample_coding_questions.docx';
import { FiDownload } from "react-icons/fi";
//import './QuestionPaperCode.css';
//import '../global.css';
import CodeForm from "./codeform";
import ImportFuncode from "./importcode";
import Nextarrow from "../../assets/images/nextarrow.png";
import ErrorModal from "../auth/errormodal";
import back from "../../assets/images/backarrow.png";
import Footer from "../../footer/footer";
import ImportCodeWord from "./importcodeword";
import { useTestQuesContext } from '../../placementofficer/test/context/testquescontext';


const exportCodeToExcel = (questions) => {
  // Create a new workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Questions-Code');

  const header = [
    { header: 'Questions**', key: 'question_text', width: 40 },
    { header: 'Answer**', key: 'answer', width: 25 },
    { header: 'Mark**', key: 'mark', width: 10 },
    { header: 'Explain Answer**', key: 'explain_answer', width: 40 },
    { header: 'Input Format', key: 'input_format', width: 30 },
    { header: 'Difficulty Level', key: 'difficulty_level', width: 30 },
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
  questions.forEach(({ id, option_a, option_b, option_c, option_d, view_hint, question_id, negative_mark, ...rest }) => {
    worksheet.addRow(rest);
  });

  // Ensure the width is set for the data rows
  worksheet.columns.forEach(column => {
    column.width = column.width || 20; // Default width if not specified
  });

  // Save workbook as Excel file
  workbook.xlsx.writeBuffer().then(buffer => {
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_Coding_questions.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  }).catch(error => {
    console.error('Error exporting to Excel:', error);
  });
};


// Define a constant sample question
const sampleQuestion = [
  {
    question_text: 'Multiply two float numbers and print the result',
    answer: 'Product of 1.20 and 3.40 is 4.0',
    mark: '25',
    explain_answer: 'printf("Hello, World!\n");',
    input_format: 'Here is a sample linae of code that can be executed in Python:print("Hello, World!"),You can just as easily store a string as a variable and then print it to stdout:, my_string = "Hello, World!"print(my_string)'
  }
];

const QuestionPaperCode = ({ userRole, collegeName,selectedTestTypeCategoryPass: testTypeCategory,selectedSkill, onCloseModal }) => {
   console.log('🔹 userRole:', userRole);
  console.log('🔹 collegeName:', collegeName);
  console.log('🔹 testTypeCategory:', testTypeCategory);
  console.log('🔹 selectedSkill:', selectedSkill);
  console.log('🔹 onCloseModal:', onCloseModal);
  const {
    setQuestionPaperCon,
    topicCon,
    subTopicCon,
    setSubtopicCon,
    // isTestAddQues
  } = useTestQuesContext();

  const [topic, setTopic] = useState(topicCon);
 
const [topics, setTopics] = useState([]);
const [subtopics, setSubtopics] = useState([]);
const [folders, setFolders] = useState([]);
  const [showMCQForm, setShowMCQForm] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadType, setUploadType] = useState("Manual");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();


  const [showInputField, setShowInputField] = useState(false);
  const [showInputFieldSubTopic, setShowInputFieldSupTopic] = useState(false);
  const [showInputFieldTopic, setShowInputFieldTopic] = useState(false);


  const handleUploadTypeChange = (type) => {
    setUploadType(type);
  };

  const [isTestCase, setIsTestCase] = useState(false);
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
      remarks: ''

    }
    : {
      question_paper_name: '',
      duration_of_test: '',
      topic: '',
      sub_topic: '',
      folder_name: '',
      no_of_questions: 0, // Initialize with appropriate default value
      upload_type: '',// Initialize with appropriate default value
      remarks: ''
    };



  // Initialize formData with the computed initial state
  const [formData, setFormData] = useState(initialFormData);
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

useEffect(() => {
  if (testTypeCategory) {
    setFormData(prev => ({
      ...prev,
      remarks: testTypeCategory
    }));
  }
}, [testTypeCategory]);

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


  const handleCloseError = () => {
    setShowError(false);
  };

  // const [uploadType, setUploadType] = useState(true); // State to track the selected upload type
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleNextbuttonClick = () => {
    setShowMCQForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const isFormValid = () => {
    return (
      formData.question_paper_name !== '' &&
      formData.duration_of_test !== '' &&
      formData.topic !== '' &&
      (
        (formData.topic === 'Softskills' && true) || // sub_topic is optional for Softskills
        ((formData.topic === 'Aptitude' || formData.topic === 'Technical' || formData.topic === 'CompanySpecific') && formData.sub_topic !== '') // sub_topic is mandatory for Aptitude and Technical
      )
      // formData.folder_name !== ""
    );
  };


  const handleCheckboxChange = (e) => {
    setIsTestCase(e.target.checked);
  };

  const handleSubmit = (e, formData) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    const MCQTest = "Coding Test";

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
        if (onCloseModal) {
        onCloseModal();
      }
        setTimeout(() => {
          setFormSubmitted(true);
          if (formData.upload_type === 'Manual') {
            handleNextbuttonClick();
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





  const handleSelectionChange = (selectedOptions) => {
    console.log('SelectesOption: ', selectedOptions.value);
    setSelectedFolder(selectedOptions || []);
    setSelectedFolderName(selectedOptions.value);
  };


  const handleExportCode = () => {
    // Export the constant sample question
    exportCodeToExcel(sampleQuestion);
  };


  const handleExportCoding = () => {
    // Path to the document in the public/assets directory
    const documentUrl = Word;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'sample_coding_questions.docx';

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger a click on the link to start the download
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
  };


  const handleExportAllLang = () => {
    // Path to the document in the public/assets directory
    const documentUrl = alllang;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'all languages.xlsx';

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger a click on the link to start the download
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
  };
  const handleExportTestcase = () => {
    // Path to the document in the public/assets directory
    const documentUrl = testcase;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'Testcase_questions.xlsx';

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger a click on the link to start the download
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
  };
  const handleExportTestcaseAll = () => {
    // Path to the document in the public/assets directory
    const documentUrl = testcaseAll;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'Testcase_questions.xlsx';

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger a click on the link to start the download
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
  };

  const handleExportTestcaseword = () => {
    // Path to the document in the public/assets directory
    const documentUrl = testcaseword;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'Testcase_questions.docx';

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger a click on the link to start the download
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
  };
  const handleExportAllLangword = () => {
    // Path to the document in the public/assets directory
    const documentUrl = allWord;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'all-languages-coding.docx';

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger a click on the link to start the download
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
  };
  const handleExportAllLangwordtestcase = () => {
    // Path to the document in the public/assets directory
    const documentUrl = allWordtestcase;

    // Create a temporary link element
    const link = document.createElement('a');
    link.href = documentUrl;
    link.download = 'all-languages-coding.docx';

    // Append the link to the body
    document.body.appendChild(link);

    // Trigger a click on the link to start the download
    link.click();

    // Remove the link from the body
    document.body.removeChild(link);
  };
  const handleDownloadTemplate = () => {
    if (uploadType === 'Excel') {
      if (selectedSubtopic === 'All Languages' && isTestCase) {
        handleExportTestcaseAll();
      } else if (isTestCase) {
        handleExportTestcase();
      } else if (selectedSubtopic === 'All Languages') {
        handleExportAllLang();
      } else {
        handleExportCode();
      }
    } else if (uploadType === 'Word') {
      if (selectedSubtopic === 'All Languages' && isTestCase) {
        handleExportAllLangwordtestcase();
      } else if (isTestCase) {
        handleExportTestcaseword();
      } else if (selectedSubtopic === 'All Languages') {
        handleExportAllLangword();
      } else {
        handleExportCoding();
      }
    }
  };

  return (
    <div className="form-ques-compo">
      {!showMCQForm ? (
        <div>
          <div>
            <Row>
              <Col>
                <Form
                  className="form-ques-compo"
                  onSubmit={(e) => handleSubmit(e, formData)}
                >
                  <Row md={12}>
                    <Col>
                      <div
                        className="questionName"
                        controlId="question_paper_name"
                      >
                        <label className="label6-ques">
                          Question Paper Name
                        </label>
                        <p></p>
                        <input
                          type="text"
                          className="input-ques"
                          name="question_paper_name"
                          required
                          placeholder=""
                          autocomplete="off"
                          onChange={handleInputChange}
                        />{" "}
                      </div>
                    </Col>

                    <Col>
                      <div className="duration" controlId="duration_of_test">
                        <label className="label7-ques">
                          Duration of the Test
                        </label>
                        <p></p>
                        <input
                          type="number"
                          name="duration_of_test"
                          required
                          placeholder=""
                          autocomplete="off"
                          className="input-ques-dur"
                          min="0"
                          onChange={handleInputChange}
                        />
                      </div>
                    </Col>
                  </Row>
                  <p></p>

                  <Row md={12}>
                    <Col>
                      <div controlId='topic'>
                        <label className='label6-ques'>Topic
                          
                        </label><p></p>
                       
   <select value={selectedTopic?.id || ''} onChange={handleTopicChange} className='input-ques-topic'>
    <option value="">Select Topic</option>
    {topics.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
</select>        
                       
                      </div>
                    </Col>




                   
                      <Col >
                        <div controlId='selectedSubTopic'>
                          <label className='label7-ques'>  Sub Topic
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
                    {(
                      <Col>
                        <div
                          className="questionName"
                          controlId="folder_name"
                        >
                          <label className="label5-ques">
                            Folder Name**
                            <Button
                              variant="link"
                              onClick={() => setShowInputField(!showInputField)}
                              style={{ color: '#fff', marginLeft: '10px', padding: 0 }}
                            >
                              {showInputField ? (
                                <i className="bi bi-x-circle"></i> // Use 'x' for close
                              ) : (
                                <i className="bi bi-plus-circle"></i> // Use plus for open
                              )}
                            </Button>
                          </label>
                          <p></p>

                          {!showInputField ? (

                           <select  className='input-ques-topic' onChange={(e) => {
    const f = folders.find(x => x.id.toString() === e.target.value);
    handleFolderChange(f);
}}>
    <option value="">Select Folder</option>
    {folders.map(f => (
        <option key={f.id} value={f.id}>{f.name}</option>
    ))}
</select>
                          ) : (
                            <input
                              type="text"
                              className="input-ques"
                              placeholder="Enter new folder name"
                              value={selectedFolderName}
                              onChange={(e) => {
                                setSelectedFolder(e.target.value);
                                setSelectedFolderName(e.target.value);
                              }}
                            />
                          )}
                        </div>

                        {" "}
                      </Col>

                    )}

                    <Col>
                      <div controlId="remarks">
                        <label className="label5-ques">Test Type</label>
                        <p></p>
                        <select
                          name="remarks"
                          value={formData.remarks}
                          onChange={handleInputChange}
                          className="input-ques-topic"
                          required
                        >
                          <option value="">Select Test Type</option>
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
                      <div controlId="upload_type">
                        <label className="label6-ques">Upload Questions</label>
                        <p></p>
                        <div className="custom-radio-group">
                          <label
                            className="custom-radio"
                            style={{ marginLeft: "10px" }}
                          >
                            <input
                              type="radio"
                              name="upload_type"
                              value="Manual"
                              // onChange={() => handleUploadTypeChange('Manual')}
                              onChange={(e) => {
                                handleUploadTypeChange("Manual"); // Call handleUploadTypeChange with the value 'Manual'
                                handleInputChange(e); // Call handleInputChange with the event object e
                              }}
                              required
                            />
                            <span
                              className="custom-radio-label"
                              style={{ color: "white", marginLeft: "10px" }}
                            >
                              Manual
                            </span>
                          </label>
                          <label
                            className="custom-radio"
                            style={{ marginLeft: "10px" }}
                          >
                            <input
                              type="radio"
                              name="upload_type"
                              value="Excel"
                              onChange={(e) => {
                                handleUploadTypeChange("Excel"); // Call handleUploadTypeChange with the value 'Manual'
                                handleInputChange(e);
                                /* setTimeout(() => {
                                   if (selectedSubtopic === 'All Languages' && isTestCase) {
                                     handleExportTestcaseAll();
                                   } else if (isTestCase) {
                                     handleExportTestcase();
                                   } else if (selectedSubtopic === 'All Languages') {
                                     handleExportAllLang();
                                   } else {
                                     handleExportCode();
                                   }
                                 }, 100);*/
                                // Call handleInputChange with the event object e
                              }}
                              required
                            // disabled={!isFormValid()}
                            />
                            <span
                              className="custom-radio-label"
                              style={{ color: "white", marginLeft: "10px" }}
                            >
                              Excel
                            </span>
                          </label>

                          <label className="custom-radio" style={{ marginLeft: "10px" }}>
                            <input
                              type="radio"
                              name="upload_type"
                              value="Word"
                              onChange={(e) => {
                                handleUploadTypeChange('Word');  // Call handleUploadTypeChange with the value 'Manual'
                                handleInputChange(e);
                                /* setTimeout(() => {
                                   if (selectedSubtopic === 'All Languages' && isTestCase) {
                                     handleExportAllLangwordtestcase();
                                   } else if (isTestCase) {
                                     handleExportTestcaseword();
                                   } else if (selectedSubtopic === 'All Languages') {
                                     handleExportAllLangword();
                                   } else {
                                     handleExportCoding();
                                   }
                                 }, 100);*/

                                // Call handleInputChange with the event object e
                              }}
                              required
                            //  disabled={!isFormValid()}
                            />
                            <span className="custom-radio-label" style={{ color: "white", marginLeft: "10px" }}>Word / pdf</span>
                          </label>
                        </div>
                      </div>
                    </Col>
                    {(
                      <Col>

                        <label className="label5-ques"> Is Test Case </label><p></p>
                        <input
                          type="checkbox"
                          checked={isTestCase}
                          onChange={handleCheckboxChange}
                        />

                      </Col>

                    )}

                  </Row>
                  <p>
                    <p></p>
                  </p>
                  <Col>
                    {uploadType === "Manual" && (
                      <React.Fragment>
                        <Col>
                          <div className="status" controlId="no_of_questions">
                            <label className="label7-ques">
                              No of Questions
                            </label>
                            <p></p>
                            <input
                              type="number"
                              autocomplete="off"
                              name="no_of_questions"
                              required
                              placeholder=""
                              min="0"
                              className="input-no"
                              onChange={handleInputChange}
                              style={{ width: "50%" }}
                            />
                          </div>
                        </Col>

                        <Col></Col>
                      </React.Fragment>
                    )}
                    {uploadType !== 'Manual' && selectedSubtopic && (
                      <div className="mt-3">
                        <div
                          className="download-circle"
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
                      </div>
                    )}
                  </Col>

                  <Row>

                    <Col>
                      {uploadType === "Manual" && (
                        <React.Fragment>
                          <p style={{ height: "0px" }}></p>

                          <div className="button-container-lms">
                            <button
                              className="button-ques-save1 btn btn-secondary back-button-lms"
                              style={{
                                float: "left",
                                width: "100px",
                                color: "black",
                                height: "50px",
                                backgroundColor: "#F1A128",
                                cursor: "not-allowed",
                              }}
                              disabled
                            >
                              <img src={back} className="nextarrow"></img>
                              <span className="button-text">Back</span>
                            </button>
                            <button
                              type="submit"
                              className="button-ques-save save-button-lms"
                              disabled={isSubmitting}
                              style={{ width: "100px" }}
                            >
                              Save
                            </button>
                            {/*}  {!formSubmitted && (
                              <button
                                onClick={handleNextbuttonClick}
                                className="button-ques-save btn btn-secondary next-button-lms"
                                disabled
                                style={{
                                  float: "right",
                                  width: "100px",
                                  backgroundColor: "#F1A128",
                                  cursor: "not-allowed",
                                  width: "100px",
                                  color: "black",
                                  height: "50px",
                                }}
                              >
                                <span className="button-text">Next</span>{" "}
                                <img
                                  src={Nextarrow}
                                  className="nextarrow"
                                  style={{ color: "#6E6D6C" }}
                                ></img>
                              </button>
                            )}

                            {formSubmitted && (
                              <button
                                onClick={handleNextbuttonClick}
                                className="button-ques-save next-button-lms"
                                style={{ float: "right", width: "100px" }}
                              >
                                <span className="button-text">Next</span>{" "}
                                <img
                                  src={Nextarrow}
                                  className="nextarrow"
                                ></img>
                              </button>
                            )}*/}
                            {/* <button className="button-ques-save save-button-lms" style={{ width: "100px" }} onClick={() => navigate("/test/test-schedules/")} >
                              AddTest
                            </button> */}
                          </div>


                          <p style={{ height: "0px" }}></p>
                        </React.Fragment>
                      )}
                    </Col>

                  </Row>
                </Form>
              </Col>
            </Row>{" "}
            <p></p>
          </div>

          {uploadType === "Excel" && (
            <div style={{ marginLeft: "0px" }}>
              <div style={{ height: "140px" }}>
                <ImportFuncode
                onSuccess={onCloseModal}
                  isFormValid={isFormValid}
                  formData={formData}
                  isTestCase={isTestCase}
                  handleSubmit={handleSubmit}
                 selectedTopic={selectedTopic?.name}
  selectedSubtopic={selectedSubtopic?.name}
 
  selectedFolderName={selectedFolderName}
  selectedFolderId={selectedFolderId} // only ID
                  collegeName={collegeName}
                  userRole={userRole}
                />
              </div>
              <p style={{ height: "50px" }}></p>
            </div>
          )}

          {uploadType === "Word" && (
            <div style={{ marginLeft: "0px" }}>
              <div style={{ height: "280px" }}>
                <ImportCodeWord onSuccess={onCloseModal} isFormValid={isFormValid} isTestCase={isTestCase} formData={formData} selectedFolderName={selectedFolderName} collegeName={collegeName}  selectedFolderId={selectedFolderId} 
                userRole={userRole} />
              </div>
              <p style={{ height: "50px" }}></p>
            </div>
          )}

          <div>
            {!uploadType && !showMCQForm && (
              <div style={{ height: "280px" }}>
                {" "}
                <ImportFuncode onSuccess={onCloseModal} isFormValid={isFormValid} formData={formData} selectedTopic={selectedTopic?.name}
  selectedSubtopic={selectedSubtopic?.name}
 
  selectedFolderName={selectedFolderName}
  selectedFolderId={selectedFolderId} 
   userRole={userRole} collegeName={collegeName} />
              </div>
            )}
          </div>
          <p style={{ height: "0px" }}></p>
        </div>
      ) : (
        <div>
          {userRole === 'Placement Officer' ? (
            <CodeForm collegeName={collegeName} onSuccess={onCloseModal}
            userRole={userRole} isTestCase={isTestCase} selectedTopic={selectedTopic?.name}
  selectedSubtopic={selectedSubtopic?.name}
 
  selectedFolderName={selectedFolderName}
  selectedFolderId={selectedFolderId} />
          ) : (
            <CodeForm isTestCase={isTestCase} selectedTopic={selectedTopic?.name}
  selectedSubtopic={selectedSubtopic?.name}
 onSuccess={onCloseModal}
  selectedFolderName={selectedFolderName}
  selectedFolderId={selectedFolderId}  />
          )}
        </div>
      )}

      <ErrorModal
        show={showError}
        handleClose={handleCloseError}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default QuestionPaperCode;
