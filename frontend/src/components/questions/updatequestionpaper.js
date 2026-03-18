import React, { useState, useEffect } from "react";
import { Col, Row, Form, Button } from "react-bootstrap";
import Select from "react-select";
import {
  updateQuestionPaperApi,
  getQuestionPaperByIdApi,getSkilltypeApi,  getqstntypeApi,
getFoldersByQuestionSkillApi
} from "../../api/endpoints";
import { useParams, Link } from "react-router-dom";
import ErrorModal from "../auth/errormodal";
import { useNavigate } from "react-router-dom";
import Nextarrow from "../../assets/images/nextarrow.png";
import back from "../../assets/images/backarrow.png";
import { format } from "date-fns";

const QuestionPaper = () => {
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showInputField, setShowInputField] = useState(false);

  const [showInputFieldSubTopic, setShowInputFieldSupTopic] = useState(false);
  const [showInputFieldTopic, setShowInputFieldTopic] = useState(false);


  const { id } = useParams();
  console.log("print id", id);
  const [formData, setFormData] = useState({
    question_paper_name: "",
    duration_of_test: "",
    topic: "",
    sub_topic: "",
    folder_name: "",
    remarks: "", audio_text: ""
  });

const [topics, setTopics] = useState([]);          // [{id, name}]
const [subtopics, setSubtopics] = useState([]);    // [{id, name}]
const [folders, setFolders] = useState([]);        // [{id, name}]

const [topicId, setTopicId] = useState(null);
const [subtopicId, setSubtopicId] = useState(null);
const [folderId, setFolderId] = useState(null);

  const [selectedSubtopic, setSelectedSubtopic] = useState('');

  const [topic, setTopic] = useState('');
 
  const [selectedFolder, setSelectedFolder] = useState([]);
  const [selectedFolderName, setSelectedFolderName] = useState('');

useEffect(() => {
  getqstntypeApi().then(res => {
    const list = res?.data || res || [];
    setTopics(list.map(t => ({
      id: t.id,
      name: t.question_type
    })));
  });
}, []);


  const handleTopicChange = (e) => {
  const id = e.target.value;
  const name = topics.find(t => String(t.id) === id)?.name || '';

  setTopicId(id);
  setSubtopicId(null);
  setFolderId(null);

  setFormData(p => ({
    ...p,
    topic: name,        // string only
    sub_topic: '',
    folder_name: ''
  }));

  getSkilltypeApi().then(res => {
    const list = res?.data || res || [];
    const filtered = list
      .filter(s => String(s.question_type_id) === id)
      .map(s => ({ id: s.id, name: s.skill_type }));
    setSubtopics(filtered);
  });
};
const handleSubtopicChange = (e) => {
  const id = e.target.value;
  const name = subtopics.find(s => String(s.id) === id)?.name || '';

  setSubtopicId(id);

  setFormData(p => ({
    ...p,
    sub_topic: name   // string only
  }));

  getFoldersByQuestionSkillApi(topicId, id).then(res => {
    const list = res?.data || res || [];
    setFolders(list.map(f => ({ id: f.id, name: f.folder_name })));
  });
};
const handleFolderChange = (e) => {
  const id = e.target.value;
  const name = folders.find(f => String(f.id) === id)?.name || '';

  setFolderId(id);

  setFormData(p => ({
    ...p,
    folder_name: name   // string only
  }));
};




  const handleSelectionChange = (selectedOptions) => {
    console.log('SelectesOption: ', selectedOptions.value);
    setSelectedFolder(selectedOptions || []);
    setSelectedFolderName(selectedOptions.value);


    setFormData((prevData) => ({
      ...prevData,
      folder_name: selectedOptions.value,
    }));
  };

