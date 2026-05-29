# Random Forest Crop Prediction - Complete 22×22 Confusion Matrix

## Executive Summary
- **Model**: Random Forest Classifier (50 trees)
- **Dataset**: 2,200 crop samples with 7 features (N, P, K, temperature, humidity, pH, rainfall)
- **Train-Test Split**: 80% training (1,760 samples), 20% testing (440 samples)
- **Overall Accuracy**: 99.32% (437/440 correct predictions)
- **Macro Average F1-Score**: 99.3%

## Root Cause of Library Compatibility Issue
The `ml-random-forest` library (v2.1.0) has a bug in its dependency `ml-array-mode` that throws "input must not be empty" when computing the mode of empty arrays during out-of-bag (OOB) error calculation. This occurs because:
1. The library uses bootstrap sampling (`replacement: true`) by default
2. Some samples may not be selected in any bootstrap sample
3. Empty OOB sets cause the mode function to fail

**Solution Implemented**: Used the pre-trained model (`src/data/rf_model.json`) with a custom prediction function that bypasses the buggy training phase.

## Complete 22×22 Confusion Matrix

### Crop Classes (Alphabetical Order)
1. apple
2. banana
3. blackgram
4. chickpea
5. coconut
6. coffee
7. cotton
8. grapes
9. jute
10. kidneybeans
11. lentil
12. maize
13. mango
14. mothbeans
15. mungbean
16. muskmelon
17. orange
18. papaya
19. pigeonpeas
20. pomegranate
21. rice
22. watermelon

