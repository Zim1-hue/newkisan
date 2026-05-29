import { useState } from 'react';
import { useApp } from '../context/StateCentral';
import { cropDatabase } from '../data/agriculturalRegistry.js';
import { soilTypes } from '../data/geographyData.js';

function getIrrigationAdvice(crop, soilType, rainfall, temperature, humidity, lang = 'en') {
  const soilRetention = {
    Clay: 0.9, Black: 0.85, Loamy: 0.7, Alluvial: 0.65, Red: 0.5, Sandy: 0.3,
  };
  const retention = soilRetention[soilType] || 0.6;

  const cropWaterNeed = (crop.minRainfall + crop.maxRainfall) / 2;
  const effectiveRain = rainfall * retention;
  const deficit = Math.max(0, cropWaterNeed - effectiveRain);
  const pct = deficit / cropWaterNeed;

  const hot = temperature > 35;
  let level, whenKey, freqKey, methodKey, noteKey;

  if (pct < 0.2) {
    level = 'low';
    whenKey = hot ? 'whenLowHot' : 'whenLowNormal';
    freqKey = 'freqLow';
    methodKey = 'methodLow';
    noteKey = 'noteLow';
  } else if (pct < 0.55) {
    level = 'medium';
    whenKey = 'whenMedium';
    freqKey = 'freqMedium';
    methodKey = 'methodMedium';
    noteKey = 'noteMedium';
  } else {
    level = 'high';
    whenKey = hot ? 'whenHighHot' : 'whenHighNormal';
    freqKey = 'freqHigh';
    methodKey = 'methodHigh';
    noteKey = 'noteHigh';
  }

  const humidModifier = (humidity > 75 && level !== 'low') ? 'humidBonus' : '';

  const strings = {
    en: {
      whenLowHot: 'Irrigate once every 10–14 days',
      whenLowNormal: 'Irrigate once every 14–21 days',
      freqLow: 'Every 2–3 weeks',
      methodLow: 'Drip or sprinkler irrigation',
      noteLow: 'Recent rainfall is sufficient. Irrigate only if soil feels dry.',
      whenMedium: 'Irrigate once every 7–10 days',
      freqMedium: 'Weekly',
      methodMedium: 'Furrow or sprinkler irrigation',
      noteMedium: 'Moderate water needed. Water early morning to reduce evaporation.',
      whenHighHot: 'Irrigate every 3–5 days (hot weather)',
      whenHighNormal: 'Irrigate every 5–7 days',
      freqHigh: 'Every 4–7 days',
      methodHigh: 'Flood or furrow irrigation',
      noteHigh: 'Low rainfall – regular irrigation essential. Avoid waterlogging.',
      humidBonus: ' High humidity reduces water need slightly.'
    },
    hi: {
      whenLowHot: 'हर 10-14 दिनों में एक बार सिंचाई करें',
      whenLowNormal: 'हर 14-21 दिनों में एक बार सिंचाई करें',
      freqLow: 'हर 2-3 सप्ताह',
      methodLow: 'ड्रिप या स्प्रिंकलर सिंचाई',
      noteLow: 'हाल की बारिश पर्याप्त है। मिट्टी सूखी लगे तभी सिंचाई करें।',
      whenMedium: 'हर 7-10 दिनों में एक बार सिंचाई करें',
      freqMedium: 'साप्ताहिक',
      methodMedium: 'फरो या स्प्रिंकलर सिंचाई',
      noteMedium: 'मध्यम पानी की आवश्यकता। वाष्पीकरण को कम करने के लिए सुबह जल्दी पानी दें।',
      whenHighHot: 'हर 3-5 दिनों में सिंचाई करें (गर्म मौसम)',
      whenHighNormal: 'हर 5-7 दिनों में सिंचाई करें',
      freqHigh: 'हर 4-7 दिन',
      methodHigh: 'बाढ़ या फरो सिंचाई',
      noteHigh: 'कम बारिश - नियमित सिंचाई जरूरी है। जलभराव से बचें।',
      humidBonus: ' उच्च आर्द्रता पानी की आवश्यकता को थोड़ा कम करती है।'
    },
    bn: {
      whenLowHot: 'প্রতি 10-14 দিনে একবার সেচ দিন',
      whenLowNormal: 'প্রতি 14-21 দিনে একবার সেচ দিন',
      freqLow: 'প্রতি 2-3 সপ্তাহ',
      methodLow: 'ড্রিপ বা স্প্রিংকলার সেচ',
      noteLow: 'সাম্প্রতিক বৃষ্টিপাত পর্যাপ্ত। মাটি শুষ্ক মনে হলে তবেই সেচ দিন।',
      whenMedium: 'প্রতি 7-10 দিনে একবার সেচ দিন',
      freqMedium: 'সাপ্তাহিক',
      methodMedium: 'ফারো বা স্প্রিংকলার সেচ',
      noteMedium: 'মাঝারি পানি প্রয়োজন। বাষ্পীভবন কমাতে ভোরে পানি দিন।',
      whenHighHot: 'প্রতি 3-5 দিনে সেচ দিন (গরম আবহাওয়া)',
      whenHighNormal: 'প্রতি 5-7 দিনে সেচ দিন',
      freqHigh: 'প্রতি 4-7 দিন',
      methodHigh: 'বন্যা বা ফারো সেচ',
      noteHigh: 'কম বৃষ্টিপাত - নিয়মিত সেচ অপরিহার্য। জলাবদ্ধতা এড়িয়ে চলুন।',
      humidBonus: ' উচ্চ আর্দ্রতা পানির প্রয়োজনীয়তা কিছুটা কমিয়ে দেয়।'
    }
  };

  const s = strings[lang] || strings.en;

  return {
    level,
    when: s[whenKey],
    frequency: s[freqKey],
    method: s[methodKey],
    note: s[noteKey] + (humidModifier ? s[humidModifier] : '')
  };
}

