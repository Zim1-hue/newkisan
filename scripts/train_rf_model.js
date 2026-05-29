import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';
import { RandomForestClassifier } from 'ml-random-forest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const csvPath = path.join(__dirname, '../src/data/crop_recommendation.csv');
const modelOutPath = path.join(__dirname, '../src/data/rf_model.json');

console.log('Reading dataset...');
const fileContent = fs.readFileSync(csvPath, 'utf8');

Papa.parse(fileContent, {
  header: true,
  dynamicTyping: true,
  skipEmptyLines: true,
  complete: function(results) {
    const data = results.data;
    
    // Check first row
    console.log('Sample row:', data[0]);

    // Features: N, P, K, temperature, humidity, ph, rainfall
    const X = [];
    const y = [];
    const classMap = {};
    const reverseClassMap = {};
    let classIndex = 0;
    
    data.forEach(row => {
      // make sure row is valid
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
        
        if (classMap[row.label] === undefined) {
          classMap[row.label] = classIndex;
          reverseClassMap[classIndex] = row.label;
          classIndex++;
        }
        y.push(classMap[row.label]);
      }
    });

    console.log(`Training Random Forest with ${X.length} samples and ${X[0].length} features...`);
    console.log(`Classes: ${Object.keys(classMap).length}`);
    
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
    classifier.train(X, y);
    
    console.log('Training complete! Saving model...');
    
    const modelJson = classifier.toJSON();
    // Embed the class map in the JSON so we can use it in the app
    modelJson.classMap = classMap;
    modelJson.reverseClassMap = reverseClassMap;
    
    fs.writeFileSync(modelOutPath, JSON.stringify(modelJson), 'utf8');
    
    console.log('Model saved successfully to src/data/rf_model.json');
    console.log(`Model Size: ${(fs.statSync(modelOutPath).size / 1024 / 1024).toFixed(2)} MB`);
  }
});
