import { useState } from 'react';
import { useApp } from '../context/StateCentral';
import { cropDatabase } from '../data/agriculturalRegistry.js';

function assessNutrient(value, min, max, lang) {
  const messages = {
    low: {
      en: { status: 'Low', rec: '' },
      hi: { status: 'कम', rec: '' },
      bn: { status: 'কম', rec: '' },
    },
    adequate: {
      en: { status: 'Adequate', rec: '' },
      hi: { status: 'पर्याप्त', rec: '' },
      bn: { status: 'পর্যাপ্ত', rec: '' },
    },
    high: {
      en: { status: 'High', rec: '' },
      hi: { status: 'अधिक', rec: '' },
      bn: { status: 'বেশি', rec: '' },
    },
  };

  if (value < min * 0.7) return 'low';
  if (value > max * 1.3) return 'high';
  return 'adequate';
}

const FERTILIZER_RECS = {
  nitrogen: {
    low: {
      en: 'Add Urea (46-0-0) — 50 kg/hectare. Or use organic compost / green manure.',
      hi: 'यूरिया (46-0-0) डालें — 50 किलो/हेक्टेयर। या हरी खाद/जैविक खाद उपयोग करें।',
      bn: 'ইউরিয়া (46-0-0) দিন — ৫০ কেজি/হেক্টর। বা জৈব সার/সবুজ সার ব্যবহার করুন।',
    },
    adequate: {
      en: 'Nitrogen is sufficient. Continue current practice.',
      hi: 'नाइट्रोजन पर्याप्त है। वर्तमान अभ्यास जारी रखें।',
      bn: 'নাইট্রোজেন পর্যাপ্ত। বর্তমান অনুশীলন চালিয়ে যান।',
    },
    high: {
      en: 'Nitrogen is high. Skip nitrogen fertilizer for this season. Over-application causes leaf burn.',
      hi: 'नाइट्रोजन अधिक है। इस मौसम में नाइट्रोजन खाद न डालें।',
      bn: 'নাইট্রোজেন বেশি। এই মৌসুমে নাইট্রোজেন সার দেবেন না।',
    },
  },
  phosphorus: {
    low: {
      en: 'Add Single Super Phosphate (SSP) — 100 kg/hectare. Or DAP (18-46-0) — 50 kg/hectare.',
      hi: 'सिंगल सुपर फॉस्फेट (SSP) डालें — 100 किलो/हेक्टेयर। या DAP — 50 किलो/हेक्टेयर।',
      bn: 'সিঙ্গেল সুপার ফসফেট (SSP) দিন — ১০০ কেজি/হেক্টর। বা DAP — ৫০ কেজি/হেক্টর।',
    },
    adequate: {
      en: 'Phosphorus is sufficient. No extra fertilizer needed.',
      hi: 'फास्फोरस पर्याप्त है। अतिरिक्त खाद की जरूरत नहीं।',
      bn: 'ফসফরাস পর্যাপ্ত। অতিরিক্ত সার দরকার নেই।',
    },
    high: {
      en: 'Phosphorus is high. Avoid phosphate fertilizers. Can cause zinc or iron deficiency.',
      hi: 'फास्फोरस अधिक है। फास्फेट खाद न डालें।',
      bn: 'ফসফরাস বেশি। ফসফেট সার দেওয়া এড়িয়ে চলুন।',
    },
  },
  potassium: {
    low: {
      en: 'Add Muriate of Potash (MOP) — 50 kg/hectare. Or use wood ash as organic alternative.',
      hi: 'म्यूरेट ऑफ पोटाश (MOP) डालें — 50 किलो/हेक्टेयर। या लकड़ी की राख उपयोग करें।',
      bn: 'মিউরেট অফ পটাশ (MOP) দিন — ৫০ কেজি/হেক্টর। বা কাঠের ছাই ব্যবহার করুন।',
    },
    adequate: {
      en: 'Potassium is sufficient. Good for crop health.',
      hi: 'पोटेशियम पर्याप्त है। फसल स्वास्थ्य के लिए अच्छा।',
      bn: 'পটাশিয়াম পর্যাপ্ত। ফসলের স্বাস্থ্যের জন্য ভালো।',
    },
    high: {
      en: 'Potassium is high. Skip potash fertilizers this season.',
      hi: 'पोटेशियम अधिक है। इस मौसम में पोटाश खाद न डालें।',
      bn: 'পটাশিয়াম বেশি। এই মৌসুমে পটাশ সার দেবেন না।',
    },
  },
};

const STATUS_COLORS = {
  low: 'bg-red-100 text-red-700 border-red-300',
  adequate: 'bg-green-100 text-green-700 border-green-300',
  high: 'bg-orange-100 text-orange-700 border-orange-300',
};

const STATUS_ICONS = { low: '⬇️', adequate: '✅', high: '⬆️' };

