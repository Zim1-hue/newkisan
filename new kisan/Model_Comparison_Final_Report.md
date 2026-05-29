# CROP PREDICTION MODEL COMPARISON EXPERIMENT

## Experiment Overview
- **Date**: 2026-04-07T15:24:36.935Z
- **Dataset**: crop_recommendation.csv
- **Total Samples**: 2200
- **Features**: 7 (N, P, K, temperature, humidity, pH, rainfall)
- **Classes**: 22 crop types
- **Train-Test Split**: 80-20 (1760 training, 440 testing)
- **Evaluation Metric**: Accuracy (percentage of correctly classified test samples)

## Experimental Setup
1. **Data Preparation**: Features normalized, labels encoded using Random Forest model's class ordering
2. **Shuffling**: Applied Fisher-Yates shuffle to ensure random distribution
3. **Models Evaluated**:
   - Decision Tree (maxDepth=10, minNumSamples=3)
   - K-Nearest Neighbors (k=5, Euclidean distance)
   - Random Forest (pre-trained, 50 trees)
4. **Timing Measurements**: Training and prediction times measured using performance.now()

## Results

### Performance Comparison Table
| Model | Accuracy | Training Time | Prediction Time | Correct Predictions |
|-------|----------|---------------|-----------------|---------------------|
| Decision Tree | 99.32% | 3648.62 ms | 0.70 ms | 437/440 |
| K-Nearest Neighbors (k=5) | 97.73% | 5.55 ms | 206.15 ms | 430/440 |
| Random Forest (pre-trained) | 99.77% | 0 ms (pre-trained) | 7.39 ms | 439/440 |

### Key Findings
1. **Best Performing Model**: Random Forest (pre-trained) achieved 99.77% accuracy
2. **Decision Tree**: 99.32% accuracy with fast prediction (0.70 ms)
3. **K-Nearest Neighbors**: 97.73% accuracy
4. **Random Forest**: 99.77% accuracy (pre-trained model)

## Technical Observations

### Model Characteristics
1. **Decision Tree**: 
   - Fastest prediction time
   - Interpretable decision rules
   - Potential for overfitting with deep trees

2. **K-Nearest Neighbors**:
   - No training phase (lazy learning)
   - Prediction time depends on training set size
   - Sensitive to feature scaling and distance metric

3. **Random Forest**:
   - Ensemble method reduces overfitting
   - Robust to noisy data
   - Higher computational cost during training

### Dataset Characteristics
- Balanced distribution across 22 crop classes
- 7 agronomic features with different scales
- Requires proper feature scaling for distance-based methods (KNN)

## Conclusions
1. Random Forest (pre-trained) demonstrated the highest accuracy for this crop prediction task.
2. Random Forest's ensemble approach provides robustness but requires more computational resources.
3. Decision Tree offers excellent accuracy-speed tradeoff for real-time applications.
4. Proper class encoding and shuffling are critical for fair model evaluation.

## Recommendations
1. **Production Deployment**: Use Random Forest (pre-trained) for optimal accuracy.
2. **Real-time Applications**: Consider Decision Tree for fastest prediction.
3. **Future Work**: 
   - Hyperparameter tuning for each model
   - Feature engineering and selection
   - Cross-validation for more robust evaluation
   - Ensemble methods combining multiple algorithms

## Files Generated
1. `model_comparison_final_results.json` - Complete experiment results
2. This report - Academic analysis of findings

---
*Experiment conducted using Node.js with ml-cart, ml-knn, and custom Random Forest predictor.*
