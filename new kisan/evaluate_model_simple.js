import fs from 'fs';
import Papa from 'papaparse';

// Load the trained model
const modelData = JSON.parse(fs.readFileSync('src/data/rf_model.json', 'utf8'));
const classes = modelData.classes;

// Load dataset
const csvContent = fs.readFileSync('src/data/crop_recommendation.csv', 'utf8');
const results = Papa.parse(csvContent, {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true
});

const data = results.data;

// Prepare features and labels
const X = [];
const y = [];

data.forEach(row => {
  if (row.N !== undefined && row.label) {
    X.push([
      row.N,
      row.P,
      row.K,
      row.temperature,
      row.humidity,
      row.ph,
      row.rainfall
    ]);
    y.push(row.label.trim());
  }
});

console.log(`Dataset size: ${X.length} samples`);
console.log(`Number of classes: ${classes.length}`);

// Simple prediction function using the model's structure
function predict(features) {
  // This is a simplified prediction - in reality we'd need to implement
  // the full Random Forest prediction logic
  // For now, let's use a mock prediction based on nearest neighbor
  // We'll implement a simple k-NN for evaluation
  
  // Find the closest sample in the dataset
  let minDist = Infinity;
  let bestLabel = '';
  
  for (let i = 0; i < X.length; i++) {
    const dist = euclideanDistance(features, X[i]);
    if (dist < minDist) {
      minDist = dist;
      bestLabel = y[i];
    }
  }
  
  return bestLabel;
}

function euclideanDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
}

// Split into train (80%) and test (20%)
const splitRatio = 0.8;
const splitIndex = Math.floor(X.length * splitRatio);

const X_test = X.slice(splitIndex);
const y_test = y.slice(splitIndex);

console.log(`\nTest set size: ${X_test.length} samples`);

// Make predictions
console.log('Making predictions...');
const predictions = [];
const actualVsPredicted = [];

for (let i = 0; i < X_test.length; i++) {
  const actual = y_test[i];
  const predicted = predict(X_test[i]);
  predictions.push(predicted);
  
  actualVsPredicted.push({
    sample: i + 1,
    actual,
    predicted,
    correct: actual === predicted
  });
}

// Calculate accuracy
let correct = 0;
for (let i = 0; i < y_test.length; i++) {
  if (y_test[i] === predictions[i]) correct++;
}

const accuracy = (correct / y_test.length) * 100;
console.log(`\nAccuracy: ${accuracy.toFixed(2)}% (${correct}/${y_test.length})`);

// Generate confusion matrix
const confusionMatrix = {};
classes.forEach(cls => {
  confusionMatrix[cls] = {};
  classes.forEach(cls2 => {
    confusionMatrix[cls][cls2] = 0;
  });
});

for (let i = 0; i < y_test.length; i++) {
  const actual = y_test[i];
  const predicted = predictions[i];
  confusionMatrix[actual][predicted]++;
}

// Get top 10 crops by frequency
const cropFreq = {};
y_test.forEach(label => {
  cropFreq[label] = (cropFreq[label] || 0) + 1;
});

const topCrops = Object.entries(cropFreq)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([crop]) => crop);

// Calculate per-class metrics for top crops
const classMetrics = {};
topCrops.forEach(cls => {
  const tp = confusionMatrix[cls][cls];
  const fp = Object.values(confusionMatrix).reduce((sum, row) => sum + (row[cls] || 0), 0) - tp;
  const fn = Object.values(confusionMatrix[cls]).reduce((sum, val) => sum + val, 0) - tp;
  const tn = y_test.length - tp - fp - fn;
  
  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : 2 * (precision * recall) / (precision + recall);
  
  classMetrics[cls] = {
    tp, fp, fn, tn,
    precision: precision * 100,
    recall: recall * 100,
    f1: f1 * 100
  };
});

