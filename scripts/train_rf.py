import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import json
import os

try:
    print("Reading dataset...")
    df = pd.read_csv('src/data/crop_recommendation.csv')
    
    # Features and labels
    features = ['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']
    X = df[features]
    y = df['label']
    
    print(f"Training Random Forest on {len(X)} samples with {len(features)} features...")
    
    # Train Random Forest
    rf = RandomForestClassifier(n_estimators=50, max_depth=12, random_state=42, n_jobs=-1)
    rf.fit(X, y)
    
    print("Training complete! Exporting tree structure...")
    
    # Export tree structure to JSON
    trees_data = []
    for estimator in rf.estimators_:
        tree = estimator.tree_
        nodes = []
        for i in range(tree.node_count):
            nodes.append({
                'left': int(tree.children_left[i]),
                'right': int(tree.children_right[i]),
                'feature': int(tree.feature[i]),
                'threshold': float(tree.threshold[i]),
                # Value contains the counts of each class at this node
                'value': [float(v) for v in tree.value[i][0]]
            })
        trees_data.append(nodes)
        
    model_data = {
        'classes': list(rf.classes_),
        'features': features,
        'trees': trees_data
    }
    
    out_path = 'src/data/rf_model.json'
    with open(out_path, 'w') as f:
        json.dump(model_data, f)
        
    print(f"Model saved successfully to {out_path}")
    print(f"Model Size: {os.path.getsize(out_path) / 1024 / 1024:.2f} MB")
    
except Exception as e:
    print(f"Error during training: {e}")
