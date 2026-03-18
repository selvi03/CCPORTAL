import React, { useEffect, useState, useRef } from "react";
import CodeEditorWindow from "./codeeditorwindow";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { defineTheme } from "../lib/definetheme";
import useKeyPress from "../hooks/usekeypress";
import OutputWindow from "./outputwindow";
import CustomInput from "./custominput";
import ThemeDropdown from "./themedropdown";

import { useTestContext } from "../../contextsub/context";
// import { addTestAnswerMapApi_Code_Com } from "../../../../api/endpoints";
import "../../../../styles/students.css";
import { java } from "@codemirror/lang-java";
import { php } from '@codemirror/lang-php';
// at top with other imports
import PowerBILite from "./PowerBILite";

import Select from "react-select";
import { customStyles } from "../constants/customstyles";
import ErrorModal from "../../../../components/auth/errormodal";
import ExcelCompiler from "./exceleditor";

import {
  getSkillType_Languages_API, runcsharpApi, runphpApi, runNodeApi, runSpringbootApi, runMatlabApi, runmysqlApi,
  runVlsiApi,runJQueryApi
} from "../../../../api/endpoints";

import { html } from "@codemirror/lang-html";
import CodeMirror from "@uiw/react-codemirror";
import { csharp } from "@replit/codemirror-lang-csharp";
import { oneDark } from "@codemirror/theme-one-dark";
import { StreamLanguage } from "@codemirror/language";
import { verilog } from "@codemirror/legacy-modes/mode/verilog";

import { sql } from "@codemirror/lang-sql";

const languageOptions = [
  { label: "Select Lang...", value: "" },
  { label: "Python", value: "python" },
  { label: "C", value: "c" },
  { label: "C++", value: "cpp" },
  { label: "JAVA", value: "java" },
  { label: "Html", value: "html" },
  { label: "AngularJS", value: "angularjs" },
  { label: "MATLAB", value: "matlab" },
  { label: "NodeJS", value: "nodejs" },
  { label: "SpringBoot", value: "springboot" },

  { label: "MySQL", value: "mysql" },
  { label: "Csharp", value: "csharp" },

 { label: "Excel", value: "excel" },
  { label: "VLSI", value: "vlsi" },
 { label: "Power BI", value: "powerbi" },

  //  { label: "ReactJS", value: "reactjs" },
  { label: "PHP", value: "php" },
  // { label: "Tailwind CSS", value: "tailwind" },
   { label: "Jquery", value: "jquery" },
];

const API_URL = "https://d36uf68d9l9joj.cloudfront.net";

