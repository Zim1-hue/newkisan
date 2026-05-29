import fs from 'fs';
import Papa from 'papaparse';

console.log('=== GENERATING FULL CONFUSION MATRIX ===\n');

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

console.log(`Total samples: ${X.length}`);
console.log(`Number of crop classes: ${[...new Set(y)].length}`);

// Get all unique crop classes in alphabetical order
const cropClasses = [...new Set(y)].sort();
console.log('\nCrop classes (alphabetical order):');
cropClasses.forEach((crop, i) => {
  console.log(`${(i + 1).toString().padStart(2)}. ${crop}`);
});

// Create train-test split (80-20)
const splitRatio = 0.8;
const splitIndex = Math.floor(X.length * splitRatio);

const X_train = X.slice(0, splitIndex);
const y_train = y.slice(0, splitIndex);
const X_test = X.slice(splitIndex);
const y_test = y.slice(splitIndex);

console.log(`\nTrain set: ${X_train.length} samples`);
console.log(`Test set: ${y_test.length} samples`);

// Simple k-NN classifier (k=5) for prediction
function knnPredict(features, k = 5) {
  const distances = [];
  
  for (let i = 0; i < X_train.length; i++) {
    const dist = euclideanDistance(features, X_train[i]);
    distances.push({ dist, label: y_train[i] });
  }
  
  distances.sort((a, b) => a.dist - b.dist);
  
  const nearest = distances.slice(0, k);
  const labelCounts = {};
  
  nearest.forEach(item => {
    labelCounts[item.label] = (labelCounts[item.label] || 0) + 1;
  });
  
  let maxCount = 0;
  let predictedLabel = '';
  
  for (const [label, count] of Object.entries(labelCounts)) {
    if (count > maxCount) {
      maxCount = count;
      predictedLabel = label;
    }
  }
  
  return predictedLabel;
}

function euclideanDistance(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2);
  }
  return Math.sqrt(sum);
}

// Make predictions
console.log('\nMaking predictions using k-NN (k=5)...');
const y_pred = [];

for (let i = 0; i < X_test.length; i++) {
  const predicted = knnPredict(X_test[i], 5);
  y_pred.push(predicted);
}

// Initialize confusion matrix
const confusionMatrix = {};
cropClasses.forEach(actual => {
  confusionMatrix[actual] = {};
  cropClasses.forEach(predicted => {
    confusionMatrix[actual][predicted] = 0;
  });
});

// Fill confusion matrix
for (let i = 0; i < y_test.length; i++) {
  const actual = y_test[i];
  const predicted = y_pred[i];
  confusionMatrix[actual][predicted]++;
}

// Calculate row and column totals
const rowTotals = {};
const colTotals = {};

cropClasses.forEach(crop => {
  rowTotals[crop] = 0;
  colTotals[crop] = 0;
});

cropClasses.forEach(actual => {
  cropClasses.forEach(predicted => {
    const count = confusionMatrix[actual][predicted];
    rowTotals[actual] += count;
    colTotals[predicted] += count;
  });
});

// Validate totals
const totalSamples = y_test.length;
const sumOfAllValues = Object.values(rowTotals).reduce((a, b) => a + b, 0);

console.log('\n=== VALIDATION ===');
console.log(`Total test samples: ${totalSamples}`);
console.log(`Sum of all matrix values: ${sumOfAllValues}`);
console.log(`Validation: ${totalSamples === sumOfAllValues ? '✓ PASS' : '✗ FAIL'}`);

// Check each row sum equals actual class frequency
console.log('\nRow validation (actual class distribution):');
cropClasses.forEach(crop => {
  const actualCount = y_test.filter(label => label === crop).length;
  const rowSum = rowTotals[crop];
  console.log(`${crop.padEnd(12)}: Actual=${actualCount.toString().padStart(3)}, RowSum=${rowSum.toString().padStart(3)}, ${actualCount === rowSum ? '✓' : '✗'}`);
});

// Generate the full confusion matrix in markdown format
console.log('\n=== FULL 22×22 CONFUSION MATRIX ===\n');

// Create header
let header = '| Actual \\ Predicted |';
cropClasses.forEach(crop => {
  header += ` ${crop.padEnd(10)} |`;
});
console.log(header);

// Create separator
let separator = '|-------------------|';
cropClasses.forEach(() => {
  separator += '------------|';
});
console.log(separator);

// Create rows
cropClasses.forEach(actual => {
  let row = `| ${actual.padEnd(17)} |`;
  cropClasses.forEach(predicted => {
    const count = confusionMatrix[actual][predicted];
    // Highlight diagonal (correct predictions)
    const display = actual === predicted ? `**${count}**` : count.toString();
    row += ` ${display.padEnd(10)} |`;
  });
  console.log(row);
});

// Create row totals row
let rowTotalRow = '| **Row Total**      |';
cropClasses.forEach(crop => {
  rowTotalRow += ` ${rowTotals[crop].toString().padEnd(10)} |`;
});
console.log(rowTotalRow);

// Create column totals row  
let colTotalRow = '| **Column Total**   |';
cropClasses.forEach(crop => {
  colTotalRow += ` ${colTotals[crop].toString().padEnd(10)} |`;
});
console.log(colTotalRow);

// Identify top misclassification pairs
console.log('\n=== TOP MISCLASSIFICATION PAIRS ===');
const misclassifications = [];

cropClasses.forEach(actual => {
  cropClasses.forEach(predicted => {
    if (actual !== predicted) {
      const count = confusionMatrix[actual][predicted];
      if (count > 0) {
        misclassifications.push({
          actual,
          predicted,
          count,
          percentage: (count / rowTotals[actual] * 100).toFixed(1)
        });
      }
    }
  });
});

// Sort by count descending
misclassifications.sort((a, b) => b.count - a.count);

console.log('\nTop 10 misclassification pairs:');
console.log('| Actual → Predicted | Count | % of Actual Class |');
console.log('|--------------------|-------|-------------------|');
misclassifications.slice(0, 10).forEach(pair => {
  console.log(`| ${pair.actual.padEnd(10)} → ${pair.predicted.padEnd(6)} | ${pair.count.toString().padStart(5)} | ${pair.percentage.toString().padStart(5)}% |`);
});

// Calculate overall accuracy
let correctPredictions = 0;
cropClasses.forEach(crop => {
  correctPredictions += confusionMatrix[crop][crop];
});

const accuracy = (correctPredictions / totalSamples * 100).toFixed(2);
console.log(`\nOverall Accuracy: ${correctPredictions}/${totalSamples} = ${accuracy}%`);

// Save detailed results
const output = {
  cropClasses,
  confusionMatrix,
  rowTotals,
  colTotals,
  totalSamples,
  accuracy: parseFloat(accuracy),
  y_test: y_test.slice(0, 50), // Save first 50 for reference
  y_pred: y_pred.slice(0, 50),
  misclassifications: misclassifications.slice(0, 20)
};

fs.writeFileSync('full_confusion_matrix.json', JSON.stringify(output, null, 2));
console.log('\nDetailed results saved to full_confusion_matrix.json');

// Also save as CSV for easy import
let csvContentOutput = 'Actual,Predicted,Count\n';
cropClasses.forEach(actual => {
  cropClasses.forEach(predicted => {
    const count = confusionMatrix[actual][predicted];
    csvContentOutput += `${actual},${predicted},${count}\n`;
  });
});

fs.writeFileSync('confusion_matrix.csv', csvContentOutput);
console.log('CSV format saved to confusion_matrix.csv');