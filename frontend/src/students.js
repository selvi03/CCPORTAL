import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./students/sidebar";
// import Dashboard from "./students/Dashboard/Dashboard";


import LearningMaterial from "./students/lms/learningmaterial";
import AttendCodeTest from "./students/test/tests/attendcodetest";
import AttendOnlineMockTest from "./students/test/tests/attendonlinemocktest";
import Footer from "./footer/footer";

import "./app.css";
import TestSchedule from "./students/test/testschedule";
//import TopNavbar from '../src/students/TopNavbar';
import { TestProvider } from "./students/test/contextsub/context";
import Uploadstudent from "./students/database/updateall";
import UploadStudentProfile from "./students/database/uploadstudentprofile";
import {
  getStudentNeedInfo,
} from "./api/endpoints";
//import { ContextProvider } from './Components/Test/context/TestTypeContext';
import Header from "./header/header";
import ThemeContextProvider from "./themecontext";
import { SearchProvider } from "./allsearch/searchcontext";
import StuDashboard from "./students/dashboard/studashboard";
import Offer from "./students/offers/offer";
import PracticeAccess from "./students/practice/practiceaccess";
import AttendCodePracticeTest from "./students/practice/attendpracticecoding";
import AttendOnlinePracticeTest from "./students/practice/attendpracticemcq";
import TestResultPage from "./students/practice/testresultmcq";
import Demo from './students/practice/practicequestion';

const Students = ({ collegeName, username, institute, userRole }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [needInfo, setNeedInfo] = useState(false);
  const [studentsNeedInfoData, setStudentsNeedInfoData] = useState([]);
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    // Fetch student's need_candidate_info when the component mounts
    getStudentNeedInfo(username)
      .then((data) => {
        setNeedInfo(data.need_candidate_info);
        setStudentsNeedInfoData(data);
        // console.log('setNeedInfo: ', data);
      })
      .catch((error) => {
        // Handle error if needed
        console.error("Error fetching need info:", error);
      });
  }, [username]);

  const handleUploadComplete = () => {
    setNeedInfo(false); // switch to main dashboard after upload
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const enableSidebar = () => {
    setIsSidebarOpen(true);
  };

  const disableSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div
      className="App-header"
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <Router>
        <div className={`app ${theme}`}>
          <SearchProvider>
            {needInfo === true ? (
              <Uploadstudent
                username={username}
                collegeName={collegeName}
                institute={institute}
                onUploadComplete={handleUploadComplete}
              />
            ) : (
              <div>
                <ThemeContextProvider>
                  <Header
                    theme={theme}
                    toggleTheme={toggleTheme}
                    username={username}
                    userRole={userRole}
                    collegeName={collegeName}
                  />
                  <Sidebar
                    isSidebarOpen={isSidebarOpen}
                    toggleSidebar={toggleSidebar}
                    username={username}
                    collegeName={collegeName}
                    institute={institute}
                  />
                  <div
                    className={`main-content ${isSidebarOpen ? "shifted" : ""}`}
                    style={{ marginTop: "60px" }}
                  >
                    <TestProvider>
                      <Routes>
                        <Route
                          path="/"
                          element={
                            <StuDashboard
                              username={username}
                              collegeName={collegeName}
                              institute={institute}
                              isSidebarOpen={isSidebarOpen}
                              disableSidebar={disableSidebar}
                              enableSidebar={enableSidebar}
                            />
                          }
                        />
                        <Route
                          path="/dashboard"
                          element={
                            <StuDashboard
                              username={username}
                              collegeName={collegeName}
                              isSidebarOpen={isSidebarOpen}
                              disableSidebar={disableSidebar}
                              enableSidebar={enableSidebar}
                            />
                          }
                        />
                        <Route
                          path="/Lms/lms"
                          element={
                            <LearningMaterial
                              username={username}
                              collegeName={collegeName}
                              institute={institute}
                            />
                          }
                        />
                       
                        <Route
                          path="/test/ts-online"
                          element={
                            <AttendOnlineMockTest
                              username={username}
                              collegeName={collegeName}
                              isSidebarOpen={isSidebarOpen}
                              disableSidebar={disableSidebar}
                              enableSidebar={enableSidebar}
                            />
                          }
                        />
                       

                        <Route
                          path="/test/ts-code"
                          element={
                            <AttendCodeTest
                              username={username}
                              collegeName={collegeName}
                              isSidebarOpen={isSidebarOpen}
                              disableSidebar={disableSidebar}
                              enableSidebar={enableSidebar}
                            />
                          }
                        />
                        <Route
                          path="/test/Testschedule"
                          element={
                            <TestSchedule
                              username={username}
                              collegeName={collegeName}
                              institute={institute}
                            />
                          }
                        />
                        <Route
                          path="/test/student"
                          element={
                            <TestSchedule
                              username={username}
                              collegeName={collegeName}
                              institute={institute}
                            />
                          }
                        />

                        <Route
                          path="/database/upload-student"
                          element={
                            <Uploadstudent
                              username={username}
                              collegeName={collegeName}
                            />
                          }
                        />
                        <Route
                          path="/database/upload-student-profile"
                          element={
                            <UploadStudentProfile
                              username={username}
                              collegeName={collegeName}
                            />
                          }
                        />

                        <Route
                          path="/practice"
                          element={
                            <PracticeAccess
                              username={username}
                              collegeName={collegeName}
                            />
                          }
                        />
                        <Route
                          path="/practice-question"
                          element={
                            <Demo
                              username={username}
                              collegeName={collegeName}
                            />
                          }
                        />

                        <Route


                          path="/test/practice-code/"
                          element={
                            <AttendCodePracticeTest
                              username={username}
                              collegeName={collegeName}
                              isSidebarOpen={isSidebarOpen}
                              disableSidebar={disableSidebar}
                              enableSidebar={enableSidebar}
                            />
                          }
                        />
                        <Route
                          path="/test/practice-mcq/"
                          element={
                            <AttendOnlinePracticeTest
                              username={username}
                              collegeName={collegeName}
                              isSidebarOpen={isSidebarOpen}
                              disableSidebar={disableSidebar}
                              enableSidebar={enableSidebar}
                            />
                          }
                        />
                       
                        <Route path="/test-result" element={<TestResultPage />} />
                        <Route
                          path="/offers"
                          element={
                            <Offer
                              username={username}
                              collegeName={collegeName}
                            />
                          }
                        />
                                           {/*}  <Route path="index.html" element={<Navigate to="/" />} />   */}
                      </Routes>
                    </TestProvider>
                  </div>
                </ThemeContextProvider>
              </div>
            )}
          </SearchProvider>
        </div>
      </Router>
      <Footer />
    </div>
  );
};

export default Students;
