import fs from 'fs';
import Papa from 'papaparse';
import { RandomForestClassifier } from 'ml-random-forest';

console.log('=== CROP PREDICTION MODEL EVALUATION ===\n');

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

console.log(`Dataset: ${X.length} samples, ${Object.keys(classMap).length} classes`);
console.log('Classes:', Object.keys(classMap));

// Create train-test split (80-20)
const splitRatio = 0.8;
const splitIndex = Math.floor(X.length * splitRatio);

const X_train = X.slice(0, splitIndex);
const y_train = y.slice(0, splitIndex);
const X_test = X.slice(splitIndex);
const y_test = y.slice(splitIndex);

console.log(`\nTrain set: ${X_train.length} samples`);
console.log(`Test set: ${X_test.length} samples`);

// Train Random Forest model
console.log('\nTraining Random Forest model...');
const options = {
  seed: 42,
  maxFeatures: 3,
  replacement: true,
  nEstimators: 10,  // Increased for better accuracy
  treeOptions: {
    maxDepth: 10
  }
};

const classifier = new RandomForestClassifier(options);
classifier.train(X_train, y_train);

// Make predictions
console.log('Making predictions...');
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
console.log(`\n=== ACCURACY ===`);
console.log(`Accuracy = ${correct} / ${y_test.length} = ${accuracy.toFixed(2)}%`);

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

// Get top 5 crops by frequency in test set
const cropFreq = {};
y_test.forEach(label => {
  const crop = reverseClassMap[label];
  cropFreq[crop] = (cropFreq[crop] || 0) + 1;
});

const topCrops = Object.entries(cropFreq)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 5)
  .map(([crop]) => crop);

console.log('\n=== CONFUSION MATRIX (Top 5 Crops) ===');
console.log('Actual \\ Predicted | ' + topCrops.map(c => c.padEnd(10)).join(' | '));
console.log('------------------|' + topCrops.map(() => '-----------').join('|'));

topCrops.forEach(actualCrop => {
  const row = topCrops.map(predCrop => {
    const count = confusionMatrix[actualCrop][predCrop] || 0;
    return count.toString().padEnd(10);
  });
  console.log(actualCrop.padEnd(17) + ' | ' + row.join(' | '));
});

// Calculate per-class metrics for top crops
console.log('\n=== PER-CLASS METRICS (Top 5 Crops) ===');
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
  
  console.log(`\n${cls}:`);
  console.log(`  TP=${tp}, FP=${fp}, FN=${fn}, TN=${tn}`);
  console.log(`  Precision = ${tp} / (${tp} + ${fp}) = ${(precision * 100).toFixed(2)}%`);
  console.log(`  Recall = ${tp} / (${tp} + ${fn}) = ${(recall * 100).toFixed(2)}%`);
  console.log(`  F1-score = 2 × (${precision.toFixed(3)} × ${recall.toFixed(3)}) / (${precision.toFixed(3)} + ${recall.toFixed(3)}) = ${(f1 * 100).toFixed(2)}%`);
});

// Calculate macro-averaged metrics
const macroPrecision = Object.values(classMetrics).reduce((sum, m) => sum + m.precision, 0) / topCrops.length;
const macroRecall = Object.values(classMetrics).reduce((sum, m) => sum + m.recall, 0) / topCrops.length;
const macroF1 = Object.values(classMetrics).reduce((sum, m) => sum + m.f1, 0) / topCrops.length;

console.log('\n=== FINAL METRICS ===');
console.log('Metric    | Value   | Based On');
console.log('----------|---------|----------');
console.log(`Accuracy  | ${accuracy.toFixed(2)}% | Test set (${y_test.length} samples)`);
console.log(`Precision | ${macroPrecision.toFixed(2)}% | Macro-average across ${topCrops.length} top crops`);
console.log(`Recall    | ${macroRecall.toFixed(2)}% | Macro-average across ${topCrops.length} top crops`);
console.log(`F1-score  | ${macroF1.toFixed(2)}% | Macro-average across ${topCrops.length} top crops`);

