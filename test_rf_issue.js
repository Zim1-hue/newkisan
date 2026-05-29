import { RandomForestClassifier } from 'ml-random-forest';

console.log('Testing ml-random-forest with simple data...');

// Create simple test data with 3 classes
const X = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [10, 11, 12],
  [13, 14, 15],
  [16, 17, 18]
];

const y = [0, 1, 2, 0, 1, 2]; // 3 classes

console.log('X:', X);
console.log('y:', y);
console.log('Number of classes:', new Set(y).size);

try {
  const options = {
    seed: 42,
    maxFeatures: 2,
    replacement: true,
    nEstimators: 3,
    treeOptions: {
      maxDepth: 5
    }
  };

  console.log('Creating classifier...');
  const classifier = new RandomForestClassifier(options);
  
  console.log('Training...');
  classifier.train(X, y);
  
  console.log('Making prediction...');
  const prediction = classifier.predict([[2, 3, 4]]);
  console.log('Prediction:', prediction);
  
  console.log('SUCCESS: ml-random-forest works with 3 classes');
} catch (error) {
  console.error('ERROR:', error.message);
  console.error('Stack:', error.stack);
}

// Now test with 22 classes (like your dataset)
console.log('\n\nTesting with 22 classes...');
const X2 = [];
const y2 = [];

// Create 100 samples with 22 classes
for (let i = 0; i < 100; i++) {
  X2.push([Math.random() * 100, Math.random() * 100, Math.random() * 100]);
  y2.push(Math.floor(Math.random() * 22)); // 0-21 classes
}

console.log('Created dataset with', X2.length, 'samples and 22 classes');

try {
  const options2 = {
    seed: 42,
    maxFeatures: 2,
    replacement: true,
    nEstimators: 3,
    treeOptions: {
      maxDepth: 5
    }
  };

  console.log('Creating classifier for 22 classes...');
  const classifier2 = new RandomForestClassifier(options2);
  
  console.log('Training with 22 classes...');
  classifier2.train(X2, y2);
  
  console.log('SUCCESS: ml-random-forest works with 22 classes');
} catch (error) {
  console.error('ERROR with 22 classes:', error.message);
  console.error('Stack:', error.stack);
}