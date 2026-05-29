import { createContext, useContext, useState } from 'react';
import { multilingualLabels } from '../data/multilingualLabels.js';

const StateCentral = createContext(null);

export function AppProvider({ children }) {
  const [lang, setLang] = useState('en');
  const [formData, setFormData] = useState({
    state: '',
    district: '',
    rainfall: '',
    temperature: '',
    humidity: '',
    soilType: '',
    nitrogen: '',
    phosphorus: '',
    potassium: '',
    ph: '',
  });
  const [predictionResult, setPredictionResult] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [tracker, setTracker] = useState({
    activities: [],
    expenses: [],
  });

  const t = multilingualLabels[lang];

  return (
    <StateCentral.Provider value={{
      lang, setLang,
      t,
      formData, setFormData,
      predictionResult, setPredictionResult,
      recommendations, setRecommendations,
      tracker, setTracker,
    }}>
      {children}
    </StateCentral.Provider>
  );
}

export function useApp() {
  return useContext(StateCentral);
}
