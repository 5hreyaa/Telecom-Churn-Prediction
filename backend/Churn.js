import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import './Churn.css';

const Churn = () => {
  const [formData, setFormData] = useState({
    MonthlyCharges: '',
    Tenure: '',
    ContractType: '',
    InternetService: '',
    OnlineSecurity: '',
    TechSupport: '',
    StreamingTV: '',
    TotalCharges: ''
  });
  
  const [predictionResult, setPredictionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showFeatures, setShowFeatures] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const validateForm = () => {
    const requiredFields = Object.keys(formData);
    for (const field of requiredFields) {
      if (!formData[field]) {
        setError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').trim()} field.`);
        return false;
      }
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/api/predict', formData);
      setPredictionResult({
        prediction: response.data.prediction,
        probability: response.data.probability
      });
      setShowFeatures(false);
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred while making the prediction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setShowFeatures(true);
  };

  const handleNewPrediction = () => {
    setFormData({
      MonthlyCharges: '',
      Tenure: '',
      ContractType: '',
      InternetService: '',
      OnlineSecurity: '',
      TechSupport: '',
      StreamingTV: '',
      TotalCharges: ''
    });
    setPredictionResult(null);
    setShowFeatures(true);
  };

  if (initialLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p>Loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="churn-container">
      <h1 className="main-title">Customer Churn Prediction</h1>

      {predictionResult && (
        <div className="prediction-summary">
          <div className={`summary-value ${predictionResult.prediction === 'Yes' ? 'summary-yes' : 'summary-no'}`}>
            <div className="summary-label">Prediction Result:</div>
            <div className="summary-text">
              {predictionResult.prediction === 'Yes' ? 'Customer Likely to Churn' : 'Customer Likely to Stay'}
              <div className="summary-probability">
                Confidence: {(predictionResult.probability * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      )}
      
      <main className="main-content">
        <AnimatePresence mode="wait">
          {showFeatures ? (
            <motion.div
              key="features"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="form-box"
            >
              <h2 className="form-title">Enter Customer Details</h2>
              <form onSubmit={handleSubmit} className="prediction-form">
                <div className="form-grid">
                  <div className="form-field">
                    <label>Monthly Charges ($)</label>
                    <input
                      type="number"
                      name="MonthlyCharges"
                      value={formData.MonthlyCharges}
                      onChange={handleChange}
                      step="0.01"
                      required
                    />
                  </div>
                  
                  <div className="form-field">
                    <label>Tenure (months)</label>
                    <input
                      type="number"
                      name="Tenure"
                      value={formData.Tenure}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-field">
                    <label>Contract Type</label>
                    <select
                      name="ContractType"
                      value={formData.ContractType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Contract Type</option>
                      <option value="Month-to-Month">Month-to-Month</option>
                      <option value="One year">One Year</option>
                      <option value="Two year">Two Year</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Internet Service</label>
                    <select
                      name="InternetService"
                      value={formData.InternetService}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Internet Service</option>
                      <option value="DSL">DSL</option>
                      <option value="Fiber optic">Fiber Optic</option>
                      <option value="No">No Internet Service</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Online Security</label>
                    <select
                      name="OnlineSecurity"
                      value={formData.OnlineSecurity}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Online Security</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Tech Support</label>
                    <select
                      name="TechSupport"
                      value={formData.TechSupport}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Tech Support</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Streaming TV</label>
                    <select
                      name="StreamingTV"
                      value={formData.StreamingTV}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Streaming TV</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div className="form-field">
                    <label>Total Charges ($)</label>
                    <input
                      type="number"
                      name="TotalCharges"
                      value={formData.TotalCharges}
                      onChange={handleChange}
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Predicting...' : 'Predict Churn'}
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="result-box"
            >
              <h2 className="form-title">Feature Details</h2>
              <div className="details-grid">
                {Object.entries(formData).map(([key, value]) => (
                  <div key={key} className="detail-item">
                    <span className="detail-label">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                    <span className="detail-value">{value}</span>
                  </div>
                ))}
              </div>
              <div className="button-group">
                <button onClick={handleBack} className="back-button">
                  Back to Features
                </button>
                <button onClick={handleNewPrediction} className="new-prediction-button">
                  New Prediction
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Churn;