const LEVEL_COLORS = {
  low: { bg: 'bg-green-50', border: 'border-green-400', text: 'text-green-800', badge: 'bg-green-500', icon: '💧' },
  medium: { bg: 'bg-yellow-50', border: 'border-yellow-400', text: 'text-yellow-800', badge: 'bg-yellow-500', icon: '💦' },
  high: { bg: 'bg-blue-50', border: 'border-blue-400', text: 'text-blue-800', badge: 'bg-blue-600', icon: '🌊' },
};

export default function IrrigationTab() {
  const { t, lang, formData } = useApp();
  const [form, setForm] = useState({
    crop: '', 
    soilType: formData?.soilType || '', 
    rainfall: formData?.rainfall || '', 
    temperature: formData?.temperature || '', 
    humidity: formData?.humidity || '',
  });
  const [result, setResult] = useState(null);

  const inputClass = "w-full border-2 border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:border-green-600 bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const crop = cropDatabase.find(c => c.name === form.crop);
    if (!crop) return;
    const advice = getIrrigationAdvice(
      crop, form.soilType,
      parseFloat(form.rainfall), parseFloat(form.temperature), parseFloat(form.humidity),
      lang
    );
    setResult({ advice, cropName: lang === 'hi' ? crop.nameHi : lang === 'bn' ? crop.nameBn : crop.name, cropIcon: crop.icon });
  }

  const colors = result ? LEVEL_COLORS[result.advice.level] : null;
  const levelLabel = result ? t.irrigation[result.advice.level] : '';

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
          💧 {t.irrigation.title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Crop */}
          <div>
            <label className={labelClass}>{t.irrigation.selectCrop} *</label>
            <select name="crop" value={form.crop} onChange={handleChange} required className={inputClass}>
              <option value="">{t.irrigation.selectCrop}</option>
              {cropDatabase.map(c => (
                <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          {/* Soil Type */}
          <div>
            <label className={labelClass}>{t.irrigation.selectSoil} *</label>
            <select name="soilType" value={form.soilType} onChange={handleChange} required className={inputClass}>
              <option value="">{t.form.selectSoil}</option>
              {soilTypes.map(s => <option key={s} value={s}>{t.soilTypes[s]}</option>)}
            </select>
          </div>

          {/* Rainfall + Temp + Humidity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>{t.irrigation.rainfall} *</label>
              <input type="number" name="rainfall" value={form.rainfall} onChange={handleChange}
                required min="0" max="500" placeholder="e.g. 80" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t.irrigation.temperature} *</label>
              <input type="number" name="temperature" value={form.temperature} onChange={handleChange}
                required min="0" max="50" placeholder="e.g. 30" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t.irrigation.humidity} *</label>
              <input type="number" name="humidity" value={form.humidity} onChange={handleChange}
                required min="0" max="100" placeholder="e.g. 60" className={inputClass} />
            </div>
          </div>

          <button type="submit"
            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-lg text-lg">
            💧 {t.irrigation.getAdvice}
          </button>
        </form>
      </div>

      {result && colors && (
        <div className={`${colors.bg} border-2 ${colors.border} rounded-xl p-5 space-y-4`}>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{result.cropIcon}</span>
              <span className="text-xl font-bold text-gray-800">{result.cropName}</span>
            </div>
            <span className={`${colors.badge} text-white text-sm font-bold px-4 py-2 rounded-full`}>
              {colors.icon} {levelLabel}
            </span>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">⏰ {t.irrigation.when}</p>
              <p className="text-gray-800 font-semibold">{result.advice.when}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">🔄 {t.irrigation.frequency}</p>
              <p className="text-gray-800 font-semibold">{result.advice.frequency}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">🚿 {t.irrigation.method}</p>
              <p className="text-gray-800 font-semibold">{result.advice.method}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-bold text-gray-500 uppercase mb-1">📝 {t.irrigation.note}</p>
              <p className="text-gray-700 text-sm">{result.advice.note}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
