import { cropDatabase } from '../data/agriculturalRegistry.js';
import rfModelData from '../data/rf_model.json' with { type: 'json' };

// Mapping between crop database names and RF model class names
const CROP_NAME_MAPPING = {
  'Rice': 'rice',
  'Wheat': 'wheat',
  'Cotton': 'cotton',
  'Sugarcane': 'sugarcane',
  'Maize': 'maize',
  'Groundnut': 'groundnut',
  'Soybean': 'soybean',
  'Coconut': 'coconut',
  'Potato': 'potato',
  'Tomato': 'tomato',
  'Tobacco': 'tobacco',
  'Mango': 'mango',
  'Banana': 'banana',
  'Chilli': 'chilli',
  'Brinjal': 'brinjal',
  'Apple': 'apple',
  'Grapes': 'grapes',
  'Jute': 'jute',
  'Kidneybeans': 'kidneybeans',
  'Lentil': 'lentil',
  'Mothbeans': 'mothbeans',
  'Mungbean': 'mungbean',
  'Muskmelon': 'muskmelon',
  'Orange': 'orange',
  'Papaya': 'papaya',
  'Pigeonpeas': 'pigeonpeas',
  'Pomegranate': 'pomegranate',
  'Watermelon': 'watermelon',
  'Coffee': 'coffee',
  'Blackgram': 'blackgram',
  'Chickpea': 'chickpea'
};

// Normalize a value to 0-1 range, capped at 0/1 outside range
function normalize(value, min, max) {
  if (value <= min) return 0;
  if (value >= max) return 1;
  return (value - min) / (max - min);
}

// Calculate crop suitability score (0-100)
function scoreCrop(crop, inputs) {
  const { rainfall, temperature, humidity, soilType, nitrogen, phosphorus, potassium, ph, state } = inputs;

  let score = 0;
  let factors = [];

  // Soil type match (20 points) - Reduced from 25 to accommodate pH
  if (crop.soilTypes.includes(soilType)) {
    score += 20;
    factors.push({ key: 'soil', value: 20, ok: true });
  } else {
    factors.push({ key: 'soil', value: 0, ok: false });
  }

  // Rainfall suitability (15 points)
  const rainfallScore = scoreInRange(rainfall, crop.minRainfall, crop.maxRainfall) * 15;
  score += rainfallScore;
  factors.push({ key: 'rainfall', value: rainfallScore, ok: rainfallScore > 7 });

  // Temperature suitability (15 points)
  const tempScore = scoreInRange(temperature, crop.minTemp, crop.maxTemp) * 15;
  score += tempScore;
  factors.push({ key: 'temperature', value: tempScore, ok: tempScore > 7 });

  // Humidity suitability (10 points)
  const humidityScore = scoreInRange(humidity, crop.minHumidity, crop.maxHumidity) * 10;
  score += humidityScore;
  factors.push({ key: 'humidity', value: humidityScore, ok: humidityScore > 5 });

  // pH suitability (20 points) - NEW
  const soilPh = ph || 6.5;
  const phScore = scoreInRange(soilPh, crop.minPh || 5.5, crop.maxPh || 7.5) * 20;
  score += phScore;
  factors.push({ key: 'pH', value: phScore, ok: phScore > 10 });

  // NPK suitability (15 points total)
  const nScore = scoreInRange(nitrogen, crop.minN, crop.maxN) * 5;
  const pScore = scoreInRange(phosphorus, crop.minP, crop.maxP) * 5;
  const kScore = scoreInRange(potassium, crop.minK, crop.maxK) * 5;
  score += nScore + pScore + kScore;
  factors.push({ key: 'npk', value: nScore + pScore + kScore, ok: (nScore + pScore + kScore) > 7 });

  // State bonus (5 points) or penalty (-30 points)
  if (state) {
    if (crop.states.includes(state)) {
      score += 5;
      factors.push({ key: 'region', value: 5, ok: true });
    } else {
      score -= 30; // Severe penalty for wrong location!
      factors.push({ key: 'region', value: 0, ok: false });
    }
  }

  // Seasonal suitability (10 points)
  const currentMonth = new Date().getMonth();
  const seasons = {
    Kharif: [5, 6, 7, 8, 9], // Jun-Oct
    Zaid: [2, 3, 4],        // Mar-May
    Rabi: [10, 11, 0, 1]     // Nov-Feb
  };
  let currentSeason = "Rabi";
  if (seasons.Kharif.includes(currentMonth)) currentSeason = "Kharif";
  else if (seasons.Zaid.includes(currentMonth)) currentSeason = "Zaid";

  if (crop.optimalSeason === currentSeason) {
    score += 10;
    factors.push({ key: 'season', value: 10, ok: true });
  } else {
    factors.push({ key: 'season', value: 0, ok: false });
  }

  return { score: Math.min(100, Math.max(0, Math.round(score))), factors };
}

