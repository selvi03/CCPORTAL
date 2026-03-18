import React, { useState, useEffect, useRef } from "react";
import {
  getTestcandidateCameraApi,
  addCameraScreenshots_API,
} from "../../../api/endpoints";
import { useNavigate } from "react-router-dom";
import Webcam from "react-webcam";

const SCREENSHOT_COOLDOWN_MS = 4000;
const DETECTION_DEBOUNCE_MS = 5000;
const MAX_MOVEMENT_WARNINGS = 5;

const CameraComponent = ({ id }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const lastFrameDataRef = useRef(null);
  const lastScreenshotTsRef = useRef(0);
  const lastDetectionTsRef = useRef(0);
  const detectionRunningRef = useRef(false);
  const testTerminatedRef = useRef(false);
  const intervalRef = useRef(null);

  const [isCameraOn, setIsCameraOn] = useState(false);
  const [userConfirmed, setUserConfirmed] = useState(null);
  const [movementWarnings, setMovementWarnings] = useState(0);

  const navigate = useNavigate();

  /* ---------------- CAMERA FLAG ---------------- */
  useEffect(() => {
    getTestcandidateCameraApi(id)
      .then((d) => setIsCameraOn(Boolean(d?.[0]?.is_camera_on)))
      .catch(() => setIsCameraOn(false));
  }, [id]);

  /* ---------------- USER CONFIRM ---------------- */
  useEffect(() => {
    if (isCameraOn && userConfirmed === null) {
      const ok = window.confirm(
        "This test uses AI proctoring. Camera movement is monitored. Continue?"
      );
      setUserConfirmed(ok);
      if (!ok) navigate(-1);
    }
  }, [isCameraOn, userConfirmed, navigate]);

  /* ---------------- MAIN LOOP ---------------- */
  useEffect(() => {
    if (!isCameraOn || !userConfirmed) return;

    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      if (!detectionRunningRef.current && !testTerminatedRef.current) {
        analyzeFrame();
      }
    }, 700);

    return () => {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    };
  }, [isCameraOn, userConfirmed]);

  /* ---------------- FRAME ANALYSIS ---------------- */
  const analyzeFrame = () => {
    const video = webcamRef.current?.video;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState !== 4) return;

    detectionRunningRef.current = true;

    const ctx = canvas.getContext("2d");
    const width = 64;
    const height = 48;

    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(video, 0, 0, width, height);

    const frameData = ctx.getImageData(0, 0, width, height).data;

    detectMovementFrontend(frameData, width, height);

    detectionRunningRef.current = false;
  };

  /* ---------------- MOVEMENT DETECTION ---------------- */
  const detectMovementFrontend = (currentData, width, height) => {
    if (!lastFrameDataRef.current) {
      lastFrameDataRef.current = currentData;
      return;
    }

    const prevData = lastFrameDataRef.current;
    let diffScore = 0;
    const totalPixels = width * height;

    for (let i = 0; i < currentData.length; i += 4) {
      const rDiff = Math.abs(currentData[i] - prevData[i]);
      const gDiff = Math.abs(currentData[i + 1] - prevData[i + 1]);
      const bDiff = Math.abs(currentData[i + 2] - prevData[i + 2]);

      if (rDiff + gDiff + bDiff > 100) {
        diffScore++;
      }
    }

    lastFrameDataRef.current = currentData;

    const movementThreshold = totalPixels * 0.15;

    if (diffScore > movementThreshold) {
      handleHeavyMovement();
    }
  };

  /* ---------------- HEAVY MOVEMENT HANDLER ---------------- */
  const handleHeavyMovement = () => {
    const now = Date.now();

    if (now - lastDetectionTsRef.current < DETECTION_DEBOUNCE_MS) return;
    lastDetectionTsRef.current = now;

    setMovementWarnings((prev) => {
      const newCount = prev + 1;

      captureAndUploadScreenshot("heavy_movement");

      if (newCount < MAX_MOVEMENT_WARNINGS) {
        alert(`⚠ Warning ${newCount}/${MAX_MOVEMENT_WARNINGS}\nHeavy movement detected.`);
      } else {
        terminateTest();
      }

      return newCount;
    });
  };

  /* ---------------- TERMINATION ---------------- */
  const terminateTest = () => {
    if (testTerminatedRef.current) return;

    testTerminatedRef.current = true;

    clearInterval(intervalRef.current);
    intervalRef.current = null;

    alert("🚫 Test Terminated\nToo many heavy movements detected.");

    window.dispatchEvent(
      new CustomEvent("AUTO_SUBMIT_TEST", {
        detail: { reason: "movement_violation" },
      })
    );
  };

  /* ---------------- SCREENSHOT ---------------- */
  const captureAndUploadScreenshot = async (reason) => {
    const now = Date.now();

    if (now - lastScreenshotTsRef.current < SCREENSHOT_COOLDOWN_MS) return;
    lastScreenshotTsRef.current = now;

    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) return;

    try {
      const blob = await fetch(imageSrc).then((r) => r.blob());

      const formData = new FormData();
      formData.append("screenshots", blob, `movement_${Date.now()}.jpg`);
      formData.append("reason", reason);

      await addCameraScreenshots_API(id, formData);
    } catch (err) {
      console.error("Screenshot upload failed:", err);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div>
      {isCameraOn && userConfirmed && (
        <>
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={{ width: 640, height: 480, facingMode: "user" }}
            style={{ width: 320, height: 240, borderRadius: 8 }}
          />

          <canvas ref={canvasRef} style={{ display: "none" }} />

          <div style={{ fontSize: 12, marginTop: 8 }}>
            AI proctoring active (frontend movement detection)
          </div>

          <div style={{ marginTop: 8, fontSize: 13 }}>
            ⚠ Warnings: {movementWarnings}/{MAX_MOVEMENT_WARNINGS}
          </div>
        </>
      )}
    </div>
  );
};

export default CameraComponent;
