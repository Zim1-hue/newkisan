import { useState } from 'react';
import FarmerInput from './FarmerInput';
import { useApp } from '../context/StateCentral';
import { suggestCrops } from '../utils/agriBrain.js';

const RANK_COLORS = [
  { bg: 'bg-yellow-50', border: 'border-yellow-400', badge: 'bg-yellow-400', text: 'text-yellow-800' },
  { bg: 'bg-gray-50', border: 'border-gray-400', badge: 'bg-gray-400', text: 'text-gray-800' },
  { bg: 'bg-orange-50', border: 'border-orange-400', badge: 'bg-orange-400', text: 'text-orange-800' },
];

const RANK_LABELS = ['🥇', '🥈', '🥉'];

export default function RecommendationTab() {
  const { t, lang, setRecommendations } = useApp();
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleSubmit(formData) {
    setLoading(true);
    setResults(null);

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
      };

      const recs = suggestCrops(inputs);
      setResults(recs);
      setRecommendations(recs);
      setLoading(false);
    }, 1200);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
          🌱 {t.recommendation.title}
        </h2>
        <FarmerInput
          onSubmit={handleSubmit}
          submitLabel={t.form.recommend}
          loading={loading}
        />
      </div>

      {results && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            🏆 {t.recommendation.top3}
          </h3>
          <div className="space-y-4">
            {results.map((rec, i) => {
              const colors = RANK_COLORS[i];
              const name = lang === 'hi' ? rec.nameHi : lang === 'bn' ? rec.nameBn : rec.name;
              const reason = rec.reason;

              return (
                <div
                  key={rec.rank}
                  className={`${colors.bg} border-2 ${colors.border} rounded-xl p-5 flex flex-col sm:flex-row sm:items-start gap-4`}
                >
                  {/* Rank Badge */}
                  <div className="flex sm:flex-col items-center sm:items-center gap-3 sm:gap-1">
                    <span className="text-4xl">{RANK_LABELS[i]}</span>
                    <span className={`${colors.badge} text-white text-xs font-bold px-2 py-1 rounded-full`}>
                      #{rec.rank}
                    </span>
                  </div>

                  {/* Crop Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-3xl">{rec.icon}</span>
                      <h3 className="text-xl font-bold text-gray-800">{name}</h3>
                    </div>

                    {/* Yield */}
                    <div className="bg-white rounded-lg p-3 mb-3 inline-block">
                      <span className="text-xs text-gray-500 uppercase font-semibold">{t.recommendation.expectedYield}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-green-700">{rec.yieldKg.toLocaleString()}</span>
                        <span className="text-sm text-gray-500">{t.prediction.kgPerHectare}</span>
                      </div>
                    </div>

                    {/* Suitability & Confidence bars */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 mb-1">
                          <span>{t.recommendation.envMatch}</span>
                          <span>{rec.score}%</span>
                        </div>
                        <div className="w-full bg-gray-200/50 rounded-full h-1.5">
                          <div
                            className="bg-green-600 h-1.5 rounded-full"
                            style={{ width: `${rec.score}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] uppercase font-bold text-blue-500 mb-1">
                          <span>{t.recommendation.mlConfidence}</span>
                          <span>{rec.confidence}%</span>
                        </div>
                        <div className="w-full bg-blue-100 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-1.5 rounded-full"
                            style={{ width: `${rec.confidence}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="bg-white rounded-lg p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-1">{t.recommendation.reason}</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">{reason}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
