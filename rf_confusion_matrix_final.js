import fs from 'fs';
import Papa from 'papaparse';

console.log('=== RANDOM FOREST CONFUSION MATRIX GENERATOR ===\n');

// Load the pre-trained model
console.log('Loading pre-trained Random Forest model...');
const modelJson = JSON.parse(fs.readFileSync('src/data/rf_model.json', 'utf8'));

const classes = modelJson.classes || [
  'apple', 'banana', 'blackgram', 'chickpea', 'coconut', 'coffee', 'cotton',
  'grapes', 'jute', 'kidneybeans', 'lentil', 'maize', 'mango', 'mothbeans',
  'mungbean', 'muskmelon', 'orange', 'papaya', 'pigeonpeas', 'pomegranate',
  'rice', 'watermelon'
];

console.log(`Model has ${modelJson.trees.length} decision trees`);
console.log(`Classes: ${classes.length} crops`);

// Function to predict using a single decision tree
function predictTree(tree, features) {
  let node = tree[0]; // Start at root
  
  while (node.left !== -1 && node.right !== -1) {
    const featureIndex = node.feature;
    const threshold = node.threshold;
    
    if (features[featureIndex] <= threshold) {
      node = tree[node.left];
    } else {
      node = tree[node.right];
    }
  }
  
  // Leaf node: return the class distribution
  return node.value;
}

// Function to predict using the entire Random Forest
function predictRandomForest(features) {
  const classVotes = new Array(classes.length).fill(0);
  
  // Get predictions from each tree
  for (const tree of modelJson.trees) {
    const treePrediction = predictTree(tree, features);
    
    // Find the class with highest probability in this tree
    let maxProb = -1;
    let predictedClass = 0;
    
    for (let i = 0; i < treePrediction.length; i++) {
      if (treePrediction[i] > maxProb) {
        maxProb = treePrediction[i];
        predictedClass = i;
      }
    }
    
    classVotes[predictedClass]++;
  }
  
  // Find the class with most votes
  let maxVotes = -1;
  let finalClass = 0;
  
  for (let i = 0; i < classVotes.length; i++) {
    if (classVotes[i] > maxVotes) {
      maxVotes = classVotes[i];
      finalClass = i;
    }
  }
  
  return finalClass;
}

// Load dataset
console.log('\nLoading dataset...');
const csvContent = fs.readFileSync('src/data/crop_recommendation.csv', 'utf8');
const results = Papa.parse(csvContent, {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true
});

const data = results.data;

// Prepare features and labels with mapping
const samples = [];
const classMap = {};
const reverseClassMap = {};

// Create mapping from crop name to index
for (let i = 0; i < classes.length; i++) {
  classMap[classes[i]] = i;
  reverseClassMap[i] = classes[i];
}

data.forEach(row => {
  if (row.N !== undefined && row.label) {
    const label = row.label.trim();
    if (classMap[label] !== undefined) {
      samples.push({
        features: [
          row.N,
          row.P,
          row.K,
          row.temperature,
          row.humidity,
          row.ph,
          row.rainfall
        ],
        label: classMap[label],
        labelName: label
      });
    }
  }
});

console.log(`Total samples: ${samples.length}`);

// Shuffle samples for proper train-test split
console.log('Shuffling samples...');
for (let i = samples.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [samples[i], samples[j]] = [samples[j], samples[i]];
}

// Split into train (80%) and test (20%)
const splitRatio = 0.8;
const splitIndex = Math.floor(samples.length * splitRatio);

const trainSamples = samples.slice(0, splitIndex);
const testSamples = samples.slice(splitIndex);

console.log(`Train set: ${trainSamples.length} samples`);
console.log(`Test set: ${testSamples.length} samples`);

// Count class distribution in test set
const classDistribution = {};
testSamples.forEach(sample => {
  const className = reverseClassMap[sample.label];
  classDistribution[className] = (classDistribution[className] || 0) + 1;
});

console.log('\n=== CLASS DISTRIBUTION IN TEST SET ===');
Object.entries(classDistribution).forEach(([className, count]) => {
  console.log(`${className.padEnd(12)}: ${count} samples`);
});

// Make predictions on test set
console.log('\nMaking predictions on test set...');
const predictions = [];
const actuals = [];

for (const sample of testSamples) {
  const predictedClass = predictRandomForest(sample.features);
  predictions.push(predictedClass);
  actuals.push(sample.label);
}

// Calculate accuracy
let correct = 0;
for (let i = 0; i < actuals.length; i++) {
  if (actuals[i] === predictions[i]) correct++;
}

const accuracy = (correct / actuals.length) * 100;
console.log(`\nAccuracy: ${accuracy.toFixed(2)}% (${correct}/${actuals.length})`);

// Generate confusion matrix
console.log('\n=== GENERATING 22×22 CONFUSION MATRIX ===');
const confusionMatrix = {};
classes.forEach(cls => {
  confusionMatrix[cls] = {};
  classes.forEach(cls2 => {
    confusionMatrix[cls][cls2] = 0;
  });
});

for (let i = 0; i < actuals.length; i++) {
  const actual = reverseClassMap[actuals[i]];
  const predicted = reverseClassMap[predictions[i]];
  confusionMatrix[actual][predicted]++;
}

// Validate matrix
console.log('\n=== VALIDATION ===');
const totalFromMatrix = Object.values(confusionMatrix).reduce(
  (sum, row) => sum + Object.values(row).reduce((rowSum, val) => rowSum + val, 0), 0
);
console.log(`Total samples in matrix: ${totalFromMatrix}`);
console.log(`Total test samples: ${testSamples.length}`);
console.log(`Validation: ${totalFromMatrix === testSamples.length ? '✓ PASS' : '✗ FAIL'}`);

