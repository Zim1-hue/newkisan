
import { predictHarvest, suggestCrops } from './src/utils/agriBrain.js';

const cases = [
  {
    name: "Manual Verification: Potato (Should be Unsuitable here)",
    inputs: { targetCrop: "Potato", nitrogen: 100, phosphorus: 10, potassium: 10, temperature: 35, humidity: 80, ph: 4.5, rainfall: 200, state: "Kerala", district: "Idukki", soilType: "Clay" }
  },
  {
    name: "pH Sensitivity Test: Rice (Acidic Soil)",
    inputs: { nitrogen: 80, phosphorus: 40, potassium: 40, temperature: 25, humidity: 80, ph: 4.0, rainfall: 200, state: "West Bengal", district: "Hooghly", soilType: "Clay" }
  }
];

cases.forEach(tc => {
  console.log(`\n### TEST: ${tc.name}`);
  const prediction = predictHarvest(tc.inputs);
  console.log(`Prediction: ${prediction.cropName}`);
  console.log(`Score: ${prediction.score}%`);
  console.log(`Target Verified? ${prediction.isTargetCropVerified}`);
  
  const suggestions = suggestCrops(tc.inputs);
  console.log(`Top 3 (Score-based): ${suggestions.map(s => `${s.name} (${s.score}%)`).join(', ')}`);
});
