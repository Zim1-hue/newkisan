import { useRef } from 'react';
import { useApp } from '../context/StateCentral';
import { evaluateSoil, evaluateClimate } from '../utils/agriBrain.js';

function NPKBar({ label, level, t }) {
  const colors = {
    low: 'bg-red-500',
    medium: 'bg-yellow-500',
    high: 'bg-green-500',
  };
  const widths = { low: '30%', medium: '60%', high: '90%' };
  const levelLabel = t.report[level] || level;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-semibold text-gray-700 w-24 flex-shrink-0">{label}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-3">
        <div className={`${colors[level]} h-3 rounded-full`} style={{ width: widths[level] }} />
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded ${level === 'low' ? 'bg-red-100 text-red-700' : level === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
        {levelLabel}
      </span>
    </div>
  );
}

function WeatherRow({ label, status, t }) {
  const ok = status === 'suitable';
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700">{label}</span>
      <span className={`text-xs font-bold px-3 py-1 rounded-full ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {ok ? '✅ ' + t.report.suitable : '⚠️ ' + t.report.notSuitable}
      </span>
    </div>
  );
}

export default function ReportTab() {
  const { t, lang, formData, predictionResult, recommendations } = useApp();
  const reportRef = useRef(null);

  const hasData = predictionResult && recommendations;

  function printReport() {
    window.print();
  }

  if (!hasData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h2 className="text-xl font-bold text-gray-700 mb-2">{t.report.title}</h2>
        <p className="text-gray-500">{t.report.generateFirst}</p>
      </div>
    );
  }

  const n = parseFloat(formData.nitrogen);
  const p = parseFloat(formData.phosphorus);
  const k = parseFloat(formData.potassium);
  const rain = parseFloat(formData.rainfall);
  const temp = parseFloat(formData.temperature);
  const hum = parseFloat(formData.humidity);

  const soilHealth = evaluateSoil(n, p, k);
  const weatherSuit = evaluateClimate(rain, temp, hum);

  const predCropName = lang === 'hi' ? predictionResult.cropNameHi : lang === 'bn' ? predictionResult.cropNameBn : predictionResult.cropName;
  const rec1Name = lang === 'hi' ? recommendations[0].nameHi : lang === 'bn' ? recommendations[0].nameBn : recommendations[0].name;
  const rec2Name = lang === 'hi' ? recommendations[1].nameHi : lang === 'bn' ? recommendations[1].nameBn : recommendations[1].name;

  // Language dictionaries for dynamic strings
  const textStrings = {
    en: {
      summary: `Your farm in ${formData.district}, ${formData.state} is best suited for **${predCropName}** (${predictionResult.score}% match). Expected yield: **${predictionResult.yieldKg.toLocaleString()} kg/ha**. Soil is **${soilHealth.overall.replace('_', ' ')}** and weather is **${weatherSuit.overall.replace('_', ' ')}**. Good alternatives: **${rec1Name}** and **${rec2Name}**.`,
      suitabilityMsg: predictionResult.score < 50 ? "⚠️ **Low Suitability**: This crop may not grow well. Consider alternatives below." : "✅ **Good Match**: This crop fits your farm conditions well.",
      actionPlan: "What to Do",
      alertsAdvisories: "Important Warnings",
      summaryTitle: "Farm Report Summary",
      actions: {
        nLow: "Add nitrogen fertilizer (Urea) for better leaf growth.",
        pLow: "Use phosphorus fertilizer (DAP) for stronger roots.",
        kLow: "Apply potassium fertilizer (MOP) to fight diseases.",
        rainLow: "Water crops regularly - rainfall is low.",
        rainHigh: "Clear drainage channels - heavy rain expected.",
        optimal: "Continue current practices - conditions are good."
      },
      alerts: {
        heat: "🔥 Hot Weather: Temperature above 35°C. Water crops early morning.",
        cold: "❄️ Cold Weather: Temperature below 10°C. Use mulch to protect roots.",
        disease: "🦠 Fungal Risk: High humidity and heat. Check for disease signs.",
        floodHigh: "🌊 Flood Danger: Very heavy rain (>250mm). Move equipment to higher ground.",
        floodWarning: "💧 Flood Warning: Heavy rain (180-250mm). Clear all drainage channels.",
        floodAdvisory: "💧 Heavy Rain Alert: Rain above 150mm. Check field drainage.",
        none: "✅ All Good: No major weather risks detected."
      }
    },
    hi: {
      summary: `${formData.district}, ${formData.state} में आपकी जमीन **${predCropName}** फसल के लिए सबसे उपयुक्त है (${predictionResult.score}% मैच)। अनुमानित उपज: **${predictionResult.yieldKg.toLocaleString()} किग्रा/हेक्टेयर**। मिट्टी **${soilHealth.overall === 'good' ? 'अच्छी' : soilHealth.overall === 'needs_improvement' ? 'सुधार की जरूरत' : 'ठीक'}** है और मौसम **${weatherSuit.overall === 'suitable' ? 'अनुकूल' : 'प्रतिकूल'}** है। अन्य विकल्प: **${rec1Name}** और **${rec2Name}**।`,
      suitabilityMsg: predictionResult.score < 50 ? "⚠️ **कम उपयुक्तता**: यह फसल अच्छी नहीं उगेगी। नीचे दिए विकल्प देखें।" : "✅ **अच्छा मैच**: यह फसल आपकी जमीन के लिए उपयुक्त है।",
      actionPlan: "क्या करें",
      alertsAdvisories: "महत्वपूर्ण चेतावनियाँ",
      summaryTitle: "फार्म रिपोर्ट सारांश",
      actions: {
        nLow: "पत्तियों के लिए नाइट्रोजन उर्वरक (यूरिया) डालें।",
        pLow: "जड़ों के लिए फास्फोरस उर्वरक (डीएपी) डालें।",
        kLow: "रोगों से बचाव के लिए पोटेशियम उर्वरक (एमओपी) डालें।",
        rainLow: "नियमित सिंचाई करें - बारिश कम है।",
        rainHigh: "जल निकासी साफ करें - भारी बारिश की संभावना।",
        optimal: "वर्तमान तरीके जारी रखें - हालात अच्छे हैं।"
      },
      alerts: {
        heat: "🔥 गर्मी: तापमान 35°C से अधिक। सुबह जल्दी सिंचाई करें।",
        cold: "❄️ ठंड: तापमान 10°C से नीचे। जड़ों की सुरक्षा के लिए मल्च डालें।",
        disease: "🦠 फंगल खतरा: उच्च आर्द्रता और गर्मी। बीमारी के लक्षण देखें।",
        floodHigh: "🌊 बाढ़ खतरा: बहुत भारी बारिश (>250mm)। उपकरण ऊँची जगह रखें।",
        floodWarning: "💧 बाढ़ चेतावनी: भारी बारिश (180-250mm)। जल निकासी साफ करें।",
        floodAdvisory: "💧 भारी बारिश सतर्कता: बारिश 150mm से अधिक। खेत की निकासी जाँचें।",
        none: "✅ सब ठीक: कोई बड़ा मौसमी खतरा नहीं।"
      }
    },
    bn: {
      summary: `${formData.district}, ${formData.state}-এ আপনার জমি **${predCropName}** ফসলের জন্য সবচেয়ে উপযুক্ত (${predictionResult.score}% ম্যাচ)। প্রত্যাশিত ফলন: **${predictionResult.yieldKg.toLocaleString()} কেজি/হেক্টর**। মাটি **${soilHealth.overall === 'good' ? 'ভালো' : 'উন্নতি প্রয়োজন'}** এবং আবহাওয়া **${weatherSuit.overall === 'suitable' ? 'উপযুক্ত' : 'অনুপযুক্ত'}**। ভালো বিকল্প: **${rec1Name}** এবং **${rec2Name}**।`,
      suitabilityMsg: predictionResult.score < 50 ? "⚠️ **কম উপযোগিতা**: এই ফসল ভালোভাবে বাড়বে না। নিচের বিকল্পগুলো দেখুন।" : "✅ **ভালো ম্যাচ**: এই ফসল আপনার জমির জন্য উপযুক্ত।",
      actionPlan: "কি করতে হবে",
      alertsAdvisories: "গুরুত্বপূর্ণ সতর্কতা",
      summaryTitle: "খামার রিপোর্ট সারসংক্ষেপ",
      actions: {
        nLow: "পাতার বৃদ্ধির জন্য নাইট্রোজেন সার (ইউরিয়া) দিন।",
        pLow: "শিকড়ের জন্য ফসফরাস সার (ডিএপি) দিন।",
        kLow: "রোগ প্রতিরোধের জন্য পটাশিয়াম সার (এমওপি) দিন।",
        rainLow: "নিয়মিত সেচ দিন - বৃষ্টিপাত কম।",
        rainHigh: "নিকাশী পরিষ্কার করুন - ভারী বৃষ্টিপাতের সম্ভাবনা।",
        optimal: "বর্তমান পদ্ধতি চালিয়ে যান - অবস্থা ভালো।"
      },
      alerts: {
        heat: "🔥 গরম আবহাওয়া: তাপমাত্রা ৩৫°C-এর বেশি। সকালে জল দিন।",
        cold: "❄️ ঠান্ডা আবহাওয়া: তাপমাত্রা ১০°C-এর নিচে। শিকড় রক্ষার জন্য মালচ ব্যবহার করুন।",
        disease: "🦠 ছত্রাক ঝুঁকি: উচ্চ আর্দ্রতা এবং তাপ। রোগের লক্ষণ দেখুন।",
        floodHigh: "🌊 বন্যা বিপদ: খুব ভারী বৃষ্টিপাত (>২৫০mm)। সরঞ্জাম উঁচু জায়গায় রাখুন।",
        floodWarning: "💧 বন্যা সতর্কতা: ভারী বৃষ্টিপাত (১৮০-২৫০mm)। সব নিকাশী পরিষ্কার করুন।",
        floodAdvisory: "💧 ভারী বৃষ্টিপাত সতর্কতা: বৃষ্টিপাত ১৫০mm-এর বেশি। জমির নিকাশী পরীক্ষা করুন।",
        none: "✅ সব ঠিক আছে: কোন বড় আবহাওয়া ঝুঁকি নেই।"
      }
    }
  };

  const str = textStrings[lang] || textStrings.en;

  const actionList = [];
  if (n < 40) actionList.push(str.actions.nLow);
  if (p < 20) actionList.push(str.actions.pLow);
  if (k < 30) actionList.push(str.actions.kLow);
  if (rain < 60) actionList.push(str.actions.rainLow);
  if (rain > 200) actionList.push(str.actions.rainHigh);
  if (actionList.length === 0) actionList.push(str.actions.optimal);

  const alertList = [];
  if (temp > 35) alertList.push({ type: 'warning', icon: '🔥', text: str.alerts.heat });
  else if (temp < 10) alertList.push({ type: 'warning', icon: '❄️', text: str.alerts.cold });
  if (hum > 80 && temp > 25) alertList.push({ type: 'danger', icon: '🦠', text: str.alerts.disease });
  
  // Improved flood warning logic: Consider multiple factors
  if (rain > 150) {
    // Check if rainfall is extremely high (>250mm) for immediate flood risk
    if (rain > 250) {
      alertList.push({ type: 'danger', icon: '🌊', text: str.alerts.floodHigh });
    }
    // Check if rainfall is high but not extreme (150-250mm) - warning depends on soil drainage
    else if (rain > 180) {
      alertList.push({ type: 'warning', icon: '💧', text: str.alerts.floodWarning });
    }
    // Moderate high rainfall (150-180mm) - advisory only
    else {
      alertList.push({ type: 'info', icon: '💧', text: str.alerts.floodAdvisory });
    }
  }
  
  if (alertList.length === 0) alertList.push({ type: 'success', icon: '✅', text: str.alerts.none });

  return (
    <div className="space-y-6">
      {/* Print button */}
      <div className="flex justify-between items-center no-print bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-green-800 flex items-center gap-2">
          📋 {t.report.title}
        </h2>
        <button
          onClick={printReport}
          className="bg-green-700 hover:bg-green-800 text-white font-bold py-2 px-5 rounded-lg flex items-center gap-2 transition-colors"
        >
          🖨️ {t.report.printReport || 'Print'}
        </button>
      </div>

      <div ref={reportRef} className="space-y-5 print:space-y-4">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-green-800 to-green-700 text-white rounded-xl p-6 shadow-md">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🌾</span>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Indian Farmer Assistant</h1>
              <p className="text-green-200 text-sm mt-1 font-medium tracking-wide">Agriculture Report — {new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        </div>

        {/* Section 1: Farm Report Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-5 py-3">
             <h3 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
              📋 {str.summaryTitle}
            </h3>
          </div>
          <div className="p-5 space-y-3">
            <p className="text-gray-700 leading-relaxed text-[15px]">{str.summary}</p>
            <div className={`p-3 rounded-lg border font-bold text-sm flex items-center gap-2 ${predictionResult.score < 50 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-green-50 border-green-200 text-green-800'}`}>
               {str.suitabilityMsg}
            </div>
          </div>
        </div>

        {/* Section 2: Soil & Weather Check */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-green-50 border-b border-green-100 px-5 py-3">
             <h3 className="font-bold text-green-800 flex items-center gap-2 text-lg">
              🌱 Soil & Weather Check
            </h3>
          </div>
          <div className="p-5 space-y-3">
            <div className="flex border-b border-gray-100 pb-3">
              <span className="w-1/3 text-gray-500 font-semibold">Soil Health</span>
              <span className="w-2/3 text-gray-800 font-bold capitalize">{soilHealth.overall.replace('_', ' ')} (N: {soilHealth.nitrogen}, P: {soilHealth.phosphorus}, K: {soilHealth.potassium})</span>
            </div>
            <div className="flex border-b border-gray-100 pb-3">
              <span className="w-1/3 text-gray-500 font-semibold">Moisture Condition</span>
              <span className="w-2/3 text-gray-800 font-bold capitalize">{weatherSuit.rainfall} Rainfall</span>
            </div>
            <div className="flex">
              <span className="w-1/3 text-gray-500 font-semibold">Climate Impact</span>
              <span className="w-2/3 text-gray-800 font-bold capitalize">{weatherSuit.temperature} Temperature</span>
            </div>
          </div>
        </div>

        {/* Section 3: Why This Crop Fits */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-purple-50 border-b border-purple-100 px-5 py-3">
             <h3 className="font-bold text-purple-800 flex items-center gap-2 text-lg">
              📊 Why This Crop Fits
            </h3>
          </div>
          <div className="p-5">
            <p className="text-gray-700 text-[15px] whitespace-pre-line leading-relaxed font-medium">
              {predictionResult.explanation?.why || `Score: ${predictionResult.score}%\nYield prediction is robust.`}
            </p>
          </div>
        </div>

        {/* Section 4: What to Do */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-50 border-b border-blue-100 px-5 py-3">
             <h3 className="font-bold text-blue-800 flex items-center gap-2 text-lg">
              🎯 {str.actionPlan}
            </h3>
          </div>
          <div className="p-5">
            <ul className="space-y-3">
              {actionList.map((action, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-blue-500 mt-0.5">🔹</span>
                  <span className="text-gray-700 text-[15px] leading-snug">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Section 5: Important Warnings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-amber-50 border-b border-amber-100 px-5 py-3">
             <h3 className="font-bold text-amber-800 flex items-center gap-2 text-lg">
              ⚠️ {str.alertsAdvisories}
            </h3>
          </div>
          <div className="p-5 space-y-3">
             {alertList.map((alert, idx) => {
               const bg = alert.type === 'danger' ? 'bg-red-50 border-red-200 text-red-800' : 
                          alert.type === 'warning' ? 'bg-orange-50 border-orange-200 text-orange-800' : 
                          'bg-green-50 border-green-200 text-green-800';
               return (
                 <div key={idx} className={`p-4 rounded-lg border ${bg} flex items-start gap-3`}>
                   <span className="text-xl">{alert.icon}</span>
                   <p className="font-medium text-[15px] mt-0.5">{alert.text}</p>
                 </div>
               )
             })}
          </div>
        </div>

        {/* Section 6: Other Good Crops */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-indigo-50 border-b border-indigo-100 px-5 py-3">
             <h3 className="font-bold text-indigo-800 flex items-center gap-2 text-lg">
              📈 Other Good Crops
            </h3>
          </div>
          <div className="p-5 space-y-4">
             {recommendations.slice(0, 2).map((rec, idx) => (
               <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                 <span className="text-3xl">{rec.icon}</span>
                 <div>
                   <h4 className="font-bold text-gray-800">{lang === 'hi' ? rec.nameHi : lang === 'bn' ? rec.nameBn : rec.name}</h4>
                   <p className="text-sm text-gray-600 font-medium">Yield: {rec.yieldKg} kg/ha</p>
                   <p className="text-sm text-gray-700 mt-1 whitespace-pre-line leading-relaxed">{rec.reason.split('\n')[0]} - {rec.reason.split('\n')[1]}</p>
                 </div>
               </div>
             ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm py-4 mt-6 border-t border-gray-200 print:border-none">
          Indian Farmer Assistant • Focus: Data-Driven Agriculture • Generated on {new Date().toLocaleString('en-IN')}
        </div>
      </div>
    </div>
  );
}