// Calculate row and column totals
const rowTotals = {};
const colTotals = {};

classes.forEach(cls => {
  rowTotals[cls] = Object.values(confusionMatrix[cls]).reduce((sum, val) => sum + val, 0);
  colTotals[cls] = 0;
});

classes.forEach(cls => {
  classes.forEach(cls2 => {
    colTotals[cls2] = (colTotals[cls2] || 0) + confusionMatrix[cls][cls2];
  });
});

// Save confusion matrix with totals
const matrixData = {
  cropClasses: classes,
  confusionMatrix: confusionMatrix,
  rowTotals: rowTotals,
  columnTotals: colTotals,
  accuracy: accuracy,
  testSamples: testSamples.length,
  trainSamples: trainSamples.length,
  modelTrees: modelJson.trees.length,
  validation: {
    totalSamples: totalFromMatrix,
    expectedSamples: testSamples.length,
    isValid: totalFromMatrix === testSamples.length
  }
};

fs.writeFileSync('rf_final_confusion_matrix.json', JSON.stringify(matrixData, null, 2), 'utf8');
console.log('\nConfusion matrix saved to rf_final_confusion_matrix.json');

// Generate formatted table for academic report
console.log('\n=== FORMATTED 22×22 CONFUSION MATRIX ===');
console.log('\nCrop classes (in order):');
classes.forEach((cls, idx) => {
  console.log(`${(idx + 1).toString().padStart(2)}. ${cls}`);
});

// Create a compact representation
console.log('\nMatrix representation (first 5 crops as example):');
console.log('Actual \\ Predicted | ' + classes.slice(0, 5).join(' | ') + ' | ... | Row Total');
console.log('------------------|' + classes.slice(0, 5).map(() => '---').join('|') + '|-----|-----------');

for (let i = 0; i < Math.min(5, classes.length); i++) {
  const actualClass = classes[i];
  const row = [];
  for (let j = 0; j < Math.min(5, classes.length); j++) {
    const predictedClass = classes[j];
    const count = confusionMatrix[actualClass][predictedClass];
    row.push(count.toString().padStart(3));
  }
  console.log(`${actualClass.padEnd(16)} | ${row.join(' | ')} | ... | ${rowTotals[actualClass].toString().padStart(3)}`);
}

console.log('\nColumn Total      | ' + classes.slice(0, 5).map(cls => colTotals[cls].toString().padStart(3)).join(' | ') + ' | ... | ' + testSamples.length);

// Calculate per-class metrics
console.log('\n=== PER-CLASS PERFORMANCE ===');
console.log('Crop              | Precision | Recall   | F1-Score | Support');
console.log('------------------|-----------|----------|----------|---------');

const classMetrics = {};
classes.forEach(cls => {
  const tp = confusionMatrix[cls][cls];
  const fp = Object.values(confusionMatrix).reduce((sum, row) => sum + (row[cls] || 0), 0) - tp;
  const fn = rowTotals[cls] - tp;
  
  const precision = tp + fp === 0 ? 0 : tp / (tp + fp);
  const recall = tp + fn === 0 ? 0 : tp / (tp + fn);
  const f1 = precision + recall === 0 ? 0 : 2 * (precision * recall) / (precision + recall);
  
  classMetrics[cls] = { precision, recall, f1, support: rowTotals[cls] };
  
  console.log(`${cls.padEnd(17)} | ${(precision * 100).toFixed(1).padStart(8)}% | ${(recall * 100).toFixed(1).padStart(7)}% | ${(f1 * 100).toFixed(1).padStart(7)}% | ${rowTotals[cls].toString().padStart(7)}`);
});

// Calculate macro averages
const macroPrecision = Object.values(classMetrics).reduce((sum, m) => sum + m.precision, 0) / classes.length;
const macroRecall = Object.values(classMetrics).reduce((sum, m) => sum + m.recall, 0) / classes.length;
const macroF1 = Object.values(classMetrics).reduce((sum, m) => sum + m.f1, 0) / classes.length;

console.log(`\nMacro Average     | ${(macroPrecision * 100).toFixed(1).padStart(8)}% | ${(macroRecall * 100).toFixed(1).padStart(7)}% | ${(macroF1 * 100).toFixed(1).padStart(7)}% |`);

// Identify top misclassifications
console.log('\n=== TOP 10 MISCLASSIFICATION PAIRS ===');
const misclassPairs = [];

for (const actualClass of classes) {
  for (const predictedClass of classes) {
    if (actualClass !== predictedClass) {
      const count = confusionMatrix[actualClass][predictedClass];
      if (count > 0) {
        const percentage = rowTotals[actualClass] > 0 ? (count / rowTotals[actualClass] * 100).toFixed(1) : '0.0';
        misclassPairs.push({
          actual: actualClass,
          predicted: predictedClass,
          count,
          percentage: parseFloat(percentage)
        });
      }
    }
  }
}

// Sort by count descending
misclassPairs.sort((a, b) => b.count - a.count);

console.log('Actual → Predicted | Count | % of Actual Class');
console.log('-------------------|-------|------------------');
for (let i = 0; i < Math.min(10, misclassPairs.length); i++) {
  const pair = misclassPairs[i];
  console.log(`${pair.actual.padEnd(10)} → ${pair.predicted.padEnd(10)} | ${pair.count.toString().padEnd(5)} | ${pair.percentage}%`);
}

console.log('\n=== FILES GENERATED ===');
console.log('1. rf_final_confusion_matrix.json - Complete matrix data with validation');
console.log('2. Full 22×22 confusion matrix is ready for academic report');
console.log(`\nOverall Model Performance: ${accuracy.toFixed(2)}% accuracy`);