useEffect(() => {
  getQuestionPaperByIdApi(id)
    .then(async (data) => {
      setFormData({
        question_paper_name: data.question_paper_name || "",
        duration_of_test: data.duration_of_test || "",
        topic: data.topic || "",
        sub_topic: data.sub_topic || "",
        folder_name: data.folder_name || "",
        remarks: data.remarks || '',
        audio_text: data.audio_text || ""
      });

      // Find topicId from topics list
      const t = topics.find(x => x.name === data.topic);
      if (!t) return;

      setTopicId(t.id);

      // Load subtopics for that topic
      const res1 = await getSkilltypeApi();
      const list1 = res1?.data || res1 || [];
      const filteredSub = list1
        .filter(s => String(s.question_type_id) === String(t.id))
        .map(s => ({ id: s.id, name: s.skill_type }));

      setSubtopics(filteredSub);

      const s = filteredSub.find(x => x.name === data.sub_topic);
      if (!s) return;

      setSubtopicId(s.id);

      // Load folders for topic + subtopic
      const res2 = await getFoldersByQuestionSkillApi(t.id, s.id);
      const list2 = res2?.data || res2 || [];
      const mappedFolders = list2.map(f => ({ id: f.id, name: f.folder_name }));
      setFolders(mappedFolders);

      const f = mappedFolders.find(x => x.name === data.folder_name);
      if (f) setFolderId(f.id);
    })
    .catch((error) => {
      console.error("Failed to fetch question paper", error);
      setErrorMessage("Failed to fetch question paper. Please try again.");
      setShowError(true);
    });
}, [id, topics]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const navigate = useNavigate();
  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    console.log("print formdata", formData)
    if (!formData.duration_of_test || String(formData.duration_of_test).trim() === "") {
      formData.duration_of_test = null;
    }
   const payload = {
    ...formData,              // contains topic, sub_topic, folder_name as string
    folder_name_id: folderId  // only ID you send
  };

    // Fetch existing question papers to validate unique topic-subtopic pairs
    updateQuestionPaperApi(id, payload)
      .then((result) => {
        navigate("/question-paper-table");
        // Handle success (e.g., show a success message or navigate to another page)
        console.log("Question paper updated successfully", result);
      })
      .catch((error) => {
        console.error("Failed to update question paper", error);
        alert("Failed to update question paper. Check console for details.");
      });
  };

  const handleCloseError = () => {
    setShowError(false);
  };




  return (
    <div className="form-ques1">
      <div className="form-ques-codepap">
        <div>
          <form
            className="form-ques-upd"
            onSubmit={(e) => handleSubmit(e, formData)}
          >
            <Row md={12}>
              <Col>
                <div className="questionName" controlId="question_paper_name">
                  <label className="label6-ques">Question Paper Name</label>
                  <p></p>
                  <input
                    type="text"
                    className="input-ques"
                    name="question_paper_name"
                    required
                    placeholder=""
                    autoComplete="off"
                    value={formData.question_paper_name}
                    onChange={handleInputChange}
                  />{" "}
                </div>
              </Col>

              <Col>
                <div className="duration" controlId="duration_of_test">
                  <label className="label7-ques">Duration of the Test</label>
                  <p></p>
                  <input
                    type="number"
                    name="duration_of_test"
                    // required
                    placeholder=""
                    autoComplete="off"
                    className="input-ques-dur"
                    min="0"
                    value={formData.duration_of_test}
                    onChange={handleInputChange}
                  />
                </div>
              </Col>
            </Row>
            <p></p>

            <Row md={12}>
              <Col>
                <div controlId="topic">
                  <label className="label6-ques">Topic
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
                   <select className='input-ques-topic' value={topicId || ''} onChange={handleTopicChange}>
  <option value="">Select Topic</option>
  {topics.map(t => (
    <option key={t.id} value={t.id}>{t.name}</option>
  ))}
</select>

                  ) : (
                    <input
                      type="text"
                      className="input-ques"
                      placeholder="Enter new topic"
                      value={formData.topic}
                      onChange={(e) => {
                        const value = e.target.value;
                        setTopic(value);
                       setSubtopics([]);   // because new topic has no subtopics yet

                        setFormData((prevData) => ({
                          ...prevData,
                          topic: value,
                        }));
                      }}
                    />
                  )}
                </div>
              </Col>
              <Col>
                <div controlId="selectedSubTopic">
                  <label className="label7-ques"> Sub Topic
                    <Button
                      variant="link"
                      onClick={() => setShowInputFieldSupTopic(!showInputFieldSubTopic)}
                      style={{ color: '#fff', marginLeft: '10px', padding: 0 }}
                    >
                      {showInputFieldSubTopic ? (
                        <i className="bi bi-x-circle"></i> // Use 'x' for close
                      ) : (
                        <i className="bi bi-plus-circle"></i> // Use plus for open
                      )}
                    </Button>
                  </label><p></p>
                  {!showInputFieldSubTopic ? (
                  <select value={subtopicId || ''} className='input-ques-topic' onChange={handleSubtopicChange} disabled={!subtopics.length}>
  <option value="">Select Subtopic</option>
  {subtopics.map(s => (
    <option key={s.id} value={s.id}>{s.name}</option>
  ))}
</select>

                  ) : (
                    <input
                      type="text"
                      className="input-ques"
                      placeholder="Enter new sub topic"
                      value={formData.sub_topic}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedSubtopic(value);
                        setFormData((prevData) => ({
                          ...prevData,
                          sub_topic: value,
                        }));
                      }}
                    />
                  )}

                </div>
              </Col>
            </Row><p></p>
            <Row>
              <Col>
                <div className="questionName" controlId="folder_name">
                  <label className="label6-ques">Folder Name
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
                   <select className='input-ques-topic' value={folderId || ''} onChange={handleFolderChange} disabled={!folders.length}>
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
                        const value = e.target.value;
                        setSelectedFolder(e.target.value);
                        setSelectedFolderName(e.target.value);
                        setFormData((prevData) => ({
                          ...prevData,
                          folder_name: value,
                        }));
                      }}
                    />
                  )}
                </div>
                {" "}
              </Col>
              <Col>
                <div controlId="remarks">
                  <label className="label5-ques">Test Type</label><p></p>
                  <select
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleInputChange}
                    className="input-ques-topic"
                    required
                  >
                    <option value="">Select Test Type</option>
                    <option value="Pre-Assessment">Pre-Assessment</option>
                    <option value="Post-Assessment">Post-Assessment</option>
                    <option value="Mock/Interview">Mock/Interview</option>
                    <option value="College">College</option>
                    <option value="Assessment">Assessment</option>
                    <option value="PracticeTest">PracticeTest</option>
                   
                  </select>
                </div>
              </Col>

            </Row>
            <p ></p>

            {formData.remarks === "AudioMCQ" && (
              <Row>
                <Col>
                  <div className="questionName" controlId="audio_text">
                    <label className="label6-ques">Audio Text</label>
                    <p></p>
                    <input
                      type="text"
                      className="input-ques"
                      name="audio_text"
                      placeholder="Enter audio text"
                      autoComplete="off"
                      value={formData.audio_text}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </Col>
              </Row>
            )}

            <p ></p>
            <Row>
              <Col>
                <div className="button-container-lms">
                  <Link to="/question-paper-table"
                    style={{ color: "black", textDecoration: "none" }}
                  >     <button
                    className="button-ques-save btn btn-secondary back-button-lms"
                    style={{

                      color: "black",

                    }}

                  >
                      <img src={back} className="nextarrow"></img>
                      <span className="button-text">Back</span>
                    </button></Link>
                  <button
                    style={{ width: "100px" }}
                    className="button-ques-save save-button-lms"
                    type="submit"
                  >
                    Update
                  </button>
                  <button
                    className="button-ques-save btn btn-secondary next-button-lms"
                    disabled
                    style={{
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
                </div>
              </Col>
            </Row>
          </form>
          <p></p>
        </div>
      </div>
      <ErrorModal
        show={showError}
        handleClose={handleCloseError}
        errorMessage={errorMessage}
      />
    </div>
  );
};

export default QuestionPaper;