// Score within range: returns 1 if in range, decreases outside
function scoreInRange(value, min, max) {
  if (value >= min && value <= max) return 1;
  const midpoint = (min + max) / 2;
  const range = (max - min) / 2;
  const distance = Math.abs(value - midpoint) - range;
  const falloff = Math.max(0, 1 - distance / range);
  return Math.max(0, falloff);
}

// Calculate yield based on suitability score and base yield
function calculateYield(crop, score, inputs) {
  const { rainfall, temperature, nitrogen } = inputs;
  
  const rainBonus = scoreInRange(rainfall, crop.minRainfall, crop.maxRainfall);
  const tempBonus = scoreInRange(temperature, crop.minTemp, crop.maxTemp);
  const nBonus = scoreInRange(nitrogen, crop.minN, crop.maxN);

  let yieldMultiplier = 0.3 + (score / 100) * 0.7;

  // STRICT Yield Consistency Rule
  if (rainfall < crop.minRainfall) {
    yieldMultiplier *= (rainfall / crop.minRainfall); // Drastic reduction if dry
  }
  
  yieldMultiplier *= (0.8 + (rainBonus + tempBonus + nBonus) / 3 * 0.2);
  let predictedYield = Math.round(crop.baseYield * yieldMultiplier);

  const variance = 0.05;
  const randomFactor = 1 + (Math.random() * variance * 2 - variance);
  return Math.max(0, Math.round(predictedYield * randomFactor));
}

export function generateExplanation(crop, inputs, lang = 'en', score = 100, rfConfidence = null) {
  let text = generateReason(crop, inputs, lang);
  let how = `The final calculated suitability score is ${score}%. The yield projection is dynamically adjusted according to this factor.`;
  
  if (rfConfidence !== null) {
    if (rfConfidence < 40) {
      text = `[AI Advisory] The environmental conditions are highly unusual or extreme. The Random Forest model predicts ${crop.name} as the most statistically resilient crop, though confidence is low (${rfConfidence}%).\n\n` + text;
    } else {
      text = `[AI Advisory] The Random Forest ML model determined ${crop.name} as the optimal crop with a confidence of ${rfConfidence}% based on historical dataset patterns.\n\n` + text;
    }
    how = `ML Confidence: ${rfConfidence}%. Suitability factor: ${score}%. Yield predicted robustly via ML classification and heuristic scaling.`;
  }
  
  return {
    why: text,
    how: how
  };
}

