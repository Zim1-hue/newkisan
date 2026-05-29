import fs from 'fs';
import Papa from 'papaparse';

// Monkey patch ml-array-mode before importing RandomForestClassifier
const mlArrayModePath = 'node_modules/ml-array-mode/lib/index.js';
try {
  const originalContent = fs.readFileSync(mlArrayModePath, 'utf8');
  // Check if the problematic line exists
  if (originalContent.includes('if (input.length === 0) throw new TypeError')) {
    console.log('Patching ml-array-mode to handle empty arrays...');
    const patchedContent = originalContent.replace(
      /if \(input\.length === 0\) throw new TypeError\('input must not be empty'\);/,
      'if (input.length === 0) return []; // Return empty array instead of throwing'
    );
    fs.writeFileSync(mlArrayModePath, patchedContent, 'utf8');
    console.log('ml-array-mode patched successfully');
  }
} catch (error) {
  console.log('Could not patch ml-array-mode:', error.message);
}

// Now import the RandomForestClassifier
import { RandomForestClassifier } from 'ml-random-forest';

console.log('=== FIXED RANDOM FOREST COMPATIBILITY TEST ===\n');

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

// Try to train Random Forest with patched library
try {
  console.log('\nTraining Random Forest with patched ml-array-mode...');
  
  const options = {
    seed: 42,
    maxFeatures: 3,
    replacement: true,
    nEstimators: 10,  // Increased for better accuracy
    treeOptions: {
      maxDepth: 15
    },
    useOOB: false  // Disable OOB to avoid the empty array issue
  };

  const classifier = new RandomForestClassifier(options);
  classifier.train(X_train, y_train);
  
  console.log('Training successful!');
  
  // Make predictions
  console.log('Making predictions on test set...');
  const predictions = classifier.predict(X_test);
  
  // Calculate accuracy
  let correct = 0;
  for (let i = 0; i < y_test.length; i++) {
    if (y_test[i] === predictions[i]) correct++;
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

  // Save confusion matrix
  const matrixData = {
    cropClasses: classes,
    confusionMatrix: confusionMatrix,
    accuracy: accuracy,
    testSamples: y_test.length,
    trainSamples: y_train.length
  };

  fs.writeFileSync('rf_confusion_matrix.json', JSON.stringify(matrixData, null, 2), 'utf8');
  console.log('\nConfusion matrix saved to rf_confusion_matrix.json');
  
  // Display matrix summary
  console.log('\n=== CONFUSION MATRIX SUMMARY ===');
  console.log('Diagonal values (correct predictions):');
  classes.forEach(cls => {
    const correctCount = confusionMatrix[cls][cls];
    const total = Object.values(confusionMatrix[cls]).reduce((sum, val) => sum + val, 0);
    const accuracy = total > 0 ? (correctCount / total * 100).toFixed(1) : '0.0';
    console.log(`  ${cls.padEnd(12)}: ${correctCount}/${total} (${accuracy}%)`);
  });
  
} catch (error) {
  console.error('\nERROR during training/prediction:', error.message);
  console.error('Stack:', error.stack);
  
  // Try alternative approach: Use the pre-trained model
  console.log('\nTrying alternative approach: Using pre-trained model...');
  try {
    const modelJson = JSON.parse(fs.readFileSync('src/data/rf_model.json', 'utf8'));
    console.log('Pre-trained model loaded successfully');
    
    // Note: We would need to implement prediction using the pre-trained model
    // This is more complex as we need to manually traverse the decision trees
    console.log('Pre-trained model has', modelJson.trees.length, 'trees');
  } catch (modelError) {
    console.error('Could not load pre-trained model:', modelError.message);
  }
}