export default function FertilizerTab() {
  const { t, lang, formData } = useApp();
  const [form, setForm] = useState({ 
    crop: '', 
    nitrogen: formData?.nitrogen || '', 
    phosphorus: formData?.phosphorus || '', 
    potassium: formData?.potassium || '' 
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

    const n = parseFloat(form.nitrogen);
    const p = parseFloat(form.phosphorus);
    const k = parseFloat(form.potassium);

    const nStatus = assessNutrient(n, crop.minN, crop.maxN, lang);
    const pStatus = assessNutrient(p, crop.minP, crop.maxP, lang);
    const kStatus = assessNutrient(k, crop.minK, crop.maxK, lang);

    const allAdequate = nStatus === 'adequate' && pStatus === 'adequate' && kStatus === 'adequate';

    setResult({
      crop, n, p, k,
      nStatus, pStatus, kStatus,
      nRec: FERTILIZER_RECS.nitrogen[nStatus][lang] || FERTILIZER_RECS.nitrogen[nStatus].en,
      pRec: FERTILIZER_RECS.phosphorus[pStatus][lang] || FERTILIZER_RECS.phosphorus[pStatus].en,
      kRec: FERTILIZER_RECS.potassium[kStatus][lang] || FERTILIZER_RECS.potassium[kStatus].en,
      allAdequate,
    });
  }

  const nutrients = result ? [
    { key: 'N', label: t.fertilizer.nitrogen, value: result.n, status: result.nStatus, rec: result.nRec, min: result.crop.minN, max: result.crop.maxN },
    { key: 'P', label: t.fertilizer.phosphorus, value: result.p, status: result.pStatus, rec: result.pRec, min: result.crop.minP, max: result.crop.maxP },
    { key: 'K', label: t.fertilizer.potassium, value: result.k, status: result.kStatus, rec: result.kRec, min: result.crop.minK, max: result.crop.maxK },
  ] : [];

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
          🌿 {t.fertilizer.title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass}>{t.fertilizer.selectCrop} *</label>
            <select name="crop" value={form.crop} onChange={handleChange} required className={inputClass}>
              <option value="">{t.fertilizer.selectCrop}</option>
              {cropDatabase.map(c => (
                <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <p className="text-sm font-semibold text-gray-600">{t.fertilizer.currentNPK}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: 'nitrogen', label: t.fertilizer.nitrogen },
              { name: 'phosphorus', label: t.fertilizer.phosphorus },
              { name: 'potassium', label: t.fertilizer.potassium },
            ].map(f => (
              <div key={f.name}>
                <label className={labelClass}>{f.label} *</label>
                <input type="number" name={f.name} value={form[f.name]} onChange={handleChange}
                  required min="0" max="300" placeholder="e.g. 40" className={inputClass} />
              </div>
            ))}
          </div>

          <button type="submit"
            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-lg text-lg">
            🌿 {t.fertilizer.getAdvice}
          </button>
        </form>
      </div>

      {result && (
        <div className="space-y-3">
          {/* Overall Status */}
          <div className={`rounded-xl p-4 text-center font-bold text-lg border-2 ${result.allAdequate ? 'bg-green-50 border-green-400 text-green-800' : 'bg-amber-50 border-amber-400 text-amber-800'}`}>
            {result.allAdequate ? `✅ ${t.fertilizer.balanced}` : `⚠️ ${t.fertilizer.action}`}
          </div>

          {/* NPK Cards */}
          <h3 className="font-bold text-gray-700 text-base">{t.fertilizer.advice}</h3>
          {nutrients.map(n => (
            <div key={n.key} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-black text-gray-700">{n.key}</span>
                  <span className="text-gray-600 text-sm">{n.label}</span>
                </div>
                <span className={`border font-bold text-sm px-3 py-1 rounded-full ${STATUS_COLORS[n.status]}`}>
                  {STATUS_ICONS[n.status]} {t.fertilizer[n.status]}
                </span>
              </div>

              {/* Bar visualization */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>{n.min} (min)</span>
                  <span>Your value: <strong>{n.value}</strong></span>
                  <span>{n.max} (max)</span>
                </div>
                <div className="relative w-full bg-gray-100 rounded-full h-4">
                  {/* Range band */}
                  <div className="absolute bg-green-200 h-4 rounded-full"
                    style={{
                      left: `${Math.min(100, (n.min / 300) * 100)}%`,
                      width: `${Math.min(100 - (n.min / 300) * 100, ((n.max - n.min) / 300) * 100)}%`
                    }}
                  />
                  {/* Your value */}
                  <div className="absolute top-0 h-4 w-1 bg-blue-600 rounded"
                    style={{ left: `${Math.min(99, (n.value / 300) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">{t.fertilizer.recommendation}</p>
                <p className="text-sm text-gray-700">{n.rec}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
