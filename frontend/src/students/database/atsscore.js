import React, { useState } from "react";
import { uploadATSResume } from "../../api/endpoints";
import jsPDF from "jspdf";

const ATSScore = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [atsScore, setAtsScore] = useState(null);
  const [atsReport, setAtsReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleResumeUpload = async () => {
    if (!resumeFile) {
      alert("Please upload a resume first");
      return;
    }

    const formData = new FormData();
    formData.append("resume", resumeFile);

    try {
      setLoading(true);

      const data = await uploadATSResume(formData);

      if (!data || data.error) {
        alert(data?.error || "Failed to calculate ATS score");
        return;
      }

      setAtsScore(data.score ?? 0);
      setAtsReport(data.report ?? {});
      setShowModal(true);

    } catch (err) {
      console.error("ATS ERROR:", err);
      alert("Server error while calculating ATS score");
    } finally {
      setLoading(false);
    }
  };

 
const downloadPDF = () => {
  const doc = new jsPDF();

  let y = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const maxLineWidth = pageWidth - margin * 2;

  const addWrappedText = (text) => {
    const lines = doc.splitTextToSize(text, maxLineWidth);

    lines.forEach((line) => {
      if (y > 270) { // create new page if overflow
        doc.addPage();
        y = 20;
      }
      doc.text(line, margin, y);
      y += 7;
    });

    y += 3;
  };

  // Title
  doc.setFontSize(16);
  doc.text("ATS Score Report", margin, y);
  y += 10;

  doc.setFontSize(12);

  addWrappedText(`Score: ${atsScore}%`);
  addWrappedText(`Summary: ${atsReport?.summary || "N/A"}`);

  if (atsReport?.strengths?.length) {
    addWrappedText(`Strengths: ${atsReport.strengths.join(", ")}`);
  }

  if (atsReport?.weaknesses?.length) {
    addWrappedText(`Weaknesses: ${atsReport.weaknesses.join(", ")}`);
  }

  if (atsReport?.suggestions?.length) {
    addWrappedText(`Suggestions: ${atsReport.suggestions.join(", ")}`);
  }

  addWrappedText(
    `Skills Score: ${atsReport?.category_scores?.skills_score ?? 0}%`
  );

  addWrappedText(
    `Experience Score: ${atsReport?.category_scores?.experience_score ?? 0}%`
  );

  addWrappedText(
    `Education Score: ${atsReport?.category_scores?.education_score ?? 0}%`
  );

  addWrappedText(
    `Formatting Score: ${atsReport?.category_scores?.formatting_score ?? 0}%`
  );

  addWrappedText(`Word Count: ${atsReport?.resume_word_count ?? 0}`);

  doc.save("ATS_Report.pdf");
};


  return (
    <div style={styles.container}>
      <h2 style={styles.title}>ATS Resume Checker</h2>

      <div style={styles.uploadBox}>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={(e) => setResumeFile(e.target.files[0])}
          style={styles.fileInput}
        />

        <button
          style={styles.button}
          onClick={handleResumeUpload}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Check ATS Score"}
        </button>
      </div>

      {/* ⭐ POPUP MODAL */}
     {showModal && (
  <div style={styles.overlay} onClick={() => setShowModal(false)}>
    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>

      <div style={styles.modalHeader}>
        <h3>ATS Score: {atsScore}%</h3>
        <button style={styles.closeBtn} onClick={() => setShowModal(false)}>✖</button>
      </div>

      <div style={styles.modalBody}>

  <p style={styles.text}><strong>Summary:</strong> {atsReport?.summary || "N/A"}</p>

  {atsReport?.strengths?.length > 0 && (
    <section style={styles.section}>
      <h4 style={styles.heading}>Strengths</h4>
      <p style={styles.text}>{atsReport.strengths.join(", ")}</p>
    </section>
  )}

  {atsReport?.weaknesses?.length > 0 && (
    <section style={styles.section}>
      <h4 style={styles.heading}>Weaknesses</h4>
      <p style={styles.text}>{atsReport.weaknesses.join(", ")}</p>
    </section>
  )}

  {atsReport?.suggestions?.length > 0 && (
    <section style={styles.section}>
      <h4 style={styles.heading}>Suggestions</h4>
      <p style={styles.text}>{atsReport.suggestions.join(", ")}</p>
    </section>
  )}

  <section style={styles.section}>
    <h4 style={styles.heading}>Category Scores</h4>
    <p style={styles.text}>Skills: {atsReport?.category_scores?.skills_score ?? 0}%</p>
    <p style={styles.text}>Experience: {atsReport?.category_scores?.experience_score ?? 0}%</p>
    <p style={styles.text}>Education: {atsReport?.category_scores?.education_score ?? 0}%</p>
    <p style={styles.text}>Formatting: {atsReport?.category_scores?.formatting_score ?? 0}%</p>
  </section>

  <section style={styles.section}>
    <h4 style={styles.heading}>Resume Word Count</h4>
    <p style={styles.text}>{atsReport?.resume_word_count ?? 0}</p>
  </section>

  <button style={styles.downloadBtn} onClick={downloadPDF}>
    Download PDF Report
  </button>

</div>


    </div>
  </div>
)}

    </div>
  );
};

export default ATSScore;

const styles = {
  container: {
    padding: "30px",
    maxWidth: "700px",
    margin: "auto",
    fontFamily: "Arial, sans-serif",
  },

  title: {
    marginBottom: "20px",
    textAlign: "center",
  },

  uploadBox: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },

  fileInput: {
    flex: 1,
  },

  button: {
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },

  overlay: {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.7)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
},

modal: {
  backgroundColor: "#ffffff",
  color: "#222",
  width: "750px",
  maxWidth: "95%",
  maxHeight: "90vh",
  borderRadius: "12px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  display: "flex",
  flexDirection: "column",
},

modalHeader: {
  padding: "15px 20px",
  borderBottom: "1px solid #eee",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: "#f8f9fa",
  borderTopLeftRadius: "12px",
  borderTopRightRadius: "12px",
},

modalBody: {
  padding: "20px",
  overflowY: "auto",
  lineHeight: 1.6,
},

section: {
  marginBottom: "20px",
},

closeBtn: {
  border: "none",
  background: "#dc3545",
  color: "#fff",
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  cursor: "pointer",
  fontSize: "16px",
},
heading: {
  fontSize: "16px",
  fontWeight: "600",
  marginBottom: "6px",
  color: "#333",
},

text: {
  fontSize: "14px",
  color: "#555",
  marginBottom: "6px",
  wordBreak: "break-word",
},

downloadBtn: {
  marginTop: "20px",
  padding: "12px 18px",
  backgroundColor: "#28a745",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "600",
  width: "100%",
},

};
