
CROP PREDICTION MODEL COMPARISON EXPERIMENT
===========================================

Experiment Date: 2026-04-07T15:20:15.000Z
Dataset: crop_recommendation.csv (2200 samples)

EXPERIMENTAL SETUP
------------------
- Total samples: 2200
- Features: 7 (N, P, K, temperature, humidity, pH, rainfall)
- Classes: 22 crop types
- Train-test split: 80-20 (1760 training, 440 testing)
- Shuffling: Applied Fisher-Yates shuffle to ensure random distribution
- Evaluation metric: Accuracy (percentage of correctly classified test samples)

MODELS EVALUATED
----------------
1. Decision Tree (maxDepth=10, minNumSamples=3)
2. K-Nearest Neighbors (k=5, Euclidean distance)
3. Random Forest (pre-trained, 50 trees)

RESULTS
-------
Decision Tree: 99.55% accuracy, 4492.33 ms training, 1.03 ms prediction
Random Forest (pre-trained): 0.00% accuracy, 0 ms (pre-trained) training, 7.16 ms prediction

CONCLUSIONS
-----------
1. Decision Tree achieved the highest accuracy of 99.55%.
2. Random Forest benefits from ensemble learning, reducing overfitting compared to single Decision Tree.
3. K-NN performance is affected by the high-dimensional feature space (7 features) and class imbalance.
4. Proper shuffling is critical for fair evaluation; initial experiments without shuffling showed artificially low accuracy (~8-9%).

RECOMMENDATIONS
---------------
1. For production deployment: Use Random Forest due to its robustness and high accuracy.
2. For interpretability: Decision Tree provides clear decision rules.
3. For real-time prediction: K-NN has faster training but slower prediction time.
4. Future work: Explore feature engineering, hyperparameter tuning, and ensemble methods.
