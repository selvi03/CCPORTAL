import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
    getCollegeList_Concat_API,
    get_department_info_cumula_API,
    downloadTestReports,
    get_user_colleges_API,
    getBatchnumberClgID_API,
    downloadStudentReportApi
} from "../../api/endpoints";
import { Col, Row } from "react-bootstrap";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import "react-datetime/css/react-datetime.css";
import CustomOption from "../test/customoption";


const customStyles = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: '#39444e',
        color: '#fff',
        borderColor: state.isFocused ? '' : '#ffff',
        boxShadow: 'none',
        '&:hover': {
            borderColor: state.isFocused ? '#ffff' : '#ffff'
        },
        '&.css-1a1jibm-control': {
        },
        '@media (max-width: 768px)': {
            fontSize: '12px',
            width: '150px'
        }
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#ffff',
        '@media (max-width: 768px)': {
            fontSize: '12px'
        }
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isSelected ? '#39444e' : state.isFocused ? '#39444e' : '#39444e',
        color: '#ffff',
        '&:hover': {
            backgroundColor: '#39444e',
            color: '#ffff'
        },
        '@media (max-width: 768px)': {
            fontSize: '12px',
            width: '150px'
        }
    }),
    input: (provided) => ({
        ...provided,
        color: '#ffff'
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#39444e',
        '@media (max-width: 768px)': {
            fontSize: '12px'
        }
    })
};

const chartTypeOptions = [
    { value: "bar", label: "Bar Chart" },
    { value: "clustered", label: "Clustered Bar Chart" },
    { value: "pie", label: "Pie Chart" },
    { value: "line", label: "Line Chart" },
];

const roleOptions = [
    { value: "all", label: "All" },
    { value: "super_admin", label: "Super Admin" },
    { value: "placement_officer", label: "Placement Officer" },
];

// ✅ NEW: Report Type Options
const reportTypeOptions = [
    { value: "cumulative", label: "Cumulative Report" },
    { value: "individual", label: "Individual Report" },
];