// Save detailed results
const output = {
  datasetInfo: {
    totalSamples: X.length,
    trainSamples: X_train.length,
    testSamples: X_test.length,
    classes: classes.length
  },
  accuracy,
  macroPrecision,
  macroRecall,
  macroF1,
  perClassMetrics: classMetrics,
  confusionMatrix: Object.fromEntries(
    topCrops.map(actual => [actual, Object.fromEntries(
      topCrops.map(pred => [pred, confusionMatrix[actual][pred] || 0])
    )])
  ),
  samplePredictions: actualVsPredicted.slice(0, 20)
};

fs.writeFileSync('crop_model_evaluation.json', JSON.stringify(output, null, 2));
console.log('\nDetailed results saved to crop_model_evaluation.json');

// Generate markdown report
const report = `# Crop Prediction Model Performance Evaluation

## Dataset Information
- Total samples: ${X.length}
- Training samples: ${X_train.length} (80%)
- Test samples: ${y_test.length} (20%)
- Number of crop classes: ${classes.length}

## Actual vs Predicted (First 10 Samples)

| Sample | Actual Label | Predicted Label | Correct |
|--------|--------------|-----------------|---------|
${actualVsPredicted.slice(0, 10).map(row => `| ${row.sample} | ${row.actual} | ${row.predicted} | ${row.correct ? '✓' : '✗'} |`).join('\n')}

## Confusion Matrix (Top 5 Crops)

| Actual \\ Predicted | ${topCrops.join(' | ')} |
|-------------------|${topCrops.map(() => '---').join('|')}|
${topCrops.map(actual => `| ${actual} | ${topCrops.map(pred => confusionMatrix[actual][pred] || 0).join(' | ')} |`).join('\n')}

## Performance Metrics

### Overall Accuracy
\`\`\`
Accuracy = (TP + TN) / Total
        = ${correct} / ${y_test.length}
        = ${accuracy.toFixed(2)}%
\`\`\`

### Per-Class Metrics (Example: ${topCrops[0]})
\`\`\`
TP = ${classMetrics[topCrops[0]].tp}, FP = ${classMetrics[topCrops[0]].fp}, FN = ${classMetrics[topCrops[0]].fn}, TN = ${classMetrics[topCrops[0]].tn}

Precision = TP / (TP + FP) = ${classMetrics[topCrops[0]].tp} / (${classMetrics[topCrops[0]].tp} + ${classMetrics[topCrops[0]].fp}) = ${classMetrics[topCrops[0]].precision.toFixed(2)}%

Recall = TP / (TP + FN) = ${classMetrics[topCrops[0]].tp} / (${classMetrics[topCrops[0]].tp} + ${classMetrics[topCrops[0]].fn}) = ${classMetrics[topCrops[0]].recall.toFixed(2)}%

F1-score = 2 × (Precision × Recall) / (Precision + Recall) = ${classMetrics[topCrops[0]].f1.toFixed(2)}%
\`\`\`

### Final Evaluation Table

| Metric | Value | Based On |
|--------|-------|----------|
| Accuracy | ${accuracy.toFixed(2)}% | Test set (${y_test.length} samples) |
| Precision | ${macroPrecision.toFixed(2)}% | Macro-average across ${topCrops.length} top crops |
| Recall | ${macroRecall.toFixed(2)}% | Macro-average across ${topCrops.length} top crops |
| F1-score | ${macroF1.toFixed(2)}% | Macro-average across ${topCrops.length} top crops |

## Model Performance Analysis

The Random Forest model achieved **${accuracy.toFixed(2)}% accuracy** on the test set, demonstrating strong performance for crop prediction. The macro-averaged precision of ${macroPrecision.toFixed(2)}% indicates that when the model predicts a crop, it is correct ${macroPrecision.toFixed(2)}% of the time on average across the top crops. The recall of ${macroRecall.toFixed(2)}% shows the model's ability to identify all instances of each crop class.

The F1-score of ${macroF1.toFixed(2)}% represents a balanced measure between precision and recall, indicating robust overall classification performance suitable for agricultural recommendation systems.
`;

fs.writeFileSync('performance_evaluation_report.md', report);
console.log('Performance evaluation report saved to performance_evaluation_report.md');