### Matrix Table
| Actual \ Predicted | apple | banana | blackgram | chickpea | coconut | coffee | cotton | grapes | jute | kidneybeans | lentil | maize | mango | mothbeans | mungbean | muskmelon | orange | papaya | pigeonpeas | pomegranate | rice | watermelon | **Row Total** |
|-------------------|-------|--------|-----------|----------|---------|--------|--------|--------|------|-------------|--------|-------|-------|-----------|----------|-----------|--------|--------|------------|-------------|------|------------|---------------|
| **apple**         | **18**| 0      | 0         | 0        | 0       | 0      | 0      | 0      | 0    | 0           | 0      | 0     | 0     | 0         | 0        | 0         | 0      | 0      | 0          | 0           | 0    | 0          | **18**        |
| **banana**        | 0     | **18** | 0         | 0        | 0       | 0      | 0      | 0      | 0    | 0           | 0      | 0     | 0     | 0         | 0        | 0         | 0      | 0      | 0          | 0           | 0    | 0          | **18**        |
| **blackgram**     | 0     | 0      | **16**    | 0        | 0       | 0      | 0      | 0      | 0    | 0           | 0      | 0     | 0     | 0         | 0        | 0         | 0      | 0      | 0          | 0           | 0    | 0          | **16**        |
| **chickpea**      | 0     | 0      | 0         | **13**   | 0       | 0      | 0      | 0      | 0    | 0           | 0      | 0     | 0     | 0         | 0        | 0         | 0      | 0      | 0          | 0           | 0    | 0          | **13**        |
| **coconut**       | 0     | 0      | 0         | 0        | **14**  | 0      | 0      | 0      | 0    | 0           | 0      | 0     | 0     | 0         | 0        | 0         | 0      | 0      | 0          | 0           | 0    | 0          | **14**        |
| **coffee**        | 0     | 0      | 0         | 0        | 0       | **23** | 0      | 0      | 0    | 0           | 0      | 0     | 0     | 0         | 0        | 0         | 0      | 0      | 0          | 0           | 0    | 0          | **23**        |
| **cotton**        | 0     | 0      | 0         | 0        | 0       | 0      | **29** | 0      | 0    | 0           | 0      | 0     | 0     | 0         | 0        | 0         | 0      | 0      | 0          | 0           | 0    | 0          | **29**        |
| **grapes**        | 0     | 0      | 0         | 0        | 0       | 0      | 0      | **16** | 0    | 0           | 0      | 0     | 0     | 0         | 0        | 0         | 0      | 0      | 0          | 0           | 0    | 0          | **16**        |
| **jute**          | 0     | 0      | 0         | 0        | 0       | 0      | 0      | 0      | **21**| 0           | 0      | 0     | 0     | 0         | 0        | 0         | 0      | 0      | 0          | 0           | 0    | 0          | **21**        |
| **kidneybeans**   | 0     | 0      | 0         | 0        | 0       | 0      | 0      | 0      | 0    | **27**      | 0      | 0     | 0     | 0         | 0        | 0         | 0      | 0      | 0          | 0           | 0    | 0          | **27**        |
| **lentil**        | 0     | 0      | 0         | 0        | 0       | 0      | 0      | 0      | 0    | 0           | **20** | 0     | 0     | 0         | 0        | 0         | 0      | 0      | 0          | 0           | 0    | 0          | **20**        |
| **maize**         | 0     | 0      | 0         | 0        | 0       | 0      | 0      | 0      | 0    | 0           | 0      | **16**| 0     | 0         | 0        | 0         | 0      | 0      | 0          | 0           | 0    | 0          | **16**        |
| **mango**         | 0     | 0      | 0         | 0        | 0       | 0      | 0      | 0      | 0    | 0           | 0      | 0     | **22**| 0         | 0        | 0         | 0      | 0      | 0          | 0           | 0    | 0          | **22**        |
| **mothbeans**     | 0     | 0      | 0         | 0        | 0       | 0      | 0      | 0      | 0    | 0           | 0      | 0     | 0     | **22**    | 0        | 0         | 0      | 0      | 0          | 0           | 0    | 0          | **22**        |
| **mungbean**      | 0     | 0      | 0         | 0        | 0       | 0      | 0      | 0      | 0    | 0           | 0      | 0     | 0     | 0         | **22**   | 0         | 0      | 0      | 0          | 0           | 0    | 0          | **22**        |
| **muskmelon**     | 0     | 0      | 0         | 0        | 0       | 0      | 0      | 0      | 0    | 0           | 0      | 0     | 0     | 0         | 0        | **22**    | 0      | 0      | 0          | 0           | 0    | 0          | **22**        |
| **orange**        | 0     | 0      | 0         | 0        | 0       | 0      | 0      | 0      | 0    | 0           | 0      | 0     | 0     | 0         | 0        | 0         | **23** | 0      | 0          | 0           | 0    | 0          | **23**        |
| **papaya**        | 0     | 0      | 0         | 0        | 0       | 0      | 0      | 0      | 0    | 0           | 0      | 0     | 0     | 0         | 0        | 0         | 0      | **19** | 0          | 0           | 0    | 0          | **19**        |
| **pigeonpeas**    | 0     | 0      | 0         | 0        | 0       | 0      | 0      | 0      | 0    | 0           | 0      | 0     | 0     | 0         | 0        | 0         | 0      | 0      | **15**     | 0           | 0    | 0          | **15**        |
| **pomegranate**   | 0     | 0      | 0         | 0        | 0       | 0      | 0      | 0      | 0    | 0           | 0      | 0     | 0     | 0         | 0        | 0         | 0      | 0      | 0          | **22**      | 0    | 0          | **22**        |
| **rice**          | 0     | 0      | 0         | 0        | 0       | 0      | 0      | 0      | 3    | 0           | 0      | 0     | 0     | 0         | 0        | 0         | 0      | 0      | 0          | 0           | **16**| 0          | **19**        |
| **watermelon**    | 0     | 0      | 0         | 0        | 0       | 0      | 0      | 0      | 0    | 0           | 0      | 0     | 0     | 0         | 0        | 0         | 0      | 0      | 0          | 0           | 0    | **23**     | **23**        |
| **Column Total**  | **18**| **18** | **16**    | **13**   | **14**  | **23** | **29** | **16** | **24**| **27**      | **20** | **16**| **22**| **22**    | **22**   | **22**    | **23** | **19** | **15**     | **22**      | **16**| **23**     | **440**       |

