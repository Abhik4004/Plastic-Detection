import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "./App.css"; // Adding CSS

const plasticData = {
  "plastic bottle": {
    grade: "PET (Polyethylene Terephthalate)",
    degradationTime: "450 years",
    recycleValue: "High",
    recyclingMethods: "Recycled into fabrics, carpets, and containers.",
    recycleProcess:
      "PET plastic bottles are cleaned, shredded into small flakes, melted, and then reformed into new products such as clothing, carpets, or new containers.",
  },
  // Add more plastic types...
};

function CameraApp() {
  const [model, setModel] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [plasticInfo, setPlasticInfo] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const loadModel = async () => {
    const loadedModel = await mobilenet.load();
    setModel(loadedModel);
    console.log("Model loaded successfully");
  };

  const startWebcam = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
      })
      .catch((err) => {
        console.error("Error accessing webcam", err);
      });
  };

  const classifyImage = async () => {
    if (model && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0, 224, 224);

      const image = tf.browser
        .fromPixels(canvasRef.current)
        .toFloat()
        .expandDims();
      const predictions = await model.classify(image);

      setPrediction(predictions[0]);

      const plasticType = predictions[0].className;
      const plasticDetails = plasticData[plasticType.toLowerCase()];
      if (plasticDetails) {
        setPlasticInfo(plasticDetails);
      } else {
        setPlasticInfo(null);
      }
    }
  };

  useEffect(() => {
    loadModel();
    startWebcam();
  }, []);

  return (
    <div className="App">
      <h1 className="main-title">Plastic Detection System</h1>
      <div className="camera-container">
        <video
          ref={videoRef}
          width="300"
          height="300"
          autoPlay
          className="video-feed"
        ></video>
        <canvas
          ref={canvasRef}
          width="224"
          height="224"
          style={{ display: "none" }}
        ></canvas>
        <button className="classify-button" onClick={classifyImage}>
          Classify Plastic
        </button>
      </div>

      {prediction && (
        <div className="prediction-container animate__animated animate__fadeInUp">
          <h3>Prediction:</h3>
          <p>{`Class: ${prediction.className}`}</p>
          <p>{`Probability: ${(prediction.probability * 100).toFixed(2)}%`}</p>
        </div>
      )}

      {plasticInfo && (
        <div className="info-container animate__animated animate__fadeInUp">
          <h3>Plastic Information:</h3>
          <p>
            <strong>Grade:</strong> {plasticInfo.grade}
          </p>
          <p>
            <strong>Degradation Time:</strong> {plasticInfo.degradationTime}
          </p>
          <p>
            <strong>Recycle Value:</strong> {plasticInfo.recycleValue}
          </p>
          <p>
            <strong>Recycling Methods:</strong> {plasticInfo.recyclingMethods}
          </p>
          <h4>Recycling Process:</h4>
          <p>{plasticInfo.recycleProcess}</p>
        </div>
      )}
    </div>
  );
}

export default CameraApp;
