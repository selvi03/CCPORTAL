import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, Modal } from "react-bootstrap";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import {
updateTotalAndAvgMarksApi,
  updateTestcadidateApi_is_active,
  updateTotalScoreTestcandidateApi,
  getTestAnswerMapApi,
  addTestAnswerMapApi_Code_Submit_Com_prrac,
  getTestcandidate_CODING_Api,
  updateTotalAndAvgMarksdeleteanswerApi,
  getQuestionApi_Filter_IO_CODE_practice,
  updateAutoTestReassign,
  Capture_Duration_Update_API,
  updateTestcadidateApi_submitted,
  updateTestcadidateApi_teststarted,
  getTestTypeCategory_testNameApi,
  incrementAttemptCount_API,
  getStudentId_API,
  getTestcandidate_MCQTestId_Api
} from "../../api/endpoints";
import { useLocation } from 'react-router-dom';
import CameraComponent from "../test/tests/cameracomponent";
import { useNavigate } from "react-router-dom";
import Timer from "../test/tests/timer";
import OnlineCoding from "../test/onlinecoding";
import ErrorModal from "../../components/auth/errormodal";
import { useTestContext } from "../test/contextsub/context";
import "../../styles/students.css";
import moment from "moment";
import CodingTimer from "../test/tests/codingtimer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AttendCodePracticeTest = ({
  collegeName,
  username,
  isSidebarOpen,
  disableSidebar,
  enableSidebar,
}) => {
  const {
    setQuestionIdCon,
    setTestIdCon,
    setStudentIdCon,
    setSelectedQuestionsCon,
    setTestStartTimeCon,
    codeWindow,
    setCodeWindow,
    languageSelected,
    customInputCom,
    outputWindowCom,
    setOutputWindowCom,
    skillTypeLanguage,
    isTestCase,
    testCases,
    setIsTestCase,
    setTestCases,
    testCasesResults,
  } = useTestContext();
const navigate = useNavigate();  // ⬅️ make sure this is at the very top of component
const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const [testCandidates, setTestCandidates] = useState([]);
  const [upcommingTests, setUpcommingTests] = useState([]);

  const [selectedTestCandidate, setSelectedTestCandidate] = useState(null);
  const [testStartTime, setTestStartTime] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [questionId_f, setQuestionId_f] = useState(null);
  const [testId_f, setTestId_f] = useState([null]);
  const [studentId_f, setStudentId_f] = useState(null);
  const [selectedQuestionID, setSelectedQuestionID] = useState(null);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showQuestionPage, setShowQuestionPage] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const outerTextRef = useRef("");
  const [completedQuestions, setCompletedQuestions] = useState([]);
  const [totalMarks, setTotalMarks] = useState(0);
  const [countMarks, setCountMarks] = useState(0);
  const [minsTaken, setMinsTaken] = useState("");
  const [secTaken, setSecTaken] = useState("");
  const [testCompleted, setTestCompleted] = useState(false);
  const [showFinalPage, setShowFinalPage] = useState(false); // State to control final page visibility

  const [testId_ans, setTestId_ans] = useState([null]);
  const [studentId_ans, setStudentId_ans] = useState(null);
  const [sbar, setSBar] = useState(false);
  const [salutation, setSalutation] = useState("");
  const [isReviewComplete, setIsReviewComplete] = useState(false);
  const currentDateOLD = new Date();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [processing, setProcessing] = useState(null);
  const [explainAnswer, setExplainAnswer] = useState(null);
  const [questionMark, setQuestionMark] = useState(0);
  const [questionAnswer, setQuestionAnswer] = useState(null);
  const [submittedResults, setSubmittedResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [testAnswers, setTestAnswers] = useState([]);
  const [isTotalScoreUpdated, setIsTotalScoreUpdated] = useState(false);
  const [testTypeCategory, setTestTypeCategory] = useState(null);
  const [studentIDs, setstudentIDs] = useState(null);
  const [triggerFetch, setTriggerFetch] = useState(true);
const [studentID, setstudentID] = useState(null);
  const [excelAnswers, setExcelAnswers] = useState([]);
 const location = useLocation();
  const tcm_id = location.state?.tcm_id;
    const testName = location.state?.test_name;
   // console.log("testname",testName)

  const [testCandidate, setTestCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const enterFullscreen = () => {
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen().catch(console.error);
  else if (el.mozRequestFullScreen) el.mozRequestFullScreen().catch(console.error);
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen().catch(console.error);
  else if (el.msRequestFullscreen) el.msRequestFullscreen().catch(console.error);
};
/*

// ⚡ Tab Switching Detection
useEffect(() => {
  if (!selectedTestCandidate || testCompleted) return;

  const handleVisibilityChange = () => {
    if (document.visibilityState === "hidden") {
      setTabSwitchCount(prev => {
        const newCount = prev + 1;
        if (newCount >= 3) {
          alert("You switched tabs too many times. Test will end now.");
          setTestCompleted(true);
          navigate("/dashboard");
        } else {
          alert(`Warning ${newCount}/3: Don't switch tabs during the test!`);
        }
        return newCount;
      });
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => {
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, [selectedTestCandidate, testCompleted, navigate]);

*/
// 📺 Fullscreen Exit Detection
useEffect(() => {
  if (!selectedTestCandidate || testCompleted) return;

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement && !testCompleted) {
      alert("You exited fullscreen. Returning to fullscreen...");
      enterFullscreen();
    }
  };

  const handleKeydown = (e) => {
    if (e.key === "Escape" && !testCompleted) {
      e.preventDefault();
      alert("You cannot exit fullscreen during the test.");
      enterFullscreen();
    }
  };

  document.addEventListener("fullscreenchange", handleFullscreenChange);
  document.addEventListener("keydown", handleKeydown);

  return () => {
    document.removeEventListener("fullscreenchange", handleFullscreenChange);
    document.removeEventListener("keydown", handleKeydown);
  };
}, [selectedTestCandidate, testCompleted]);

  useEffect(() => {
    console.log("🟡 useEffect triggered. Username:", username);

    if (username) {
      const fetchstudentID = async () => {
        console.log("🔄 Fetching student ID for:", username);

        try {
          const res = await getStudentId_API(username);
          console.log("✅ Student ID fetched successfully:", res);

          if (res && res.student_id) {
            setstudentIDs(res.student_id);  // ✅ Correct assignment
            console.log("📌 studentID set in state:", res.student_id);
          }

          else {
            console.warn("⚠️ API returned no 'id' in response:", res);
          }
        } catch (err) {
          console.error("❌ Failed to load student ID:", err);
        }
      };

      fetchstudentID();
    } else {
      console.warn("⚠️ Username is not defined.");
    }
  }, [username]);

  const handleCloseError = () => {
    setShowError(false);
  };
 
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);

  const [reassignCount, setReassignCount] = useState(0);
  const isTabSwitchMonitoringActive =
    !!selectedTestCandidate &&
    questions.length > 0 &&
    !testCompleted &&
    (showQuestionPage || selectedQuestion !== null);

  // Load reassignCount from localStorage when component mounts
 
 useEffect(() => {
   if (tcm_id) {
     setSelectedCandidateId(tcm_id);
   }
 }, [tcm_id]); 
 
 useEffect(() => {
   console.log("🟡 useEffect triggered. Username:", username);
 
   if (username) {
     const fetchstudentID = async () => {
       console.log("🔄 Fetching student ID for:", username);
 
       try {
         const res = await getStudentId_API(username);
         console.log("✅ Student ID fetched successfully:", res);
 
        if (res && res.student_id) {
           setstudentID(res.student_id);  // ✅ Correct assignment
           console.log("📌 studentID set in state:", res.student_id);
         }
           
          else {
           console.warn("⚠️ API returned no 'id' in response:", res);
         }
       } catch (err) {
         console.error("❌ Failed to load student ID:", err);
       }
     };
 
     fetchstudentID();
   } else {
     console.warn("⚠️ Username is not defined.");
   }
 }, [username]);
 
   useEffect(() => {
     if (!tcm_id) {
       setError("No test candidate ID found.");
       setLoading(false);
       return;
     }
   console.log("testdetails",tcm_id,testName)
     const fetchTestDetails = async () => {
  try {
    const response = await getTestcandidate_MCQTestId_Api(tcm_id);
    console.log("🧪 Raw API response:", response);
    console.log("📦 Is Array?", Array.isArray(response));

    const wrapped = Array.isArray(response) ? response : [response];

    setTestCandidate(wrapped[0]);  // or keep as is if needed
    setTestCandidates(wrapped);    // always an array now

    console.log("✅ Loaded test details:", wrapped);
  } catch (err) {
    console.error("❌ Failed to load test details:", err);
    setError("Failed to load test details.");
  } finally {
    setLoading(false);
  }
};

 
     fetchTestDetails();
   }, [tcm_id]);
 
 

  useEffect(() => {
    getTestTypeCategory_testNameApi(testId_f)
      .then((result) => {
        setTestTypeCategory(result.test_type_category);
      })
      .catch((error) => {
        console.error("Error fetching test type category:", error);
      });
  }, [testId_f]);

  

 /*useEffect(() => {
    // Check if UpcommingTests is empty before fetching new data
    if (!upcommingTests || upcommingTests.length === 0) {
      getTestCandidates();
    }
  }, [collegeName, username, upcommingTests, triggerFetch]);

  const getTestCandidates = () => {
    if (triggerFetch) {
      getTestcandidate_CODING_Api(username)
        .then((testCandidatesData) => {
          setTestCandidates(testCandidatesData);
          setUpcommingTests(testCandidatesData);
          console.log("upcommingTest: ", testCandidatesData);
          setTriggerFetch(false);

        })
        .catch((error) => {
          console.error("Error fetching test candidates:", error);
        });
    }
  };*/


  const handleTestCompletion = (e) => {
    e.preventDefault();
    setTestCompleted(true);
    handleSubmit(e); // Assume handleSubmit is defined elsewhere
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  const handlefinish = async (e) => {
    if (isReviewComplete) {
      // Handle save/finish logic
      console.log("Finished");
      const endTime = new Date();
      // Calculate the time taken in seconds
      const timeTakenInSeconds = Math.floor((endTime - testStartTime) / 1000);

      // Convert the time taken to minutes and seconds
      const minutesTaken = Math.floor(timeTakenInSeconds / 60);
      setMinsTaken(minutesTaken);
      const secondsTaken = timeTakenInSeconds % 60;
      setSecTaken(secondsTaken);

try {
    console.log("🟡 Calling updateTotalAndAvgMarksdeleteanswerApi...");
    const response = await updateTotalAndAvgMarksdeleteanswerApi(testName, studentId_f);
    console.log("✅ updateTotalAndAvgMarksdeleteanswerApi Response:", response);
  } catch (error) {
    console.error("❌ Failed in updateTotalAndAvgMarksdeleteanswerApi:", error);
  }

      try {

        enableSidebar();
        setCompletedQuestions([]);
        setTestAnswers([]);

        navigate("/dashboard");
      } catch (error) {
        // Handle errors from the delete API call
        console.error("Failed to delete test answer:", error);
      }
    } else {
      console.log("Review is not complete");
    }
  };



  const handleReassignment = async (testName, studentId_f) => {
    try {
      await updateAutoTestReassign(testName, studentId_f);
      console.log("Test reassigned successfully.");
    } catch (error) {
      console.error("Error reassigning test:", error);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSBar(false);
    // await updateTestcadidateApi_is_active(selectedCandidateId);
    await updateTestcadidateApi_submitted(selectedCandidateId);

    console.log(`✅ Attempt count incremented for test: ${testName}, student ID: ${studentId_f}`);
    setIsReviewComplete(true);
    const endTime = new Date();

    // Calculate the time taken in seconds
    const timeTakenInSeconds = Math.floor((endTime - testStartTime) / 1000);

    // Convert the time taken to minutes and seconds
    const minutesTaken = Math.floor(timeTakenInSeconds / 60);
    setMinsTaken(minutesTaken);
    const secondsTaken = timeTakenInSeconds % 60;
    setSecTaken(secondsTaken);

    // Display the time taken
    console.log(
      `Time taken: ${minutesTaken} minutes and ${secondsTaken} seconds`
    );
try {
    console.log("🟡 Calling updateTotalAndAvgMarksdeleteanswerApi...");
   const currentStudentId = studentId_f || studentID || selectedTestCandidate?.student_id__id;
   console.log("stu_id",currentStudentId)
const response = await updateTotalAndAvgMarksdeleteanswerApi(testName, currentStudentId);

    console.log("✅ updateTotalAndAvgMarksdeleteanswerApi Response:", response);
  } catch (error) {
    console.error("❌ Failed in updateTotalAndAvgMarksdeleteanswerApi:", error);
  }

    const totalTiming = `${minutesTaken} min ${secondsTaken} sec`;
    
    const incrementReassignCount = () => {
      const current = reassignCount + 1;
      setReassignCount(current);
      localStorage.setItem(`reassign_${studentId_f}_${testName}`, current);
      console.log("Updated count in localStorage:", current);
    };
    Capture_Duration_Update_API(selectedCandidateId, totalTiming)
      .then((data) => {
        if (data.status === "success") {
          console.log(`Duration updated: ${data.capture_duration}`);
        }
      })
      .catch((error) => {
        console.error("Error updating duration:", error);
      });

    setTestCompleted(true);
    const allQuestionIds = questions.map((question) => question.id);
    setCompletedQuestions(allQuestionIds);


    console.log("Checking conditions for updateAutoTestReassign:");
    console.log("testName:", testName);
    console.log("CandidateId:", studentId_f);
    const shouldReassignDueToScore = testTypeCategory === "Assessment" && totalResults === 0;
    const shouldReassignDueToTime = testTypeCategory === "Assessment" && minutesTaken <= 3;
    if ((shouldReassignDueToScore || shouldReassignDueToTime) && reassignCount < 3) {
      const reason = shouldReassignDueToScore
        ? "The test will be reassigned due to a zero score."
        : "The test will be reassigned due to insufficient duration.";

      if (window.confirm(reason + " Do you want to proceed?")) {
        setErrorMessage("Test Reassigned");
        setShowError(true);
        incrementReassignCount();
        await handleReassignment(testName, studentId_f);
        setCompletedQuestions([]);
        setTestAnswers([]);
        setQuestions([]);
        return

      } else {
        console.log("User declined reassignment.");
      }
    }

    if (reassignCount >= 3) {
      alert("Test reassignment limit reached (3 times only).");
    }
    setCompletedQuestions([]);
    setTestAnswers([]);
    setQuestions([]);
    setShowFinalPage(true);
  };
  useEffect(() => {
    const handleBeforeUnload = () => {

      setCompletedQuestions([]);
      setTestAnswers([]);

      setQuestions([]);

    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);


  const handleGoForTest = async (selectedCandidateId) => {
      enterFullscreen();
    console.log("🟡 Step 1: Go for Test clicked.");
    console.log("➡️ Received selectedCandidateId:", selectedCandidateId);
     
    const candidate = testCandidates.find(
      (candidate) => candidate.id === selectedCandidateId
    );
    console.log("🟡 Step 2: Matched candidate object for ID", selectedCandidateId, ":", candidate);

    if (!candidate) {
      console.error("❌ Candidate not found for selectedCandidateId:", selectedCandidateId);
      return;
    }

    setSelectedTestCandidate(candidate);
    console.log("🟢 Step 3: Candidate set as selectedTestCandidate.");

    setShowQuestionPage(true);
    console.log("🟢 Step 4: Question page shown for Candidate ID:", selectedCandidateId);

    setTestIdCon(candidate.test_name);
   // setTestName(candidate.test_name);
    setTestId_ans(candidate.test_name);
    setStudentId_ans(candidate.student_id__id);
    console.log("🟢 Step 5: Test name and student ID set.");
    console.log("➡️ Test Name:", candidate.test_name);
    console.log("➡️ Student ID:", candidate.student_id__id);

    const now = new Date();
    setTestStartTime(now);
    setTestStartTimeCon(now);
    console.log("🕒 Step 6: Test start time set to:", now);

    disableSidebar();
    setSBar(true);
    setShowFinalPage(false);
    console.log("🚀 Increment Attempt Input:", {
      test_name: testName,
      student_id: candidate?.student_id_id
    });

    await incrementAttemptCount_API({ test_name: testName, student_id: studentIDs });

    console.log("🛑 Step 7: Sidebar disabled and final page hidden.");

    console.log("📥 Step 8: Fetching questions for question_id__id:", testName);
    getQuestionApi_Filter_IO_CODE_practice(testName)
      .then((questionsData) => {
        console.log("✅ Step 9: Questions fetched for Candidate ID:", selectedCandidateId, "-", questionsData);
        setQuestions(questionsData);

        const totalMarks1 = questionsData.reduce(
          (total, question) => total + question.mark,
          0
        );
        setCountMarks(totalMarks1);
        console.log("🧮 Step 10: Total marks calculated:", totalMarks1);
      })
      .catch((error) => {
        console.error("❌ Error fetching questions for Candidate ID:", selectedCandidateId, "-", error);
      });

    try {
      console.log("🔄 Step 11: Updating test candidate status for ID:", selectedCandidateId);
      await updateTestcadidateApi_teststarted(selectedCandidateId);
      console.log("✅ Test candidate marked as started for ID:", selectedCandidateId);

      await updateTestcadidateApi_is_active(selectedCandidateId);
      console.log("✅ Test candidate marked as active for ID:", selectedCandidateId);
      setCompletedQuestions([]);
      const ts = 0;
      await updateTotalScoreTestcandidateApi(selectedCandidateId, {
        total_score: ts,
      });
      console.log("✅ Step 12: Total score initialized to 0 for ID:", selectedCandidateId);

      console.log("📦 Step 13: Fetching test answers for Candidate ID:", selectedCandidateId);
      const testAnswerData = await getTestAnswerMapApi(username, candidate.test_name);
      setTestAnswers(testAnswerData);
      console.log("✅ Step 14: Test answers fetched:", testAnswerData);

      const completed = testAnswerData.map((answer) => answer.question_id__id);
      setCompletedQuestions((prevCompletedQuestions) => [
        ...prevCompletedQuestions,
        ...completed,
      ]);
      console.log("✅ Step 15: Completed questions updated for Candidate ID:", selectedCandidateId, ":", completed);
    } catch (error) {
      console.error("❌ Error during candidate test setup for ID:", selectedCandidateId, "-", error);
    }
  };


  const renderQuestionList = () => {
    const allQuestionIds1 = questions.map((question) => question.id);

    const allQuestionsCompleted = allQuestionIds1.every((id) =>
      completedQuestions.includes(id)
    );

    return (
      <div>
        <div className="questions-container-code">
          {questions.map((question) => {
            // Check if the question is completed
            const isCompleted = completedQuestions.includes(question.id);

            // Find the submitted result for the question
            const submittedResult = submittedResults.find(
              (result) => result.ques_id === question.id
            );
            // Find the test answer for the question (if needed)
            const testAnswer = testAnswers.find(
              (answer) => answer.question_id__id === question.id
            );

            return (
              <div
                key={question.id}
                className={`question-item-code ${isCompleted ? "question-item-code-disabled" : ""
                  }`}
              >
                <button
                  onClick={() => handleAttentQues(question.id, question)}
                  className="question-button-code"
                  disabled={isCompleted} // Disable the button if the question is completed
                >
                  {question.question_text}
                  <span style={{ float: "right" }}>
                    {isCompleted ? "Completed" : "Solve Challenge"}
                  </span>
                </button>
                {submittedResult && (
                  <div className="question-answer">
                    Mark: {submittedResult.result}
                  </div>
                )}
                {/*}    {testAnswer && (
                                    <div className="question-answer">
                                        Mark: {testAnswer.result}
                                    </div>
                                )}  */}
              </div>
            );
          })}

          <div
            className="button-codetest"
            style={{ width: "100%", marginLeft: "-50px" }}
          >
            <button
              className="button-ques-save  save-button-lms"
              style={{
                width: "100px",
                marginRight: "10px",
              }}
              disabled={!allQuestionsCompleted || isReviewComplete}
              onClick={handleSave}
            >
              Review
            </button>
            <button
              className="button-ques-save  save-button-lms"
              disabled={!isReviewComplete}
              style={{
                width: "100px",
              }}
              onClick={handlefinish}
            >
              Finish
            </button>
          </div>
        </div>
      </div>
    );
  };



  const handleBackToQuestions = () => {
    console.log("Going back to question list...");
    setShowQuestionPage(true);
  };

  const renderCommonElements = () => (
    <>
      <div style={{ display: "flex" }}>
        <div className="Box" style={{ marginLeft: "0px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              {selectedTestCandidate && (
                <div style={{ marginRight: "10px" }}>
                  Duration: {selectedTestCandidate.duration} mins
                </div>
              )}
              <div style={{ marginRight: "10px" }}>
                Questions: {questions.length}
              </div>
              {/* Assuming questions have a 'Marks' property */}
              <div style={{ marginRight: "10px" }}>
                Marks:{" "}
                {questions.reduce((acc, q) => {
                  // Check if q.marks is a valid number
                  if (!isNaN(q.mark)) {
                    return acc + q.mark;
                  } else {
                    return acc;
                  }
                }, 0)}
              </div>
              <CameraComponent id={selectedCandidateId}></CameraComponent>
            </div>
            <div className="display-flex-code">
              {showQuestionPage === false && (
                <div style={{ margin: "10px" }}>
                  <form onSubmit={(e) => submitTest(e)}>
                    <button
                      type="submit"
                      disabled={processing}
                      className="btn-sizes"
                    >
                      {processing ? "Processing.." : "Submit"}
                    </button>
                  </form>

                  {/* Modal for confirming submission without output */}
                  <Modal show={showModal} onHide={handleModalConfirmNo}>
                    <Modal.Header closeButton>
                      <Modal.Title style={{ fontWeight: "bold" }}>
                        Confirm
                      </Modal.Title>
                    </Modal.Header>
                    <Modal.Body style={{ fontWeight: "bold" }}>
                      Do you want to submit without Output?
                    </Modal.Body>
                    <Modal.Footer>
                      <Button
                        variant="secondary"
                        onClick={handleModalConfirmNo}
                      >
                        No
                      </Button>
                      <Button variant="primary" onClick={handleModalConfirmYes}>
                        Yes
                      </Button>
                    </Modal.Footer>
                  </Modal>
                </div>
              )}

              <div className="timer-code">
                {renderTimer()}
                {/*<Timer duration={showFinalPage ? 0 : selectedTestCandidate.duration} setTimeLeftCallback={setTimeLeft} />        */}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showQuestionPage ? renderQuestionList() : renderQuestionDetail()}
    </>
  );
  const handleAttentQues = async (questionId, question) => {
    disableSidebar();
    setShowFinalPage(false);
    setTestId_f(selectedTestCandidate.test_name);
    console.log("Final selected Test ID: ", selectedTestCandidate.test_name);

    setStudentId_f(selectedTestCandidate.student_id__id);
    setStudentIdCon(selectedTestCandidate.student_id__id);
    console.log(
      "Final selected Student ID: ",
      selectedTestCandidate.student_id__id
    );

    setQuestionId_f(questionId);
    setSelectedQuestionID(questionId);
    setQuestionIdCon(questionId);
    console.log("Final selected Question ID: ", questionId);

    setSelectedQuestion(question);
    setSelectedQuestionsCon(question);
    console.log("Final selected Questions: ", question);

    setIsTestCase(question.question_name_id__is_testcase);
    setTestCases(question.testCases);


    setExplainAnswer(question.explain_answer);
    setQuestionMark(question.mark);
    setQuestionAnswer(question.answer);
    setShowQuestionPage(false);
  };

  const renderQuestionDetail = () => {
    return (
      <div>
        <div className="test-container">
          <div className="question-container1">
            <h4
              style={{
                fontFamily: "Roboto, sans-serif",
                fontSize: "1rem",
                fontWeight: "600",
                color: "#b7c3dd",
              }}
            >
              {selectedQuestion.question_text}
            </h4>

            {isTestCase ? ( // Corrected condition
              <>
                <h5>Test Cases:</h5>
                {testCases.map((test, index) => ( // Moved inside fragment
                  <p key={index}>
                    <b>Input:</b> {test.input} | <b>Expected Output:</b> {test.expected}
                  </p>
                ))}
              </>
            ) : (
              <>
                <h5>Input Instruction: </h5>
                <p className="instruction-header">
                  &#8226; If the code has any inputs, you need to give the inputs in
                  the custom input box and then click on run code.
                  <br />
                  &#8226; If there is more than one input, the input should be given on
                  the next line properly.
                </p>

                {/* Display the selectedQuestion input format */}
                <ul>
  {selectedQuestion.input_format &&
    selectedQuestion.input_format
      .split(/(?<=\.)\s/)
      .map((input_format, index) => (
        <li key={index} className="instruction-item">
          {input_format.trim()}
        </li>
      ))}
</ul>
              </>
            )}



          </div>
          <div className="question-buttons-container">
            <div>
              <OnlineCoding />
            </div>
          </div>
        </div>
        {/*}  <button
                    onClick={handleBackToQuestions}
                    style={{
                        marginTop: '20px'
                    }}
                    className="button-ques-back-next back-button"
                >
                    <FaArrowLeft />
                    <span className="button-text">Back to Questions</span></button>*/}
      </div>
    );
  };

  const [showModal, setShowModal] = useState(false);
// legacy formulasRef removed; prefer `codeWindow` or `excelAnswers`

  // Form submit handler
const submitTestold = (e) => {
  e.preventDefault();

  // ✅ EXCEL FIXED
  if (languageSelected === "excel") {

    const formulaString = (codeWindow && codeWindow.trim())
      ? codeWindow
      : (Array.isArray(excelAnswers) && excelAnswers.length)
        ? excelAnswers.map(f => `${f.cell}:=${f.formula}`).join("\n")
        : "";

    console.log("Excel formulas (submit):", formulaString);

    // Set code so AttendCodeTest has it
    setCodeWindow(formulaString);

    handleSubmit(e);
    return;
  }

  // ✅ NON-EXCEL (unchanged)
  if (!codeWindow || !codeWindow.trim()) {
    setErrorMessage("Code Window is Empty");
    setShowError(true);
    setProcessing(false);
    return;
  }

  if (!isTestCase && (!outputWindowCom || !outputWindowCom.trim())) {
    setShowModal(true);
    return;
  }

  handleSubmit(e);
};

const submitTest = (e) => {
  e.preventDefault();

  // ✅ EXCEL & POWER BI (NO CODE VALIDATION, NO POPUP)
  if (languageSelected === "excel" || languageSelected === "power bi") {

    const formulaString =
      languageSelected === "excel"
        ? (codeWindow && codeWindow.trim())
          ? codeWindow
          : (Array.isArray(excelAnswers) && excelAnswers.length)
            ? excelAnswers.map(f => `${f.cell}:=${f.formula}`).join("\n")
            : ""
        : "N/A"; // Power BI

    console.log(`${languageSelected} submit:`, formulaString);

    setCodeWindow(formulaString);

    handleSubmit(e);
    return;
  }

  // ✅ CODING LANGUAGES (C, Java, Python etc.)
  if (!codeWindow || !codeWindow.trim()) {
    setErrorMessage("Code Window is Empty");
    setShowError(true);
    setProcessing(false);
    return;
  }

  if (!isTestCase && (!outputWindowCom || !outputWindowCom.trim())) {
    setShowModal(true);
    return;
  }

  handleSubmit(e);
};
  // Handle confirmation from the modal
  const handleModalConfirmYes = (e) => {
    setShowModal(false); // Close modal
    handleSubmit(e); // Proceed with submission after user confirms
  };

  const handleModalConfirmNo = () => {
    setShowModal(false); // Close modal
    setProcessing(false); // Stop processing if user cancels
  };


  // ✅ Strong Excel formula normalizer
const normalizeExcelFormula = (raw) => {
  if (!raw || typeof raw !== "string") return "";

  let s = raw.trim();

  // remove cell prefix like "A1:" or "A6:"
  s = s.replace(/^[A-Z]+\d+:/i, "");

  // remove junk like "A6)"
  s = s.replace(/^[A-Z]+\d+\)/i, "");

  // fix multiple equals (==SUM → =SUM)
  s = s.replace(/^=+/, "=");

  // if looks like SUM(...) but missing "="
  if (!s.startsWith("=") && /^[A-Z]+\(.+\)$/i.test(s)) {
    s = "=" + s;
  }

  // final safety: keep only "=FUNC(...)"
  const match = s.match(/=\s*[A-Z]+\s*\([^)]*\)/i);
  if (match) {
    s = match[0].replace(/\s+/g, "");
  }

  return s;
};



const handleSubmit = async (e) => {
  console.log("⚡ Handle Submit Triggered...");
  e.preventDefault();
  setProcessing(true);

  try {
    const endTime = new Date();

    // -------------------------------
    // ✅ Resolve student_id safely
    // -------------------------------
    let resolvedStudentId = studentId_f;

    if (!resolvedStudentId) {
      resolvedStudentId = studentID;
    }

    if (!resolvedStudentId && selectedTestCandidate?.student_id__id) {
      resolvedStudentId = selectedTestCandidate.student_id__id;
    }

    if (!resolvedStudentId) {
      setErrorMessage("Student ID missing — please reload the test.");
      setShowError(true);
      setProcessing(false);
      return;
    }

    console.log("✅ Final resolved student_id:", resolvedStudentId);

    // -------------------------------
    // ✅ Excel handling (diagnostic logs added)
    // -------------------------------
    const isExcel = languageSelected === "excel";
    console.log('🔍 Pre-submit values:', {
      languageSelected,
      codeWindow,
      outputWindowCom,
      excelAnswers: typeof excelAnswers !== 'undefined' ? excelAnswers : undefined,
    });

    const excelFormula = isExcel ? normalizeExcelFormula(outputWindowCom) : null;

    console.log('🔍 normalizeExcelFormula result:', excelFormula);
const isPowerBI = languageSelected === "powerbi";
// -------------------------------
// ✅ Power BI handling
// -------------------------------
let powerBIBlueprint = null;

if (isPowerBI) {
  try {
    powerBIBlueprint = codeWindow
      ? JSON.parse(codeWindow)
      : outputWindowCom
      ? JSON.parse(outputWindowCom)
      : null;

    console.log("📊 Parsed Power BI Blueprint:", powerBIBlueprint);
  } catch (err) {
    console.error("❌ Power BI JSON parse error:", err);
    setErrorMessage("Invalid Power BI dashboard data.");
    setShowError(true);
    setProcessing(false);
    return;
  }

  if (!powerBIBlueprint) {
    setErrorMessage("Please create a Power BI dashboard before submitting.");
    setShowError(true);
    setProcessing(false);
    return;
  }
}
   

    // -------------------------------
    // ✅ FINAL PAYLOAD
    // -------------------------------
    const dataToSubmit = {
      test_name: testId_f,
      question_id: questionId_f,
      student_id: resolvedStudentId,
      dtm_start: testStartTime,
      dtm_end: endTime,

      // 🔥 Excel formula stored cleanly
      code: isExcel ? excelFormula : codeWindow,

      // 🔥 Backend-safe language
      p_type: isExcel ? "python" : languageSelected,

      inputs: customInputCom,

      // 🔥 SAME formula everywhere for Excel
      output: isExcel ? excelFormula : outputWindowCom || "No Output",
      explain_answer: isExcel ? excelFormula : explainAnswer,

      mark: questionMark,
      answer: questionAnswer,
      skill_type: skillTypeLanguage,
      test_case_results: testCasesResults,
      is_test_case: isTestCase,
    };

    console.log("🟡 Data to submit:", dataToSubmit);

    // -------------------------------
    // ✅ Submit to backend
    // -------------------------------
    const response = await addTestAnswerMapApi_Code_Submit_Com_prrac(dataToSubmit);

    if (!response || !response.question_id) {
      throw new Error("Invalid server response");
    }

    console.log("✅ Submission Response:", response);

    // -------------------------------
    // ✅ Update UI state
    // -------------------------------
    const newResult = {
      ques_id: response.question_id,
      result: response.result ?? 0,
    };

    setSubmittedResults((prev) => [...prev, newResult]);
    setTotalResults((prev) => prev + newResult.result);
    setCompletedQuestions((prev) => [...prev, selectedQuestionID]);

    setShowQuestionPage(true);
    setCodeWindow("");
    setOutputWindowCom(null);

    // -------------------------------
    // ✅ Update total & avg marks
    // -------------------------------
    const currentStudentId =
      studentId_f || studentID || selectedTestCandidate?.student_id__id;

    try {
      await updateTotalAndAvgMarksApi(testName, currentStudentId);
    } catch (apiError) {
      console.error("❌ updateTotalAndAvgMarksApi Failed:", apiError);
    }

    setErrorMessage("Submitted Successfully");
    setShowError(true);
  } catch (error) {
    console.error("❌ Error during handleSubmit:", error);
    setErrorMessage("Not Submitted");
    setShowError(true);
  } finally {
    setProcessing(false);
  }
};


  const handleSubmitTimer = useCallback((e) => {
    console.log("Handle Submit..");
    if (e) e.preventDefault();

    const isNonCoding =
    languageSelected === "excel" ||
    languageSelected === "power bi";

  // ✅ Skip empty code validation for Excel & Power BI
  if (!isNonCoding && (!codeWindow || !codeWindow.trim())) {
    console.log("Code Window is Empty");
    setErrorMessage("Code Window is Empty");
    setShowError(true);
    setProcessing(false);
    return;
  }


    // Capture the current time when the user submits the test
    const endTime = new Date();
    // Construct answer objects
    const dataToSubmit = {
      test_name: testId_f,
      question_id: questionId_f,
      student_id: studentId_f,
      dtm_start: testStartTime,
      dtm_end: endTime,
      code: codeWindow,
      p_type: languageSelected,
      inputs: customInputCom,
      output: outputWindowCom,
      explain_answer: explainAnswer,
      mark: questionMark,
      answer: questionAnswer,
      skill_type: skillTypeLanguage,
      test_case_results: testCasesResults,
      is_test_case: isTestCase,
    };

    console.log("Data to submit: ", dataToSubmit);

    addTestAnswerMapApi_Code_Submit_Com_prrac(dataToSubmit)
      .then((response) => {
        setProcessing(false);
        setErrorMessage("Submitted Successfully");
        setShowError(true);
        console.log("response: ", response);

        const newResult = {
          ques_id: response.question_id,
          result: response.result,
        };
        const updatedResults = [...submittedResults, newResult];

        setSubmittedResults(updatedResults);

        // Update totalResults by adding the new result to the current totalResults
        const newTotal = totalResults + response.result;
        console.log("newTotal: ", newTotal);

        //const newTotal = updatedResults.reduce((acc, curr) => acc + curr.result, 0);
        setTotalResults(newTotal);

        setShowQuestionPage(true);
        setCompletedQuestions((prevCompletedQuestions) => [
          ...prevCompletedQuestions,
          selectedQuestionID,
        ]);
        setCodeWindow("");
        setOutputWindowCom(null);
        console.log("set output null value");
        
        //updateTotalScoreTestcandidateApi(selectedCandidateId, { total_score: newTotal }); // Use updated total marks
      })
      .catch((error) => {
        console.error("Failed to submit", error);
        setProcessing(false);
        setErrorMessage("Not Submitted");
        setShowError(true);
      });
  });

  const handleTestCompletionTimer = (e) => {
    if (e) e.preventDefault();

    // Only call handleSubmitTimer if showQuestionPage is false
    if (!showQuestionPage) {
      handleSubmitTimer(e);
    }

    setTestCompleted(true);
    setShowQuestionPage(true);
    //setShowFinalPage(true);
    //handleSave()
    const allQuestionIds = questions.map((question) => question.id);
    setCompletedQuestions(allQuestionIds);
    // handleSubmitTimer(e); // Assume handleSubmit is defined elsewhere
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  const calculateRemainingTime = (endTime) => {
    const end = moment(endTime);
    const now = moment();
    const remainingSeconds = end.diff(now, "seconds");
    return remainingSeconds;
  };

  const renderTimer = () => {
    if (selectedTestCandidate.duration_type === "Start&EndTime") {
      const remainingTimeFromEndTime = calculateRemainingTime(
        selectedTestCandidate.dtm_end
      );
      const remainingTime = selectedTestCandidate.duration * 60; // Calculate initial duration in seconds

      //  console.log('Remaining time from End Time:', remainingTimeFromEndTime);
      //  console.log('SelectedTestCandidate.dtm_end:', selectedTestCandidate.dtm_end);

      return (
        <CodingTimer
          duration={remainingTime <= 0 ? 0 : remainingTime}
          setTimeLeftCallback={setTimeLeft}
          handleTestCompletionTimer={handleTestCompletionTimer}
          showFinalPage={showFinalPage}
          dtmEnd={selectedTestCandidate.dtm_end}
        />
      );
    } else if (selectedTestCandidate.duration_type === "QuestionTime") {
      const remainingTime = selectedTestCandidate.duration * 60; // Assuming duration is in minutes
      return (
        <CodingTimer
          duration={remainingTime <= 0 ? 0 : remainingTime} // Pass duration in seconds
          setTimeLeftCallback={setTimeLeft}
          handleTestCompletionTimer={handleTestCompletionTimer}
          showFinalPage={showFinalPage}
        />
      );
    }
    return null; // Return null if none of the conditions match
  };



  const currentDateUTC = new Date();
  //console.log('currentUTC: ', currentDateUTC);

  const extractDateComponents = (date) => ({
    day: date.getUTCDate(),
    month: date.getUTCMonth() + 1,
    year: date.getUTCFullYear(),
    hours: date.getUTCHours(),
    minutes: date.getUTCMinutes(),
  });

  const currentDateComponents = extractDateComponents(currentDateUTC);
  //console.log('currentDateComponents: ', currentDateComponents);

  return (
    <div className="no-select">
      <div className="no-screenshot-overlay"></div>
      <div
        className="product-table-container-stu"
        style={{ marginLeft: sbar ? "-10px" : "0px" }}
      >
        {!showQuestionPage && selectedCandidateId !== null && !selectedTestCandidate && (
          <div className="hai">
            <div className="hai2">
              <h6 style={{ textAlign: "center" }}>
                YOU MUST BEFORE YOU GO...
              </h6>
            </div>
            <br />
            <div className="hai2">
              {/* Display instructions safely */}
             <div className="instructions">
            {testCandidate?.instruction
              ?.split(/(?<=\.)\s/)
              ?.map((instruction, index) => (
                <p key={index} className="instruction-item">
                  {index + 1}. {instruction.trim()}
                </p>
              )) || <p>No instructions available</p>}
          </div>

              <br />
              <div style={{ display: "grid", placeItems: "center" }}>
                <button
                  style={{ border: "none" }}
                  className="btn-sizes"
                  onClick={() => handleGoForTest(selectedCandidateId)}
                >
                  Start
                </button>
              </div>
            </div>
          </div>
        )}

        <div>{selectedTestCandidate && renderCommonElements()}</div>
        {testCompleted}
        {showFinalPage && (
          <div>
            <br></br>
            <div className="scores">
              {testTypeCategory === "PracticeTest" ? (
                <>
                  <h4 style={{ textAlign: "center" }}>Scores</h4>
                  <br></br>
                  <p style={{ color: "#DDFB35" }}>
                    Your Total Marks: {totalResults}/{countMarks}
                  </p>
                  {/*}    <p>{questionsWrong} Questions are wrong</p>     */}

                  <p>
                    You have Completed Test in {minsTaken} minutes and{" "}
                    {secTaken} seconds{" "}
                  </p>
                </>
              ) : (
                <p>
                  You have Completed Test in {minsTaken} minutes and {secTaken}{" "}
                  seconds{" "}
                </p>
              )}
              <br></br>

              <br></br>
              <br></br>
            </div>
            <br></br>
          </div>
        )}
        <ErrorModal
          show={showError}
          handleClose={handleCloseError}
          errorMessage={errorMessage}
        />
      </div>
    </div>
  );
};

export default AttendCodePracticeTest;
