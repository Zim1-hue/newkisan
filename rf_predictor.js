import fs from 'fs';
import Papa from 'papaparse';

console.log('=== RANDOM FOREST PREDICTOR USING PRE-TRAINED MODEL ===\n');

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
  
  return {
    classIndex: finalClass,
    className: classes[finalClass],
    confidence: maxVotes / modelJson.trees.length,
    votes: classVotes
  };
}

// Load dataset for evaluation
console.log('\nLoading dataset for evaluation...');
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

// Create mapping from crop name to index (must match model's class order)
for (const className of classes) {
  classMap[className] = classIndex;
  reverseClassMap[classIndex] = className;
  classIndex++;
}

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
    if (classMap[label] !== undefined) {
      y.push(classMap[label]);
    } else {
      console.warn(`Warning: Label "${label}" not found in model classes`);
    }
  }
});

console.log(`Dataset: ${X.length} samples, ${classes.length} classes`);

// Create train-test split (80-20) - same as before
const splitRatio = 0.8;
const splitIndex = Math.floor(X.length * splitRatio);

const X_train = X.slice(0, splitIndex);
const y_train = y.slice(0, splitIndex);
const X_test = X.slice(splitIndex);
const y_test = y.slice(splitIndex);

console.log(`\nTrain set: ${X_train.length} samples (for reference only)`);
console.log(`Test set: ${X_test.length} samples (for evaluation)`);

// Make predictions on test set
console.log('\nMaking predictions on test set...');
const predictions = [];
const predictionDetails = [];

for (let i = 0; i < X_test.length; i++) {
  const result = predictRandomForest(X_test[i]);
  predictions.push(result.classIndex);
  
  if (i < 5) { // Log first 5 predictions for debugging
    predictionDetails.push({
      sample: i + 1,
      features: X_test[i],
      actual: reverseClassMap[y_test[i]],
      predicted: result.className,
      confidence: result.confidence.toFixed(3),
      correct: y_test[i] === result.classIndex
    });
  }
}

// Calculate accuracy
let correct = 0;
for (let i = 0; i < y_test.length; i++) {
  if (y_test[i] === predictions[i]) correct++;
}

const accuracy = (correct / y_test.length) * 100;
console.log(`\nAccuracy: ${accuracy.toFixed(2)}% (${correct}/${y_test.length})`);

// Display first few predictions
console.log('\n=== FIRST 5 PREDICTIONS ===');
console.log('Sample | Actual -> Predicted | Confidence | Correct');
console.log('-------|---------------------|------------|---------');
predictionDetails.forEach(detail => {
  console.log(`${detail.sample.toString().padEnd(6)} | ${detail.actual.padEnd(10)} -> ${detail.predicted.padEnd(10)} | ${detail.confidence.padEnd(10)} | ${detail.correct ? '✓' : '✗'}`);
});

// Generate confusion matrix
console.log('\n=== GENERATING CONFUSION MATRIX ===');
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

// Save confusion matrix
const matrixData = {
  cropClasses: classes,
  confusionMatrix: confusionMatrix,
  accuracy: accuracy,
  testSamples: y_test.length,
  trainSamples: X_train.length,
  modelTrees: modelJson.trees.length
};

fs.writeFileSync('rf_correct_confusion_matrix.json', JSON.stringify(matrixData, null, 2), 'utf8');
console.log('\nConfusion matrix saved to rf_correct_confusion_matrix.json');

// Generate CSV format
let csvContentOutput = 'Actual,Predicted,Count\n';
for (const actualClass of classes) {
  for (const predictedClass of classes) {
    const count = confusionMatrix[actualClass][predictedClass];
    if (count > 0) {
      csvContentOutput += `${actualClass},${predictedClass},${count}\n`;
    }
  }
}

fs.writeFileSync('rf_confusion_matrix.csv', csvContentOutput, 'utf8');
console.log('CSV format saved to rf_confusion_matrix.csv');

// Display matrix summary
console.log('\n=== CONFUSION MATRIX SUMMARY ===');
console.log('Crop              | Correct | Total | Accuracy');
console.log('------------------|---------|-------|----------');

let totalCorrect = 0;
let totalSamples = 0;

for (const cls of classes) {
  const correct = confusionMatrix[cls][cls];
  const total = Object.values(confusionMatrix[cls]).reduce((sum, val) => sum + val, 0);
  
  if (total > 0) {
    const acc = (correct / total * 100).toFixed(1);
    console.log(`${cls.padEnd(17)} | ${correct.toString().padEnd(7)} | ${total.toString().padEnd(5)} | ${acc}%`);
    totalCorrect += correct;
    totalSamples += total;
  }
}

console.log(`\nOverall Accuracy: ${(totalCorrect / totalSamples * 100).toFixed(2)}% (${totalCorrect}/${totalSamples})`);

// Identify top misclassifications
console.log('\n=== TOP MISCLASSIFICATION PAIRS ===');
const misclassPairs = [];

for (const actualClass of classes) {
  for (const predictedClass of classes) {
    if (actualClass !== predictedClass) {
      const count = confusionMatrix[actualClass][predictedClass];
      if (count > 0) {
        const totalActual = Object.values(confusionMatrix[actualClass]).reduce((sum, val) => sum + val, 0);
        const percentage = totalActual > 0 ? (count / totalActual * 100).toFixed(1) : '0.0';
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