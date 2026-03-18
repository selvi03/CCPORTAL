import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import {
  FaEdit,
  FaTrash,
  FaEye,
  FaClipboardCheck,
  FaLayerGroup
} from "react-icons/fa";
import { Modal, Button,Col} from 'react-bootstrap';

import {
  get_department_info_cumula_API,scheduleTestAPI,
  getBatchnumberClgID_API,getAssignedTopicsByTrainingId_API,
 getSkillTypesByQuestionType_API,getqstntypeTrainingApi,
getSetsBySkill,assignTopicstrainingAPI,getAssessmentTestTypesAPI,getRegNoRange_API,
  getCollegeList_Concat_API, getTrainersBySkill_API,
  getcollege_Test_Api,updateAutoSchedule,getAutoScheduleById,getTrainerApi,
  get_user_colleges_API,createAutoSchedule,getAutoScheduleList,deleteAutoSchedule,addTrainerwithskillApi, createBatch_API
} from "../../api/endpoints";
import CustomPagination from '../../api/custompagination';
import './dummy.css'

import {  Row,Form } from "react-bootstrap";
import HolidayComponent from '../database/holidays';
import DatePicker from 'react-datepicker';

import 'react-datepicker/dist/react-datepicker.css';
import "react-datetime/css/react-datetime.css";
import CustomOption from '../test/customoption';

import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import { create } from '@mui/material/styles/createTransitions';
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

      width: '150px'
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
      width: '150px'
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


const AutoSchedule = ({username, userRole}) => {
 
  const [collegeList, setCollegeList] = useState([]);
  const [selectedCollege, setSelectedCollege] = useState(null);

  const [departmentList, setDepartmentList] = useState([]);
  const [batchNumbers, setBatchNumbers] = useState([]);
  const [trainerOptions, setTrainerOptions] = useState([]);
  const [locations, setLocations] = useState([]);
  const [locationHolidays, setLocationHolidays] = useState([]);

  const [govtHolidays, setGovtHolidays] = useState([]); // for selected location's holidays

  const [locat, setlocat] = useState('');
  const [updateStartDate, setUpdateStartDate] = useState('');
  const [updateEndDate, setUpdateEndDate] = useState(null);
  const [updateNoOfDays, setUpdateNoOfDays] = useState('');
  const [trainingDates, setTrainingDates] = useState([]);
  const [highlightedDates, setHighlightedDates] = useState([]);
  const [updateNoOfBatch, setUpdateNoOfBatch] = useState(0);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [colleges, setColleges] = useState([]);
const [setsOptions, setSetsOptions] = useState([]);
const [selectedSets, setSelectedSets] = useState([]);
 const [searchTerm, setSearchTerm] = useState(""); // Add state for search input
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages1, setTotalPages1] = useState(1);
  const [pageSize] = useState(10); // Items per page

  const navigate = useNavigate();
  const [triggerFetch, setTriggerFetch] = useState(true);
  const [tempId, setTempId] = useState(null); // For storing temp ID
   const batchOptionsWithAll = [{ label: "All Batches", value: "ALL" }, ...batchNumbers];
const departmentOptionsWithAll = [{ label: "All Departments", value: "ALL" }, ...departmentList];
const [questionTypes, setQuestionTypes] = useState([]);
const [skillTypes, setSkillTypes] = useState([]);

const [selectedQuestionTypes, setSelectedQuestionTypes] = useState([]); // array
const [selectedSkillTypes, setSelectedSkillTypes] = useState([]);       // array

