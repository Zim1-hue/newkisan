import { useState } from 'react';
import { useApp } from '../context/StateCentral';
import { cropDatabase } from '../data/agriculturalRegistry.js';

const DISEASE_RISKS = {
  Rice: {
    high: {
      diseases: ['Blast (fungal)', 'Brown Plant Hopper', 'Sheath Blight'],
      prevention: {
        en: ['Spray Tricyclazole fungicide early', 'Drain excess water from fields', 'Avoid excess nitrogen fertilizer', 'Use certified disease-resistant seeds'],
        hi: ['जल्दी ट्राइसाइक्लाज़ोल फफूंदनाशक छिड़कें', 'खेतों से अतिरिक्त पानी निकालें', 'अत्यधिक नाइट्रोजन खाद से बचें', 'प्रमाणित बीज उपयोग करें'],
        bn: ['আগেভাগে ট্রাইসাইক্লাজোল ছত্রাকনাশক স্প্রে করুন', 'মাঠ থেকে অতিরিক্ত পানি বের করুন', 'অতিরিক্ত নাইট্রোজেন সার দেওয়া এড়িয়ে চলুন'],
      },
    },
    medium: {
      diseases: ['Leaf Scald', 'Narrow Brown Leaf Spot'],
      prevention: {
        en: ['Monitor fields regularly', 'Apply balanced NPK fertilizer', 'Use clean water for irrigation'],
        hi: ['नियमित रूप से खेतों की निगरानी करें', 'संतुलित NPK खाद डालें', 'सिंचाई के लिए साफ पानी उपयोग करें'],
        bn: ['নিয়মিত মাঠ পরিদর্শন করুন', 'সুষম NPK সার দিন', 'সেচের জন্য পরিষ্কার পানি ব্যবহার করুন'],
      },
    },
    low: {
      diseases: [],
      prevention: {
        en: ['Keep monitoring. Conditions are currently safe.', 'Maintain good field hygiene.'],
        hi: ['निगरानी जारी रखें। परिस्थितियां अभी सुरक्षित हैं।', 'अच्छी खेत स्वच्छता बनाए रखें।'],
        bn: ['পর্যবেক্ষণ চালিয়ে যান। পরিস্থিতি এখন নিরাপদ।', 'মাঠের পরিচ্ছন্নতা বজায় রাখুন।'],
      },
    },
  },
  Wheat: {
    high: { diseases: ['Yellow Rust', 'Powdery Mildew', 'Loose Smut'], prevention: { en: ['Apply Propiconazole fungicide', 'Use rust-resistant varieties', 'Avoid overhead irrigation'], hi: ['प्रोपिकोनाज़ोल छिड़कें', 'रतुआ प्रतिरोधी किस्में उपयोग करें'], bn: ['প্রোপিকোনাজোল স্প্রে করুন', 'মরিচা-প্রতিরোধী জাত ব্যবহার করুন'] } },
    medium: { diseases: ['Leaf Blight', 'Septoria Leaf Blotch'], prevention: { en: ['Monitor crop regularly', 'Spray copper-based fungicide if symptoms appear'], hi: ['नियमित निगरानी', 'लक्षण दिखने पर कॉपर-बेस्ड फफूंदनाशक छिड़कें'], bn: ['নিয়মিত পর্যবেক্ষণ', 'লক্ষণ দেখা দিলে কপার-ভিত্তিক ছত্রাকনাশক স্প্রে করুন'] } },
    low: { diseases: [], prevention: { en: ['Conditions are safe. Continue regular monitoring.'], hi: ['परिस्थितियां सुरक्षित हैं।'], bn: ['পরিস্থিতি নিরাপদ।'] } },
  },
};

// Generic risk data for other crops
const GENERIC_RISKS = {
  high: {
    diseases: ['Fungal Infection', 'Bacterial Blight', 'Leaf Spot'],
    prevention: {
      en: ['Spray systemic fungicide (Mancozeb/Carbendazim)', 'Remove infected plant parts', 'Improve field drainage', 'Reduce plant density for better air flow'],
      hi: ['फफूंदनाशक (मैनकोज़ेब/कार्बेन्डाज़िम) छिड़कें', 'संक्रमित पत्तियां हटाएं', 'जल निकासी सुधारें'],
      bn: ['ছত্রাকনাশক (ম্যানকোজেব/কার্বেন্ডাজিম) স্প্রে করুন', 'আক্রান্ত পাতা সরান', 'নিকাশি উন্নত করুন'],
    },
  },
  medium: {
    diseases: ['Early Blight', 'Downy Mildew'],
    prevention: {
      en: ['Watch for early signs of disease', 'Apply preventive fungicide spray', 'Maintain proper spacing between plants'],
      hi: ['बीमारी के शुरुआती संकेत देखें', 'निवारक फफूंदनाशक छिड़कें'],
      bn: ['রোগের প্রাথমিক লক্ষণ দেখুন', 'প্রতিরোধমূলক ছত্রাকনাশক স্প্রে করুন'],
    },
  },
  low: {
    diseases: [],
    prevention: {
      en: ['Conditions are favorable. Continue regular crop monitoring.', 'Maintain soil health for natural disease resistance.'],
      hi: ['परिस्थितियां अनुकूल हैं। नियमित निगरानी जारी रखें।'],
      bn: ['পরিস্থিতি অনুকূল। নিয়মিত পর্যবেক্ষণ চালিয়ে যান।'],
    },
  },
};

