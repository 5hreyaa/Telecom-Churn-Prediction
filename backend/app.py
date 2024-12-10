from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import pickle
import warnings

warnings.filterwarnings('ignore')
app = Flask(__name__)
CORS(app)

label_encoders = {}

def prepare_data():
    """Load and prepare data"""
    try:
        df = pd.read_csv('dataset.csv')
        
        df['Churn'] = df['Churn'].astype(int)
        features = ['MonthlyCharges', 'Tenure', 'ContractType', 'InternetService', 
                   'OnlineSecurity', 'TechSupport', 'StreamingTV', 'TotalCharges']
        
        X = df[features]
        y = df['Churn']
        
        categorical_features = ['ContractType', 'InternetService', 'OnlineSecurity', 
                              'TechSupport', 'StreamingTV']
        
        global label_encoders
        for feature in categorical_features:
            label_encoders[feature] = LabelEncoder()
            X[feature] = label_encoders[feature].fit_transform(X[feature])
        
        X['TotalCharges'] = pd.to_numeric(X['TotalCharges'])
        
        return X, y
    except Exception as e:
        print(f"Error in prepare_data: {str(e)}")
        raise

def train_model():
    """Train and save the model"""
    try:
        X, y = prepare_data()  
        model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            random_state=42
        )
        model.fit(X, y)
       
        with open('churn_model.pkl', 'wb') as f:
            pickle.dump(model, f)
        
        with open('label_encoders.pkl', 'wb') as f:
            pickle.dump(label_encoders, f)
        
        return model
    except Exception as e:
        print(f"Error in train_model: {str(e)}")
        raise

try:
    with open('churn_model.pkl', 'rb') as f:
        model = pickle.load(f)
    with open('label_encoders.pkl', 'rb') as f:
        label_encoders = pickle.load(f)
    print("Model and encoders loaded successfully")
except:
    print("Training new model...")
    model = train_model()
    print("Model trained successfully")

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        required_fields = ['MonthlyCharges', 'Tenure', 'ContractType', 'InternetService',
                          'OnlineSecurity', 'TechSupport', 'StreamingTV', 'TotalCharges']
        
        if not all(key in data for key in required_fields):
            return jsonify({'error': 'Missing required fields'}), 400
        
        input_data = pd.DataFrame([{
            'MonthlyCharges': float(data['MonthlyCharges']),
            'Tenure': float(data['Tenure']),
            'ContractType': label_encoders['ContractType'].transform([data['ContractType']])[0],
            'InternetService': label_encoders['InternetService'].transform([data['InternetService']])[0],
            'OnlineSecurity': label_encoders['OnlineSecurity'].transform([data['OnlineSecurity']])[0],
            'TechSupport': label_encoders['TechSupport'].transform([data['TechSupport']])[0],
            'StreamingTV': label_encoders['StreamingTV'].transform([data['StreamingTV']])[0],
            'TotalCharges': float(data['TotalCharges'])
        }])
        
        prediction = model.predict(input_data)[0]
        probability = model.predict_proba(input_data)[0][1]
        
        return jsonify({
            'prediction': 'Yes' if prediction == 1 else 'No',
            'probability': float(probability),
            'status': 'success'
        })
    
    except ValueError as e:
        return jsonify({'error': 'Invalid numeric value'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)