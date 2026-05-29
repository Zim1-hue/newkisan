import { RandomForestClassifier } from 'ml-random-forest';

console.log('Testing ml-random-forest with different options...');

// Create simple test data
const X = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [10, 11, 12],
  [13, 14, 15],
  [16, 17, 18]
];

const y = [0, 1, 2, 0, 1, 2];

// Test 1: Default options (replacement: true)
console.log('\n=== Test 1: Default options (replacement: true) ===');
try {
  const classifier1 = new RandomForestClassifier({
    seed: 42,
    maxFeatures: 2,
    replacement: true,  // This causes bootstrap sampling
    nEstimators: 3,
    treeOptions: { maxDepth: 5 }
  });
  classifier1.train(X, y);
  console.log('SUCCESS with replacement: true');
} catch (error) {
  console.error('FAILED:', error.message);
}

// Test 2: replacement: false (no bootstrap)
console.log('\n=== Test 2: replacement: false ===');
try {
  const classifier2 = new RandomForestClassifier({
    seed: 42,
    maxFeatures: 2,
    replacement: false,  // No bootstrap sampling
    nEstimators: 3,
    treeOptions: { maxDepth: 5 }
  });
  classifier2.train(X, y);
  console.log('SUCCESS with replacement: false');
} catch (error) {
  console.error('FAILED:', error.message);
}

// Test 3: useOOB: false (disable out-of-bag error)
console.log('\n=== Test 3: useOOB: false ===');
try {
  const classifier3 = new RandomForestClassifier({
    seed: 42,
    maxFeatures: 2,
    replacement: true,
    nEstimators: 3,
    useOOB: false,  // Disable OOB error calculation
    treeOptions: { maxDepth: 5 }
  });
  classifier3.train(X, y);
  console.log('SUCCESS with useOOB: false');
} catch (error) {
  console.error('FAILED:', error.message);
}

// Test 4: Larger dataset (like your actual dataset)
console.log('\n=== Test 4: Larger dataset (100 samples, 22 classes) ===');
const X2 = [];
const y2 = [];

for (let i = 0; i < 100; i++) {
  X2.push([Math.random() * 100, Math.random() * 100, Math.random() * 100]);
  y2.push(Math.floor(Math.random() * 22));
}

try {
  const classifier4 = new RandomForestClassifier({
    seed: 42,
    maxFeatures: 2,
    replacement: false,  // No bootstrap to avoid empty OOB
    nEstimators: 5,
    useOOB: false,
    treeOptions: { maxDepth: 10 }
  });
  classifier4.train(X2, y2);
  console.log('SUCCESS with larger dataset');
  
  // Test prediction
  const pred = classifier4.predict([[50, 50, 50]]);
  console.log('Prediction:', pred);
} catch (error) {
  console.error('FAILED:', error.message);
  console.error('Stack:', error.stack);
}

// Test 5: Check ml-random-forest version
console.log('\n=== Test 5: Library version check ===');
try {
  const fs = await import('fs');
  const packageJson = JSON.parse(fs.readFileSync('node_modules/ml-random-forest/package.json', 'utf8'));
  console.log('ml-random-forest version:', packageJson.version);
  console.log('ml-cart version:', JSON.parse(fs.readFileSync('node_modules/ml-cart/package.json', 'utf8')).version);
} catch (err) {
  console.log('Could not read package versions');
}