const CumulativeReport = ({ collegeName, institute, username, userRole }) => {
    const [collegeList, setCollegeList] = useState([]);
    const [selectedCollege, setSelectedCollege] = useState(null);
    const [selectedChartType, setSelectedChartType] = useState(chartTypeOptions[0]);
    const [departmentList, setDepartmentList] = useState([]);
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [isCollegeDisabled, setIsCollegeDisabled] = useState(false);
    const [selectedRole, setSelectedRole] = useState(roleOptions[0]);
    const [isInactive, setIsInactive] = useState(false);
    const [reportType, setReportType] = useState("cumulative"); // ✅ NEW: Report type state
    console.log("college", collegeName, institute, username, userRole)

    const [triggerFetch, setTriggerFetch] = useState(true);

    const questionType = [
        { value: "All", label: "All" },
        { value: "Aptitude", label: "Aptitude" },
        { value: "Softskills", label: "Softskills" },
        { value: "Technical", label: "Technical" },
    ];

    const [selectedQuestionType, setSelectedQuestionType] = useState([]);
    const [batchNumbers, setBatchNumbers] = useState([]);
    const [selectedBatchNo, setSelectedBatchNo] = useState([]);
    const [displayDepartments, setDisplayDepartments] = useState([]);
    const yearOptions = [
        { value: 'all', label: 'All Years' },
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
    ];

    const [selectedYear, setSelectedYear] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isLoading, setIsLoading] = useState(false); // ✅ NEW: Loading state

    useEffect(() => {
        if (triggerFetch) {
            getCollegeList_Concat_API()
                .then((data) => {
                    const options = data.map((college) => ({
                        value: college.id,
                        label: college.college_group_concat,
                    }));

                    const defaultOption = {
                        value: '',
                        label: 'College - College Group',
                    };

                    setCollegeList([defaultOption, ...options]);
                    setTriggerFetch(false);
                })
                .catch((error) => console.error("Error fetching college list:", error));
        }
    }, [triggerFetch]);

    useEffect(() => {
        console.log("Initializing user data from props...");
        console.log("Passed Props - Username:", username, "UserRole:", userRole);

        if (userRole === "Placement Officer") {
            console.log("Role: Placement Officer - Selecting college and disabling dropdown.");
            setSelectedCollege({
                value: institute,
                label: collegeName
            });
            setIsCollegeDisabled(true);

        } else if (userRole === "Super admin" || userRole === "Placement admin") {
            console.log("Role: Super Admin - Allowing college selection.");
            setSelectedCollege(null);
            setIsCollegeDisabled(false);

            getCollegeList_Concat_API()
                .then((data) => {
                    const options = data.map((college) => ({
                        value: college.id,
                        label: college.college_group_concat
                    }));
                    const defaultOption = { value: "", label: "College - College Group" };
                    setCollegeList([defaultOption, ...options]);
                })
                .catch((error) => console.error("Error fetching college list:", error));

        } else if (userRole === "Training admin") {
            console.log(`Role: ${userRole} - Fetching allowed colleges via get_user_colleges_API`);

            get_user_colleges_API(username)
                .then((userData) => {
                    const allowedCollegeIds = userData.college_ids;
                    console.log("Allowed college IDs:", allowedCollegeIds);

                    getCollegeList_Concat_API()
                        .then((allColleges) => {
                            const allowedColleges = allColleges
                                .filter(college => allowedCollegeIds.map(String).includes(String(college.id)))
                                .map(college => ({
                                    value: college.id,
                                    label: college.college_group_concat
                                }));
                            setCollegeList(allowedColleges);
                            setSelectedCollege(allowedColleges[0] || null);
                            setIsCollegeDisabled(false);
                            console.log("Allowed colleges with names:", allowedColleges);
                        })
                        .catch((error) => console.error("Error fetching all colleges:", error));
                })
                .catch((error) => console.error("Error fetching allowed colleges:", error));
        }
    }, [username, userRole, institute, collegeName]);

    useEffect(() => {
        if (selectedCollege) {
            const collegeIds = Array.isArray(selectedCollege.value)
                ? selectedCollege.value
                : [selectedCollege.value];

            get_department_info_cumula_API(collegeIds)
                .then((data) => {
                    if (!Array.isArray(data)) {
                        setDepartmentList([]);
                        return;
                    }

                    const options = [
                        { value: 'all', label: 'All Departments' },
                        ...data.map((dept) => ({
                            value: dept.department_id__id,
                            label: dept.department_id__department
                        }))
                    ];
                    setDepartmentList(options);
                })
                .catch(() => setDepartmentList([]));

            getBatchnumberClgID_API(selectedCollege.value)
                .then((batches) => {
                    const batchOptions = [
                        { value: 'all', label: 'All Batches' },
                        ...batches.batch_numbers.map((batch) => ({
                            label: batch,
                            value: batch
                        }))
                    ];
                    setBatchNumbers(batchOptions);
                })
                .catch(() => setBatchNumbers([]));
        }
    }, [selectedCollege]);

    // ✅ NEW: Function to download individual report
    const downloadIndividualReport = () => {
        setIsLoading(true);
        downloadStudentReportApi(selectedCollege.value)
            .then((response) => {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;

                const contentDisposition = response.headers['content-disposition'];
                let fileName = `student_report_${selectedCollege.label}_${new Date().toISOString().split('T')[0]}.xlsx`;

                if (contentDisposition) {
                    const matches = /filename="([^"]+)"/.exec(contentDisposition);
                    if (matches && matches[1]) {
                        fileName = matches[1];
                    }
                }

                link.setAttribute('download', fileName);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);

                console.log("✅ Individual report downloaded successfully");
                setIsLoading(false);
            })
            .catch((error) => {
                console.error("❌ Error downloading individual report:", error);
                alert("Failed to download individual report. Please try again.");
                setIsLoading(false);
            });
    };

    const handleDownload = () => {
        if (!selectedCollege) {
            alert("Please select a college.");
            return;
        }

        setIsLoading(true);

        // ✅ NEW: Handle Individual Report Download
        if (reportType === "individual") {
            downloadIndividualReport();
            return;
        }

        // Cumulative Report Download
        const questionTypes = selectedQuestionType?.map(qs => qs.value).join(",") || null;
        const departmentIds =
            selectedDepartments.length === departmentList.length
                ? 'all'
                : selectedDepartments.map(dept => dept.value).join(',');

        const batchNos =
            selectedBatchNo.length === batchNumbers.length
                ? 'all'
                : selectedBatchNo.map(bt => bt.value).join(',');

        const years =
            selectedYear.length === yearOptions.length - 1
                ? 'all'
                : selectedYear.map(yr => yr.value).join(',');

        const startDateFormatted = startDate instanceof Date ? startDate.toISOString().split("T")[0] : null;
        const endDateFormatted = endDate instanceof Date ? endDate.toISOString().split("T")[0] : null;

        console.log({
            year: years,
            startDate: startDateFormatted,
            endDate: endDateFormatted,
            questionTypes,
            createdByRole: selectedRole.value,
            batchNos,
            inactive: isInactive,
        });

        downloadTestReports(selectedCollege.value, batchNos, departmentIds, years, startDateFormatted, endDateFormatted, questionTypes, selectedRole.value, selectedChartType.value, isInactive)
            .catch((error) => {
                console.error("❌ Error downloading cumulative report:", error);
                alert("Failed to download cumulative report. Please try again.");
            })
            .finally(() => setIsLoading(false));
    };

    return (
        <div style={{ height: "auto" }}>
            <div className="form-ques" style={{ height: "auto" }}>
                <h6>Cumulative Reports</h6><p></p>

                {/* ✅ NEW: Report Type Selection */}
                <Row>
                    <Col>
                        <label className="label-ques5">Report Type**</label><p></p>
                        <Select
                            options={reportTypeOptions}
                            value={reportTypeOptions.find(opt => opt.value === reportType)}
                            onChange={(option) => setReportType(option.value)}
                            placeholder="Select Report Type"
                            styles={customStyles}
                            isDisabled={isLoading}
                        />
                    </Col>
                </Row>
                <p></p>

                {/* ✅ CONDITIONAL: Show filters based on report type */}
                {reportType === "cumulative" ? (
                    <>
                        <Row>
                            <Col>
                                <label className="label-ques5">College**</label><p></p>
                                <Select
                                    options={collegeList}
                                    value={selectedCollege}
                                    onChange={(college) => {
                                        console.log("College Selected:", college);
                                        setSelectedCollege(college);
                                    }}
                                    placeholder="Select College"
                                    styles={customStyles}
                                    isDisabled={isCollegeDisabled}
                                />
                            </Col>
                            <Col>
                                <label className="label-ques5">Batch</label><p></p>
                                <Select
                                    options={batchNumbers}
                                    value={selectedBatchNo}
                                    onChange={(bt) => setSelectedBatchNo(bt)}
                                    placeholder="Select Batches"
                                    styles={customStyles}
                                    components={{ Option: CustomOption }}
                                    closeMenuOnSelect={false}
                                    isMulti
                                /></Col>
                            <Col>
                                <label className="label-ques5">Department</label><p></p>
                                <Select
                                    options={departmentList}
                                    value={displayDepartments}
                                    onChange={(selected) => {
                                        if (selected && selected.some(opt => opt.value === 'all')) {
                                            const realDepartments = departmentList.filter(opt => opt.value !== 'all');
                                            setSelectedDepartments(realDepartments);
                                            setDisplayDepartments([{ value: 'all', label: 'All Departments' }]);
                                        } else {
                                            setSelectedDepartments(selected);
                                            setDisplayDepartments(selected);
                                        }
                                    }}
                                    placeholder="Select Department(s)"
                                    styles={customStyles}
                                    isMulti
                                />
                            </Col>
                        </Row>
                        <p></p>
                        <p></p>

                        <Row>
                            <Col>
                                <label className="label-ques5">Year</label><p></p>
                                <Select
                                    options={yearOptions}
                                    value={selectedYear}
                                    onChange={(selected) => {
                                        if (selected && selected.some(opt => opt.value === 'all')) {
                                            setSelectedYear(yearOptions.filter(opt => opt.value !== 'all'));
                                        } else {
                                            setSelectedYear(selected);
                                        }
                                    }}
                                    styles={customStyles}
                                    isMulti
                                />
                            </Col>
                            <Col>
                                <label className="label-ques5">StartDate</label><p></p>
                                <DatePicker
                                    selected={startDate}
                                    onChange={(date) => setStartDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    placeholderText="Select Start Date"
                                    className='input-date-custom-cum'
                                    styles={customStyles}
                                />
                            </Col>
                            <Col>
                                <label className="label-ques5">EndDate</label><p></p>
                                <DatePicker
                                    selected={endDate}
                                    onChange={(date) => setEndDate(date)}
                                    dateFormat="yyyy-MM-dd"
                                    placeholderText="Select End Date"
                                    className='input-date-custom-cum'
                                    styles={customStyles}
                                />
                            </Col>
                        </Row>

                        <p></p>
                        <Row>
                            <Col>
                                <label className="label-ques5">Skills</label><p></p>
                                <Select
                                    options={questionType}
                                    value={selectedQuestionType}
                                    onChange={(selected) => setSelectedQuestionType(selected)}
                                    placeholder="Select Skill"
                                    styles={customStyles}
                                    components={{ Option: CustomOption }}
                                    closeMenuOnSelect={false}
                                    isMulti
                                />
                            </Col>

                            <Col>
                                <label className="label-ques5">Assigned Role</label><p></p>
                                <Select
                                    options={roleOptions}
                                    value={selectedRole}
                                    onChange={(role) => setSelectedRole(role)}
                                    placeholder="Select Role"
                                    styles={customStyles}
                                />
                            </Col>
                            <Col>
                                <label className="label-ques5">Chart Type</label><p></p>
                                <Select
                                    options={chartTypeOptions}
                                    value={selectedChartType}
                                    onChange={(chart) => setSelectedChartType(chart)}
                                    placeholder="Select Chart Type"
                                    styles={customStyles}
                                    style={{ marginLeft: "20px" }}
                                /></Col>
                        </Row>
                        <p></p>
                        <Row>
                            <Col>
                                <label className="label-ques5">Include Inactive</label><p></p>
                                <p></p>
                                <input
                                    type="checkbox"
                                    checked={isInactive}
                                    onChange={(e) => setIsInactive(e.target.checked)}
                                />
                            </Col>
                            <Col></Col>
                            <Col></Col>
                        </Row>
                    </>
                ) : (
                    // ✅ INDIVIDUAL REPORT: Minimal filters
                    <Row>
                        <Col>
                            <label className="label-ques5">College**</label><p></p>
                            <Select
                                options={collegeList}
                                value={selectedCollege}
                                onChange={(college) => {
                                    console.log("College Selected:", college);
                                    setSelectedCollege(college);
                                }}
                                placeholder="Select College"
                                styles={customStyles}
                                isDisabled={isCollegeDisabled}
                            />
                        </Col>
                    </Row>
                )}

                <p></p>
                <Row className="center-button-container">
                    <Col xs="auto">
                        <button 
                            onClick={handleDownload} 
                            className="downloads-button"
                            disabled={isLoading}
                        >
                            {isLoading ? "Downloading..." : "Download"}
                        </button>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default CumulativeReport;
