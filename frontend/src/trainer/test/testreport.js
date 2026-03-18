import React, { useState, useEffect, useContext } from "react";
import { getTestcandidateReportsApi } from "../../api/endpoints";
import "../../styles/trainer.css";
import { Form, Pagination } from "react-bootstrap";
import Download from "../../assets/images/download.png";
import { SearchContext } from "../../allsearch/searchcontext";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import CustomPagination from '../../api/custompagination';
const TestReports = () => {

  const { searchQuery } = useContext(SearchContext);

  const [testCandidates, setTestCandidates] = useState([]);
  const [search, setSearch] = useState("");

  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [filters, setFilters] = useState({
    college_id: "",
    test_name: "",
    year: "",
    department_id: "",
    avg_mark: ""
  });

  /* ---------------- FETCH DATA ---------------- */

  useEffect(() => {
    fetchTestCandidates();
  }, [currentPage, itemsPerPage, search, searchQuery]);

  const fetchTestCandidates = () => {

    const searchTerm = searchQuery || search;

    getTestcandidateReportsApi(currentPage, itemsPerPage, searchTerm)
      .then((data) => {

        console.log("FULL API RESPONSE:", data);
        console.log("RESULT DATA:", data.results);

        setTestCandidates(data.results || []);
        setTotalPages(data.total_pages || 1);
        setTotalRecords(data.total_records || 0);

      })
      .catch((error) => {
        console.error("Error fetching test candidates:", error);
      });
  };

  /* ---------------- FILTER CHANGE ---------------- */

  const handleFilterChange = (e, key) => {

    const value = e.target.value;

    setFilters({
      ...filters,
      [key]: value
    });

    setCurrentPage(1);
  };

  /* ---------------- SCORE FILTER ---------------- */

  const filterByTotalScore = (score, filterValue) => {

    if (filterValue === "AA") return score === "AA";

    if (filterValue.startsWith("range:")) {

      const [min, max] = filterValue
        .replace("range:", "")
        .split("-")
        .map(Number);

      const scoreValue = parseFloat(score);

      return !isNaN(scoreValue) && scoreValue >= min && scoreValue <= max;
    }

    return true;
  };

  /* ---------------- FILTER DATA ---------------- */

  const filteredCandidates = testCandidates.filter((candidate) => {

   if (
  filters.college_id &&
  String(candidate.college_id) !== String(filters.college_id)
)
  return false;

if (
  filters.test_name &&
  String(candidate.test_name) !== String(filters.test_name)
)
  return false;

if (
  filters.year &&
  String(candidate.year) !== String(filters.year)
)
  return false;

if (
  filters.department_id &&
  String(candidate.department_id) !== String(filters.department_id)
)
  return false;
    return true;
  });

  /* ---------------- DROPDOWN OPTIONS ---------------- */

const generateDropdownOptions = (key) => {

  const values = testCandidates
    .map((candidate) => candidate[key])
    .filter((v) => v !== null && v !== undefined && v !== "");

  const uniqueValues = [...new Set(values)].sort();

  return uniqueValues.map((value, index) => (
    <option key={index} value={value}>
      {value}
    </option>
  ));
};

  /* ---------------- SCORE OPTIONS ---------------- */

  const generateTotalScoreOptions = () => {

    return [
      "All","AA","0-10","10-20","20-30","30-40",
      "40-50","50-60","60-70","70-80","80-90","90-100"
    ].map((option) => (
      <option
        key={option}
        value={
          option === "All"
            ? ""
            : option === "AA"
            ? "AA"
            : `range:${option}`
        }
      >
        {option}
      </option>
    ));
  };

  /* ---------------- EXPORT EXCEL ---------------- */

  const exportToExcel = () => {

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Test Report");

    const headerMap = {
      test_name: "Test Name",
      college_id: "College",
      department_id: "Department",
      year: "Year",
      student_name: "Candidate",
      email_id: "Email",
      mobile_number: "Contact",
      avg_mark: "Score"
    };

    worksheet.columns = Object.keys(headerMap).map((key) => ({
      header: headerMap[key],
      key: key,
      width: 20
    }));

    filteredCandidates.forEach((row) => {
      worksheet.addRow(row);
    });

    worksheet.getRow(1).font = { bold: true };

    workbook.xlsx.writeBuffer().then((buffer) => {

      const blob = new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      saveAs(blob, "test_report.xlsx");
    });
  };

  /* ---------------- UI ---------------- */

  return (

    <div className="table-responsive-trainer">

      <div className="product-table-container">

        <h4>Test Result</h4>

        <div style={{ display: "flex", justifyContent: "space-between" }}>

          <button
            className="button-ques-save"
            style={{ width: "100px" }}
            onClick={exportToExcel}
          >
            <img src={Download} alt="Download" className="nextarrow" />
            Export
          </button>

          <input
            className="search-box1"
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
          />

        </div>

        {/* TABLE */}

       <div className='table-responsive-table'>
        <table className="product-table">
          <thead className="table-thead">

              <tr>

                <th style={{textAlign:'center'}}>
                  College
                  <br />
                <select className="dropdown-custom"
                    value={filters.college_id}
                    onChange={(e) => handleFilterChange(e,"college_id")}
                  >
                    <option value="">All</option>
                    {generateDropdownOptions("college_id")}
                  </select>
                </th>

                <th style={{textAlign:'center'}}>
                  Test Name
                  <br />
                <select className="dropdown-custom"
                    value={filters.test_name}
                    onChange={(e) => handleFilterChange(e,"test_name")}
                  >
                    <option value="">All</option>
                    {generateDropdownOptions("test_name")}
                  </select>
                </th>

                <th style={{textAlign:'center'}}>
                  Year
                  <br />
                <select className="dropdown-custom"
                    value={filters.year}
                    onChange={(e) => handleFilterChange(e,"year")}
                  >
                    <option value="">All</option>
                    {generateDropdownOptions("year")}
                  </select>
                </th>

                <th style={{textAlign:'center'}}>
                  Department
                  <br />
                <select className="dropdown-custom"
                    value={filters.department_id}
                    onChange={(e) => handleFilterChange(e,"department_id")}
                  >
                    <option value="">All</option>
                    {generateDropdownOptions("department_id")}
                  </select>
                </th>

                
               <th style={{textAlign:'center'}}>
      Student Name
    </th>
                <th style={{textAlign:'center'}}>
                  Score
                  <br />
                
                </th>

              </tr>

            </thead>

            <tbody className="table-tbody">

              {filteredCandidates.map((candidate) => (

                <tr key={candidate.id}>

                  <td style={{textAlign:'center'}}>{candidate.college_id}</td>
                  <td style={{textAlign:'center'}}>{candidate.test_name}</td>
                  <td style={{textAlign:'center'}}>{candidate.year}</td>
                  <td style={{textAlign:'center'}}>{candidate.department_id}</td>
                  <td style={{textAlign:'center'}}>
        {candidate.student_name}
      </td>
                  <td style={{textAlign:'center'}}>{candidate.avg_mark}</td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

        {/* PAGINATION */}
<p style={{height:'50px'}}></p>
      
<div className="dis-page">

  <CustomPagination
    totalPages={totalPages}
    currentPage={currentPage}
    onPageChange={(page) => setCurrentPage(page)}
  />

</div>

      </div>

    </div>

  );
};

export default TestReports;