function calculateRisk(humidity, temperature, rainfall) {
  let score = 0;
  if (humidity > 85) score += 3;
  else if (humidity > 70) score += 2;
  else if (humidity > 55) score += 1;

  if (temperature >= 20 && temperature <= 32) score += 2;
  else if (temperature >= 15 && temperature <= 35) score += 1;

  if (rainfall > 80) score += 3;
  else if (rainfall > 30) score += 2;
  else if (rainfall > 10) score += 1;

  if (score >= 6) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}

const RISK_COLORS = {
  low: { bg: 'bg-green-50', border: 'border-green-400', badge: 'bg-green-500', text: 'text-green-800', icon: '🟢' },
  medium: { bg: 'bg-yellow-50', border: 'border-yellow-400', badge: 'bg-yellow-500', text: 'text-yellow-800', icon: '🟡' },
  high: { bg: 'bg-red-50', border: 'border-red-400', badge: 'bg-red-500', text: 'text-red-800', icon: '🔴' },
};

export default function DiseaseRiskTab() {
  const { t, lang, formData } = useApp();
  const [form, setForm] = useState({ 
    crop: '', 
    humidity: formData?.humidity || '', 
    temperature: formData?.temperature || '', 
    rainfall: formData?.rainfall || '' 
  });
  const [result, setResult] = useState(null);

  const inputClass = "w-full border-2 border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:border-green-600 bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const risk = calculateRisk(
      parseFloat(form.humidity),
      parseFloat(form.temperature),
      parseFloat(form.rainfall)
    );
    const cropRisks = DISEASE_RISKS[form.crop] || GENERIC_RISKS;
    const data = cropRisks[risk] || GENERIC_RISKS[risk];
    setResult({ risk, data, crop: form.crop });
  }

  const colors = result ? RISK_COLORS[result.risk] : null;
  const riskLabel = result ? t.riskPredict[result.risk] : '';
  const prevention = result ? (result.data.prevention[lang] || result.data.prevention.en) : [];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
          ⚠️ {t.riskPredict.title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>{t.riskPredict.selectCrop} *</label>
            <select name="crop" value={form.crop} onChange={handleChange} required className={inputClass}>
              <option value="">{t.riskPredict.selectCrop}</option>
              {cropDatabase.map(c => (
                <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t.riskPredict.humidity} *</label>
              <input type="number" name="humidity" value={form.humidity} onChange={handleChange}
                required min="0" max="100" placeholder="e.g. 75" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t.riskPredict.temperature} *</label>
              <input type="number" name="temperature" value={form.temperature} onChange={handleChange}
                required min="0" max="50" placeholder="e.g. 28" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t.riskPredict.rainfall} *</label>
              <input type="number" name="rainfall" value={form.rainfall} onChange={handleChange}
                required min="0" max="500" placeholder="e.g. 50" className={inputClass} />
            </div>
          </div>

          <button type="submit"
            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-lg text-lg">
            ⚠️ {t.riskPredict.predict}
          </button>
        </form>
      </div>

      {result && colors && (
        <div className={`${colors.bg} border-2 ${colors.border} rounded-xl p-5 space-y-4`}>
          {/* Risk Level */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase">{t.riskPredict.riskLevel}</p>
              <p className="text-3xl font-bold text-gray-800">{colors.icon} {riskLabel}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">{result.crop}</p>
              <p className="text-xs text-gray-400">
                H:{form.humidity}% T:{form.temperature}°C R:{form.rainfall}mm
              </p>
            </div>
          </div>

          {/* Risk Meter */}
          <div className="bg-white rounded-xl p-3">
            <div className="flex h-6 rounded-full overflow-hidden">
              <div className="bg-green-400 flex-1 flex items-center justify-center text-xs font-bold text-white">Low</div>
              <div className="bg-yellow-400 flex-1 flex items-center justify-center text-xs font-bold text-white">Med</div>
              <div className="bg-red-400 flex-1 flex items-center justify-center text-xs font-bold text-white">High</div>
            </div>
            <div className="relative mt-1">
              <div
                className="absolute -top-7 w-3 h-3 bg-gray-800 rounded-full transform -translate-x-1/2"
                style={{
                  left: result.risk === 'low' ? '16%' : result.risk === 'medium' ? '50%' : '84%',
                }}
              />
            </div>
          </div>

          {/* Possible Diseases */}
          {result.data.diseases.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase mb-2">🦠 {t.riskPredict.diseases}</p>
              <div className="flex flex-wrap gap-2">
                {result.data.diseases.map((d, i) => (
                  <span key={i} className="bg-red-100 text-red-700 text-sm font-medium px-3 py-1 rounded-full">
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Prevention Tips */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <p className="text-xs font-bold text-gray-500 uppercase mb-2">🛡️ {t.riskPredict.prevention}</p>
            <ul className="space-y-2">
              {prevention.map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 font-bold mt-0.5">✓</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