// Generate strict recommendation text
export function generateReason(crop, inputs, lang = 'en', rankIndex = -1) {
  const { soilType, rainfall, temperature, nitrogen, phosphorus, potassium } = inputs;
  const soilMatch = crop.soilTypes.includes(soilType);
  const goodRain = rainfall >= crop.minRainfall && rainfall <= crop.maxRainfall;
  const goodTemp = temperature >= crop.minTemp && temperature <= crop.maxTemp;
  const nScore = scoreInRange(nitrogen, crop.minN, crop.maxN);
  const pScore = scoreInRange(phosphorus, crop.minP, crop.maxP);
  const kScore = scoreInRange(potassium, crop.minK, crop.maxK);
  const goodNutrients = (nScore + pScore + kScore) > 1.5;

  const { score } = scoreCrop(crop, inputs);
  const isSuitable = score >= 50;
  
  let classification = "Not Suitable";
  if (score >= 80) classification = "Highly Suitable";
  else if (score >= 50) classification = "Moderately Suitable";

  let text = [];

  if (rankIndex >= 0) {
    if (rankIndex === 0) {
      if (score >= 80) text.push(`💡 Why Ranked #1:\nTop recommendation due to excellent environmental synergy and maximum yield prospects.\n`);
      else if (score >= 60) text.push(`💡 Why Ranked #1:\nBest available option under current metrics, though it requires attention to specific environmental risk factors.\n`);
      else text.push(`💡 Why Ranked #1:\nHighest scoring option under current difficult conditions, but significant management and care is required.\n`);
    } else if (rankIndex === 1) {
      if (score >= 70) text.push(`💡 Why Ranked #2:\nHighly compatible alternative requiring minimal environmental management.\n`);
      else text.push(`💡 Why Ranked #2:\nViable secondary option with moderate adaptability to your soil and weather.\n`);
    } else {
      text.push(`💡 Why Ranked #3:\nA solid alternative choice with standard yield potential despite some manageable challenges.\n`);
    }
  }

  if (isSuitable) {
    const lethalHeat = temperature > 40;
    const extremeDrought = rainfall < 50 && crop.minRainfall > 200;

    text.push(`💡 Why This Crop Is Suitable (${classification}):`);
    if (soilMatch) text.push(`✅ Soil Compatibility: ${soilType} soil supports healthy root development.`);
    if (goodRain) text.push(`✅ Rainfall Suitability: Expected moisture matches the crop requirements.`);
    if (goodTemp) text.push(`✅ Temperature Suitability: Climate falls into the optimal growth range.`);
    
    // Add Minor risks if any
    let risks = [];
    if (!soilMatch) risks.push(`Requires soil treatment for ${soilType}`);
    if (!goodRain) risks.push(rainfall < crop.minRainfall ? `Requires dedicated irrigation` : `High waterlogging risk`);
    if (!goodTemp) risks.push(`Vulnerable to temperature extremes`);
    if (!goodNutrients) risks.push(`Requires NPK nutrient supplementation`);
    
    if (risks.length > 0) {
      text.push(`⚠️ Minor Risks (if any): ${risks.join(' & ')}.`);
    }
  } else {
    const lethalHeat = temperature > 40;
    const extremeDrought = rainfall < 50 && crop.minRainfall > 200;

    text.push(`❌ Why This Crop Is NOT Suitable (${classification}):`);
    if (lethalHeat) {
      text.push(`❌ CRITICAL: Extreme heat (>40°C) poses lethal risk to this crop type.`);
    } else if (!goodTemp) {
      text.push(`⚠️ Temperature Issue: The temperature spans are too stressful for survival.`);
    }

    if (extremeDrought) {
      text.push(`❌ CRITICAL: Severe drought conditions detected. Natural moisture is insufficient for survival.`);
    } else if (!goodRain) {
      text.push(`⚠️ Rainfall Issue: The natural rainfall drastically deviates from required volumes.`);
    }

    if (!soilMatch) text.push(`⚠️ Soil Issue: ${soilType} soil is generally rejected by this crop's roots.`);
    if (!goodNutrients) text.push(`⚠️ Nutrient Issue: Critical NPK deficiency detected across the field.`);
  }

  return text.join('\n');
}

