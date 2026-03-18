import React, { useState, useEffect } from "react";
import {
  generateMCQQuestions_API_upload,
  generateCodingQuestions_API_upload,
  getSkilltypeApi,
  getqstntypeApi,getFoldersByQuestionSkillApi
} from '../../api/endpoints';
import { Col, Row, Form, Button } from "react-bootstrap";
const GenerateQuestionsForm = () => {
  const [form, setForm] = useState({
    test_type: "",
    topic: "",
    sub_topic: "",
    folder_name: "",
    difficulty_level: "Easy",
    no_of_questions: "",
    is_testcases: false,
    download: false,
     remarks: "",   
     duration_of_test: "", 
     question_text: "",
  });

  const [questionTypes, setQuestionTypes] = useState([]);
  const [loading, setLoading] = useState(false);
   const [skillTypes, setSkillTypes] = useState([]);
const [folderList, setFolderList] = useState([]);

  // 🔹 Load Topic dropdown
  useEffect(() => {
    getqstntypeApi()
      .then((res) => {
        setQuestionTypes(res);
      })
      .catch(() => {
        alert("Failed to load topics");
      });
  }, []);

  // 🔹 Load Sub Topic dropdown based on Topic
useEffect(() => {
  if (!form.topic) {
    setSkillTypes([]);
    return;
  }

  getSkilltypeApi().then((res) => {
    const filtered = res.filter(
      (s) => s.question_type_name === form.topic
    );
    setSkillTypes(filtered);
  });
}, [form.topic]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };
const getQuestionTypeId = () => {
  const qt = questionTypes.find(q => q.question_type === form.topic);
  return qt ? qt.id : null;
};

const getSkillTypeId = () => {
  const st = skillTypes.find(s => s.skill_type === form.sub_topic);
  return st ? st.id : null;
};

useEffect(() => {
  const questionTypeId = getQuestionTypeId();
  const skillTypeId = getSkillTypeId();

  if (!questionTypeId || !skillTypeId) {
    setFolderList([]);
    return;
  }

  getFoldersByQuestionSkillApi(questionTypeId, skillTypeId)
    .then((res) => {
      // API returns [{id, folder_name}]
      setFolderList(res.map(f => f.folder_name)); // 👈 STORE STRING ONLY
    })
    .catch(() => {
      setFolderList([]);
    });

}, [form.topic, form.sub_topic]);

useEffect(() => {
  if (form.remarks === "PracticeTest") {
    setForm(prev => ({
      ...prev,
      duration_of_test: "",
    }));
  }
}, [form.remarks]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  const payload = {
    test_type: form.test_type,
    topic: form.topic,
    sub_topic: form.sub_topic,
    folder_name: form.folder_name,
    difficulty_level: form.difficulty_level,
    no_of_questions: Number(form.no_of_questions),
    download: form.download,
    remarks: form.remarks,
  };

  // ✅ add conditionally AFTER payload is created
  if (form.remarks !== "PracticeTest") {
    payload.duration_of_test = Number(form.duration_of_test);
  }
  // ✅ send only if user entered text
if (form.question_text && form.question_text.trim() !== "") {
  payload.question_text = form.question_text;
}

  try {
    if (form.test_type === "MCQ Test") {
      await generateMCQQuestions_API_upload(payload);
      alert("✅ MCQ Questions Generated");
    } else {
      await generateCodingQuestions_API_upload({
        ...payload,
        is_testcases: form.is_testcases,
      });
      alert("✅ Coding Questions Generated");
    }
  } catch (err) {
    console.error(err);
    alert("❌ Error generating questions");
  } finally {
    setLoading(false);
  }
};


  return (
    <form onSubmit={handleSubmit} className="form-ques-compo">
      <h3>Generate Questions</h3>

     <Row md={12}>
                         <Col><label>Test Type</label><p></p>
     <select
  name="test_type"
  value={form.test_type}
  className="input-ques"
  onChange={handleChange}
  required
>
  <option value="">-- Select Test Type --</option>
  <option value="MCQ Test">MCQ Test</option>
  <option value="Coding Test">Coding Test</option>
</select>
</Col>
                         <Col> <label>Topic</label><p></p>
      <select
  name="topic"
  value={form.topic}
  onChange={handleChange}
  className="input-ques"
>
  <option value="">-- Select Topic --</option>
  {questionTypes.map((q) => (
    <option key={q.id} value={q.question_type}>
      {q.question_type}
    </option>
  ))}
</select>
</Col>
                         </Row>
      
     <p></p>
<Row md={12}>
                         <Col><label>Sub Topic</label><p></p>
     <select
  name="sub_topic"
  value={form.sub_topic}
  onChange={handleChange}
  className="input-ques"
  disabled={!skillTypes.length}
>
  <option value="">-- Select Sub Topic --</option>
  {skillTypes.map((s) => (
    <option key={s.id} value={s.skill_type}>
      {s.skill_type}
    </option>
  ))}
</select>
</Col>
                         <Col> <label>Folder Name</label><p></p>
    <select
  name="folder_name"
  value={form.folder_name}
  onChange={handleChange}
  className="input-ques"
  disabled={!folderList.length}
>
  <option value="">-- Select Folder --</option>
  {folderList.map((f, index) => (
    <option key={index} value={f}>
      {f}
    </option>
  ))}
</select>


</Col>
                         </Row><p></p>
    
    <Row>
        <Col><label>Difficulty</label><p></p>
      <select
      className="input-ques"
        name="difficulty_level"
        value={form.difficulty_level}
        onChange={handleChange}
      >
        <option value="Easy">Easy</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Difficulty">Difficulty</option>
        <option value="Challenging">Challenging</option>
      </select></Col>
        <Col>{/* Count */}
      <label>No of Questions</label><p></p>
      <input
        type="number"
        className="input-ques"
        name="no_of_questions"
        min="1"
        value={form.no_of_questions}
        onChange={handleChange}
        required
     />
</Col>
    </Row>
      
<p></p>
      <Row>
     <Col>
    <label>Test Method</label>
    <p></p>
    <select
      name="remarks"
      value={form.remarks}
      onChange={handleChange}
      className="input-ques"
      required
    >
      <option value="">-- Select --</option>
      <option value="Pre-Assessment">Pre-Assessment</option>
                    <option value="Post-Assessment">Post-Assessment</option>
                    <option value="Mock/Interview">Mock/Interview</option>
                    <option value="College">College</option>
                    <option value="Assessment">Assessment</option>
                    <option value="PracticeTest">PracticeTest</option>
    </select>
  </Col>
   <Col>
    <label>Question Text (Optional)</label>
    <p></p>
    <textarea
      name="question_text"
      value={form.question_text}
      onChange={handleChange}
      className="input-ques"
      rows="3"
      placeholder="Enter question text if you want AI to generate based on this..."
    />
  </Col>
  {/* ⏱ Duration – required except PracticeTest */}
   <Col>
{form.remarks && form.remarks !== "PracticeTest" && (
 <div>
   
      <label>Duration of Test (Minutes)</label>
      <p></p>
      <input
        type="number"
        name="duration_of_test"
        className="input-ques"
        min="1"
        value={form.duration_of_test}
        onChange={handleChange}
        required
      />
      </div>
    
 
)}
</Col>
</Row><p></p>

 {/*}  <Col>
      <label>
        <input
          type="checkbox"
          name="download"
          checked={form.download}
          onChange={handleChange}
       /><p></p>
        Download Excel
      </label></Col>*/}
      

<Row>
   <Col>
      {form.test_type === "Coding Test" && (
        <label>
          <input
            type="checkbox"
            name="is_testcases"
            checked={form.is_testcases}
            onChange={handleChange}
         /><p></p>
          Include Test Cases
        </label>
      )}
</Col>
<Col></Col>
</Row>
     <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
  <button
    className="button-ques-save save-button-lms"
    type="submit"
    disabled={loading}
  >
    {loading ? "Generating..." : "Generate"}
  </button>
</div>

    </form>
  );
};

export default GenerateQuestionsForm;