const Landing = () => {
  const [code, setCode] = useState("");
  const [customInput, setCustomInput] = useState("");
  const [processing, setProcessing] = useState(null);
  const [theme, setTheme] = useState("cobalt");
  const [output, setOutput] = useState(""); // State to store the output
const [triggerExcelRun, setTriggerExcelRun] = useState(false);

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [skillType, setSkillType] = useState("");
const [excelAnswers, setExcelAnswers] = useState([]);

  const [userInput, setUserInput] = useState("");
  const outputRef = useRef(null);
  const [csharpCode, setCsharpCode] = useState("");
  const [htmlCode, setHtmlCode] = useState("");
  const [outputHistory, setOutputHistory] = useState([]);
  const editorRef = useRef(null);
  const [showPopup, setShowPopup] = useState(false);
const [powerBIAnswers, setPowerBIAnswers] = useState(null);
  const handleRequireLanguage = () => {
    setShowPopup(true);
  };

  const {
    testIdCon,
    setCodeWindow,
    setLanguageSelected,
    setCustomInputCom,
    setOutputWindowCom,
    setSkillTypeLanguage,
  } = useTestContext();

  const enterPress = useKeyPress("Enter");
  const ctrlPress = useKeyPress("Control");
  const [selectLanguage, setSelectLanguage] = useState(languageOptions[0]);

  const handleChangeLanguage = (selectedOption) => {
    setSelectLanguage(selectedOption);
    console.log("Selected language:", selectedOption);
    setLanguageSelected(selectedOption.value);
    setErrorMessage("");
    setOutput("");
  };

  useEffect(() => {
    fetchTestName();
  }, [testIdCon]);


  const fetchTestName = async () => {
    try {
      const name = await getSkillType_Languages_API(testIdCon);
      setSkillType(name.skill_type);
      setSkillTypeLanguage(name.skill_type);
      console.log("name.skilltype: ", name.skill_type);

      // Try to find skill_type in languageOptions
      const matchedOption = languageOptions.find(
        (option) =>
          option.label.toLowerCase() === name.skill_type?.toLowerCase()
      );

      if (!name.skill_type || name.skill_type === "All Languages" || !matchedOption) {
        // ✅ If null, "All Languages", or not found → show all options
        setSelectLanguage(null);
        setLanguageSelected("");
        console.log("Showing all languages in dropdown");
      } else {
        // ✅ Found match → preselect it
        setSelectLanguage(matchedOption);
        setLanguageSelected(name.skill_type.toLowerCase());
        console.log("Preselected:", name.skill_type.toLowerCase());
      }
    } catch (error) {
      console.error("Error fetching skill type:", error);
      // fallback → show all languages
      setSelectLanguage(null);
      setLanguageSelected("");
    }
  };


  const handleCloseError = () => {
    setShowError(false);
  };

  useEffect(() => {
    setCode('');
    setOutput('');
    setCodeWindow('');
    setOutputWindowCom('');
  }, [selectLanguage]);

  useEffect(() => {
    if (enterPress && ctrlPress) {
      console.log("enterPress", enterPress);
      console.log("ctrlPress", ctrlPress);
    }
  }, [ctrlPress, enterPress]);



  const onChange = (newValue) => {
    setCode(newValue);
    setCodeWindow(newValue);
  };


  const onChangeOther = (action, data) => {
    switch (action) {
      case "code": {
        setCode(data);
        setCodeWindow(data);
        // console.log('setCode: ', data);
        break;
      }
      default: {
        console.warn("case not handled!", action, data);
      }
    }
  };


  function handleThemeChange(th) {
    const theme = th;
    console.log("theme...", theme);

    if (["light", "vs-dark"].includes(theme.value)) {
      setTheme(theme);
    } else {
      defineTheme(theme.value).then((_) => setTheme(theme));
    }
  }
  useEffect(() => {
    defineTheme("oceanic-next").then((_) =>
      setTheme({ value: "oceanic-next", label: "Oceanic Next" })
    );
  }, []);

  // Define detection functions for different languages
  const cleanCode = (code) => {
  return code
    .replace(/\/\/.*$/gm, "")        // remove single line comments
    .replace(/\/\*[\s\S]*?\*\//g, "") // remove block comments
    .trim();
};

const languageDetectionMap = {

  python: (code) => {
    let score = 0;

    const patterns = [
      /\bdef\s+\w+\(/,
      /\bimport\s+\w+/,
      /\bprint\s*\(/,
      /\binput\s*\(/,
      /\blambda\b/,
      /\byield\b/,
      /\basync\b/,
      /\bawait\b/,
      /\belif\b/,
      /\bNone\b/,
      /\bTrue\b|\bFalse\b/,
      /\bclass\s+\w+/,
      /\btry:/,
      /\bexcept\b/
    ];

    patterns.forEach(p => {
      if (p.test(code)) score++;
    });

    return score;
  },


  java: (code) => {
    let score = 0;

    const patterns = [
      /public\s+class\s+\w+/,
      /public\s+static\s+void\s+main/,
      /System\.out\.println/,
      /System\.out\.print/,
      /System\.out\.printf/,
      /import\s+java\./,
      /Scanner\s+\w+/,
      /new\s+Scanner/,
      /String\s*\[\]\s*args/,
      /extends\s+\w+/,
      /implements\s+\w+/,
      /\bpackage\s+\w+/
    ];

    patterns.forEach(p => {
      if (p.test(code)) score++;
    });

    return score;
  },


  cpp: (code) => {
    let score = 0;

    const patterns = [
      /#include\s*<iostream>/,
      /using\s+namespace\s+std/,
      /std::/,
      /cout\s*<</,
      /cin\s*>>/,
      /vector\s*</,
      /string\s+\w+/,
      /endl/,
      /int\s+main\s*\(/
    ];

    patterns.forEach(p => {
      if (p.test(code)) score++;
    });

    return score;
  },


  c: (code) => {
    let score = 0;

    const patterns = [
      /#include\s*<stdio\.h>/,
      /\bprintf\s*\(/,
      /\bscanf\s*\(/,
      /\bgets\s*\(/,
      /\bputs\s*\(/,
      /\bint\s+main\s*\(/,
      /return\s+0;/,
      /%d|%f|%c/
    ];

    patterns.forEach(p => {
      if (p.test(code)) score++;
    });

    return score;
  }

};
function detectLanguage(code) {

  const cleaned = cleanCode(code);
  const scores = {};

  Object.keys(languageDetectionMap).forEach(lang => {
    scores[lang] = languageDetectionMap[lang](cleaned);
  });

  let detected = null;
  let highestScore = 0;

  Object.entries(scores).forEach(([lang, score]) => {
    if (score > highestScore) {
      highestScore = score;
      detected = lang;
    }
  });

  return detected;
}

  const runCodeNodeJS = async () => {
    setProcessing(true);
    try {
      const data = await runNodeApi(code); // call the endpoint function
      const output = data.output || "No output.";
      setOutput(output);
      setOutputWindowCom(output);
      setTimeout(() => setProcessing(false), 500);// ✅ Added this line
    } catch (error) {
      const errorMsg = "Error: " + error.message;
      setOutput(errorMsg);
      setOutputWindowCom(errorMsg); // ✅ Added this line
    } finally {
      setProcessing(false);
    }
  };


  const runCodeSpringBoot = async () => {
    setProcessing(true);
    try {
      const data = await runSpringbootApi(code);
      const output = data.output || "No output.";
      setOutput(output);
      setOutputWindowCom(output);
      setTimeout(() => setProcessing(false), 500); // ✅ Add this
    } catch (error) {
      const errorMsg = "Error: " + error.message;
      setOutput(errorMsg);
      setOutputWindowCom(errorMsg);  // ✅ Add this
    } finally {
      setProcessing(false);
    }
  };

  const runCodeMatlab = async () => {
    setProcessing(true);
    try {
      const data = await runMatlabApi(code, customInput);
      setOutput(data.result || data.message || "No output.");
      setOutputWindowCom(data.result);
      setTimeout(() => setProcessing(false), 500);
    } catch (error) {
      setOutput("Error running MATLAB code.");
    } finally {
      setProcessing(false);
    }
  };
const runCodejquery = async () => {
  setProcessing(true);
  try {
    const res = await runJQueryApi(code);

    const plainOutput = res.output ? res.output : "No output.";
    setOutput(plainOutput);
    setOutputWindowCom(plainOutput);
  } catch (err) {
    console.error("Error running jQuery code:", err);
    setOutput("Error running jQuery code.");
  } finally {
    setProcessing(false);
  }
};

  const runCodeVlsi = async () => {
    setProcessing(true);
    try {
      const data = await runVlsiApi(code);
      setOutput(data.result || data.message || "No output.");
      setOutputWindowCom(data.result);
      setTimeout(() => setProcessing(false), 500);
    } catch (error) {
      setOutput("Error running VLSI simulation.");
    } finally {
      setProcessing(false);
    }
  };
  const runCodeAngular = () => {
    setProcessing(true);
    console.log('Running AngularJS code...');

    const angularCdn = `
    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.8.2/angular.min.js"></script>
  `;

    const bootstrapCdn = `
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
  `;

    // Combine AngularJS + HTML code
    const fullOutput = `${bootstrapCdn}${angularCdn}${code}`;

    setOutput(fullOutput);
    setOutputWindowCom(fullOutput);
    setTimeout(() => setProcessing(false), 500);
  };

  const handleSubmit = () => {
    console.log('Handle submit is working......');
    setProcessing(true);
    if (!selectLanguage) {
      setErrorMessage("Please select a language before running code.");
      setShowError(true);
      return;
    }
   
    const dataToSubmit = {
      code: code,
      p_type: selectLanguage.value,
      inputs: customInput,
    };
    console.log("Data To Submit: ", dataToSubmit);

    // Validate if the code matches the selected language
    if (selectLanguage?.value !== "excel") {
  const detectedLanguage = detectLanguage(code);

if (detectedLanguage !== selectLanguage.value) {
    setErrorMessage(
      `The provided code does not match the selected language: ${selectLanguage.label}.`
    );
    setShowError(true);
    setProcessing(false);
    return;
  }
}

if (selectLanguage.value === "excel") {
    const answers = Array.isArray(excelAnswers) ? excelAnswers : [];

    if (!answers.length) {
      setErrorMessage("Please enter formulas in Excel before submitting.");
      setShowError(true);
      setProcessing(false);
      return;
    }

    // Convert formulas into string (optional – for storage/logging)
    const formulaString = answers
      .map(f => `${f.cell}=${f.formula}`)
      .join("\n");

    console.log("📊 Excel formulas captured:", answers);

    // ✅ Save into global context (used by Attend Practice Test)
    setCode(formulaString);
    setCodeWindow(formulaString);
    setLanguageSelected("excel");
    setOutputWindowCom(formulaString);

    
    setProcessing(false);
    return; // 🔥 IMPORTANT: STOP HERE (NO COMPILER)
  }

// ================= POWER BI BLOCK =================
if (selectLanguage.value === "powerbi") {
  if (!powerBIAnswers) {
    setErrorMessage("Please create a dashboard before submitting.");
    setShowError(true);
    setProcessing(false);
    return;
  }

  const blueprintString = JSON.stringify(powerBIAnswers, null, 2);

  console.log("📊 Power BI Blueprint Captured:", powerBIAnswers);

  // Save to global context (same like Excel)
  setCode(blueprintString);
  setCodeWindow(blueprintString);
  setOutputWindowCom(blueprintString);
  setLanguageSelected("powerbi");

  setProcessing(false);
  return; // 🔥 VERY IMPORTANT — STOP COMPILER
}
    // Detect if the code requires input based on the selected language
    const requiresInput =
      (selectLanguage.value === "python" && code.includes("input(")) ||
      (selectLanguage.value === "c" && code.includes("scanf(")) ||
      (selectLanguage.value === "cpp" && code.includes("cin")) ||
      (selectLanguage.value === "java" && code.includes("Scanner"));

    if (requiresInput && !customInput.trim()) {
      setErrorMessage(
        "The code requires input, but no input was provided. Please provide the necessary input."
      );
      setShowError(true);
      setProcessing(false);
      return;
    }

    // Step 1: Detect input functions for each language
    let expectedInputs = 0;

    if (selectLanguage.value === "python") {
      // Count all input() calls in the code
      const inputCalls = code.match(/input\s*\(/g) || [];
      expectedInputs = inputCalls.length;

      // Check for array input cases
      const arraySizeMatch = code.match(
        /int\s*\(input\s*\(".*"\)\)\s*(\+\s*\d+)?\s*(#|\/\/)?\s*#?\s*Get\s*the\s*elements/
      );
      if (arraySizeMatch) {
        // If there's a pattern indicating an array, add the first input size and then the number of elements
        const firstInput = parseInt(customInput.split(/\r?\n/)[0], 10); // Get the first input as the array size (n)
        if (!isNaN(firstInput)) {
          expectedInputs += firstInput; // Add n more inputs for the array elements
        }
      }
    } else if (selectLanguage.value === "c") {
      expectedInputs = (code.match(/scanf\s*\(/g) || []).length; // C: scanf
    } else if (selectLanguage.value === "cpp") {
      expectedInputs = (code.match(/cin/g) || []).length; // C++: cin
    } else if (selectLanguage.value === "java") {
      // expectedInputs = (
      // code.match(/scanner\s*\.\s*next(Line)?\s*\(\s*\)/g) || []
      //).length; // Java: Scanner input (nextLine() or next())
      expectedInputs = (
        code.match(/scanner\s*\.\s*next\w*\s*\(\s*\)/gi) || []
      ).length;
    }

    const providedInputs =
      customInput.trim() === "" ? 0 : customInput.split(/\r?\n/).length; // Count number of lines in provided input

    // Step 2: Check if validation is necessary
    if (expectedInputs > 0 && expectedInputs !== providedInputs) {
      const errorMessage = `You have ${expectedInputs} inputs in the code, but you provided ${providedInputs}. Please provide the correct number of inputs.`;
      console.error(errorMessage); // Display the error message
      setErrorMessage(errorMessage);
      setShowError(true);
      setProcessing(false);
      return;
    }

    // If no inputs are expected or the input matches the required amount, proceed
    console.log(
      "Inputs are valid or not required, proceeding to execute the code."
    );

    // First API call to start the code execution
    axios
      .post(`${API_URL}/program-compiler/`, dataToSubmit)
      .then((response) => {
        console.log("Full response:", response.data);

        if (response.data && response.data.status === "SUCCESS") {
          setOutput(response.data.result);
          setOutputWindowCom(response.data.result);
          console.log("Compiled Successfully!");
          setProcessing(false);
          setCustomInput("");
        }
      })
      .catch((error) => {

  console.error("Compilation error:", error);

  // 🔴 SERVER RESPONDED WITH ERROR (4xx / 5xx)
  if (error.response) {

    const status = error.response.status;

    console.error("Server response error:", status);

    if (status === 500) {

      setErrorMessage("Your code is incorrect. Kindly check your code.");
      setOutput("Compilation Error");
      setOutputWindowCom("Your code is incorrect. Kindly check your code.");

    } 
    else if (status === 404 || status === 502 || status === 503) {

      setErrorMessage("⚠️ Compiler stopped. Please try again later.");
      setOutput("Compiler Service Unavailable");
      setOutputWindowCom("Compiler stopped.");

    } 
    else {

      setErrorMessage(
        error.response.data?.message || "Compilation failed."
      );
      setOutput("Compilation Error");
      setOutputWindowCom(
        error.response.data?.message || "Compilation failed."
      );

    }

  }

  // 🔴 REQUEST SENT BUT NO RESPONSE (SERVER DOWN / NETWORK ISSUE)
  else if (error.request) {

    console.error("No response from server:", error.request);

    setErrorMessage("⚠️ Compiler stopped. Please try again later.");
    setOutput("Compiler Service Unavailable");
    setOutputWindowCom("Compiler service unavailable.");

  }

  // 🔴 TIMEOUT ERROR
  else if (error.code === "ECONNABORTED") {

    console.error("Request timeout");

    setErrorMessage("⏱ Compiler timeout. Please try again.");
    setOutput("Compiler Timeout");
    setOutputWindowCom("Execution timeout.");

  }

  // 🔴 OTHER ERRORS
  else {

    console.error("Unexpected error:", error.message);

    setErrorMessage("Unexpected error occurred.");
    setOutput("Unknown Error");
    setOutputWindowCom("Unexpected error occurred.");

  }

  setShowError(true);
  setProcessing(false);

});
  };

  const handleSetCustomInput = (input) => {
    console.log("Input handle: ", input);
    setCustomInput(input);
    setCustomInputCom(input);
  };


  const renderCodeEditor = () => {
    if (selectLanguage?.value === "csharp") {
      return (
        <CodeMirror
          value={code}
          height="450px"

          theme={oneDark}
          extensions={[csharp()]}
          onChange={onChange}
        />
      );
    } 
else if (selectLanguage?.value === "excel") {
  return (
    <ExcelCompiler
      externalRun={triggerExcelRun}
      onResult={(res) => {
        console.log("✅ Excel formulas received:", res.answers);

        const answers = Array.isArray(res.answers) ? res.answers : [res.answers].filter(Boolean);
        // 🔥 Convert formulas to STRING
        const formulaString = answers
          .map((f) => `${f.cell}:=${f.formula}`)
          .join("\n");

        console.log("📄 Excel formula string:", formulaString);

        // save answers for submit
        setExcelAnswers(answers);

        // ✅ Store as code (string)
        setCode(formulaString);
        // update shared context so other pages/components can submit
        setCodeWindow(formulaString);
        setLanguageSelected("excel");
        setOutputWindowCom(formulaString);
        console.log('🟪 landingold onResult -> saved formulaString to context:', {
          formulaString,
          codeWindowValue: formulaString,
          outputWindowComValue: formulaString,
          languageSelected: 'excel',
        });
      }}
    />
  );
}



else if (selectLanguage?.value === "html") {
      return (
        <CodeMirror
          value={code}
          height="450px"
          theme={oneDark}
          extensions={[html()]}
          onChange={onChange}
        />
      );
    } else if (selectLanguage?.value === 'vlsi') {
      return (

        <CodeMirror
          value={code}
          height="450px"
          theme={oneDark}
          extensions={[StreamLanguage.define(verilog)]}
          onChange={onChange}
        />
      )
    } else if (selectLanguage?.value === 'mysql') {
      return (

        <CodeMirror
          value={code}
          height="450px"
          theme={oneDark}
          extensions={[sql()]}
          onChange={onChange}
          onCreateEditor={(view) => (editorRef.current = view)}
        />
      )
    }
    else if (selectLanguage?.value === "angularjs") {
      return (
        <CodeMirror
          value={code}
          height="450px"
          theme={oneDark}
          extensions={[html()]} // AngularJS uses HTML + JS, so this works
          onChange={onChange}
        />
      );
    }
    else if (selectLanguage?.value === "nodejs") {
      return (
        <CodeMirror
          value={code}
          height="450px"
          theme={oneDark}
          extensions={[html()]} // JavaScript highlighting (basic)
          onChange={onChange}
        />
      );
    } else if (selectLanguage?.value === "springboot") {
      return (
        <CodeMirror
          value={code}
          height="450px"
          theme={oneDark}
          extensions={[]} // use java extension if you want
          onChange={onChange}
        />
      );
    }
    else if (selectLanguage?.value === "powerbi") {
  return (
    <PowerBILite
      onResult={(dashboardData) => {
        console.log("📊 Power BI Dashboard Data:", dashboardData);

        setPowerBIAnswers(dashboardData);

        const blueprintString = JSON.stringify(dashboardData, null, 2);

        // Save like Excel
        setCode(blueprintString);
        setCodeWindow(blueprintString);
        setOutputWindowCom(blueprintString);
        setLanguageSelected("powerbi");

        console.log("🟢 Power BI blueprint saved to context");
      }}
    />
  );
}

     else if (selectLanguage?.value === "jquery") {
      return (
        <CodeMirror
          value={code}
          height="450px"
          theme={oneDark}
          extensions={[]} // ✅ optional, no need for special mode unless you have javascript() import
          onChange={onChange}
          editable={true} // ✅ ensures user can type & paste
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            syntaxHighlighting: true,
            history: true,
          }}
          onPaste={(event) => {
            // ✅ manually handle paste to ensure it works everywhere
            const paste = (event.clipboardData || window.clipboardData).getData("text");
            onChange(paste);
            event.preventDefault();
          }}
        />
      );
    }
    else if (selectLanguage?.value === "php") {
      return (
        <CodeMirror
          value={code}
          height="450px"
          theme={oneDark}
          extensions={[php()]}  // PHP syntax highlighting
          onChange={onChange}
        />
      );
    }


    else {
      return (
        <>

          <CodeEditorWindow
            code={code}
            onChange={onChangeOther}
            language={selectLanguage}
            onRequireLanguage={handleRequireLanguage}
            theme={theme.value}
          />


        </>
      );
    }
  };



  const runCodeHTML = () => {
    setProcessing(true);
    console.log('Html run code is working...');
    const bootstrapCdn = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">`;
    setOutput(`${bootstrapCdn}${code}`);
    setOutputWindowCom(`${bootstrapCdn}${code}`)
    // setProcessing(false);
    setTimeout(() => setProcessing(false), 500);
  };


  const runCodeCSharp = async () => {
    setProcessing(true);
    console.log('C# run code is working...');
    setOutput(""); // Clear previous output
    setUserInput(""); // Reset input

    console.log('Code: ', code);

    try {
      const response = await runcsharpApi(code); // 🔥 use your Django API
      console.log('C# RESPONSE: ', response);

      if (response.status === "SUCCESS") {
        setOutput(response.result);
        setOutputWindowCom(response.result);
        setTimeout(() => setProcessing(false), 500);
      } else {
        const errorMsg = `Error: ${response.message}`;
        setOutput(errorMsg);
        setOutputWindowCom(errorMsg); // ✅ Added this for safety
      }
    } catch (error) {
      console.error("C# Error:", error);
      const errorMsg = "Error connecting to the Django server.";
      setOutput(errorMsg);
      setOutputWindowCom(errorMsg); // ✅ Added this for consistency
    } finally {
      setProcessing(false);
    }
  };


  const runCodePHP = async () => {
    setProcessing(true);
    console.log('php run code is working...');
    setOutput("");
    setUserInput("");

    console.log('Code: ', code);

    try {
      const response = await runphpApi(code); // call your Django API
      console.log('php RESPONSE: ', response);

      // Use the 'output' key returned by Django
      setOutput(response.output);
      setOutputWindowCom(response.output);
      setTimeout(() => setProcessing(false), 500);

    } catch (error) {
      console.error("php Error:", error);
      setOutput("Error connecting to the Django server.");
    } finally {
      setProcessing(false);
    }
  };



  const handleInputCsharp = async (event) => {
    setProcessing(true);
    if (event.key === "Enter") {
      event.preventDefault();
      const newOutput = output + "\n" + customInput;
      setOutput(newOutput);
      setProcessing(false);

      await fetch("http://localhost:5000/send-input", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: customInput }),
      });

      setCustomInput("");
      setProcessing(false);
    }
  };



  const runSimulation = () => {
    setProcessing(true);
    let simulationResult = "Simulation Output:\nSimulation started...\n";
    const lines = code.split("\n");
    let errors = [];

    let insideModuleHeader = false;
    const moduleHeaderLines = [];

    const validKeywords = [
      "module", "endmodule", "input", "output", "wire", "reg", "assign", "always", "begin", "end"
    ];

    const knownModules = ["AND_Gate", "OR_Gate", "NOT_Gate", "XOR_Gate", "Half_Adder"];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      const lineNum = index + 1;
      const firstWord = trimmed.split(/\s+/)[0];

      // Keyword spelling check
      if (
        firstWord &&
        !validKeywords.includes(firstWord) &&
        /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(firstWord)
      ) {
        const suggestion = validKeywords.find(
          (kw) =>
            kw.length === firstWord.length &&
            [...kw].filter((ch, i) => ch !== firstWord[i]).length <= 2
        );
        errors.push(
          `Line ${lineNum}: Unknown keyword '${firstWord}'.` +
          (suggestion ? ` Did you mean '${suggestion}'?` : "")
        );

        setProcessing(false);
      }

      // Start module block
      if (trimmed.startsWith("module")) {
        insideModuleHeader = true;

        const tokens = trimmed.split(/\s+/);
        const moduleName = tokens[1];

        if (!moduleName || !/^[a-zA-Z_]\w*$/.test(moduleName)) {
          errors.push(`Line ${lineNum}: Invalid or missing module name.`);

          setProcessing(false);
        } else if (!knownModules.includes(moduleName)) {
          const close = knownModules.find(
            (name) =>
              name.length === moduleName.length &&
              [...name].filter((ch, i) => ch !== moduleName[i]).length <= 2
          );
          errors.push(
            `Line ${lineNum}: Unknown module name '${moduleName}'.` +
            (close ? ` Did you mean '${close}'?` : "")

          );

          setProcessing(false);
        }

        if (!trimmed.includes("(")) {
          errors.push(`Line ${lineNum}: Module declaration should include '('`);

          setProcessing(false);
        }

        if (trimmed.includes(");")) {
          insideModuleHeader = false;
        }
      } else if (insideModuleHeader) {
        if (trimmed === ");" || trimmed.endsWith(");")) {
          insideModuleHeader = false;

          moduleHeaderLines.forEach((entry, i) => {
            const isLast = i === moduleHeaderLines.length - 1;
            const line = entry.line.trim();
            if (!isLast && !line.endsWith(",")) {
              errors.push(`Line ${entry.lineNum}: Port declaration should end with ','`);
            }

            setProcessing(false);
          });
        } else {
          moduleHeaderLines.push({ line, lineNum });
        }
      } else {
        const needsSemicolon =
          trimmed.startsWith("assign") ||
          trimmed.startsWith("wire") ||
          trimmed.startsWith("reg");

        if (needsSemicolon && !trimmed.endsWith(";")) {
          errors.push(`Line ${lineNum}: Missing semicolon.`);

          setProcessing(false);
        }

        if (trimmed.startsWith("endmodule") && trimmed.length > 9) {
          errors.push(`Line ${lineNum}: Unexpected characters after 'endmodule'.`);

          setProcessing(false);
        }
      }
    });

    const normalizedCode = code.replace(/\s+/g, " ").trim();

    if (errors.length > 0) {
      simulationResult += `\nFound ${errors.length} error(s):\n` + errors.join("\n") + "\n";
    } else {
      if (normalizedCode.includes("assign Y = A & B;")) {
        simulationResult += `
A = 0, B = 0, Y = 0
A = 0, B = 1, Y = 0
A = 1, B = 0, Y = 0
A = 1, B = 1, Y = 1`;
      } else {
        simulationResult += "Unknown Verilog Code. Please enter a valid circuit.";
      }
    }

    simulationResult += "\nSimulation complete!";
    setOutput(simulationResult);

    setProcessing(false);
  };

  // monu
  const runCodeMySQL = async () => {
    setProcessing(true);
    try {
      const response = await runmysqlApi(code); // ✅ connect to backend
      console.log("MYSQL RESPONSE:", response);
      const output = response.output || "No output.";

      setOutput(output);            // ✅ updates output state
      setOutputWindowCom(output);   // ✅ updates global context
    } catch (error) {
      console.error("MySQL run error:", error);
      setOutput("Error running SQL query.");
    } finally {
      setProcessing(false);
    }
  };


  return (
    <>
      <ToastContainer />

      <div className="flex-row">
        {(!skillType || skillType === "All Languages" ||
          !languageOptions.some(
            (opt) => opt.label.toLowerCase() === skillType?.toLowerCase()
          )) ? (
          // ✅ Show all languages in dropdown
          <div style={{ marginRight: "25px" }}>
            <Select
              options={languageOptions}
              value={selectLanguage}
              onChange={handleChangeLanguage}
              styles={customStyles}
            />
          </div>
        ) : (
          // ✅ Show only the fixed skill type
          <div style={{marginRight:"25px"}}>
            <span>Language: {skillType}</span>
          </div>
        )}

        <div >
          <ThemeDropdown handleThemeChange={handleThemeChange} theme={theme} />
        </div>

        <div className="dropdown-container" >
          <button
            onClick={() => {
              if (!code) return;

              switch (selectLanguage?.value) {
              
                case "c":
                case "cpp":
                case "java":
                case "python":
                  handleSubmit();
                  break;

                case "html":
                  runCodeHTML();
                  break;
                 
                case "powerbi":
  return (
    <div
      style={{
        width: "100%",
        height: "450px",
        background: "#111",
        color: "#0f0",
        padding: "10px",
        borderRadius: "6px",
        fontFamily: "monospace",
      }}
    >
      Power BI does not require code output.  
      Use the dashboard on the left side.
    </div>
  );

                case "csharp":
                  runCodeCSharp();
                  break;

                case "matlab":
                  runCodeMatlab();
                  break;

                case "vlsi":
                  runCodeVlsi();
                  break;

                case "php": // ✅ Add this
                  runCodePHP();
                  break;
                // monu
                case "mysql":
                  runCodeMySQL();
                  break;
                case "angularjs":
                  runCodeAngular();
                  break;
                case "nodejs":
                  runCodeNodeJS();
                  break;
 //                case "excel":
 // setTriggerExcelRun(true);
 // setTimeout(() => setTriggerExcelRun(false), 500); // reset trigger
 // break;


 case "jquery":
                  runCodejquery();
                  break;

                case "springboot":
                  runCodeSpringBoot();
                  break;

                default:
                  console.warn(
                    "No execution method for selected language:",
                    selectLanguage?.value
                  );
              }
            }}
            disabled={processing || (!code && selectLanguage?.value !== "excel")}

           
            className="compile-button"
          >
            {processing ? "Processing..." : "Run Code"}
          </button>
        </div>
      </div>


      <div className="mn-con">
        <div className="code-editor-container">{renderCodeEditor()}</div>

      </div>

      <div className="mn-con" style={{ marginTop: "10px" }}>
        <div style={{ display: "flex", marginTop: "10px" }}>
          {/* Custom/Input Section */}
          {(() => {
            switch (selectLanguage?.value) {
              case "c":
              case "cpp":
              case "python":
              case "java":
                return (
                  <div className="custom-input-container">
                    <CustomInput
                      customInput={customInput}
                      setCustomInput={handleSetCustomInput}
                    />
                  </div>
                );
              case "matlab": // ✅ Added MATLAB input support
                return (
                  <div className="custom-input-container">
                    <CustomInput
                      customInput={customInput}
                      setCustomInput={handleSetCustomInput}
                    />
                  </div>
                );
              case "php":
                return (
                  <div className="custom-input-container">
                    <CustomInput
                      customInput={customInput}
                      setCustomInput={handleSetCustomInput}
                    />
                  </div>
                );

              case "CSharp":
                return (
                  <div className="custom-input-container">
                    <input
                      type="text"
                      value={userInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      onKeyDown={handleInputCsharp}
                      style={{
                        width: "98%",
                        backgroundColor: "black",
                        color: "white",
                        border: "none",
                        outline: "none",
                        fontSize: "14px",
                        fontFamily: "monospace",
                        padding: "15px",
                        borderRadius: "5px",
                      }}
                    />
                  </div>
                );
              default:
                return null;
            }
          })()}

          {/* Output Section */}
          <div className="output-details-n" style={{ marginLeft: "10px" }}>
            {(() => {
              switch (selectLanguage?.value) {
                case "csharp":
                  return (
                    <pre
                      ref={outputRef}
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "5px",
                        padding: "10px",
                        backgroundColor: "#000",
                        color: "#fff",
                        fontFamily: "monospace",
                        overflowY: "auto",
                      }}
                    >
                      {output || "Waiting for execution..."}
                    </pre>
                  );
                case "html":
                  return (
                    <iframe
                      srcDoc={output} // Inject the HTML output
                      title="HTML Output"
                      style={{ width: "100%", height: "400px", border: "none" }}
                    />
                  );
                // monu
                case "php":
                  const isHtmlOutput = /<\s*html|<\s*body|<\s*h[1-6]|<!DOCTYPE/i.test(output);
                  const styledHtml = `
    <style>
      body {
        background-color: #000;
        color: #0f0;
        font-family: monospace;
        padding: 10px;
      }
      h1, h2, h3, p {
        color: #0f0;
      }
    </style>
    ${output}
  `;

                  if (isHtmlOutput) {
                    // ✅ If the PHP output includes HTML — render inside iframe
                    return (
                      <iframe
                        srcDoc={styledHtml}
                        title="PHP Output"
                        style={{
                          width: "100%",
                          height: "400px",
                          border: "none",
                          borderRadius: "8px",
                        }}
                      />
                    );
                  } else {
                    // ✅ Otherwise, render plain text in <pre>
                    return (
                      <pre
                        style={{
                          width: "100%",
                          height: "100%",
                          borderRadius: "5px",
                          padding: "10px",
                          backgroundColor: "#000",
                          color: "#0f0",
                          fontFamily: "monospace",
                          overflowY: "auto",
                        }}
                      >
                        {output || "Waiting for PHP execution..."}
                      </pre>
                    );
                  }



                case "angularjs":
                  return (
                    <iframe
                      srcDoc={output}
                      title="AngularJS Output"
                      style={{ width: "100%", height: "400px", border: "none" }}
                    />
                  );
                case "nodejs":
                case "springboot":
                  return (
                    <pre
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "5px",
                        padding: "10px",
                        backgroundColor: "#000",
                        color: "#0f0",
                        fontFamily: "monospace",
                        overflowY: "auto",
                      }}
                    >
                      {output || "Waiting for execution..."}
                    </pre>
                  );


                case "matlab": // ✅ Added MATLAB Output
                  return (
                    <pre
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "5px",
                        padding: "10px",
                        backgroundColor: "#1e1e1e",
                        color: "#0f0",
                        fontFamily: "monospace",
                        overflowY: "auto",
                      }}
                    >
                      {output || "Waiting for MATLAB execution..."}
                    </pre>
                  );


                // monu
                case "vlsi":
                  return (
                    <div style={{ height: "210px" /* adjust as needed: 400px, 600px, etc. */ }}>
                      <textarea
                        style={{
                          width: "100%",
                          height: "100%",        // fills the wrapper's 500px
                          minHeight: "200px",    // optional fallback
                          maxHeight: "20vh",     // don't overflow the viewport
                          resize: "vertical",    // let user manually resize if desired
                          border: "1px solid #ccc",
                          borderRadius: "5px",
                          backgroundColor: "#282A36",
                          color: "#FFF",
                          fontSize: "14px",
                          padding: "10px",
                          overflowY: "auto",
                        }}
                        value={output}
                        readOnly
                      />
                    </div>
                  );


                // monu
                case "mysql":
                  return (
                    <div
                      style={{
                        padding: "10px",
                        borderRadius: "5px",
                        height: "90%",
                        backgroundColor: "#1e1e1e",
                        color: "#0f0",
                        fontFamily: "monospace",
                        whiteSpace: "pre-line",
                        overflowY: "auto",
                      }}
                    >
                      {output || "Run a MySQL query to see the result..."}
                    </div>
                  );

 case "jquery":
  return (
    <pre
  style={{
    whiteSpace: "pre-wrap",
    color: "#0f0",
    background: "#111",
    padding: "10px",
    borderRadius: "6px",
    height: "100%",
    overflowY: "auto",
  }}
>
  {output ? output.replace(/\\n/g, "\n") : "No output"}
</pre>

  );




                default:
                  return <OutputWindow output={output} />;
              }
            })()}
          </div>
        </div>

      </div>

      <ErrorModal
        show={showError}
        handleClose={handleCloseError}
        errorMessage={errorMessage}
      />
    </>
  );
};
export default Landing;