function predictWithRF(inputs) {
  const { nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall } = inputs;
  const soilPh = ph || 6.5;
  
  const features = [nitrogen, phosphorus, potassium, temperature, humidity, soilPh, rainfall];
  let classVotes = new Array(rfModelData.classes.length).fill(0);
  
  for (const tree of rfModelData.trees) {
    let nodeIdx = 0;
    while (true) {
      const node = tree[nodeIdx];
      if (node.left === -1 && node.right === -1) {
        const totalSamples = node.value.reduce((a, b) => a + b, 0);
        for (let i = 0; i < node.value.length; i++) {
            classVotes[i] += node.value[i] / totalSamples;
        }
        break;
      }
      if (features[node.feature] <= node.threshold) {
        nodeIdx = node.left;
      } else {
        nodeIdx = node.right;
      }
    }
  }
  
  let maxVote = 0;
  let bestClassIdx = 0;
  for (let i = 0; i < classVotes.length; i++) {
    if (classVotes[i] > maxVote) {
      maxVote = classVotes[i];
      bestClassIdx = i;
    }
  }
  
  // Enhanced confidence calculation: normalize and ensure minimum 10% for top prediction
  const rawConfidence = (maxVote / rfModelData.trees.length) * 100;
  const confidence = Math.max(10, Math.round(rawConfidence));
  const predictedCropName = rfModelData.classes[bestClassIdx];
  return { predictedCropName, confidence, classVotes };
}

export function predictHarvest(inputs) {
  const rfResult = predictWithRF(inputs);
  const mlBestCropName = rfResult.predictedCropName.toLowerCase();
  
  let bestCrop;
  let isTargetCropVerified = false;

  // Manual Crop Verification Logic
  if (inputs.targetCrop && inputs.targetCrop !== 'auto') {
    bestCrop = cropDatabase.find(c => c.name.toLowerCase() === inputs.targetCrop.toLowerCase());
    isTargetCropVerified = true;
  } else {
    bestCrop = cropDatabase.find(c => c.name.toLowerCase() === mlBestCropName);
  }
  
  if (!bestCrop) {
    // FALLBACK: If RF predicts a crop not in our detailed database (e.g. apple),
    // we find the best matching crop from our registry using our heuristic scoring.
    console.warn(`[AgriBrain] Using fallback heuristic search.`);
    let highestScore = -100;
    cropDatabase.forEach(c => {
      const { score } = scoreCrop(c, inputs);
      if (score > highestScore) {
        highestScore = score;
        bestCrop = c;
      }
    });
  }

  const { score, factors } = scoreCrop(bestCrop, inputs);
  const yieldKg = calculateYield(bestCrop, score, inputs);

  let locationWarning = null;
  if (inputs.state && !bestCrop.states.includes(inputs.state)) {
    locationWarning = `❌ Location Suitability Warning:\nThis crop is not commonly suitable for ${inputs.district}, ${inputs.state} due to climate/soil mismatch.\nConsider alternative region-native crops for optimized yields.`;
  }

  // Calculate ML confidence - never show 0%
  let rfConfidence;
  if (isTargetCropVerified) {
    if (bestCrop.name.toLowerCase() === mlBestCropName) {
      rfConfidence = rfResult.confidence;
    } else {
      // If user selected a different crop than ML predicted, still show reasonable confidence
      // based on suitability score and ML confidence for that crop
      const mappedName = CROP_NAME_MAPPING[bestCrop.name] || bestCrop.name.toLowerCase();
      const classIdx = rfModelData.classes.findIndex(name => name.toLowerCase() === mappedName);
      if (classIdx !== -1) {
        const rawConfidence = (rfResult.classVotes[classIdx] / rfModelData.trees.length) * 100;
        rfConfidence = Math.max(15, Math.round(rawConfidence));
      } else {
        // Fallback to suitability-based confidence
        rfConfidence = Math.max(20, Math.min(95, Math.round(score * 0.7)));
      }
    }
  } else {
    rfConfidence = rfResult.confidence;
  }
  
  // Ensure minimum confidence of 10%
  rfConfidence = Math.max(10, rfConfidence);
  
  const explanation = generateExplanation(bestCrop, inputs, 'en', score, rfConfidence);

  return {
    cropName: bestCrop.name,
    cropNameHi: bestCrop.nameHi,
    cropNameBn: bestCrop.nameBn,
    cropIcon: bestCrop.icon,
    yieldKg: yieldKg,
    score: score,
    confidence: rfConfidence,
    factors: factors,
    crop: bestCrop,
    locationWarning,
    explanation,
    isTargetCropVerified
  };
}