const [collegeIds, setCollegeIds] = useState([]); // for Training admin
const [userColleges, setUserColleges] = useState([]); // store dropdown options
const [trainers, setTrainers] = useState([]); // all trainers fetched for selected skills
const [selectedTrainers, setSelectedTrainers] = useState([]); // trainers selected in the multi-select
 const [form, setForm] = useState({
  college_id: '',       // Number or string (ID)
  no_of_days: '',       // Number
  no_of_batch: '',      // Number
  no_of_trainer: '',    // Number, optional
  department_id: [],    // Array of IDs
  year: [],             // Array of years
  batch_no: [],         // Array of batch numbers
  sets: [],             // Array of sets
  trainer_id: [],       // Array of trainer IDs
  dtm_start_training: '', 
  dtm_end_training: '',
  dtm_end_student: '',
  status: '',
  created_by: '',       // User
});

  const [isManualEndDate, setIsManualEndDate] = useState(false);

  const yearOptions = ['1', '2', '3', '4'];
 useEffect(() => {
    fetchTrainingdata(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handlePageChange1 = (page) => {
    setCurrentPage(page);
  };

const fetchTrainingdata = async (page) => {
  console.log("🚀 fetchTrainingdata called");
  console.log("📄 Requested page:", page);
  console.log("🔍 searchTerm:", searchTerm);

  try {
    const response = await getAutoScheduleList({
      page: page,
      limit: pageSize,      // ✅ FIX
      search: searchTerm,
    });

    console.log("✅ API response:", response);

    const results = response?.results || [];
    const totalCount = response?.total_count || 0;

    setColleges(results);

    const totalPages = Math.ceil(totalCount / pageSize);
    setTotalPages1(totalPages);

    console.log("📊 Total pages:", totalPages);

  } catch (error) {
    console.error("❌ fetchTrainingdata error:", error);
  }
};


   const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this training schedule?")) {
      try {
        await deleteAutoSchedule(id);
        alert("Training schedule deleted successfully!");
  
        // 👇 Refresh current page data properly
        fetchTrainingdata(currentPage);
      } catch (error) {
        console.error("Error deleting training schedule:", error);
        alert("Failed to delete training schedule.");
      }
    }
  };
  
useEffect(() => {
  // helper: merge concat list with codes from base list
  const mergeWithCodes = async (list) => {
    const base = await getcollege_Test_Api(); // has id, college_code
    const codeMap = new Map(base.map((b) => [Number(b.id), b.college]));
    return list.map((c) => ({
      value: Number(c.id),
      label: c.college_group_concat,
      code: codeMap.get(Number(c.id)) || "", // <-- keep code here
    }));
  };


  // ✅ Case 2: Training admin → show only assigned colleges
  if (userRole === "Training admin") {
    get_user_colleges_API(username)
      .then(async (userData) => {
        const ids = (userData?.college_ids || []).map((x) => Number(x));
        setCollegeIds(ids);

        const concatList = await getCollegeList_Concat_API();
        const filtered = concatList.filter((c) => ids.includes(Number(c.id)));
        const withCodes = await mergeWithCodes(filtered);
        setUserColleges(withCodes);
      })
      .catch((error) => {
        console.error("❌ Error fetching user colleges:", error);
      });
  } else {
    // ✅ Case 3: other roles → show all colleges with concat labels
    Promise.all([getCollegeList_Concat_API(), getcollege_Test_Api()])
      .then(([concatList, base]) => {
        const codeMap = new Map(base.map((b) => [Number(b.id), b.college_code]));
        const all = concatList.map((c) => ({
          value: Number(c.id),
          label: c.college_group_concat,
          code: codeMap.get(Number(c.id)) || "",
        }));
        setUserColleges(all);
      })
      .catch((error) => {
        console.error("❌ Error fetching all colleges:", error);
      });
  }
}, [username, userRole]);
 // Fetch college list
  useEffect(() => {
    if (triggerFetch) {
      getCollegeList_Concat_API()
        .then((data) => {
          const options = data.map((college) => ({
            value: college.id,
            label: college.college_group_concat,
          }));
          setCollegeList([{ value: '', label: 'College - College Group' }, ...options]);

          // ✅ Only reset trigger after successful data fetch
          setTriggerFetch(false);
        })
        .catch((error) => console.error("Error fetching college list:", error));
    }
  }, [triggerFetch]);

  // When college is selected: fetch department + batch
  useEffect(() => {
    if (selectedCollege) {
      const collegeId = selectedCollege.value;
      setForm(prev => ({ ...prev, college_id: collegeId }));

      get_department_info_cumula_API([collegeId])
        .then((data) => {
          const options = Array.isArray(data)
            ? data.map((d) => ({
              value: d.department_id__id,
              label: d.department_id__department,
            }))
            : [];
          setDepartmentList(options);
        })
        .catch(() => setDepartmentList([]));

      getBatchnumberClgID_API(collegeId)
        .then((batches) => {
          const options = batches.batch_numbers.map((b) => ({
            label: b,
            value: b,
          }));
          setBatchNumbers(options);
        })
        .catch(() => setBatchNumbers([]));
    }
  }, [selectedCollege]);
  // 🔄 Fetch Holidays Once on Mount
  useEffect(() => {
    console.log("📥 Fetching holiday JSON from /data/tn-holidays-2025.json");
    fetch("/data/tn-holidays-2025.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("❌ File not found or fetch failed");
        }
        return response.json();
      })
      .then((data) => {
        console.log("✅ Holiday JSON fetched successfully:", data);

        const locationKeys = Object.keys(data);
        console.log("📍 Extracted locations:", locationKeys);
        setLocations(locationKeys);

        const parsedHolidayMap = {};
        Object.entries(data).forEach(([location, holidays]) => {
          parsedHolidayMap[location] = holidays.map(dateStr => new Date(dateStr));
          console.log(`📅 Holidays parsed for location "${location}":`, parsedHolidayMap[location].map(d => d.toDateString()));
        });

        setGovtHolidays(parsedHolidayMap);
        console.log("✅ Mapped holidays set to state");
      })
      .catch((error) => {
        console.error("❌ Error loading JSON file:", error);
      });
  }, []);
  const parseDateSafe = (date) => {
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  };

  const calculateEndDate = (startDate, daysToAdd, holidays) => {
    let currentDate = new Date(startDate);
    let addedDays = 0;

    console.log("🚀 Calculating End Date...");
    console.log("👉 Start Date:", currentDate.toDateString());
    console.log("🧾 Days to Add:", daysToAdd);
    console.log("🏖️ Holidays:", holidays.map(h => h.toDateString()));

    while (addedDays < daysToAdd) {
      const currentDateStr = currentDate.toDateString();
      const isHoliday = holidays.some(h => h.toDateString() === currentDateStr);
      const isSunday = currentDate.getDay() === 0; // Only skip Sundays (0 = Sunday)

      console.log(`➡️  ${currentDate.toDateString()} | Sunday: ${isSunday} | Holiday: ${isHoliday}`);

      if (!isHoliday && !isSunday) {
        addedDays++;
        console.log(`✅ Counted as training day: ${currentDate.toDateString()} (${addedDays}/${daysToAdd})`);
      } else {
        console.log(`⏩ Skipped: ${currentDate.toDateString()}`);
      }

      if (addedDays < daysToAdd) {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    console.log("✅ Final End Date:", currentDate.toDateString());
    return currentDate;
  };


  useEffect(() => {
    console.log("🟡 Triggered training calculation useEffect");

    if (updateStartDate && updateNoOfDays && Array.isArray(locationHolidays)) {
      const start = parseDateSafe(updateStartDate);
      if (!start) {
        console.error("⛔ Invalid start date provided:", updateStartDate);
        return;
      }

      console.log("📌 Start Date:", start.toDateString());
      const daysToAdd = parseInt(updateNoOfDays);
      console.log("📐 Number of training days to calculate:", daysToAdd);

      const holidaysAsDates = locationHolidays.map(h => parseDateSafe(h)).filter(Boolean);
      console.log("🎯 Parsed holidays:", holidaysAsDates.map(h => h.toDateString()));

      const trainingDatesArr = [];
      let current = new Date(start);
      let added = 0;

      while (added < daysToAdd) {
        const isHoliday = holidaysAsDates.some(h => h.toDateString() === current.toDateString());
        const isWeekend = current.getDay() === 0 || current.getDay() === 6;

        console.log(`🧭 Evaluating ${current.toDateString()} | Weekend: ${isWeekend}, Holiday: ${isHoliday}`);

        if (!isHoliday && !isWeekend) {
          trainingDatesArr.push(new Date(current));
          added++;
          console.log(`✅ Added Training Day (${added}/${daysToAdd}): ${current.toDateString()}`);
        } else {
          console.log(`⛔ Skipped Day: ${current.toDateString()} (Weekend/Holiday)`);
        }

        current.setDate(current.getDate() + 1);
      }

      console.log("📅 Final Training Dates:", trainingDatesArr.map(d => d.toDateString()));
      setTrainingDates(trainingDatesArr);

      const calculatedEndDate = calculateEndDate(start, daysToAdd, holidaysAsDates);
      setUpdateEndDate(calculatedEndDate);

      setHighlightedDates([
        { dates: holidaysAsDates, className: "holiday-date" },
        { dates: trainingDatesArr, className: "training-date" }
      ]);
      console.log("🌈 Highlighted dates updated");
    } else {
      console.warn("⚠️ Required inputs missing or invalid:", {
        updateStartDate,
        updateNoOfDays,
        locationHolidays
      });
    }
  }, [updateStartDate, updateNoOfDays, locationHolidays]);

  const handleMultiSelect = (selectedOptions, fieldName) => {
  const allOptionSelected = selectedOptions?.some(option => option.value === "ALL");
  let values = [];

  if (fieldName === 'batches') {
    const allValues = batchNumbers.map(option => option.value);
    values = allOptionSelected ? allValues : selectedOptions.map(opt => opt.value);
    setSelectedBatches(
      allOptionSelected ? batchNumbers : selectedOptions
    );
    setUpdateNoOfBatch(values.length);
  }

  if (fieldName === 'department_id') {
    const allValues = departmentList.map(option => option.value);
    values = allOptionSelected ? allValues : selectedOptions.map(opt => opt.value);
    setSelectedDepartments(
      allOptionSelected ? departmentList : selectedOptions
    );
  }

  if (fieldName === 'year') {
    values = selectedOptions.map(option => option.value);
    setSelectedYears(selectedOptions);
  }

  setForm((prevForm) => ({
    ...prevForm,
    [fieldName]: values,
    ...(fieldName === 'batches' && { no_of_batch: values.length })
  }));
};

// Load Question Types initially
useEffect(() => {
  getqstntypeTrainingApi().then(setQuestionTypes);
  setSkillTypes([]);
  setSelectedQuestionTypes([]);
  setSelectedSkillTypes([]);
}, []);

useEffect(() => {
  if (selectedQuestionTypes.length > 0) {
    Promise.all(
      selectedQuestionTypes.map(qtId =>
        getSkillTypesByQuestionType_API(qtId)
      )
    ).then(results => {
      // Flatten and remove duplicates
      const merged = Array.from(new Map(
        results.flat().map(item => [item.id, item])
      ).values());
      setSkillTypes(merged);
      setSelectedSkillTypes([]); // reset selected skills
    });
  } else {
    setSkillTypes([]);
    setSelectedSkillTypes([]);
  }
}, [selectedQuestionTypes]);
useEffect(() => {
  if (selectedSkillTypes.length > 0) {
    const skillIds = selectedSkillTypes; // these are already IDs
    fetchTrainersForSkills(skillIds);
    setSelectedTrainers([]); // reset selected trainers
  } else {
    setTrainers([]);
    setSelectedTrainers([]);
  }
}, [selectedSkillTypes]);

const fetchTrainersForSkills = async (skillIds) => {
  console.log("📌 fetchTrainersForSkills called with skill IDs:", skillIds);

  if (!skillIds || skillIds.length === 0) {
    setTrainers([]);
    return;
  }

  const query = skillIds.join(","); // API expects ?skill_type=1,2
  console.log("🔍 Fetching trainers with query:", query);

  try {
    const res = await getTrainersBySkill_API(query); // API call: ?skill_type=1,2
    console.log("✅ Trainers fetched:", res);

    const unique = [];
    const seen = new Set();

    res.forEach(t => {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        unique.push({
          value: t.id,
          label: t.user_name || t.trainer_name
        });
      }
    });

    setTrainers(unique);
  } catch (err) {
    console.error("❌ Error fetching trainers:", err);
    setTrainers([]);
  }
};

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

useEffect(() => {
  if (selectedSkillTypes.length > 0) {
    getSetsBySkill(selectedSkillTypes)
      .then((data) => {
        const options = data.map(item => ({
  value: item.sets,
  label: item.sets,
}));
setSetsOptions(options);

        setSetsOptions(options);
        setSelectedSets([]); // reset on skill change
      })
      .catch(err => {
        console.error("Error fetching sets:", err);
        setSetsOptions([]);
      });
  } else {
    setSetsOptions([]);
    setSelectedSets([]);
  }
}, [selectedSkillTypes]);

const formatDatesForBackend = (dates) => {
  return dates.map(d =>
    moment(d).format("YYYY-MM-DD")
  );
};

const handleSubmit = async (event) => {
  event.preventDefault();

  const payload = {
    college_id: selectedCollege?.value || null,
    no_of_days: Number(updateNoOfDays || 0),
    no_of_batch: Number(updateNoOfBatch || 0),
    department_id: selectedDepartments.map(d => d.value),
    year: selectedYears.map(y => y.value),
    batch_no: selectedBatches.map(b => b.value),
    sets: selectedSets.map(s => s.value),
    trainer_id: selectedTrainers.map(t => t.value),
    dtm_start_training: updateStartDate ? moment(updateStartDate).format("YYYY-MM-DD") : null,
    dtm_end_training: updateEndDate ? moment(updateEndDate).format("YYYY-MM-DD") : null,
    dtm_end_student: updateEndDate ? moment(updateEndDate).format("YYYY-MM-DD") : null,
    status: form.status || "",
    created_by: form.created_by || "",
    all_training_dates: formatDatesForBackend(trainingDates),
  };

  try {
    let res;
   if (tempId) {
  await updateAutoSchedule(tempId, payload); // uses PUT or PATCH
  alert("✅ Training updated!");
} else {
  const res = await createAutoSchedule(payload);
  alert("✅ Training created!");
  setTempId(res.id);
}


    fetchTrainingdata(currentPage);
  } catch (err) {
    console.error("❌ Submit error:", err);
    alert("❌ Save failed");
  }
};
const [editData, setEditData] = useState(null);
useEffect(() => {
  fetchTrainers();
}, []);

const fetchTrainers = async () => {
  const res = await getTrainerApi();

  const formatted = res.map(t => ({
    value: t.id,
    label: t.trainer_name
  }));

  setTrainers(formatted);
};

useEffect(() => {
  if (!editData || departmentList.length === 0) return;

  const matched = departmentList.filter(d =>
    editData.departments?.includes(d.value)
  );

  console.log("✅ Departments populated:", matched);
  setSelectedDepartments(matched);
}, [departmentList, editData]);
useEffect(() => {
  if (
    !editData ||
    !Array.isArray(editData.batch_nos) ||
    batchNumbers.length === 0
  ) {
    console.log("⏳ Waiting for batchNumbers...");
    return;
  }

  const matched = batchNumbers.filter(b =>
    editData.batch_nos.includes(b.value)
  );

  console.log("✅ Final batch match:", matched);
  setSelectedBatches(matched);

}, [batchNumbers, editData]);
useEffect(() => {
  if (!editData || !Array.isArray(editData.trainer_id) || trainers.length === 0) {
    console.log("⏳ Waiting for trainers or editData...");
    return;
  }

  const matched = trainers.filter(t =>
    editData.trainer_id.includes(t.value)
  );

  console.log("✅ Trainers populated:", matched);
  setSelectedTrainers(matched);

}, [trainers, editData]);

useEffect(() => {
  if (!editData) return;

  const matchedYears = (editData.years || []).map(y => ({
    value: y,
    label: y,
  }));

  setSelectedYears(matchedYears);
}, [editData]);

const handleEdit = async (id) => {
  try {
    const data = await getAutoScheduleById(id);

    setTempId(data.id);
    setEditData(data); // ✅ store everything here

    // only set college (this triggers useEffect)
    const collegeObj = userColleges.find(
      c => c.value === data.college_id
    );
    setSelectedCollege(collegeObj || null);

    // simple fields (safe)
    setUpdateNoOfDays(data.no_of_days);
    setUpdateNoOfBatch(data.no_of_batch);
    setUpdateStartDate(data.dtm_start_training ? new Date(data.dtm_start_training) : null);
    setUpdateEndDate(data.dtm_end_training ? new Date(data.dtm_end_training) : null);
    setTrainingDates((data.all_training_dates || []).map(d => new Date(d)));

    setSelectedYears(
      (data.years || []).map(y => ({ value: y, label: y }))
    );

    setSelectedSets(
      (data.sets || []).map(s => ({ value: s, label: s }))
    );

    setForm(prev => ({ ...prev, status: data.status }));

  } catch (e) {
    console.error("Edit failed", e);
  }
};


//----------------------------------------Assing Topic______________________________________//
const [showAssignModal, setShowAssignModal] = useState(false);
const [assignAutoId, setAssignAutoId] = useState(null);
const [isReassigned, setIsReassigned] = useState(false);
const [topicsAssignedMap, setTopicsAssignedMap] = useState({});

const handleConfirmAssignTopicsold = async () => {
  try {
    await assignTopicstrainingAPI(assignAutoId, {
      is_reassigned: isReassigned, 
    });

    alert("✅ Topics assigned successfully");
    setShowAssignModal(false);

  } catch (err) {
    console.error("Assign error:", err);
    alert("❌ Failed to assign topics");
  }
};
const handleConfirmAssignTopics = async () => {
  try {
    const res = await assignTopicstrainingAPI(assignAutoId, {
      is_reassigned: isReassigned,
    });

    if (res?.data?.status === "success") {
      alert("✅ Topics assigned successfully");

      setTopicsAssignedMap((prev) => ({
        ...prev,
        [assignAutoId]: true,
      }));

      setShowAssignModal(false);
    } else {
      alert("⚠ Topic assignment incomplete");
    }

  } catch (err) {
    console.error("Assign error:", err);

    const data = err?.response?.data;

    // 🔴 Case 1: Missing topics in folders
    if (data?.missing_topics && data.missing_topics.length > 0) {
      const message = data.missing_topics
        .map((item, index) => `${index + 1}. ${item.folder_name}`)
        .join("\n");

      alert("❌ Missing topics for folders:\n\n" + message);
    }

    // 🔴 Case 2: Not enough topics
    else if (data?.error) {
      alert("❌ " + data.error);
    }

    // 🔴 Case 3: Generic backend message
    else if (data?.message) {
      alert("❌ " + data.message);
    }

    // 🔴 Case 4: Unknown error
    else {
      alert("❌ Failed to assign topics. Please try again.");
    }
  }
};

//-------------------------------Test assign part------------------------
const [assessmentTestTypes, setAssessmentTestTypes] = useState([]);
const [selectedTestType, setSelectedTestType] = useState([]);
const [isTestcase, setIsTestcase] = useState(false);
const [scheduleDayOption, setScheduleDayOption] = useState("on_day");
 const isCodingTestSelected = assessmentTestTypes.some(
  opt =>
    selectedTestType.includes(String(opt.value)) &&
    opt.label.toLowerCase() === "coding test"
);

const [showTestModal, setShowTestModal] = useState(false);
const [selectedTraining, setSelectedTraining] = useState(null);
useEffect(() => {
  getAssessmentTestTypesAPI()
    .then(setAssessmentTestTypes)
    .catch(err => console.error("❌ Error:", err));
}, []);

useEffect(() => {
  if (!isCodingTestSelected) {
    setIsTestcase(false);
  }
}, [isCodingTestSelected]);

const handleAssignTest = (college) => {
  const isTopicsAssigned = topicsAssignedMap[college.id];

  if (!isTopicsAssigned) {
    alert(
      "⚠ Please assign topics first.\n\n" +
      "👉 Assign Topics → Then Assign Test"
    );
    return; // ⛔ STOP here
  }

  // ✅ Allowed only if topics assigned
  setSelectedTraining(college);
  setShowTestModal(true);
};

const handleSubmitTestAssign = async () => {
  
  try {
    const testPayload = {
      training_id: selectedTraining.id,
      test_type_id: selectedTestType,
       is_testcase: isCodingTestSelected ? isTestcase : false,
      schedule_day_option: scheduleDayOption,
    };

    console.log("📤 Sending Payload:", testPayload);

    const response = await scheduleTestAPI(testPayload);

    console.log("✅ API Response:", response);

    alert("Test assigned successfully!");
  } catch (error) {
    console.error("❌ Assign Test Failed:", error);
    alert("Failed to assign test");
  }
};

//-------------------#-----------------------------
 
  const [assignedTopicsMap, setAssignedTopicsMap] = useState({});
const [openTrainingId, setOpenTrainingId] = useState(null);


  const handleViewAssignedTopics = async (trainingId) => {
  try {
    // toggle close
    if (openTrainingId === trainingId) {
      setOpenTrainingId(null);
      return;
    }

    // already loaded → just open
    if (assignedTopicsMap[trainingId]) {
      setOpenTrainingId(trainingId);
      return;
    }

    const res = await getAssignedTopicsByTrainingId_API(trainingId);

    setAssignedTopicsMap(prev => ({
      ...prev,
      [trainingId]: res.assigned_data || [],
    }));

    setOpenTrainingId(trainingId);

  } catch (err) {
    console.error("❌ Failed to load assigned topics", err);
  }
};
const renderAssignedTopicsTable = (assignedTopics) => {
  if (!assignedTopics || !assignedTopics.length) {
    return <p>No topics assigned</p>;
  }

  // ---------- GROUP DATA ----------
  const tableData = {};
  const batchSet = new Set();

  assignedTopics.forEach((item) => {
    const {
      date,
      session,
      batch,
      trainer,
      topic,
      topics,
      topic_name,
    } = item;

    batchSet.add(batch);

    if (!tableData[date]) tableData[date] = {};
    if (!tableData[date][session]) tableData[date][session] = {};
    if (!tableData[date][session][batch]) {
      tableData[date][session][batch] = {
        trainer,
        topics: [],
      };
    }

    // ✅ NORMALIZE TOPIC DATA (THIS IS THE FIX)
    let normalizedTopics = [];

    if (Array.isArray(topics)) {
      normalizedTopics = topics;
    } else if (typeof topic === "string") {
      normalizedTopics = [topic];
    } else if (typeof topic_name === "string") {
      normalizedTopics = [topic_name];
    }

    normalizedTopics.forEach(t =>
      tableData[date][session][batch].topics.push(t)
    );
  });

  const batches = Array.from(batchSet).sort();
  const dates = Object.keys(tableData).sort();

  const SESSION_COLORS = {
    FN: "#84b7ed",
    AN: "#e8a848",
  };

  return (
    <div className="schedule-wrapper">
      <table className="schedule-grid">
        <thead>
          <tr>
            <th>Days</th>
            <th>Date</th>
            <th>Session</th>
            {batches.map((b) => (
              <th key={b}>{b}</th>
            ))}
          </tr>
        </thead>

        <tbody>
          {dates.map((date, dayIndex) =>
            ["FN", "AN"].map((session, sIdx) => (
              <tr
                key={`${date}-${session}`}
                style={{ background: SESSION_COLORS[session] }}
              >
                <td>{sIdx === 0 ? `Day ${dayIndex + 1}` : ""}</td>
                <td>{date}</td>
                <td><b>{session}</b></td>

                {batches.map((batch) => {
                  const cell = tableData[date]?.[session]?.[batch];

                  return (
                    <td key={batch} className="batch-cell">
                      {cell ? (
                        <>
                          <div className="trainer-name">
                            {cell.trainer || "-"}
                          </div>
                          <div className="topic-text">
                            {cell.topics.length
                              ? cell.topics.join(", ")
                              : "-"}
                          </div>
                        </>
                      ) : (
                        "-"
                      )}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

//-----------------------------------------------------------------------------------------------
const [loading, setLoading] = useState(false);
  const [departmentOptions, setDepartmentOptions] = useState([]);
const [showAddTrainerModal, setShowAddTrainerModal] = useState(false);
   const [newTrainer, setNewTrainer] = useState({
     trainer_name: '',
     user_name: '',
     password: '',
     skill_type: [],
   });  
const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    batch_no: '',
    department_id: '',
    reg_start: '',
    reg_end: ''
  });
useEffect(() => {
  if (!selectedCollege?.value) {
    setDepartmentOptions([]);
    return;
  }

  const collegeId = selectedCollege.value;

  get_department_info_cumula_API(collegeId)
    .then((res) => {
      const normalized = res.map(item => ({
        id: item.department_id__id,
        department: item.department_id__department
      }));
      setDepartmentOptions(normalized);
    })
    .catch((err) => {
      console.error("❌ Department error:", err);
      setDepartmentOptions([]);
    });

}, [selectedCollege]);

useEffect(() => {
  if (!selectedCollege?.value) return;

  const collegeId = selectedCollege.value;

  getRegNoRange_API(collegeId)
    .then((res) => {
      setFormData(prev => ({
        ...prev,
        reg_start: res.min_registration_number || '',
        reg_end: res.max_registration_number || ''
      }));
    })
    .catch(err => console.error("❌ Reg range error:", err));

}, [selectedCollege]);

const handleInputChangenew = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};

 const submitBatchUpdate = async () => {
  if (!formData.batch_no || !formData.department_id) {
    alert("Batch No and Department are required");
    return;
  }

  if (!selectedCollege?.value) {
    alert("Please select a college");
    return;
  }

  try {
    const payload = {
      ...formData,
      college_id: selectedCollege.value
    };

    const res = await createBatch_API(payload);

    alert(res.message || "Batch saved successfully");
    setShowModal(false);

    // reset form
    setFormData({
      batch_no: '',
      department_id: '',
      reg_start: '',
      reg_end: ''
    });

    // ✅ FIXED HERE
    const batches = await getBatchnumberClgID_API(selectedCollege.value);
    setBatchNumbers(
      batches.batch_numbers.map(b => ({ label: b, value: b }))
    );

  } catch (err) {
    console.error(err);
    alert("Failed to save batch");
  }
};

const submitAddTrainer = async () => {
  if (
    !newTrainer.trainer_name ||
    !newTrainer.user_name ||
    !newTrainer.password ||
    newTrainer.skill_type.length === 0
  ) {
    alert("All fields are required");
    return;
  }

  try {
    await addTrainerwithskillApi({
      ...newTrainer,
       college_id: selectedCollege.value
    });

    alert("Trainer added successfully");

    setShowAddTrainerModal(false);

    // reset form
    setNewTrainer({
      trainer_name: '',
      user_name: '',
      password: '',
      skill_type: []
    });

    // 🔄 refresh trainers based on selected skills
    fetchTrainersForSkills(selectedSkillTypes);

  } catch (err) {
    console.error(err);
    alert("Error adding trainer");
  }
};

  return (

    <div >
      <div className='form-ques-master'>
       
      <form onSubmit={handleSubmit} className='form-ques-master'>


        <Row>
          <Col>
            <label>College:</label><p></p>
            <Select options={userColleges}
              styles={customStyles}
              onChange={setSelectedCollege} value={selectedCollege} />

          </Col>
          <Col>
         <div className="d-flex align-items-center justify-content-between">
     <label>Batches:</label> 
     <div>
      <button
  type="button"          // ✅ IMPORTANT
  onClick={(e) => {
    e.preventDefault();  // extra safety
    e.stopPropagation(); // prevents bubbling
    setShowModal(true);
  }}
  style={{
    background: 'none',
    border: '1px solid white',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '18px'
  }}
>
  +
</button>
       
     </div>
   </div>
          
            <Select
              isMulti
               options={batchOptionsWithAll}
             // options={batchNumbers}
                value={selectedBatches}
              styles={customStyles}
               components={{ Option: CustomOption }}
              closeMenuOnSelect={false}
              onChange={(selected) => handleMultiSelect(selected, 'batches')}
            /></Col>
          <Col>
            <label>Departments:</label><p></p>
            <Select
              isMulti
              options={departmentOptionsWithAll}
               value={selectedDepartments}
              //options={departmentList}
              styles={customStyles}
              components={{ Option: CustomOption }}
              closeMenuOnSelect={false}
              onChange={(selected) => handleMultiSelect(selected, 'department_id')}
            /></Col>
        </Row><p></p>

        <Row>
          <Col><label>Year(s):</label><p></p>
            <Select
              isMulti
              styles={customStyles}
              value={selectedYears}
              components={{ Option: CustomOption }}
              closeMenuOnSelect={false}
              options={yearOptions.map((y) => ({ label: y, value: y }))}
              onChange={(selected) => handleMultiSelect(selected, 'year')}
            /></Col>


          <Col>
            <label>No. of Days:</label><p></p>
           <input
  type="number"
  name="no_of_days"
  value={updateNoOfDays || ""}
  className="input-ques-su"
  onChange={(e) => {
    setUpdateNoOfDays(e.target.value);
    setForm(prev => ({
      ...prev,
      no_of_days: e.target.value
    }));
  }}
/>


          </Col>
          <Col>      <label>Location:</label><p></p>
            <Select
              options={locations.map(loc => ({ label: loc, value: loc }))}
              onChange={(selected) => {
                setForm(prev => ({ ...prev, location: selected.value }));
                setlocat(selected.value); // if you're using it elsewhere
                if (govtHolidays[selected.value]) {
                  setLocationHolidays(govtHolidays[selected.value]);
                } else {
                  setLocationHolidays([]);
                }
              }}
              styles={customStyles}
            />
          </Col>
        </Row>  <p></p>

        <Row>
        
         
          <Col>
  <div>
    <label>Topic</label><p></p>
    <Select
      styles={customStyles}
      options={questionTypes.map(qt => ({
        value: qt.id,
        label: qt.question_type
      }))}
      components={{ Option: CustomOption }}
              closeMenuOnSelect={false}
      value={selectedQuestionTypes.map(id => ({
        value: id,
        label: questionTypes.find(qt => qt.id === id)?.question_type || ""
      }))}
      onChange={options => setSelectedQuestionTypes(options ? options.map(o => o.value) : [])}
      placeholder="-- Select Question Type(s) --"
      isClearable
      isMulti
    />
  </div>
</Col>
<Col>
  <div>
    <label>Skill Type</label><p></p>
    <Select
      styles={customStyles}
      options={skillTypes.map(st => ({
        value: st.id,
        label: st.skill_type
      }))}
      components={{ Option: CustomOption }}
              closeMenuOnSelect={false}
      value={selectedSkillTypes.map(id => ({
        value: id,
        label: skillTypes.find(st => st.id === id)?.skill_type || ""
      }))}
      onChange={options => setSelectedSkillTypes(options ? options.map(o => o.value) : [])}
      placeholder="-- Select Skill Type(s) --"
      isClearable
      isMulti
    />
  </div>
</Col>

<Col>
  <label>Sets</label><p></p>
  <Select
    isMulti
    styles={customStyles}
    options={setsOptions}
    value={selectedSets}
    onChange={setSelectedSets}
    placeholder="-- Select Sets --"
    closeMenuOnSelect={false}
  />
</Col>
    </Row><p></p>
<Row>

<Col>
 <div className="d-flex align-items-center justify-content-between">
     <Form.Label><strong>Trainer</strong></Form.Label>
     <div>
      
       <button
  type="button"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAddTrainerModal(true);
  }}
 style={{
    background: 'none',
    border: '1px solid white',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '18px'
  }}
>
  +
</button>
     </div>
   </div>

<Select
  options={trainers}
  value={selectedTrainers} // [{ value, label }]
  onChange={(selectedOptions) => setSelectedTrainers(selectedOptions || [])}
  isMulti
  placeholder="Select Trainers"
  styles={customStyles}
  components={{ Option: CustomOption }}
  closeMenuOnSelect={false}
/>

</Col>
   <Col>
            <div >
              <label className="label5-ques" style={{ marginRight: '10px' }}>Start Date</label><p></p>
              <DatePicker
                selected={parseDateSafe(updateStartDate)}
                onChange={(date) => setUpdateStartDate(date)}
                highlightDates={highlightedDates}
                showTimeSelect
                timeFormat="hh:mm aa"
                timeIntervals={15}
                dateFormat="dd-MM-yyyy, h:mm aa"
                timeCaption="Time"
                className="input-date-custom"
                autoComplete="off"

              />


            </div>
          </Col>
          <Col>

            <div >
              <label className="label5-ques" style={{ marginRight: '10px' }}>End Date </label><p></p>
              <DatePicker
                selected={updateEndDate}
                onChange={(date) => {
                  setUpdateEndDate(date);
                  setIsManualEndDate(true);
                }}
                highlightDates={highlightedDates}
                showTimeSelect
                timeFormat="hh:mm aa"
                timeIntervals={15}
                dateFormat="dd-MM-yyyy, h:mm aa"
                timeCaption="Time"
                className="input-date-custom"
                autoComplete="off"
              />


            </div>
          </Col>
          

  
</Row>
<p>

</p>
<Row>
   <Col>
            <div classname='responsive-holiday-box'>

              <label className="label5-ques">Holidays </label><p></p>
              <DatePicker
                inline
                highlightDates={[
                  {
                    "react-datepicker__day--holiday": locationHolidays.map(date => new Date(date)),
                  },
                  {
                    "react-datepicker__day--weekend": (() => {
                      const weekends = [];
                      const now = new Date();
                      const year = now.getFullYear();
                      const month = now.getMonth();
                      for (let i = 1; i <= 31; i++) {
                        const date = new Date(year, month, i);
                        if (date.getMonth() === month && (date.getDay() === 0 || date.getDay() === 6)) {
                          weekends.push(date);
                        }
                      }
                      return weekends;
                    })()
                  }
                ]}
                onChange={(date) => {
                  const dateString = new Date(date).toDateString();
                  const exists = locationHolidays.some(
                    (d) => new Date(d).toDateString() === dateString
                  );
                  let updated;
                  if (exists) {
                    updated = locationHolidays.filter(
                      (d) => new Date(d).toDateString() !== dateString
                    );
                    console.log("Removed holiday:", dateString);
                  } else {
                    updated = [...locationHolidays, date];
                    console.log("Added holiday:", dateString);
                  }
                  setLocationHolidays(updated);
                }}
                dayClassName={(date) => {
                  const isHoliday = locationHolidays.some(
                    (d) => new Date(d).toDateString() === date.toDateString()
                  );
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                  if (isHoliday) return 'react-datepicker__day--holiday';
                  if (isWeekend) return 'react-datepicker__day--weekend';
                  return undefined;
                }}
              />
            </div></Col>
</Row>

        <br /><br />
        <div className='button-container-set'>
                     


          <button className='button-ques-save' onClick={handleSubmit}>Save</button>
         
          <button className='button-ques-save'   disabled={!tempId} >Next</button>
        </div>
        <HolidayComponent location={locat} onHolidaysFetched={setGovtHolidays} />


      </form>
       

      </div>
       <div className="po-table-responsive-t-Reports">
                    <table className="placement-table-t" >

                    <thead >
            <tr>
              <th>TrainingName</th>
              <th>College</th>

 
              <th  style={{textAlign:"center"}}>Update</th>
              <th  style={{textAlign:"center"}}>Assign Topics</th>
              <th  style={{textAlign:"center"}}>Assign Test</th>
               <th  style={{textAlign:"center"}}>View Schedule</th>
              <th  style={{textAlign:"center"}}>Delete</th>
            </tr>
          </thead>
         <tbody>
  {colleges.map((college) => (
    <React.Fragment key={college.id}>
      {/* MAIN ROW */}
      <tr>
        <td>{college.training_name}</td>
        <td>{college.college_name}</td>

        <td  style={{textAlign:"center"}}>
          <button className="action-button edit" onClick={() => handleEdit(college.id)}>
            ✏️
          </button>
        </td>

        <td style={{textAlign:"center"}}>
          <button
            className="action-button"
           style={{ color: "white" }}
           onClick={() => {
    setAssignAutoId(college.id);
    setIsReassigned(false); // default
    setShowAssignModal(true);
  }}
            //onClick={() => handleAssignTopics(college.id)}
          >
            <FaLayerGroup size={18}/>
          </button>
        </td>

        <td style={{textAlign:"center"}}>
          <button
            className="action-button"
             style={{ color: "white" }}
            onClick={() => handleAssignTest(college)}
          >
            <FaClipboardCheck size={18}/>
          </button>
        </td>

        <td style={{textAlign:"center"}}>
          <button
            className="action-button"
           
            onClick={() => handleViewAssignedTopics(college.id)}
          >
            <FaEye color="white" size={18}/>
          </button>
        </td>

        <td  style={{textAlign:"center"}}>
          <button
            className="action-button delete"
            style={{ color: "orange" }}
            onClick={() => handleDelete(college.id)}
          >
            🗑
          </button>
        </td>
      </tr>

      {/* 🔽 EXPANDED SCHEDULE ROW */}
      {openTrainingId === college.id && (
        <tr>
          <td colSpan={7}>
            {renderAssignedTopicsTable(
              assignedTopicsMap[college.id] || []
            )}
          </td>
        </tr>
      )}
    </React.Fragment>
  ))}
</tbody>

        </table><p></p><p></p>



        <div className='dis-page' style={{ marginTop: '10%' }}>
          {/* Custom Pagination */}
          <CustomPagination
            totalPages={totalPages1}
            currentPage={currentPage}
            onPageChange={handlePageChange1}
            maxVisiblePages={3} // Limit to 3 visible pages
          />
        </div>

      </div>
      {showAssignModal && (
  <div className="custom-modal-backdrop">
    <div className="custom-modal">
      
<div className="p-3 rounded shadow-sm"
        style={{ background: 'rgb(55,63,70)' }}>
      <label>
        <input
          type="checkbox"
          checked={isReassigned}
          onChange={(e) => setIsReassigned(e.target.checked)}
        />
        &nbsp; Is Reassign?
      </label>
      </div>
<p></p>
      <div className="modal-actions">
        

        <button
          className="action-button delete"
          onClick={handleConfirmAssignTopics}
        >
          Assign
        </button>

        <button className="action-button edit" onClick={() => setShowAssignModal(false)}>
          Cancel
        </button>
      </div>

    </div>
  </div>
)}

      {showTestModal && (
  <div className="custom-modal-backdrop">
    <div className="custom-modal">
      
      {/* Reuse your existing form UI */}
      <div className="p-3 rounded shadow-sm"
        style={{ background: 'rgb(55,63,70)' }}>

        {/* Test Type */}
        <Form.Group className="mb-3">
          <Form.Label><strong>Test Type</strong></Form.Label>
          <Select
            isMulti
            options={assessmentTestTypes}
            styles={customStyles}
            value={assessmentTestTypes.filter(opt =>
              selectedTestType.includes(String(opt.value))
            )}
            onChange={(selectedOptions) => {
              const ids = selectedOptions
                ? selectedOptions.map(opt => String(opt.value))
                : [];
              setSelectedTestType(ids);
            }}
          />
        </Form.Group>

        {/* Is Testcase */}
       {isCodingTestSelected && (
  <Form.Check
    type="checkbox"
    label="Is Test Case"
    checked={isTestcase}
    onChange={(e) => setIsTestcase(e.target.checked)}
  />
)}


        {/* Schedule Day */}
        <Form.Group className="mb-3">
          <Form.Label><strong>Schedule Test On</strong></Form.Label>
          <Select
            options={[
              { label: 'On Day', value: 'on_day' },
              { label: 'Next Day', value: 'next_day' },
              { label: 'Two Days Later', value: 'two_days_later' },
            ]}
            value={{
              label:
                scheduleDayOption === 'on_day'
                  ? 'On Day'
                  : scheduleDayOption === 'next_day'
                    ? 'Next Day'
                    : 'Two Days Later',
              value: scheduleDayOption,
            }}
            onChange={(selected) => setScheduleDayOption(selected.value)}
            styles={customStyles}
          />
        </Form.Group>
          
      </div>
<p></p>
      <div className="modal-actions">
        <button className="action-button edit" onClick={handleSubmitTestAssign}>
          ✅ Assign Test
        </button>
        <button className="action-button delete" onClick={() => setShowTestModal(false)}>
          ❌ Close
        </button>
      </div>
    </div>
  </div>
)}


      <Modal show={showAddTrainerModal} onHide={() => setShowAddTrainerModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Trainer</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group controlId="trainer_name">
                  <Form.Label>Trainer Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={newTrainer.trainer_name}
                    onChange={(e) => setNewTrainer({ ...newTrainer, trainer_name: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group controlId="user_name">
                  <Form.Label>User Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={newTrainer.user_name}
                    onChange={(e) => setNewTrainer({ ...newTrainer, user_name: e.target.value })}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group controlId="password">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={newTrainer.password}
                    onChange={(e) => setNewTrainer({ ...newTrainer, password: e.target.value })}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="skill_type" >
                  <Form.Label>Skill Type</Form.Label>
                  {skillTypes.map((skill) => (
                    <Form.Check
                      key={skill.id}
                      type="checkbox"
                      label={skill.skill_type}
                      value={skill.id}
                      checked={newTrainer.skill_type.includes(skill.id)}
                      onChange={(e) => {
                        const id = skill.id;
                        const updated = e.target.checked
                          ? [...newTrainer.skill_type, id]
                          : newTrainer.skill_type.filter((s) => s !== id);
                        setNewTrainer({ ...newTrainer, skill_type: updated });
                      }}
                    />
                  ))}
                </Form.Group></Col>
            </Row>


          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="success"
           onClick={submitAddTrainer}
          >
            Add Trainer
          </Button>
          <Button variant="secondary" onClick={() => setShowAddTrainerModal(false)}>
            Cancel
          </Button>

        </Modal.Footer>
      </Modal>


      {/* React Bootstrap Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Batch for Students</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row><Col md={6}>
              <Form.Group controlId="batch_no" className="mb-3">
                <Form.Label>Batch No</Form.Label>
                <Form.Control
                  type="text"
                  name="batch_no"
                  value={formData.batch_no}
                  onChange={handleInputChangenew}
                />
              </Form.Group></Col>
              <Col md={6}>
                <Form.Group controlId="department_id" className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleInputChangenew}
                  >
                    <option value="">-- Select Department --</option>
                    {departmentOptions.map((dept, idx) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.department}
                      </option>

                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row><Col md={6}>
              <Form.Group controlId="reg_start" className="mb-3">
                <Form.Label>Reg No Start</Form.Label>
                <Form.Control
                  type="text"
                  name="reg_start"
                  value={formData.reg_start}
                  onChange={handleInputChangenew} // ✅ Allow editing
                />
              </Form.Group></Col>
              <Col md={6}>
                <Form.Group controlId="reg_end" className="mb-3">
                  <Form.Label>Reg No End</Form.Label>
                  <Form.Control
                    type="text"
                    name="reg_end"
                    value={formData.reg_end}
                    onChange={handleInputChangenew} // ✅ Allow editing
                  />
                </Form.Group>
              </Col></Row>


          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={submitBatchUpdate}>
            Submit
          </Button>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default AutoSchedule;
