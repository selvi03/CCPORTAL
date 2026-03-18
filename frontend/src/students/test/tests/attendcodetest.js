import React, { useState, useEffect, useRef, useCallback } from "react";
import { Button, Modal } from "react-bootstrap";
import { FaArrowRight, FaArrowLeft } from "react-icons/fa";
import {
  updateTestcadidateApi_is_active,
  updateTotalScoreTestcandidateApi,
  getTestAnswerMapApi,
  updateTotalAndAvgMarksApi,
  addTestAnswerMapApi_Code_Submit_Com,
  getTestcandidate_CODING_Api,
  getQuestionApi_Filter_IO_CODE,
  getQuestionApi_Filter_IO_CODE_practice,
  deleteTestAnswer_Api,
  updatekeypressApi,
  updateAutoTestReassign,
  getScoreDisplay_API,
  updateTotalAndAvgMarksanswerApi,
  Capture_Duration_Update_API,
  updateTestcadidateApi_submitted,
  updateTestcadidateApi_teststarted,
  getTestTypeCategory_testNameApi, ReassignTestCandidatesRefresh, updateMoveTabCountApi
} from "../../../api/endpoints";
import CameraComponent from "./cameracomponent";
import { useNavigate } from "react-router-dom";
import Timer from "./timer";
import OnlineCoding from "../onlinecoding";
import ErrorModal from "../../../components/auth/errormodal";
import { useTestContext } from "../contextsub/context";
import "../../../styles/students.css";
import moment from "moment";
import CodingTimer from "./codingtimer";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AttendCodeTest = ({
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

  const [testCandidates, setTestCandidates] = useState([]);
  const [upcommingTests, setUpcommingTests] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
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
  const [scoreDisplay, setScoreDisplay] = useState(false);
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
  const handleCloseError = () => {
    setShowError(false);
  };
  const [testName, setTestName] = useState("");

  const [keyPressCount, setKeyPressCount] = useState(0);
  const [testTerminated, setTestTerminated] = useState(false);
  const navigate = useNavigate();
  const [isTestActive, setIsTestActive] = useState(true);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [lastKeyPressed, setLastKeyPressed] = useState(null); // New state for last key pressed
  const [reassignCount, setReassignCount] = useState(0);
  const [triggerFetch, setTriggerFetch] = useState(true);
  const isTabSwitchMonitoringActive =
    !!selectedTestCandidate &&
    questions.length > 0 &&
    !testCompleted &&
    (showQuestionPage || selectedQuestion !== null);
  // Load reassignCount from localStorage when component mounts
  useEffect(() => {
    if (studentId_f && testName) {
      const storedCount = localStorage.getItem(`reassign_${studentId_f}_${testName}`);
      setReassignCount(storedCount ? parseInt(storedCount) : 0);
      console.log(`Initial reassignCount: ${storedCount}`);
    }
  }, [studentId_f, testName]);
  useEffect(() => {

    if (!testName) {
      console.warn("⚠️ testName is undefined or empty. Skipping API call.");
      return;
    }

    console.log("📡 Fetching test type category for:", testId_f);

    getTestTypeCategory_testNameApi(testName)
      .then((result) => {
        console.log("✅ Received test type category response:", result);

        if (result && result.test_type_category) {
          setTestTypeCategory(result.test_type_category);
          console.log("📝 Updated testTypeCategory:", result.test_type_category);
        } else {
          console.warn("⚠️ test_type_category not found in response:", result);
        }
      })
      .catch((error) => {
        console.error("❌ Error fetching test type category:", error);
      });
  }, [testName]);
  const terminateTest = () => {
    setIsTestActive(false);
    alert(
      "You have exceeded the allowed number of switches. Test will be terminated123."
    );
    updatekeypressApi(selectedCandidateId, lastKeyPressed)
      .then((response) => {
        console.log("API call successful:", response.data);
      })
      .catch((error) => {
        console.error("Error updating keypress:", error);
        if (error.response) {
          console.error("Error response data:", error.response.data);
          console.error("Error response status:", error.response.status); // This will confirm the 404 error
        }
      });
    navigate("/test/Testschedule");
  };
// ⏱️ Periodically update captured_duration
useEffect(() => {
  if (!testStartTime || !selectedCandidateId || testCompleted) return;

  const interval = setInterval(() => {
    const now = new Date();
    const elapsedSeconds = Math.floor((now - testStartTime) / 1000);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    const formatted = `${minutes} min ${seconds} sec`;

    // Push current captured time to backend
    Capture_Duration_Update_API(selectedCandidateId, formatted)
      .then(() => console.log("⏳ Updated captured_duration:", formatted))
      .catch((err) => console.error("❌ Failed to update duration:", err));
  }, 60000); // update every 1 min

  return () => clearInterval(interval);
}, [testStartTime, selectedCandidateId, testCompleted]);

 useEffect(() => {
  if (!isTabSwitchMonitoringActive) return;

  const handleVisibilityChange = async () => {
    if (document.visibilityState === "hidden" && isTestActive && !testCompleted) {
      console.warn("🚨 Tab switch detected!");

      // Increment local counter
      setTabSwitchCount((prevCount) => {
        const newCount = prevCount + 1;

        // Show warning to user
        if (newCount <= 3) {
          alert(`Warning: You switched tabs ${newCount} time(s). ${3 - newCount} chance(s) left.`);
        }

        // ✅ Call backend to store updated tab move count
        if (studentId_f && testName) {
          const data = {
            student_id: studentId_f,
            test_name: testName,
            tab_move_count: newCount,
          };
          console.log("📤 Updating tab move count:", data);
          updateMoveTabCountApi(data)
            .then((res) => console.log("✅ Tab move count updated:", res))
            .catch((err) => console.error("❌ Failed to update tab move count:", err));
        } else {
          console.warn("⚠️ Missing studentId_f or testName, skipping updateMoveTabCountApi call.");
        }

        // Call existing logic (update keypress and auto reassign)
        updatekeypressApi(selectedCandidateId, lastKeyPressed).catch(() => {});
        handleAutoReassignRefresh();

        return newCount;
      });
    }
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
}, [
  isTabSwitchMonitoringActive,
  isTestActive,
  testCompleted,
  selectedCandidateId,
  lastKeyPressed,
  studentId_f,
  testName,
]);
  useEffect(() => {
  const autoTerminateTest = async () => {
    if (
      isTabSwitchMonitoringActive &&
      tabSwitchCount > 3 &&
      isTestActive &&
      !testCompleted
    ) {
      console.warn("🚨 Too many tab switches — auto-submitting test.");
      setIsTestActive(false);
      setTestTerminated(true);
      setTestCompleted(true);

      try {
        // 1️⃣ Update keypress info
        await updatekeypressApi(selectedCandidateId, lastKeyPressed);
        console.log("✅ Keypress update successful.");

        // 2️⃣ Mark test as active in DB
        await updateTestcadidateApi_is_active(selectedCandidateId);
        console.log("✅ is_active updated true.");

        // 3️⃣ Save duration (capped)
        const endTime = new Date();
        const allowedSeconds = (selectedTestCandidate?.duration || 0) * 60;
        const actualSeconds = Math.floor((endTime - testStartTime) / 1000);
        const cappedSeconds = Math.min(actualSeconds, allowedSeconds);
        const cappedMin = Math.floor(cappedSeconds / 60);
        const cappedSec = cappedSeconds % 60;
        const totalTiming = `${cappedMin} min ${cappedSec} sec`;

        await Capture_Duration_Update_API(selectedCandidateId, totalTiming);
        console.log("✅ captured_duration updated on termination.");

        // 4️⃣ Auto-submit answers + mark test submitted
        await handleSave();

        alert("❌ Test terminated due to multiple tab switches. Your answers have been auto-submitted.");

        // 5️⃣ Prevent re-entry until refresh
        sessionStorage.setItem("test_terminated", "true");

        // 6️⃣ Exit fullscreen and redirect
        if (document.fullscreenElement) {
          await document.exitFullscreen().catch(() => {});
        }

        navigate("/test/Testschedule");
      } catch (error) {
        console.error("❌ Error in autoTerminateTest:", error);
        navigate("/test/Testschedule");
      }
    }
  };

  autoTerminateTest();
}, [
  isTabSwitchMonitoringActive,
  tabSwitchCount,
  isTestActive,
  testCompleted,
  selectedCandidateId,
  lastKeyPressed,
  selectedTestCandidate,
  testStartTime,
  navigate
]);
  useEffect(() => {
    const now = new Date();
    const indianTime = new Date(
      now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const hours = indianTime.getHours();

    let greeting = "";
    if (hours < 12) {
      greeting = "Good Morning";
    } else if (hours < 17) {
      greeting = "Good Afternoon";
    } else {
      greeting = "Good Evening";
    }
    setSalutation(greeting);
  }, []);

  useEffect(() => {
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
  }; 
  const handleTestCompletion = (e) => {
    e.preventDefault();
    setTestCompleted(true);
    handleSubmit(e); // Assume handleSubmit is defined elsewhere
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error(err));
    }
  };

  const handlefinish = async (e) => {
   //  await updateTestcadidateApi_is_active(selectedCandidateId);

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
        // Call the delete API and wait for the response
        // await deleteTestAnswer_Api(studentId_ans);

        // Optionally, you can handle any post-delete logic here
        // console.log("Test answer deleted successfully");

        // Enable the sidebar and navigate only after successful API call
        enableSidebar();
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

  // 🔁 Automatically reassign candidate if test interrupted before submit
  const handleAutoReassignRefresh = async () => {
    try {
      if (!testName || !studentId_f) {
        console.warn("⚠️ Missing testName or studentId_f — skipping auto reassign");
        return;
      }

      console.log("🔄 Calling ReassignTestCandidatesRefresh...");
      await ReassignTestCandidatesRefresh(testName, studentId_f);
      console.log("✅ ReassignTestCandidatesRefresh success");

      // Save marker to localStorage
      localStorage.setItem(`auto_reassign_${studentId_f}_${testName}`, "triggered");
    } catch (error) {
      console.error("❌ Error calling ReassignTestCandidatesRefresh:", error);
    }
  };

  // 🧠 Detect refresh / tab close / power off before submit
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!testCompleted && selectedTestCandidate) {
        handleAutoReassignRefresh(); // Call reassign API
        e.preventDefault();
        e.returnValue = ""; // Standard browser dialog
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [testCompleted, selectedTestCandidate, testName, studentId_f]);


  // 📡 Detect network issue
  useEffect(() => {
    const handleOffline = () => {
      if (!testCompleted && selectedTestCandidate) {
        console.warn("📴 Network disconnected! Calling ReassignTestCandidatesRefresh...");
        handleAutoReassignRefresh();
      }
    };

    window.addEventListener("offline", handleOffline);
    return () => window.removeEventListener("offline", handleOffline);
  }, [testCompleted, selectedTestCandidate, testName, studentId_f]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSBar(false);
    // await updateTestcadidateApi_is_active(selectedCandidateId);
    await updateTestcadidateApi_submitted(selectedCandidateId);
    await updateTotalAndAvgMarksanswerApi(testId_f,studentId_f)
    
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
    const shouldReassignDueToScore = (testTypeCategory === "Assessment" || testTypeCategory === "College") && totalResults === 0;
    const shouldReassignDueToTime = (testTypeCategory === "Assessment" || testTypeCategory === "College") && minutesTaken <= 3;
    if ((shouldReassignDueToScore || shouldReassignDueToTime) && reassignCount < 3) {
      const reason = shouldReassignDueToScore
        ? "The test will be reassigned due to a zero score."
        : "The test will be reassigned due to insufficient duration.";

      if (window.confirm(reason + " Do you want to proceed?")) {
        setErrorMessage("Test Reassigned");
        setShowError(true);
        incrementReassignCount();
        return await handleReassignment(testName, studentId_f);
        setCompletedQuestions([]);
      } else {
        console.log("User declined reassignment.");
      }
    }

    if (reassignCount >= 3) {
      alert("Test reassignment limit reached (3 times only).");
    }

  
    setShowFinalPage(true);
  };

  const handleArrowClick = (candidateId) => {
    setSelectedCandidateId(candidateId);
    console.log("selected Test Assign id: ", candidateId);
  };

  const handleGoForTest = async (selectedCandidateId) => {
    console.log("🟡 Starting handleGoForTest for candidate ID:", selectedCandidateId);

    try {
      const candidate = testCandidates.find(
        (candidate) => candidate.id === selectedCandidateId
      );

      if (!candidate) {
        console.warn("⚠️ Candidate not found for ID:", selectedCandidateId);
        return;
      }

      console.log("👤 Found candidate:", candidate);

      // Set state
      setSelectedTestCandidate(candidate);
      setShowQuestionPage(true);
      console.log("✅ Selected test candidate and showing question page");

      setTestIdCon(candidate.test_name);
      setTestName(candidate.test_name);
      setTestId_ans(candidate.test_name);
      setStudentId_ans(candidate.student_id__id);
      console.log("🆔 Test and student IDs set");

      const currentTime = new Date();
      setTestStartTime(currentTime);
      setTestStartTimeCon(currentTime);
      console.log("🕒 Test start time set:", currentTime);

      disableSidebar();
      setSBar(true);
      setShowFinalPage(false);
      console.log("🧩 Sidebar disabled and final page hidden");
      console.log("📡 Fetching test type category manually for:", candidate.test_name);
      const result = await getTestTypeCategory_testNameApi(candidate.test_name);
      const testTypeCat = result?.test_type_category || "";
      console.log("✅ Received test type category:", testTypeCat);
      // Fetch questions
      let questionsData = [];
      if (testTypeCat === "PracticeTest" || testTypeCat === "PracticeCollege") {

        console.log("📘 Fetching Practice Test questions for:", candidate.test_name);
        questionsData = await getQuestionApi_Filter_IO_CODE_practice(candidate.test_name);
      } else {
        console.log("📗 Fetching Regular Test questions for Question ID:", candidate.question_id__id);
        questionsData = await getQuestionApi_Filter_IO_CODE(candidate.question_id__id);
      }

      console.log("📋 Received questions:", questionsData);
      setQuestions(questionsData);

      // Calculate total marks
      const totalMarks1 = questionsData.reduce(
        (total, question) => total + (parseInt(question.mark) || 0),
        0
      );
      console.log("🎯 Calculated Total Marks:", totalMarks1);
      setCountMarks(totalMarks1);

      // Update test candidate status
      console.log("🔁 Updating test candidate status to 'started'");
      console.log("📡 Calling is_active API for:", selectedCandidateId);

const res = await updateTestcadidateApi_is_active(selectedCandidateId);

console.log("✅ is_active API response:", res);
      await updateTestcadidateApi_teststarted(selectedCandidateId);
     
      await updateTotalScoreTestcandidateApi(selectedCandidateId, {
        total_score: 0,
      });
      console.log("✅ Candidate status updated");

      // Fetch test answers
      console.log("📦 Fetching previous answers for user:", username);

      const testAnswerData = await getTestAnswerMapApi(username, candidate.test_name);
      setTestAnswers(testAnswerData);
      console.log("📨 Received existing test answers:", testAnswerData);

      // Track already completed questions
      const completed = testAnswerData.map((answer) => answer.question_id__id);
      setCompletedQuestions((prev) => [...prev, ...completed]);
      console.log("🟩 Completed questions updated:", completed);

    } catch (error) {
      console.error("❌ Error in handleGoForTest:", error);
    }
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
                {scoreDisplay  && submittedResult && (
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
              // disabled={!isReviewComplete}
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

  const handleAttentQues = async (questionId, question) => {
    if (completedQuestions.includes(questionId)) {
      console.log("This question is already submitted and cannot be reattempted.");
      setErrorMessage("You have already submitted this question.");
      setShowError(true);
      return; // stop execution
    }

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
  useEffect(() => {
    const fetchSubmittedAnswers = async () => {
      const response = await getTestAnswerMapApi(selectedTestCandidate.test_name, selectedTestCandidate.student_id__id);
      const completedIds = response.map((ans) => ans.question_id);
      setCompletedQuestions(completedIds);
    };

    if (selectedTestCandidate) {
      fetchSubmittedAnswers();
    }
  }, [selectedTestCandidate]);

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
                  {selectedQuestion?.input_format && (
                    <ul>
                      {selectedQuestion.input_format
                        .split(/(?<=\.)\s/)
                        .map((input_format, index) => (
                          <li key={index} className="instruction-item">
                            {input_format.trim()}
                          </li>
                        ))}
                    </ul>
                  )}


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

  // Form submit handler
 const submitTest = (e) => {
  e.preventDefault(); // Prevent form submission

  const isNonCoding =
    languageSelected === "excel" ||
    languageSelected === "power bi";

  // ✅ Show "Code Window is Empty" only for coding languages
  if (!isNonCoding && (!codeWindow || !codeWindow.trim())) {
    console.log("Code Window is Empty");
    setErrorMessage("Code Window is Empty");
    setShowError(true);
    setProcessing(false);
    return;
  }

  // ✅ Show Output confirmation popup only for coding languages
  if (
    !isNonCoding &&
    !isTestCase &&
    (!outputWindowCom || !outputWindowCom.trim())
  ) {
    console.log("Output Window is Empty");
    setShowModal(true);
    return;
  }
  const isPowerBI = languageSelected === "powerbi";
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
   


  // ✅ For Excel & Power BI → directly submit
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

  const handleSubmit = async (e) => {
  console.log("Handle Submit..");
  setProcessing(true);

  e.preventDefault();

  const endTime = new Date();
  const dataToSubmit = {
    test_name: testId_f,
    question_id: questionId_f,
    student_id: studentId_f,
    dtm_start: testStartTime,
    dtm_end: endTime,
    code: codeWindow,
    p_type: languageSelected,
    inputs: customInputCom,
    output: outputWindowCom || "No Output",
    explain_answer: explainAnswer,
    mark: questionMark,
    answer: questionAnswer,
    skill_type: skillTypeLanguage,
    test_case_results: testCasesResults,
    is_test_case: isTestCase,
  };

  console.log("Data to submit: ", dataToSubmit);

  try {
    const response = await addTestAnswerMapApi_Code_Submit_Com(dataToSubmit);

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

    const newTotal = totalResults + response.result;
    console.log("newTotal: ", newTotal);
    setTotalResults(newTotal);

    setShowQuestionPage(true);
    setCompletedQuestions((prevCompletedQuestions) => [
      ...prevCompletedQuestions,
      selectedQuestionID,
    ]);
    setCodeWindow("");
    setOutputWindowCom(null);

    // ✅ Call total & average mark API
    const res = await updateTotalAndAvgMarksApi(testName, studentId_f);
    console.log("✅ Total and avg marks updated:", res);
   // toast.success("Total & Average Marks Updated Successfully!");
    const scoreResponse = await getScoreDisplay_API(testName);
    console.log("🎯 Score Display Response:", scoreResponse.data);
    
    setScoreDisplay(scoreResponse.data.score_display);

  } catch (error) {
    console.error("❌ Failed to submit:", error);
    setProcessing(false);
    setErrorMessage("Not Submitted");
    setShowError(true);
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
const isPowerBI = languageSelected === "powerbi";
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

    addTestAnswerMapApi_Code_Submit_Com(dataToSubmit)
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

 const handleTestCompletionTimer = async (e) => {
  console.log("⏰ Timer reached 0 — auto-submitting and closing test");

  // Prevent multiple triggers
  if (testCompleted) return;
  setTestCompleted(true);

  try {
    // Calculate elapsed duration
    const endTime = new Date();
    const allowedSeconds = (selectedTestCandidate?.duration || 0) * 60;
    const actualSeconds = Math.floor((endTime - testStartTime) / 1000);
    const cappedSeconds = Math.min(actualSeconds, allowedSeconds);

    const cappedMin = Math.floor(cappedSeconds / 60);
    const cappedSec = cappedSeconds % 60;
    const totalTiming = `${cappedMin} min ${cappedSec} sec`;

    // ✅ Update captured duration before closing
    if (selectedCandidateId) {
      await Capture_Duration_Update_API(selectedCandidateId, totalTiming)
        .then(() => console.log("✅ Captured duration updated (auto-close):", totalTiming))
        .catch((err) => console.error("❌ Failed to update captured_duration:", err));
    }

    // ✅ Auto-submit if user is inside a question page
    if (!showQuestionPage) {
      console.log("📨 Auto-submitting current question before auto-close...");
      await handleSubmitTimer(e);
    }

    // ✅ Mark all questions as completed
    const allQuestionIds = questions.map((question) => question.id);
    setCompletedQuestions(allQuestionIds);

    // ✅ Final save and finish logic
    await handleSave(e);

    // ✅ Exit fullscreen safely
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch((err) => console.error(err));
    }

    console.log("✅ Test auto-closed successfully after allowed duration.");

  } catch (error) {
    console.error("❌ Error during handleTestCompletionTimer:", error);
  }
};

useEffect(() => {
  const handleAutoSubmit = async (event) => {
    const reason = event.detail?.reason;

    if (testCompleted || !selectedCandidateId) return;

    console.warn("🚨 Auto termination triggered:", reason);

    setIsTestActive(false);
    setTestTerminated(true);
    setTestCompleted(true);

    try {
      
      // 2️⃣ Mark test inactive in DB
      await updateTestcadidateApi_is_active(selectedCandidateId);
      console.log("✅ is_active updated.");

      // 3️⃣ Capture Duration (same logic as tab switch)
      const endTime = new Date();
      const allowedSeconds = (selectedTestCandidate?.duration || 0) * 60;
      const actualSeconds = Math.floor((endTime - testStartTime) / 1000);
      const cappedSeconds = Math.min(actualSeconds, allowedSeconds);
      const cappedMin = Math.floor(cappedSeconds / 60);
      const cappedSec = cappedSeconds % 60;
      const totalTiming = `${cappedMin} min ${cappedSec} sec`;

      await Capture_Duration_Update_API(selectedCandidateId, totalTiming);
      console.log("✅ captured_duration updated.");

      // 4️⃣ Auto-submit answers
      await handleSave();

      alert(
        reason === "face_not_detected"
          ? "❌ Test terminated due to face not detected."
          : "❌ Test terminated due to movement violation."
      );

      // 5️⃣ Prevent re-entry
      sessionStorage.setItem("test_terminated", "true");

      // 6️⃣ Exit fullscreen
      if (document.fullscreenElement) {
        await document.exitFullscreen().catch(() => {});
      }

      navigate("/test/Testschedule");

    } catch (error) {
      console.error("❌ Auto termination failed:", error);
      navigate("/test/Testschedule");
    }
  };

  window.addEventListener("AUTO_SUBMIT_TEST", handleAutoSubmit);

  return () =>
    window.removeEventListener("AUTO_SUBMIT_TEST", handleAutoSubmit);

}, [
  testCompleted,
  selectedCandidateId,
  lastKeyPressed,
  selectedTestCandidate,
  testStartTime,
  navigate
]);


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

  const formatDate1 = (dateString) => {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, "0");
    const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
    const year = date.getUTCFullYear();
    let hours = date.getUTCHours();
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const strHours = hours.toString().padStart(2, "0");
    return `${day}/${month}/${year} ${strHours}:${minutes} ${ampm}`;
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

  const parseDateSafe = (dateStr) => {
    if (!dateStr) return null;

    return new Date(
      dateStr
        .replace(/-/g, "/")
        .replace(/T/g, " ")
        .replace(/Z/g, "")
    );
  };
  return (
    <div className="no-select">
      <div className="no-screenshot-overlay"></div>
      <div
        className="product-table-container-stu"
        style={{ marginLeft: sbar ? "-10px" : "0px" }}
      >
        <div>
          {isTestActive ? (
            <p></p>
          ) : (
            <p
              style={{ textAlign: "center", color: "red", fontWeight: "bold" }}
            >
              Test is terminated due to switching tabs. You will be redirected.
            </p>
          )}
          {selectedCandidateId === null ? (
            <div>
              <div className="hai2">
                <h6 style={{ textAlign: "center" }}>
                  Hii {salutation}, You have only three chances for the test,
                  <br></br>
                  If you skip all three test, you will be marked 0 and your
                  eligibilty will go down
                </h6>
              </div>
              <br />
              <div className="hai">
                <div className="dash-border">
                  <h5 style={{ fontWeight: "bold" }}>Upcoming Tests</h5>
                  <div className="dash-test-container">
                    {/* Display test IDs and start dates */}
                    <header>
                      <p style={{ width: "500px" }}>
                        <strong>Test Name</strong>
                      </p>
                      {/*}    <p style={{ width: "500px" }}><strong>Duration Type</strong></p>    */}
                      <p style={{ width: "250px" }}>
                        <strong>Start Date</strong>
                      </p>
                      <p style={{ width: "250px" }}>
                        <strong>End Date</strong>
                      </p>
                      <p>
                        <strong>Start</strong>
                      </p>
                    </header>
                    {upcommingTests.map((candidate) => {
                     const dtmStart = parseDateSafe(candidate.dtm_start);
                      const dtmEnd = parseDateSafe(candidate.dtm_end);

                      {
                        /*}  console.log('format1 dtm_start: ', formatDate1(candidate.dtm_start));
                                        console.log('format1 dtm_end: ', formatDate1(candidate.dtm_end));

                                        console.log('Test:', candidate.test_name);
                                        console.log('dtmStart:', dtmStart);
                                        console.log('dtmEnd:', dtmEnd);
                                        console.log('currentDate:', currentDateOLD);        */
                      }

                      const isButtonAccessible =
                        (candidate.duration_type === "QuestionTime" &&
                          currentDateUTC >= dtmStart &&
                          currentDateUTC <= dtmEnd) ||
                        (candidate.duration_type === "Start&EndTime" &&
                          currentDateUTC >= dtmStart &&
                          currentDateUTC <= dtmEnd);

                      return (
                        <div key={candidate.id} className="dash-test-item">
                          <p style={{ width: "500px" }}>
                            {
                              candidate.test_name?.includes('_')
                                ? candidate.test_name.split('_').slice(2).join('_')
                                : candidate.test_name
                            }
                          </p>
                          {/*}    <p style={{ width: "500px" }}>{candidate.duration_type}</p>     */}
                          <p style={{ width: "250px" }}>
                            {formatDate1(candidate.dtm_start)}
                          </p>
                          <p style={{ width: "250px" }}>
                            {formatDate1(candidate.dtm_end)}
                          </p>
                          <p>
                            <button
                              style={{
                                backgroundColor: isButtonAccessible
                                  ? "#F1A128"
                                  : "#ccc",
                                padding: "10px",
                                border: "none",
                                borderRadius: "4px",
                                cursor: isButtonAccessible
                                  ? "pointer"
                                  : "not-allowed",
                              }}
                              onClick={
                                isButtonAccessible
                                  ? () => handleArrowClick(candidate.id)
                                  : null
                              }
                              disabled={!isButtonAccessible}
                            >
                              <FaArrowRight style={{ color: "black" }} />
                            </button>
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
        <div>{selectedTestCandidate && renderCommonElements()}</div>
        {/*}    {showQuestionPage && renderQuestionDetail()}    */}

        {selectedCandidateId !== null && !selectedTestCandidate && (
          <div className="hai">
            <div className="hai2">
              <h6 style={{ textAlign: "center" }}>YOU MUST BEFORE YOU GO...</h6>
            </div>
            <br />
            <div className="hai2">
              {/* Display instructions with numbers */}
              <div className="instructions">
                {testCandidates
                  .find((candidate) => candidate.id === selectedCandidateId)
                  .rules_id__instruction.split(/(?<=\.)\s/) // Split by periods followed by a space
                  .map((rules_id__instruction, index) => (
                    <p key={index} className="instruction-item">
                      {index + 1}. {rules_id__instruction.trim()}
                    </p>
                  ))}
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
        {testCompleted}
        {showFinalPage && (
          <div>
            <br></br>
            <div className="scores">
              {scoreDisplay  ? (
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

export default AttendCodeTest;