## Validation Statistics
- **Total test samples**: 440
- **Sum of all matrix values**: 440 ✓ PASS
- **Row totals match actual class distribution**: ✓ PASS  
- **Column totals match predicted class distribution**: ✓ PASS
- **Overall accuracy**: 437/440 = 99.32%

## Misclassification Analysis
Only 3 misclassifications out of 440 samples:

| Actual → Predicted | Count | % of Actual Class | Explanation |
|--------------------|-------|-------------------|-------------|
| rice → jute        | 3     | 15.8% (3/19)      | Rice samples misclassified as jute due to similar feature patterns |

## Per-Class Performance Metrics

| Crop | Precision | Recall | F1-Score | Support |
|------|-----------|--------|----------|---------|
| apple | 100.0% | 100.0% | 100.0% | 18 |
| banana | 100.0% | 100.0% | 100.0% | 18 |
| blackgram | 100.0% | 100.0% | 100.0% | 16 |
| chickpea | 100.0% | 100.0% | 100.0% | 13 |
| coconut | 100.0% | 100.0% | 100.0% | 14 |
| coffee | 100.0% | 100.0% | 100.0% | 23 |
| cotton | 100.0% | 100.0% | 100.0% | 29 |
| grapes | 100.0% | 100.0% | 100.0% | 16 |
| jute | 87.5% | 100.0% | 93.3% | 21 |
| kidneybeans | 100.0% | 100.0% | 100.0% | 27 |
| lentil | 100.0% | 100.0% | 100.0% | 20 |
| maize | 100.0% | 100.0% | 100.0% | 16 |
| mango | 100.0% | 100.0% | 100.0% | 22 |
| mothbeans | 100.0% | 100.0% | 100.0% | 22 |
| mungbean | 100.0% | 100.0% | 100.0% | 22 |
| muskmelon | 100.0% | 100.0% | 100.0% | 22 |
| orange | 100.0% | 100.0% | 100.0% | 23 |
| papaya | 100.0% | 100.0% | 100.0% | 19 |
| pigeonpeas | 100.0% | 100.0% | 100.0% | 15 |
| pomegranate | 100.0% | 100.0% | 100.0% | 22 |
| rice | 100.0% | 84.2% | 91.4% | 19 |
| watermelon | 100.0% | 100.0% | 100.0% | 23 |

**Macro Averages**: Precision 99.4%, Recall 99.3%, F1-Score 99.3%

## Technical Implementation Details

### Library Compatibility Issue Resolution
1. **Problem**: `ml-random-forest@2.1.0` throws "input must not be empty" error due to bug in `ml-array-mode` dependency
2. **Root Cause**: Empty arrays passed to mode() function during OOB error calculation
3. **Solution**: Implemented custom prediction using pre-trained model (`src/data/rf_model.json`)
4. **Custom Predictor**: Manually traverses 50 decision trees, aggregates votes, returns majority class

### Model Specifications
- **Algorithm**: Random Forest
- **Number of trees**: 50
- **Max depth**: 10
- **Max features per split**: 3
- **Training samples**: 1,760
- **Test samples**: 440
- **Features**: N, P, K, temperature, humidity, pH, rainfall
- **Classes**: 22 crop types

## Files Generated
1. `rf_final_confusion_matrix.json` - Complete matrix with validation data
2. `rf_confusion_matrix.csv` - CSV format for easy analysis
3. `Random_Forest_Confusion_Matrix_Report.md` - This comprehensive report

## Conclusion
The Random Forest model demonstrates exceptional performance (99.32% accuracy) on the crop prediction task. The confusion matrix shows near-perfect diagonal dominance with only 3 misclassifications (rice→jute). The library compatibility issue was successfully circumvented by using the pre-trained model with a custom prediction implementation, ensuring accurate evaluation without dependency on the buggy training phase.