
import { predictHarvest, suggestCrops } from './src/utils/agriBrain.js';

const testCases = [
  {
    name: "Standard Rice Case",
    inputs: { nitrogen: 80, phosphorus: 40, potassium: 40, temperature: 25, humidity: 80, ph: 6.5, rainfall: 200, state: "West Bengal", district: "Hooghly", soilType: "Clay" }
  },
  {
    name: "Extreme Dry Case",
    inputs: { nitrogen: 50, phosphorus: 30, potassium: 30, temperature: 30, humidity: 30, ph: 6.0, rainfall: 10, state: "Rajasthan", district: "Jodhpur", soilType: "Sandy" }
  },
  {
    name: "Extreme Hot Case",
    inputs: { nitrogen: 60, phosphorus: 40, potassium: 40, temperature: 45, humidity: 40, ph: 7.0, rainfall: 50, state: "Gujarat", district: "Ahmedabad", soilType: "Loamy" }
  },
  {
    name: "High Nutrient Maize Case",
    inputs: { nitrogen: 100, phosphorus: 60, potassium: 25, temperature: 25, humidity: 65, ph: 6.5, rainfall: 100, state: "Karnataka", district: "Mysuru", soilType: "Loamy" }
  },
  {
    name: "Edge Case: Low Humidity",
    inputs: { nitrogen: 70, phosphorus: 35, potassium: 35, temperature: 20, humidity: 10, ph: 6.5, rainfall: 150, state: "Punjab", district: "Amritsar", soilType: "Alluvial" }
  },
  {
    name: "Fallback Case: Unknown Prediction",
    // These values are often associated with fruits not in the cropDatabase (like Apple/Grapes)
    inputs: { nitrogen: 10, phosphorus: 120, potassium: 200, temperature: 22, humidity: 50, ph: 6.0, rainfall: 100, state: "Himachal Pradesh", district: "Shimla", soilType: "Loamy" }
  },
  {
    name: "Manual Verification: Potato (Should be Unsuitable here)",
    inputs: { targetCrop: "Potato", nitrogen: 100, phosphorus: 10, potassium: 10, temperature: 35, humidity: 80, ph: 4.5, rainfall: 200, state: "Kerala", district: "Idukki", soilType: "Clay" }
  },
  {
    name: "pH Sensitivity Test: Rice (Acidic Soil)",
    inputs: { nitrogen: 80, phosphorus: 40, potassium: 40, temperature: 25, humidity: 80, ph: 4.0, rainfall: 200, state: "West Bengal", district: "Hooghly", soilType: "Clay" }
  }
];

console.log("--- STARTING CROP PREDICTION TESTS ---\n");

testCases.forEach(tc => {
  console.log(`TEST CASE: ${tc.name}`);
  console.log(`Inputs: ${JSON.stringify(tc.inputs)}`);
  
  try {
    const prediction = predictHarvest(tc.inputs);
    const suggestions = suggestCrops(tc.inputs);
    
    console.log(`Prediction: ${prediction.cropName}`);
    console.log(`Confidence: ${prediction.confidence}%`);
    console.log(`Suitability Score: ${prediction.score}%`);
    console.log(`Yield: ${prediction.yieldKg} kg/ha`);
    console.log(`Top 3: ${suggestions.length > 0 ? suggestions.map(s => `${s.rank}. ${s.name} (${s.score}%)`).join(', ') : 'None from database'}`);
    
    if (suggestions.length > 0) {
      console.log(`Why Ranked #1:\n${suggestions[0].reason}`);
    } else {
      console.log("Why Ranked #1: N/A");
    }
    
    console.log(`Explanation (How): ${prediction.explanation.how}`);
    
    if (prediction.locationWarning) {
      console.log(`Location Warning: ${prediction.locationWarning}`);
    }
  } catch (err) {
    console.error(`Error in test case ${tc.name}:`, err);
  }
  console.log("---------------------------------------\n");
});