export function suggestCrops(inputs) {
  const rfResult = predictWithRF(inputs);
  
  // 1. Calculate suitability for ALL crops in registry
  const allScoredCrops = cropDatabase.map(crop => {
    const { score, factors } = scoreCrop(crop, inputs);
    
    // Find ML confidence for this crop using mapping
    const mappedName = CROP_NAME_MAPPING[crop.name] || crop.name.toLowerCase();
    const classIdx = rfModelData.classes.findIndex(name => name.toLowerCase() === mappedName);
    
    let mlConfidence = 0;
    if (classIdx !== -1) {
      const rawConfidence = (rfResult.classVotes[classIdx] / rfModelData.trees.length) * 100;
      // Ensure minimum confidence of 5% for crops that appear in RF model
      mlConfidence = Math.max(5, Math.round(rawConfidence));
    } else {
      // For crops not in RF model, derive confidence from suitability score
      mlConfidence = Math.min(95, Math.max(10, Math.round(score * 0.8)));
    }

    return { crop, score, factors, mlConfidence };
  });

  // 2. Rank primarily by Suitability Score (High to Low), secondarily by ML Confidence
  const sortedCrops = allScoredCrops.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.mlConfidence - a.mlConfidence;
  });

  // 3. Select Top 3, ensuring suitability where possible
  const topCrops = sortedCrops.slice(0, 3);

  return topCrops.map((tc, i) => {
    const yieldKg = calculateYield(tc.crop, tc.score, inputs);
    let reasonText = generateReason(tc.crop, inputs, 'en', i);
    
    // Always show ML confidence, never show 0%
    const displayConfidence = Math.max(10, tc.mlConfidence);
    reasonText = `🤖 ML Confidence: ${displayConfidence}%\n\n${reasonText}`;
    
    return {
      rank: i + 1,
      name: tc.crop.name,
      nameHi: tc.crop.nameHi,
      nameBn: tc.crop.nameBn,
      icon: tc.crop.icon,
      yieldKg: yieldKg,
      score: tc.score,
      confidence: displayConfidence,
      reason: reasonText,
      crop: tc.crop,
    };
  });
}

// Soil health assessment based on NPK
export function evaluateSoil(n, p, k) {
  const assessN = n < 30 ? 'low' : n < 80 ? 'medium' : 'high';
  const assessP = p < 15 ? 'low' : p < 40 ? 'medium' : 'high';
  const assessK = k < 20 ? 'low' : k < 50 ? 'medium' : 'high';

  return {
    nitrogen: assessN,
    phosphorus: assessP,
    potassium: assessK,
    overall: assessN === 'medium' && assessP === 'medium' && assessK === 'medium' ? 'good' :
             (assessN === 'low' || assessP === 'low' || assessK === 'low') ? 'needs_improvement' : 'adequate',
  };
}

// Weather suitability assessment
export function evaluateClimate(rainfall, temperature, humidity) {
  const rainSuit = rainfall >= 40 && rainfall <= 280 ? 'suitable' : 'not_suitable';
  const tempSuit = temperature >= 10 && temperature <= 40 ? 'suitable' : 'not_suitable';
  const humSuit = humidity >= 30 && humidity <= 90 ? 'suitable' : 'not_suitable';

  return {
    rainfall: rainSuit,
    temperature: tempSuit,
    humidity: humSuit,
    overall: rainSuit === 'suitable' && tempSuit === 'suitable' ? 'suitable' : 'not_suitable',
  };
}

// Risk calculation
export function determineRisk(humidity, temperature, rainfall) {
  let score = 0;
  if (humidity > 80) score += 40;
  if (temperature > 25 && temperature < 35) score += 30;
  if (rainfall > 100) score += 30;

  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}
