import React, { useState, useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "./App.css";

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
  "plastic straw": {
    grade: "PP (Polypropylene)",
    degradationTime: "200 years",
    recycleValue: "Low",
    recyclingMethods:
      "Can be recycled into other plastic products, though rarely done.",
    recycleProcess:
      "Plastic straws are difficult to recycle due to their size and contamination, but they can be shredded and turned into granules for use in making products like pipes or furniture.",
  },
  "plastic cup": {
    grade: "PS (Polystyrene)",
    degradationTime: "500 years",
    recycleValue: "Low",
    recyclingMethods:
      "Rarely recycled, but can be turned into insulation or packaging materials.",
    recycleProcess:
      "Polystyrene cups are typically not recycled due to contamination, but when they are, they can be shredded, melted, and reused for insulation or other packaging materials.",
  },
  "plastic packaging": {
    grade: "LDPE (Low-Density Polyethylene)",
    degradationTime: "500-1,000 years",
    recycleValue: "Low",
    recyclingMethods: "Recycled into trash can liners and floor tiles.",
    recycleProcess:
      "LDPE plastic is collected, cleaned, melted, and used in the production of items like trash bags, floor tiles, or furniture. However, recycling rates for LDPE are relatively low.",
  },
  "plastic toys": {
    grade: "PVC (Polyvinyl Chloride)",
    degradationTime: "100-500 years",
    recycleValue: "Low",
    recyclingMethods: "Recycled into pipes and flooring materials.",
    recycleProcess:
      "PVC plastic from toys and other products can be collected, cleaned, and recycled into products like piping, floor tiles, or window frames.",
  },
  "water jug": {
    grade: "PS (Polystyrene)",
    degradationTime: "500 years",
    recycleValue: "Low",
    recyclingMethods: "Rarely recycled due to contamination issues.",
    recycleProcess:
      "Polystyrene utensils are generally not recycled because of contamination, but in rare cases, they can be shredded and used in products like insulation or plastic packaging.",
  },
  "plastic bottle cap": {
    grade: "HDPE (High-Density Polyethylene)",
    degradationTime: "500 years",
    recycleValue: "Moderate",
    recyclingMethods:
      "Recycled into new caps, bottles, or other plastic products.",
    recycleProcess:
      "Bottle caps are collected, cleaned, shredded, and processed into new plastic products such as caps, containers, or even composite materials.",
  },
  "plastic food tray": {
    grade: "PS (Polystyrene)",
    degradationTime: "500 years",
    recycleValue: "Low",
    recyclingMethods:
      "Rarely recycled, but can be used for insulation and packaging.",
    recycleProcess:
      "Polystyrene food trays are difficult to recycle due to contamination, but they can be shredded and repurposed into insulation or packaging materials.",
  },
  "plastic milk jug": {
    grade: "HDPE (High-Density Polyethylene)",
    degradationTime: "10-20 years",
    recycleValue: "High",
    recyclingMethods: "Recycled into new plastic containers and bottles.",
    recycleProcess:
      "Milk jugs made of HDPE can be easily recycled by washing, shredding, and re-extruding into new bottles or containers.",
  },
  "plastic wrapping": {
    grade: "LDPE (Low-Density Polyethylene)",
    degradationTime: "500-1,000 years",
    recycleValue: "Low",
    recyclingMethods: "Recycled into trash can liners and plastic lumber.",
    recycleProcess:
      "Plastic wrapping is typically recycled by washing, shredding, and remelting it into products like plastic lumber or trash liners.",
  },
  "plastic pipes": {
    grade: "PVC (Polyvinyl Chloride)",
    degradationTime: "100-500 years",
    recycleValue: "Moderate",
    recyclingMethods: "Recycled into flooring materials and piping.",
    recycleProcess:
      "PVC pipes can be collected, cleaned, and re-extruded into new products such as pipes, flooring materials, and window frames.",
  },
  "plastic film": {
    grade: "LDPE (Low-Density Polyethylene)",
    degradationTime: "500-1,000 years",
    recycleValue: "Low",
    recyclingMethods:
      "Recycled into products like plastic bags and floor tiles.",
    recycleProcess:
      "Plastic film is recycled by collecting, cleaning, and shredding it into smaller pieces, which are then melted and reformed into new products like bags or tiles.",
  },
  "plastic furniture": {
    grade: "HDPE (High-Density Polyethylene)",
    degradationTime: "500 years",
    recycleValue: "Moderate",
    recyclingMethods: "Recycled into new plastic furniture or containers.",
    recycleProcess:
      "Plastic furniture made from HDPE is collected, cleaned, and shredded before being melted and re-extruded into new furniture or plastic containers.",
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
        {image && <img src={image.src} alt="Uploaded" />}
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
