import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "./App.css"; // Add this line to include CSS

const plasticData = {
  "plastic bottle": {
    grade: "PET (Polyethylene Terephthalate)",
    degradationTime: "450 years",
    recycleValue: "High",
    recyclingMethods: "Recycled into fabrics, carpets, and containers.",
    recycleProcess:
      "PET plastic bottles are cleaned, shredded into small flakes, melted, and then reformed into new products such as clothing, carpets, or new containers.",
  },
  "plastic bag": {
    grade: "HDPE (High-Density Polyethylene)",
    degradationTime: "10-20 years",
    recycleValue: "Moderate",
    recyclingMethods: "Recycled into new plastic bags or plastic lumber.",
    recycleProcess:
      "HDPE plastic is washed, melted, and re-extruded into pellets, which can then be used to manufacture products like new plastic bags, plastic bottles, or plastic lumber for decking.",
  },
  "plastic container": {
    grade: "PP (Polypropylene)",
    degradationTime: "20-30 years",
    recycleValue: "Moderate",
    recyclingMethods:
      "Recycled into automotive parts, signal lights, and battery cables.",
    recycleProcess:
      "Polypropylene can be cleaned, melted, and turned into products like signal lights, battery cables, and automotive parts after being processed into plastic granules.",
  },
};

function App() {
  const [model, setModel] = useState(null);
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [plasticInfo, setPlasticInfo] = useState(null);

  const loadModel = async () => {
    const loadedModel = await mobilenet.load();
    setModel(loadedModel);
    console.log("Model loaded successfully");
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        setImage(img);
      };
    };
    reader.readAsDataURL(file);
  };

  const classifyImage = async () => {
    if (model && image) {
      const processedImage = tf.browser
        .fromPixels(image)
        .resizeNearestNeighbor([224, 224])
        .toFloat()
        .expandDims();

      const predictions = await model.classify(processedImage);
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
  }, []);

  return (
    <div className="App">
      <h1>Plastic Detection System</h1>
      <div className="upload-section">
        <input type="file" accept="image/*" onChange={handleImageUpload} />
        {image && <img src={image.src} alt="Uploaded" width="200" />}
        <button onClick={classifyImage}>Classify Plastic</button>
      </div>

      {prediction && (
        <div className="prediction-section">
          <h3>Prediction:</h3>
          <p>{`Class: ${prediction.className}`}</p>
          <p>{`Probability: ${(prediction.probability * 100).toFixed(2)}%`}</p>
        </div>
      )}

      {plasticInfo && (
        <div className="info-section">
          <h3>Plastic Information:</h3>
          <p>{`Grade: ${plasticInfo.grade}`}</p>
          <p>{`Degradation Time: ${plasticInfo.degradationTime}`}</p>
          <p>{`Recycle Value: ${plasticInfo.recycleValue}`}</p>
          <p>{`Recycling Methods: ${plasticInfo.recyclingMethods}`}</p>
          <h4>Recycling Process:</h4>
          <p>{plasticInfo.recycleProcess}</p>
        </div>
      )}
    </div>
  );
}

export default App;
