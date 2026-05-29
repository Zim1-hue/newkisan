import { predictHarvest, suggestCrops } from './src/utils/agriBrain.js';

console.log("=== NORMAL INPUT TEST ===");
const normalInput = {
    state: "West Bengal",
    district: "Burdwan",
    nitrogen: 90,
    phosphorus: 42,
    potassium: 43,
    temperature: 20.8,
    humidity: 82.0,
    ph: 6.5,
    rainfall: 202.9,
    soilType: "clay"
};

const res1 = predictHarvest(normalInput);
console.log(`Predicted: ${res1.cropName} | Confidence: ${res1.confidence}%`);
console.log(`Yield: ${res1.yieldKg} kg | Score: ${res1.score}`);
console.log(`Explanation:\n${res1.explanation.why}`);


console.log("\n=== EXTREME UNSEEN INPUT TEST ===");
const extremeInput = {
    state: "Rajasthan",
    district: "Thar",
    nitrogen: 10,
    phosphorus: 5,
    potassium: 5,
    temperature: 55.0, // extremely hot
    humidity: 10.0, // extremely dry
    ph: 9.0, // highly alkaline
    rainfall: 5.0, // no rain
    soilType: "sandy"
};

const res2 = predictHarvest(extremeInput);
console.log(`Predicted: ${res2.cropName} | Confidence: ${res2.confidence}%`);
console.log(`Yield: ${res2.yieldKg} kg | Score: ${res2.score}`);
console.log(`Explanation:\n${res2.explanation.why}`);