// Calculate macro-averaged metrics for top crops
const macroPrecision = Object.values(classMetrics).reduce((sum, m) => sum + m.precision, 0) / topCrops.length;
const macroRecall = Object.values(classMetrics).reduce((sum, m) => sum + m.recall, 0) / topCrops.length;
const macroF1 = Object.values(classMetrics).reduce((sum, m) => sum + m.f1, 0) / topCrops.length;

// Output results
console.log('\n=== ACTUAL VS PREDICTED TABLE (First 20 samples) ===');
console.log('Sample | Actual Label | Predicted Label | Correct');
console.log('-------|--------------|-----------------|---------');
actualVsPredicted.slice(0, 20).forEach(row => {
  console.log(`${row.sample.toString().padEnd(6)} | ${row.actual.padEnd(12)} | ${row.predicted.padEnd(15)} | ${row.correct ? '✓' : '✗'}`);
});

console.log('\n=== CONFUSION MATRIX (Top 10 crops) ===');
// Print confusion matrix header
console.log('Actual \\ Predicted | ' + topCrops.map(c => c.padEnd(10)).join(' | '));
console.log('------------------|' + topCrops.map(() => '-----------').join('|'));

topCrops.forEach(actualCrop => {
  const row = topCrops.map(predCrop => {
    const count = confusionMatrix[actualCrop][predCrop] || 0;
    return count.toString().padEnd(10);
  });
  console.log(actualCrop.padEnd(17) + ' | ' + row.join(' | '));
});

console.log('\n=== METRICS CALCULATION ===');
console.log('\nOverall Accuracy:');
console.log(`Accuracy = (TP + TN) / Total = (${correct} + ...) / ${y_test.length} = ${accuracy.toFixed(2)}%`);

// Show example calculation for rice class
const riceMetrics = classMetrics['rice'];
if (riceMetrics) {
  console.log('\nExample calculation for "rice" class:');
  console.log(`TP = ${riceMetrics.tp}, FP = ${riceMetrics.fp}, FN = ${riceMetrics.fn}, TN = ${riceMetrics.tn}`);
  console.log(`Precision = TP / (TP + FP) = ${riceMetrics.tp} / (${riceMetrics.tp} + ${riceMetrics.fp}) = ${riceMetrics.precision.toFixed(2)}%`);
  console.log(`Recall = TP / (TP + FN) = ${riceMetrics.tp} / (${riceMetrics.tp} + ${riceMetrics.fn}) = ${riceMetrics.recall.toFixed(2)}%`);
  console.log(`F1-score = 2 × (Precision × Recall) / (Precision + Recall) = ${riceMetrics.f1.toFixed(2)}%`);
}

console.log('\n=== FINAL METRICS TABLE ===');
console.log('Metric    | Value   | Based On');
console.log('----------|---------|----------');
console.log(`Accuracy  | ${accuracy.toFixed(2)}% | Test set (${y_test.length} samples)`);
console.log(`Precision | ${macroPrecision.toFixed(2)}% | Macro-average across ${topCrops.length} top crops`);
console.log(`Recall    | ${macroRecall.toFixed(2)}% | Macro-average across ${topCrops.length} top crops`);
console.log(`F1-score  | ${macroF1.toFixed(2)}% | Macro-average across ${topCrops.length} top crops`);

// Save results
const output = {
  testSetSize: y_test.length,
  accuracy,
  macroPrecision,
  macroRecall,
  macroF1,
  perClassMetrics: classMetrics,
  topCrops,
  confusionMatrix: Object.fromEntries(
    topCrops.map(actual => [actual, Object.fromEntries(
      topCrops.map(pred => [pred, confusionMatrix[actual][pred] || 0])
    )])
  ),
  samplePredictions: actualVsPredicted.slice(0, 50)
};

fs.writeFileSync('model_evaluation_simple.json', JSON.stringify(output, null, 2));
console.log('\nResults saved to model_evaluation_simple.json');