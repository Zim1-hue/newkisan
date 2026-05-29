import fs from 'fs';
import Papa from 'papaparse';
import { RandomForestClassifier } from 'ml-random-forest';

// Load dataset
const csvContent = fs.readFileSync('src/data/crop_recommendation.csv', 'utf8');

// Parse CSV
const results = Papa.parse(csvContent, {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true
});

const data = results.data;

// Prepare features and labels
const X = [];
const y = [];
const classMap = {};
const reverseClassMap = {};
let classIndex = 0;

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
    
    const label = row.label.trim();
    if (classMap[label] === undefined) {
      classMap[label] = classIndex;
      reverseClassMap[classIndex] = label;
      classIndex++;
    }
    y.push(classMap[label]);
  }
});

console.log(`Dataset size: ${X.length} samples`);
console.log(`Number of classes: ${Object.keys(classMap).length}`);
console.log('Classes:', Object.keys(classMap));

// Split into train (80%) and test (20%)
const splitRatio = 0.8;
const splitIndex = Math.floor(X.length * splitRatio);

const X_train = X.slice(0, splitIndex);
const y_train = y.slice(0, splitIndex);
const X_test = X.slice(splitIndex);
const y_test = y.slice(splitIndex);

console.log(`\nTrain size: ${X_train.length}, Test size: ${X_test.length}`);

// Train Random Forest model
console.log('\nTraining Random Forest model...');
const options = {
  seed: 42,
  maxFeatures: 3,
  replacement: true,
  nEstimators: 5,
  treeOptions: {
    maxDepth: 10
  }
};

const classifier = new RandomForestClassifier(options);
classifier.train(X_train, y_train);

// Make predictions on test set
console.log('Making predictions on test set...');
const predictions = classifier.predict(X_test);

// Calculate accuracy
let correct = 0;
const actualVsPredicted = [];

for (let i = 0; i < y_test.length; i++) {
  const actual = reverseClassMap[y_test[i]];
  const predicted = reverseClassMap[predictions[i]];
  const isCorrect = y_test[i] === predictions[i];
  if (isCorrect) correct++;
  
  actualVsPredicted.push({
    sample: i + 1,
    actual,
    predicted,
    correct: isCorrect
  });
}

const accuracy = (correct / y_test.length) * 100;
console.log(`\nAccuracy: ${accuracy.toFixed(2)}% (${correct}/${y_test.length})`);

// Generate confusion matrix
const classes = Object.keys(classMap);
const confusionMatrix = {};
classes.forEach(cls => {
  confusionMatrix[cls] = {};
  classes.forEach(cls2 => {
    confusionMatrix[cls][cls2] = 0;
  });
});

for (let i = 0; i < y_test.length; i++) {
  const actual = reverseClassMap[y_test[i]];
  const predicted = reverseClassMap[predictions[i]];
  confusionMatrix[actual][predicted]++;
}

// Calculate per-class metrics
const classMetrics = {};
classes.forEach(cls => {
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

// Calculate macro-averaged metrics
const macroPrecision = Object.values(classMetrics).reduce((sum, m) => sum + m.precision, 0) / classes.length;
const macroRecall = Object.values(classMetrics).reduce((sum, m) => sum + m.recall, 0) / classes.length;
const macroF1 = Object.values(classMetrics).reduce((sum, m) => sum + m.f1, 0) / classes.length;

// Output results
console.log('\n=== ACTUAL VS PREDICTED TABLE (First 20 samples) ===');
console.log('Sample | Actual Label | Predicted Label | Correct');
console.log('-------|--------------|-----------------|---------');
actualVsPredicted.slice(0, 20).forEach(row => {
  console.log(`${row.sample.toString().padEnd(6)} | ${row.actual.padEnd(12)} | ${row.predicted.padEnd(15)} | ${row.correct ? '✓' : '✗'}`);
});

console.log('\n=== CONFUSION MATRIX (Top 10 crops by frequency) ===');
// Get top 10 crops by frequency in test set
const cropFreq = {};
y_test.forEach(label => {
  const crop = reverseClassMap[label];
  cropFreq[crop] = (cropFreq[crop] || 0) + 1;
});

const topCrops = Object.entries(cropFreq)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([crop]) => crop);

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
console.log(`Precision | ${macroPrecision.toFixed(2)}% | Macro-average across ${classes.length} classes`);
console.log(`Recall    | ${macroRecall.toFixed(2)}% | Macro-average across ${classes.length} classes`);
console.log(`F1-score  | ${macroF1.toFixed(2)}% | Macro-average across ${classes.length} classes`);

// Save detailed results to file
const output = {
  datasetInfo: {
    totalSamples: X.length,
    trainSamples: X_train.length,
    testSamples: X_test.length,
    classes: classes.length,
    classList: classes
  },
  accuracy,
  macroPrecision,
  macroRecall,
  macroF1,
  perClassMetrics: classMetrics,
  confusionMatrix,
  actualVsPredicted: actualVsPredicted.slice(0, 50) // Save first 50 samples
};

fs.writeFileSync('model_evaluation_results.json', JSON.stringify(output, null, 2));
console.log('\nDetailed results saved to model_evaluation_results.json');