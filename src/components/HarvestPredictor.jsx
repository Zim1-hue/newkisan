import { useState } from 'react';
import FarmerInput from './FarmerInput';
import { useApp } from '../context/StateCentral';
import { predictHarvest, generateExplanation } from '../utils/agriBrain.js';

export default function PredictionTab() {
  const { t, lang, setPredictionResult, setRecommendations } = useApp();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(formData) {
    setLoading(true);
    setResult(null);

    // Simulate processing delay
    setTimeout(() => {
      const inputs = {
        state: formData.state,
        district: formData.district,
        rainfall: parseFloat(formData.rainfall),
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        soilType: formData.soilType,
        nitrogen: parseFloat(formData.nitrogen),
        phosphorus: parseFloat(formData.phosphorus),
        potassium: parseFloat(formData.potassium),
        ph: parseFloat(formData.ph || 6.5),
        targetCrop: formData.crop,
      };

      const prediction = predictHarvest(inputs);
      const finalResult = { ...prediction, inputs };
      setResult(finalResult);
      setPredictionResult(finalResult);
      setLoading(false);
    }, 1200);
  }

  const cropName = result
    ? (lang === 'hi' ? result.cropNameHi : lang === 'bn' ? result.cropNameBn : result.cropName)
    : '';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
          🌾 {t.prediction.title}
        </h2>
        <FarmerInput
          onSubmit={handleSubmit}
          submitLabel={t.form.predict}
          loading={loading}
          showCropSelect={true}
        />
      </div>

      {result && (
        <div className="space-y-4">
          {/* Main Result Card */}
          <div className="bg-green-700 text-white rounded-xl shadow p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="text-6xl">{result.cropIcon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-green-200 text-sm font-semibold uppercase tracking-wide">
                    {t.prediction.predictedCrop}
                  </p>
                  <span className="bg-green-500/20 border border-green-400/50 text-green-100 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter">
                    {t.prediction.modelType}
                  </span>
                </div>
                <h2 className="text-3xl font-bold">{cropName}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex-1 bg-green-900/50 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-400 h-full transition-all duration-1000" 
                      style={{ width: `${result.confidence}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-green-200">{result.confidence}% {t.prediction.mlConfidence}</span>
                </div>
              </div>
              <div className="bg-green-800 rounded-xl p-4 text-center min-w-[140px]">
                <p className="text-green-300 text-xs font-semibold uppercase">{t.prediction.predictedYield}</p>
                <p className="text-3xl font-bold">{result.yieldKg.toLocaleString()}</p>
                <p className="text-green-300 text-sm">{t.prediction.kgPerHectare}</p>
              </div>
            </div>
          </div>

          {/* Suitability Score */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-gray-700">Suitability Score</span>
              <span className="text-lg font-bold text-green-700">{result.score}/100</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-green-600 h-4 rounded-full transition-all"
                style={{ width: `${result.score}%` }}
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
              {result.factors.map((f, i) => (
                <div key={i} className={`rounded-lg p-2 text-center text-xs font-medium ${f.ok ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {f.ok ? '✅' : '⚠️'} {f.key.charAt(0).toUpperCase() + f.key.slice(1)}
                </div>
              ))}
            </div>
          </div>

          {result.locationWarning && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <p className="text-red-800 text-sm font-bold whitespace-pre-line">{result.locationWarning}</p>
            </div>
          )}

          {/* Explanation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`border rounded-xl p-4 ${result.score >= 50 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-line font-medium">{result.explanation.why}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-1">
                📊 {t.prediction.howFactors}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{result.explanation.how}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
