import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { uploadQuestionExcel } from "../../api/endpoints";

const UploadQuestionExcelModal = ({ show, handleClose, questionPaperId }) => {

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {

    if (!file) {
      alert("Please choose Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("question_paper_id", questionPaperId);

    try {
      setLoading(true);

      await uploadQuestionExcel(questionPaperId, formData);

      alert("Questions updated successfully");

      handleClose();
      setFile(null);

    } catch (error) {
  console.error(error);
  alert(error?.response?.data?.error || "Upload failed");
}

    setLoading(false);
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Upload Questions Excel</Modal.Title>
      </Modal.Header>

      <Modal.Body>

        <Form.Group>
          <Form.Label>Select Excel File</Form.Label>

          <Form.Control
            type="file"
            accept=".xlsx"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </Form.Group>

      </Modal.Body>

      <Modal.Footer>

       <Button
  onClick={handleClose}
  style={{
    backgroundColor: "#e0e0e0",
    color: "black",
    border: "1px solid #cfcfcf"
  }}
>
  Cancel
</Button>

<Button
  onClick={handleSubmit}
  disabled={loading}
  style={{
    backgroundColor: "orange",
    color: "black",
    border: "1px solid #cfcfcf"
  }}
>
  {loading ? "Uploading..." : "Upload"}
</Button>

      </Modal.Footer>
    </Modal>
  );
};

export default UploadQuestionExcelModal;