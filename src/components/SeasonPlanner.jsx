import { useState } from 'react';
import { useApp } from '../context/StateCentral';
import { cropDatabase } from '../data/agriculturalRegistry.js';

const CALENDAR_DATA = {
  Rice: {
    totalDays: 130,
    stages: [
      { key: 'sowing', icon: '🌱', days: '0–10', daysNum: [0,10], activities: { en: 'Prepare field. Sow pre-soaked seeds in nursery bed. Keep soil moist.', hi: 'खेत तैयार करें। नर्सरी बेड में बीज बोएं। मिट्टी नम रखें।', bn: 'মাঠ প্রস্তুত করুন। নার্সারিতে বীজ বপন করুন। মাটি আর্দ্র রাখুন।' }, tips: { en: 'Soak seeds 24 hours before sowing for better germination.', hi: 'बेहतर अंकुरण के लिए बुआई से 24 घंटे पहले बीज भिगोएं।', bn: 'ভালো অঙ্কুরোদগমের জন্য বপনের ২৪ ঘন্টা আগে বীজ ভিজিয়ে নিন।' } },
      { key: 'germination', icon: '🌿', days: '10–30', daysNum: [10,30], activities: { en: 'Transplant seedlings to main field. Maintain 2–3 cm water level.', hi: 'पौधों को मुख्य खेत में रोपें। 2-3 सेमी पानी का स्तर बनाए रखें।', bn: 'চারা মূল মাঠে রোপণ করুন। ২-৩ সেমি পানির স্তর বজায় রাখুন।' }, tips: { en: 'Use resistant varieties to reduce disease risk.', hi: 'रोग जोखिम कम करने के लिए प्रतिरोधी किस्मों का उपयोग करें।', bn: 'রোগ ঝুঁকি কমাতে প্রতিরোধী জাত ব্যবহার করুন।' } },
      { key: 'growing', icon: '🌾', days: '30–80', daysNum: [30,80], activities: { en: 'Weed control. Maintain water level. Watch for pests and disease signs.', hi: 'खरपतवार नियंत्रण। पानी का स्तर बनाए रखें। कीट और रोग देखें।', bn: 'আগাছা নিয়ন্ত্রণ। পানির স্তর বজায় রাখুন। রোগ-পোকার লক্ষণ দেখুন।' }, tips: { en: 'Drain field once to promote root growth around day 40.', hi: 'लगभग 40वें दिन जड़ विकास के लिए खेत से पानी निकालें।', bn: 'প্রায় ৪০তম দিনে শিকড় বৃদ্ধির জন্য মাঠ থেকে পানি বের করুন।' } },
      { key: 'fertilizing', icon: '🌿', days: '20–60', daysNum: [20,60], activities: { en: 'Apply Urea 50 kg/ha at tillering. Apply NPK at panicle initiation.', hi: 'टिलरिंग पर 50 किलो/हेक्टेयर यूरिया डालें। बाली निकलने पर NPK डालें।', bn: 'টিলারিংয়ে ৫০ কেজি/হেক্টর ইউরিয়া দিন। শীষ বের হলে NPK দিন।' }, tips: { en: 'Split fertilizer into 2–3 doses for better absorption.', hi: 'बेहतर अवशोषण के लिए खाद को 2-3 भागों में डालें।', bn: 'ভালো শোষণের জন্য সার ২-৩ ভাগে দিন।' } },
      { key: 'harvesting', icon: '🚜', days: '110–130', daysNum: [110,130], activities: { en: 'Drain field 10 days before harvest. Harvest when 80% grains are golden.', hi: 'कटाई से 10 दिन पहले खेत का पानी निकालें। 80% दाने सुनहरे होने पर काटें।', bn: 'কাটাইয়ের ১০ দিন আগে মাঠ শুকান। ৮০% দানা সোনালি হলে কাটুন।' }, tips: { en: 'Dry grains below 14% moisture before storage.', hi: 'भंडारण से पहले अनाज 14% से कम नमी तक सुखाएं।', bn: 'সংরক্ষণের আগে দানা ১৪% এর কম আর্দ্রতায় শুকান।' } },
    ],
  },
  Wheat: {
    totalDays: 120,
    stages: [
      { key: 'sowing', icon: '🌱', days: '0–7', daysNum: [0,7], activities: { en: 'Plough field well. Sow seeds 5 cm deep in rows. Apply basal fertilizer.', hi: 'खेत अच्छे से जोतें। पंक्तियों में 5 सेमी गहरे बीज बोएं।', bn: 'মাঠ ভালোভাবে চাষ করুন। সারিতে ৫ সেমি গভীরে বীজ বপন করুন।' }, tips: { en: 'Sow in October–November for best yield.', hi: 'सर्वोत्तम उपज के लिए अक्टूबर-नवंबर में बुआई करें।', bn: 'সেরা ফলনের জন্য অক্টোবর-নভেম্বরে বপন করুন।' } },
      { key: 'germination', icon: '🌿', days: '7–21', daysNum: [7,21], activities: { en: 'First irrigation after sowing. Thin out overcrowded seedlings.', hi: 'बुआई के बाद पहली सिंचाई। अधिक घने पौधों को पतला करें।', bn: 'বপনের পরে প্রথম সেচ। বেশি ঘন চারা পাতলা করুন।' }, tips: { en: 'Ensure soil has enough moisture for germination.', hi: 'अंकুরण के लिए मिट्टी में पर्याप्त नमी सुनिश्चित करें।', bn: 'অঙ্কুরোদগমের জন্য মাটিতে পর্যাপ্ত আর্দ্রতা নিশ্চিত করুন।' } },
      { key: 'growing', icon: '🌾', days: '21–90', daysNum: [21,90], activities: { en: 'Irrigate every 15–20 days. Control weeds. Watch for rust disease.', hi: 'हर 15-20 दिन में सिंचाई करें। खरपतवार नियंत्रण। रतुआ रोग देखें।', bn: 'প্রতি ১৫-২০ দিনে সেচ দিন। আগাছা নিয়ন্ত্রণ। মরিচা রোগ দেখুন।' }, tips: { en: 'Yellow rust spreads fast in cool humid weather. Act early.', hi: 'ठंडे नम मौसम में पीला रतुआ तेजी से फैलता है। जल्दी कार्रवाई करें।', bn: 'ঠান্ডা আর্দ্র আবহাওয়ায় হলুদ মরিচা দ্রুত ছড়ায়। আগে ব্যবস্থা নিন।' } },
      { key: 'fertilizing', icon: '🌿', days: '0–45', daysNum: [0,45], activities: { en: 'Basal dose NPK at sowing. Top dress Urea at tillering (30 days).', hi: 'बुआई पर मूल खुराक NPK। टिलरिंग पर यूरिया टॉप ड्रेसिंग (30 दिन)।', bn: 'বপনে মূল মাত্রা NPK। টিলারিংয়ে (৩০ দিন) ইউরিয়া টপ ড্রেসিং।' }, tips: { en: 'Do not over-apply nitrogen – causes lodging (crop falling).', hi: 'अधिक नाइट्रोजन न डालें – फसल बिछ जाती है।', bn: 'অতিরিক্ত নাইট্রোজেন দেবেন না – ফসল ঢলে পড়ে।' } },
      { key: 'harvesting', icon: '🚜', days: '110–120', daysNum: [110,120], activities: { en: 'Harvest when grains are hard and golden. Use combine or manually cut.', hi: 'जब दाने कठोर और सुनहरे हों तब काटें। कंबाइन या हाथ से काटें।', bn: 'দানা শক্ত ও সোনালি হলে কাটুন। কম্বাইন বা হাতে কাটুন।' }, tips: { en: 'Harvest early if hailstorm is expected to avoid losses.', hi: 'ओलावृष्टि की संभावना हो तो जल्दी काट लें।', bn: 'শিলাবৃষ্টির পূর্বাভাস থাকলে আগে কাটুন।' } },
    ],
  },
  Cotton: {
    totalDays: 170,
    stages: [
      { key: 'sowing', icon: '🌱', days: '0–15', daysNum: [0,15], activities: { en: 'Prepare firm seedbed. Sow seeds 2.5 cm deep with 60 cm spacing.', hi: 'बीज क्यारी तैयार करें। 60 सेमी की दूरी के साथ 2.5 सेमी गहरे बीज बोएं।', bn: 'বীজতলা প্রস্তুত করুন। ৬০ সেমি দূরত্বে ২.৫ সেমি গভীরে বীজ বপন করুন।' }, tips: { en: 'Treat seeds with fungicide to prevent damping-off.', hi: 'बीमारी रोकने के लिए बीजों को फफूंदनाशक से उपचारित करें।', bn: 'ড্যাম্পিং-অফ প্রতিরোধ করতে বীজের ছত্রাকনাশক চিকিৎসা করুন।' } },
      { key: 'germination', icon: '🌿', days: '15–40', daysNum: [15,40], activities: { en: 'Check for seedling emergence. Fill gaps by re-sowing if needed.', hi: 'अंकुरण की जाँच करें। जरूरत पड़ने पर फिर से बुआई करके अंतराल भरें।', bn: 'চারা গজানো চেক করুন। প্রয়োজন হলে পুনরায় বপন করে ফাঁক পূরণ করুন।' }, tips: { en: 'Maintain optimal moisture; avoid waterlogging.', hi: 'नमी बनाए रखें; जलभराव से बचें।', bn: 'মাটির আর্দ্রতা বজায় রাখুন; জলাবদ্ধতা এড়ান।' } },
      { key: 'growing', icon: '🌾', days: '40–120', daysNum: [40,120], activities: { en: 'Squaring and flowering stage. Monitor for bollworms and pests.', hi: 'फूल आने की अवस्था। बोलवर्म और कीटों की निगरानी करें।', bn: 'ফুল আসার পর্যায়। বোলওয়ার্ম এবং পোকা-মাকড় পর্যবেক্ষণ করুন।' }, tips: { en: 'Use pheromone traps for early pest detection.', hi: 'कीट का जल्दी पता लगाने के लिए फेरोमोन ट्रैप का उपयोग करें।', bn: 'পোকা সনাক্ত করতে ফেরোমোন ট্র্যাপ ব্যবহার করুন।' } },
      { key: 'fertilizing', icon: '🌿', days: '30–90', daysNum: [30,90], activities: { en: 'Apply nitrogen in two split doses at thinning and flowering.', hi: 'दो भागों में नाइट्रोजन डालें - छँटाई और फूल आने के समय।', bn: 'পাতলা করার সময় এবং ফুল আসার সময় নাইট্রোজেন দিন।' }, tips: { en: 'Potash helps in better fiber quality.', hi: 'पोटाश फाइबर की गुणवत्ता बढ़ाने में मदद करता है।', bn: 'পটাশ ফাইবারের মান বৃদ্ধিতে সাহায্য করে।' } },
      { key: 'harvesting', icon: '🚜', days: '150–170', daysNum: [150,170], activities: { en: 'Pick cotton bolls when fully open. Avoid picking wet cotton.', hi: 'पूरी तरह खुलने पर कपास के गोलों को चुनें। गीली कपास न चुनें।', bn: 'পুষ্ট বোলগুলো সংগ্রহ করুন। ভেজা তুলা সংগ্রহ করবেন না।' }, tips: { en: 'Store in a dry, ventilated place to prevent lint damage.', hi: 'नुकसान रोकने के लिए सूखे और हवादार स्थान पर भंडारण करें।', bn: 'লিট নষ্ট হওয়া রোধে শুষ্ক ও বায়ু চলাচলকারী স্থানে মজুত করুন।' } },
    ],
  },
  Sugarcane: {
    totalDays: 330,
    stages: [
      { key: 'sowing', icon: '🌱', days: '0–30', daysNum: [0,30], activities: { en: 'Plant healthy setts in furrows. Treat with copper-based fungicide.', hi: 'नाली में स्वस्थ गन्ने के टुकड़े लगाएं। कॉपर-आधारित फफूंदनाशक से उपचार करें।', bn: 'খাতগুলোতে সুস্থ চারা রোপণ করুন। কপার-ভিত্তিক ছত্রাকনাশক দিয়ে চিকিৎসা করুন।' }, tips: { en: 'Select setts with at least 3 buds for uniform growth.', hi: 'समान वृद्धि के लिए कम से कम 3 कलियों वाले टुकड़े चुनें।', bn: 'সমজাতীয় বৃদ্ধির জন্য প্রতি চারায় অন্তত ৩টি কুঁড়ি রাখুন।' } },
      { key: 'germination', icon: '🌿', days: '30–60', daysNum: [30,60], activities: { en: 'Light irrigation to promote sprouting. Control early shoots weeds.', hi: 'अंकुरण बढ़ाने के लिए हल्की सिंचाई। शुरुआती खरपतवारों को नियंत्रित करें।', bn: 'অঙ্কুরোদগম বাড়াতে হালকা সেচ দিন। আগাছা নিয়ন্ত্রণ করুন।' }, tips: { en: 'Proper soil temperature is critical for sett germination.', hi: 'टुकड़ों के अंकुरण के लिए उचित मिट्टी का तापमान महत्वपूर्ण है।', bn: 'চারা গজানোর জন্য মাটির সঠিক তাপমাত্রা খুব জরুরি।' } },
      { key: 'growing', icon: '🌾', days: '60–270', daysNum: [60,270], activities: { en: 'Grand growth phase. Earthing-up to prevent lodging.', hi: 'मुख्य वृद्धि चरण। गन्ने को गिरने से बचाने के लिए मिट्टी चढ़ाएं।', bn: 'প্রধান বৃদ্ধির পর্যায়। গাছ হেলে পড়া থেকে রোখাতে মাটি দিন।' }, tips: { en: 'Propping or tying canes helps during monsoon winds.', hi: 'मानसून की हवाओं के दौरान गन्ने बांधना मददगार होता है।', bn: 'বর্ষার বাতাসে আখ বেঁধে রাখা উপকারী।' } },
      { key: 'fertilizing', icon: '🌿', days: '45–180', daysNum: [45,180], activities: { en: 'Apply NPK in split doses. High nitrogen required in growth phase.', hi: 'NPK के विभाजित खुराक डालें। वृद्धि चरण में अधिक नाइट्रोजन चाहिए।', bn: 'NPK সারের বিভক্ত মাত্রা দিন। বৃদ্ধি পর্যায়ে প্রচুর নাইট্রোজেন প্রয়োজন।' }, tips: { en: 'Apply fertilizer in the root zone for maximum uptake.', hi: 'अधिकतम लाभ के लिए जड़ क्षेत्र में खाद डालें।', bn: 'সর্বোচ্চ শোষণের জন্য মূল অঞ্চলে সার প্রয়োগ করুন।' } },
      { key: 'harvesting', icon: '🚜', days: '300–330', daysNum: [300,330], activities: { en: 'Stop irrigation 2 weeks before harvest. Cut at ground level.', hi: 'कटाई से 2 सप्ताह पहले सिंचाई बंद करें। जमीन के पास से काटें।', bn: 'কাটার ২ সপ্তাহ আগে সেচ বন্ধ করুন। মাটি ঘেঁষে কাটুন।' }, tips: { en: 'Process immediately after harvest for maximum sugar recovery.', hi: 'चीनी की अधिकतम रिकवरी के लिए कटाई के तुरंत बाद मिल भेजें।', bn: 'সর্বোচ্চ চিনি পাওয়ার জন্য কাটার পরপরই মাড়াই করুন।' } },
    ],
  },
  Maize: {
    totalDays: 100,
    stages: [
      { key: 'sowing', icon: '🌱', days: '0–7', daysNum: [0,7], activities: { en: 'Sow at 3–5 cm depth. Spacing 60x20 cm. Use moisture-rich soil.', hi: '3-5 सेमी गहराई में बोएं। दूरी 60x20 सेमी। नमी युक्त मिट्टी उपयोग करें।', bn: '৩-৫ সেমি গভীরে বুনুন। দূরত্ব ৬০x২০ সেমি। আর্দ্র মাটি ব্যবহার করুন।' }, tips: { en: 'Early sowing avoids stem borer damage.', hi: 'जल्दी बुआई तना छेदक के नुकसान से बचाती है।', bn: 'তাড়াতাড়ি বপন করলে কাণ্ড ছিদ্রকারী পোকার আক্রমণ কমে।' } },
      { key: 'germination', icon: '🌿', days: '7–20', daysNum: [7,20], activities: { en: 'Thinning of weaker plants. Keep field free from weeds.', hi: 'कमजोर पौधों की छँटाई। खेत को खरपतवार मुक्त रखें।', bn: 'দুর্বল চারা পাতলা করুন। মাঠ আগাছামুক্ত রাখুন।' }, tips: { en: 'Critical moisture required during seedling stage.', hi: 'अंकुरण अवस्था के दौरान महत्वपूर्ण नमी जरूरी है।', bn: 'চারা অবস্থায় পর্যাপ্ত আর্দ্রতা প্রয়োজন।' } },
      { key: 'growing', icon: '🌾', days: '20–75', daysNum: [20,75], activities: { en: 'Tasseling and silking phase. High water demand.', hi: 'फूल आने और सिलकिंग अवस्था। पानी की अधिक मांग।', bn: 'ফুল ও মোচা আসার পর্যায়। প্রচুর পানির চাহিদা।' }, tips: { en: 'Water stress at silking can reduce yield by 50%.', hi: 'सिलकिंग के समय पानी की कमी उपज को 50% तक कम कर सकती है।', bn: 'মোচা আসার সময় সেচ কম হলে ফলন ৫০% কমে যেতে পারে।' } },
      { key: 'fertilizing', icon: '🌿', days: '20–60', daysNum: [20,60], activities: { en: 'Nitrogen top dress at knee-high and tasseling stages.', hi: 'घुटने की ऊँचाई और फूल आने पर नाइट्रोजन डालें।', bn: 'হাঁটু সমান উচ্চতা এবং ফুল আসার সময়ে নাইট্রোজেন দিন।' }, tips: { en: 'Zinc application is essential for healthy cob development.', hi: 'स्वस्थ भुट्टे के विकास के लिए जिंक बहुत जरूरी है।', bn: 'মোচার সুস্থ বিকাশের জন্য জিঙ্ক প্রয়োগ জরুরি।' } },
      { key: 'harvesting', icon: '🚜', days: '90–100', daysNum: [90,100], activities: { en: 'Harvest when husks turn brown and silk is dry. Grains hard.', hi: 'जब छिलका भूरा और सिल्क सूख जाए तब काटें। दाने कठोर हों।', bn: 'মোচার খোসা বাদামী ও সিল্ক শুকিয়ে গেলে সংগ্রহ করুন। দানা শক্ত হতে হবে।' }, tips: { en: 'Dry immediately to 13% moisture for safe storage.', hi: 'सुरक्षित भंडारण के लिए तुरंत 13% नमी तक सुखाएं।', bn: 'নিরাপদ মজুতের জন্য ১৩% আর্দ্রতায় শুকিয়ে নিন।' } },
    ],
  },
  Groundnut: {
    totalDays: 110,
    stages: [
      { key: 'sowing', icon: '🌱', days: '0–10', daysNum: [0,10], activities: { en: 'Sow at 5 cm depth. Use treated seeds. Soil should be friable.', hi: '5 सेमी गहराई में बोएं। उपचारित बीजों का प्रयोग करें। मिट्टी भुरभुरी हो।', bn: '৫ সেমি গভীরে বুনুন। শোধিত বীজ ব্যবহার করুন। মাটি ঝুরঝুরে হওয়া চাই।' }, tips: { en: 'Late sowing reduces yield and increases disease.', hi: 'देर से बुआई उपज कम करती है और बीमारियाँ बढ़ाती है।', bn: 'দেরিতে বপন ফলন কমায় এবং রোগের ঝুঁকি বাড়ায়।' } },
      { key: 'germination', icon: '🌿', days: '10–25', daysNum: [10,25], activities: { en: 'Monitor soil crust. Gap fill within 10 days of sowing.', hi: 'मिट्टी की पपड़ी की निगरानी करें। बुआई के 10 दिन में खाली जगह भरें।', bn: 'মাটির আস্তরণ পর্যবেক্ষণ করুন। বপনের ১০ দিনের মধ্যে ফাঁকা জায়গা পূরণ করুন।' }, tips: { en: 'Avoid heavy irrigation during initial growth.', hi: 'प्रारंभिक वृद्धि के दौरान अधिक सिंचाई से बचें।', bn: 'শুরুর বৃদ্ধির সময় অতিরিক্ত সেচ দেবেন না।' } },
      { key: 'growing', icon: '🌾', days: '25–85', daysNum: [25,85], activities: { en: 'Pegging stage (critical). Keep soil loose for peg penetration.', hi: 'पेगिंग अवस्था। मिट्टी को ढीला रखें ताकि जड़ें अंदर जा सकें।', bn: 'পেগিং পর্যায়। পেগ প্রবেশ সহজ করতে মাটি নরম রাখুন।' }, tips: { en: 'Do not disturb soil once pegs enter the ground.', hi: 'एक बार जड़ें अंदर जाने के बाद मिट्टी को न छेड़ें।', bn: 'মাটির ভেতরে পেগ ঢুকে গেলে মাটি নাড়াচাড়া করবেন না।' } },
      { key: 'fertilizing', icon: '🌿', days: '15–45', daysNum: [15,45], activities: { en: 'Apply Gypsum (400kg/ha) at flowering for pod filling.', hi: 'फली भरने के लिए फूल आने पर जिप्सम (400kg/ha) डालें।', bn: 'বাদাম পুষ্ট হওয়ার প্রয়োজনে ফুল আসার সময়ে জিপসাম দিন।' }, tips: { en: 'Calcium is vital for kernel formation.', hi: 'दानों के बनने के लिए कैल्शियम बहुत जरूरी है।', bn: 'বাদাম পুষ্ট করতে ক্যালসিয়াম অত্যাবশ্যক।' } },
      { key: 'harvesting', icon: '🚜', days: '100–110', daysNum: [100,110], activities: { en: 'Dig pods when shells show dark internal markings.', hi: 'जब छिलकों पर अंदर काले निशान दिखें तब फलियाँ खोदें।', bn: 'খোলার ভেতরে কালো দাগ দেখা দিলে বাদাম সংগ্রহ করুন।' }, tips: { en: 'Cure in shade for 3-5 days to reduce aflatoxin risk.', hi: 'जोखिम कम करने के लिए 3-5 दिनों तक छाया में सुखाएं।', bn: '৩-৫ দিন ছায়ায় শুকিয়ে নিন যাতে বিষাক্ততা কমে।' } },
    ],
  },
  Soybean: {
    totalDays: 100,
    stages: [
      { key: 'sowing', icon: '🌱', days: '0–7', daysNum: [0,7], activities: { en: 'Sow seeds 3cm deep. Optimal row spacing 45cm.', hi: 'बीज 3 सेमी गहरे बोएं। कतारों के बीच 45 सेमी की दूरी रखें।', bn: '৩ সেমি গভীরে বীজ বুনুন। সারির দূরত্ব ৪৫ সেমি রাখুন।' }, tips: { en: 'Inoculate seeds with Rhizobium for better nodules.', hi: 'बेहतर ग्रंथियों के लिए बीजों को राइजोबियम से उपचारित करें।', bn: 'শিকড়ে ভালো নডুল তৈরির জন্য রাইজোবিয়াম দিয়ে বীজ শোধন করুন।' } },
      { key: 'germination', icon: '🌿', days: '7–20', daysNum: [7,20], activities: { en: 'Control early weeds. Monitor moisture for emergence.', hi: 'शुरुआती खरपतवार नियंत्रित करें। नमी की निगरानी करें।', bn: 'শুরুর দিকের আগাছা নিয়ন্ত্রণ করুন। ছোপ ছোপ আর্দ্রতা বজায় রাখুন।' }, tips: { en: 'Wait for 75-100mm rain before sowing.', hi: 'बुआई से पहले 75-100 मिमी बारिश का इंतज़ार करें।', bn: 'বপনের আগে অন্তত ৭৫-১০০ মিমি বৃষ্টির অপেক্ষা করুন।' } },
      { key: 'growing', icon: '🌾', days: '20–80', daysNum: [20,80], activities: { en: 'Pod formation phase. Avoid moisture stress now.', hi: 'फली बनने की अवस्था। इस समय पानी की कमी न होने दें।', bn: 'শুঁটি গঠন পর্যায়। এই সময়ে পানির অভাব যেন না হয়।' }, tips: { en: 'Pod borer can destroy crop fast. Scout regularly.', hi: 'फली छेदक फसल को बर्बाद कर सकता है। नियमित जांच करें।', bn: 'শুঁটি ছিদ্রকারী পোকা দ্রুত ফসল নষ্ট করে। নিয়মিত নজর দিন।' } },
      { key: 'fertilizing', icon: '🌿', days: '0–40', daysNum: [0,40], activities: { en: 'Basal dose Sulphur is critical for oil content.', hi: 'तेल की मात्रा के लिए सल्फर की खुराक बहुत जरूरी है।', bn: 'তেলের পরিমাণ ঠিক রাখতে সালফার প্রয়োগ খুব জরুরি।' }, tips: { en: 'Excess nitrogen prevents nodule formation.', hi: 'अधिक नाइट्रोजन से जड़ों की ग्रंथियाँ नहीं बनतीं।', bn: 'অতিরিক্ত নাইট্রোজেন শিকড়ের গুটি গঠনে বাধা দেয়।' } },
      { key: 'harvesting', icon: '🚜', days: '90–100', daysNum: [90,100], activities: { en: 'Harvest when leaves turn yellow/drop and pods rattle.', hi: 'जब पत्तियाँ पीली पड़कर गिरें और फलियाँ खड़खड़ाएँ तब काटें।', bn: 'পাতা হলুদ হয়ে ঝরে পড়লে এবং শুঁটি ঝরঝরে আওয়াজ করলে কাটুন।' }, tips: { en: 'Delay leads to pod shattering in the field.', hi: 'देरी से खेत में फलियाँ चटक कर बीज बिखर सकते हैं।', bn: 'দেরি করলে শুঁটি ফেটে দানা ঝরে যেতে পারে।' } },
    ],
  },
  Mustard: {
    totalDays: 125,
    stages: [
      { key: 'sowing', icon: '🌱', days: '0–7', daysNum: [0,7], activities: { en: 'Sow at 3cm depth. Maintain row spacing 30cm.', hi: '3 सेमी गहराई में बोएं। कतारों की दूरी 30 सेमी रखें।', bn: '৩ সেমি গভীরে বুনুন। সারির মধ্যে ৩০ সেমি দূরত্ব রাখুন।' }, tips: { en: 'Soil must have enough moisture at sowing time.', hi: 'बुआई के समय मिट्टी में पर्याप्त नमी होनी चाहिए।', bn: 'বপনের সময়ে মাটিতে পর্যাপ্ত আর্দ্রতা থাকতে হবে।' } },
      { key: 'germination', icon: '🌿', days: '7–25', daysNum: [7,25], activities: { en: 'Light irrigation if needed. Watch for aphids.', hi: 'जरूरत होने पर हल्की सिंचाई। माहू (एफिड्स) पर नजर रखें।', bn: 'প্রয়োজনে হালকা সেচ দিন। জাব পোকার দিকে নজর রাখুন।' }, tips: { en: 'Early thinning is vital for crop health.', hi: 'पौधों को समय पर पतला करना फसल के स्वास्थ्य के लिए जरूरी है।', bn: 'চারাগাছকে সময়ে পাতলা করা সুস্বাস্থ্যের জন্য খুব দরকার।' } },
      { key: 'growing', icon: '🌾', days: '25–100', daysNum: [25,100], activities: { en: 'Flowering to pod (siliqua) formation. Critical irrigation.', hi: 'फूल आने से फली बनने की अवस्था। सिंचाई बहुत महत्वपूर्ण है।', bn: 'ফুল থেকে শুঁটি তৈরির পর্যায়। সেচ করা অত্যন্ত জরুরি।' }, tips: { en: 'Frost damage is a risk in late growing stage.', hi: 'बढ़ते समय के अंतिम चरण में पाले से नुकसान का खतरा होता है।', bn: 'বৃদ্ধির শেষের দিকে কুয়াশা বা ঠান্ডায় ক্ষতির ঝুঁকি থাকে।' } },
      { key: 'fertilizing', icon: '🌿', days: '0–40', daysNum: [0,40], activities: { en: 'Sulphur (40kg/ha) increases oil content and yield.', hi: 'सल्फर (40kg/ha) से तेल की मात्रा और उपज बढ़ती है।', bn: 'সালফার ও দানা তেলের পরিমাণ ও ফলন বাড়ায়।' }, tips: { en: 'Boron application prevents grain emptiness.', hi: 'बोरॉन डालने से दानों का खालीपन रुकता है।', bn: 'বোরন প্রয়োগ করলে দানা অপুষ্ট থাকা বন্ধ হয়।' } },
      { key: 'harvesting', icon: '🚜', days: '115–125', daysNum: [115,125], activities: { en: 'Harvest when 75% siliquae turn golden yellow.', hi: 'जब 75% फलियाँ सुनहरी पीली हो जाएँ तब कटाई करें।', bn: '৭৫% শুঁটি সোনালি হলুদ হয়ে গেলে ফসল কাটুন।' }, tips: { en: 'Avoid harvesting in heat to reduce shattering.', hi: 'झड़ने से रोकने के लिए तेज धूप में कटाई न करें।', bn: 'দানা ঝরা রোধ করতে কড়া রোদে ফসল কাটবেন না।' } },
    ],
  },
  Turmeric: {
    totalDays: 240,
    stages: [
      { key: 'sowing', icon: '🌱', days: '0–30', daysNum: [0,30], activities: { en: 'Plant rhizomes in raised beds. Apply heavy mulch.', hi: 'उठी हुई क्यारियों में प्रकंद (rhizomes) लगायें। मल्चिंग करें।', bn: 'উঁচু বেডে রাইজোম রোপণ করুন। ভালো করে মালচিং করুন।' }, tips: { en: 'Use mother rhizomes for higher yields.', hi: 'अधिक उपज के लिए मदर राइजोम का उपयोग करें।', bn: 'বেশি ফলনের জন্য মাদার রাইজোম ব্যবহার করুন।' } },
      { key: 'germination', icon: '🌿', days: '30–60', daysNum: [30,60], activities: { en: 'Sprouting phase. Maintain consistent moisture.', hi: 'अंकुरण अवस्था। लगातार नमी बनाए रखें।', bn: 'অঙ্কুরোদগম পর্যায়। সমভাবের আর্দ্রতা বজায় রাখুন।' }, tips: { en: 'Weeding is critical as growth is slow initially.', hi: 'शुरुआत में वृद्धि धीमी होने के कारण खरपतवार निकालना जरूरी है।', bn: 'শুরুর বৃদ্ধি ধীর গতির বলে আগাছা পরিষ্কার খুব জরুরি।' } },
      { key: 'growing', icon: '🌾', days: '60–210', daysNum: [60,210], activities: { en: 'Rhizome development. Earthing-up twice.', hi: 'प्रकंद विकास। दो बार मिट्टी चढ़ाएं (earthing-up)।', bn: 'রাইজোম বিকাশ। দুবার মাটি তুলে দিন।' }, tips: { en: 'Leaf spot can reduce rhizome size. Watch closely.', hi: 'लीफ स्पॉट से राइजोम का आकार कम हो सकता है। ध्यान रखें।', bn: 'পাতার দাগ রাইজোমের আকার কমিয়ে দিতে পারে। সতর্ক থাকুন।' } },
      { key: 'fertilizing', icon: '🌿', days: '45–150', daysNum: [45,150], activities: { en: 'Heavy organic manure + high potash for quality color.', hi: 'अच्छे रंग के लिए भारी खाद और अधिक पोटाश डालें।', bn: 'উন্নত রঙের জন্য প্রচুর জৈব সার ও পটাশ দিন।' }, tips: { en: 'Split nitrogen into 3 doses across growth phase.', hi: 'वृद्धि चरण के दौरान नाइट्रोजन को 3 भागों में डालें।', bn: 'বৃদ্ধির সময়কালে নাইট্রোজেন ৩টি কিস্তিতে দিন।' } },
      { key: 'harvesting', icon: '🚜', days: '210–240', daysNum: [210,240], activities: { en: 'Harvest when leaves wither and dry. Dig carefully.', hi: 'जब पत्तियाँ मुरझाकर सूख जाएँ तब खुदाई करें। सावधानी से खोदें।', bn: 'পাতা শুকিয়ে গেলে সাবধানে রাইজোম খনন করুন।' }, tips: { en: 'Curcumin content is highest if harvested at full maturity.', hi: 'पूरी परिपक्वता पर कटाई से करक्यूमिन की मात्रा सर्वाधिक होती है।', bn: 'পুরো পরিপক্ক হওয়ার পর কাটলে কার্কুমিন সবচেয়ে বেশি পাওয়া যায়।' } },
    ],
  },
  Chickpea: {
    totalDays: 105,
    stages: [
      { key: 'sowing', icon: '🌱', days: '0–7', daysNum: [0,7], activities: { en: 'Sow at 7–10cm depth for moisture. Space rows 30cm.', hi: 'नमी के लिए 7-10 सेमी गहराई पर बोएं। कतारों में 30 सेमी दूरी रखें।', bn: 'আর্দ্রতার জন্য ৭-১০ সেমি গভীরে বুনুন। সারির মধ্যে ৩০ সেমি দূরত্ব রাখুন।' }, tips: { en: 'Treatment against wilt disease is mandatory.', hi: 'मुरझाना (विल्ट) रोग के खिलाफ उपचार अनिवार्य है।', bn: 'উইল্ট রোগের বিরুদ্ধে চিকিৎসা বাধ্যতামূলক।' } },
      { key: 'germination', icon: '🌿', days: '7–20', daysNum: [7,20], activities: { en: 'Monitor soil moisture. Light weeding after 15 days.', hi: 'मिट्टी की नमी पर नजर रखें। 15 दिन बाद हल्की निराई करें।', bn: 'মাটির আর্দ্রতা পর্যবেক্ষণ করুন। ১৫ দিন পর হালকা আগাছা পরিষ্কার করুন।' }, tips: { en: 'Sensitive to frost in the early morning.', hi: 'सुबह के समय पाले के प्रति संवेदनशील।', bn: 'ভোরে কুয়াশা বা ঠান্ডায় গাছ বেশি ক্ষতিগ্রস্ত হয়।' } },
      { key: 'growing', icon: '🌾', days: '20–85', daysNum: [20,85], activities: { en: 'Nipping (cutting top) to promote branching. Flowering stage.', hi: 'शाखाओं को बढ़ावा देने के लिए सिरे काटें (Nipping)। फूल आने की अवस्था।', bn: 'অধিক ডালপালার জন্য নিপিং করুন। ফুল আসার পর্যায়।' }, tips: { en: 'High water demand during flowering; avoid excess now.', hi: 'फूल आने के दौरान पानी की मांग अधिक, लेकिन ज्यादा पानी से बचें।', bn: 'ফুল আসার সময় পানির চাহিদা বেশি; অতিরিক্ত সেচ এড়িয়ে চলুন।' } },
      { key: 'fertilizing', icon: '🌿', days: '0–30', daysNum: [0,30], activities: { en: 'Phosphorus is key for better pod development.', hi: 'फलियों के बेहतर विकास के लिए फास्फोरस प्रमुख है।', bn: 'শুঁটি ভালো হওয়ার জন্য ফসফরাস সবচেয়ে জরুরি।' }, tips: { en: 'Fixes its own nitrogen; basal NPK is enough.', hi: 'यह अपना नाइट्रोजन खुद बनाता है; शुरुआती NPK काफी है।', bn: 'নিজে নিজেই নাইট্রোজেন তৈরি করে; তাই শুরুর NPK-ই যথেষ্ট।' } },
      { key: 'harvesting', icon: '🚜', days: '95–105', daysNum: [95,105], activities: { en: 'Harvest when leaves turn reddish-brown and dry.', hi: 'जब पत्तियां लाल-भूरे रंग की होकर सूख जाएं तब काटें।', bn: 'পাতা লালচে-বাদামী হয়ে শুকিয়ে গেলে ফসল সংগ্রহ করুন।' }, tips: { en: 'Dry to 10% moisture before storing in cool place.', hi: 'ठंडे स्थान पर रखने से पहले 10% नमी तक सुखाएं।', bn: 'ঠাণ্ডা জায়গায় মজুত করার আগে ১০% আর্দ্রতায় শুকিয়ে নিন।' } },
    ],
  },
  Tomato: {
    totalDays: 110,
    stages: [
      { key: 'sowing', icon: '🌱', days: '0–30', daysNum: [0,30], activities: { en: 'Sow in nursery beds. Transplant when 10cm tall.', hi: 'नर्सरी बेड में बोएं। 10 सेमी लंबे होने पर रोपाई करें।', bn: 'নার্সারিতে বীজ বপন করুন। ১০ সেমি লম্বা হলে মূল মাঠে রোপণ করুন।' }, tips: { en: 'Use disease-free seeds from trusted source.', hi: 'भरोसेमंद स्रोत से रोग मुक्त बीजों का उपयोग करें।', bn: 'বিশ্বস্ত উৎস থেকে রোগমুক্ত বীজ ব্যবহার করুন।' } },
      { key: 'germination', icon: '🌿', days: '30–50', daysNum: [30,50], activities: { en: 'Staking plants for support. Regular irrigation.', hi: 'पौधों को सहारा देने के लिए डंडे लगाएं। नियमित सिंचाई।', bn: 'গাছকে ঠেকনা দিয়ে বেঁধে দিন। নিয়মিত সেচ দিন।' }, tips: { en: 'Mulching helps preserve soil moisture.', hi: 'मल्चिंग मिट्टी की नमी बनाए रखने में मदद करती है।', bn: 'মালচিং মাটির আর্দ্রতা ধরে রাখতে সাহায্য করে।' } },
      { key: 'growing', icon: '🌾', days: '50–90', daysNum: [50,90], activities: { en: 'Peak flowering & fruiting. High potassium requirement.', hi: 'फूल आने और फल लगने का समय। पोटाश की अधिक आवश्यकता।', bn: 'ফুল ও ফল আসার ভরা মৌসুম। পটাশ সারের বিশেষ প্রয়োজন।' }, tips: { en: 'Remove lower leaves to improve air circulation.', hi: 'हवा के संचार के लिए नीचे की पत्तियां हटा दें।', bn: 'বাতাস চলাচলের সুবিধার্থে নিচের পাতাগুলো ছেঁটে দিন।' } },
      { key: 'fertilizing', icon: '🌿', days: '30–75', daysNum: [30,75], activities: { en: 'Apply NPK every 20 days. Focus on Calcium to prevent rot.', hi: 'हर 20 दिन में NPK डालें। सड़न रोकने के लिए कैल्शियम पर ध्यान दें।', bn: 'প্রতি ২০ দিনে NPK দিন। পচন রোধে ক্যালসিয়ামের দিকে নজর দিন।' }, tips: { en: 'Calcium deficiency causes Blossom End Rot.', hi: 'कैल्शियम की कमी से फल नीचे से सड़ने लगते हैं।', bn: 'ক্যালসিয়ামের অভাবে ফলের নিচের অংশে পচন ধরে।' } },
      { key: 'harvesting', icon: '🚜', days: '90–110', daysNum: [90,110], activities: { en: 'Harvest based on market distance (green/pink/red).', hi: 'बाजार की दूरी के आधार पर तुड़ाई करें (हरे/गुलाबी/लाल)।', bn: 'বাজারের দূরত্বের ভিত্তিতে টমেটো সংগ্রহ করুন (সবুজ/গোলাপী/লাল)।' }, tips: { en: 'Pick with stalk to keep fruit fresh longer.', hi: 'ताजा रखने के लिए डंठल के साथ तोड़ें।', bn: 'টমেটো সতেজ রাখতে বোঁটা সহ ছিঁড়ুন।' } },
    ],
  },
  Potato: {
    totalDays: 100,
    stages: [
      { key: 'sowing', icon: '🌱', days: '0–10', daysNum: [0,10], activities: { en: 'Plant cut seed tubers with healthy eyes. Depth 10cm.', hi: 'स्वस्थ आँखों वाले आलू के टुकड़े लगाएं। 10 सेमी गहराई।', bn: 'সুস্থ চারা সম্বলিত আলু রোপণ করুন। গভীরতা ১০ সেমি।' }, tips: { en: 'Tubers should be sprouted before planting.', hi: 'लगाने से पहले आलुओं में अंकुर आ जाने चाहिए।', bn: 'রোপণের আগে আলুর বীজ অঙ্কুরিত হওয়া উচিত।' } },
      { key: 'germination', icon: '🌿', days: '10–25', daysNum: [10,25], activities: { en: 'Irrigate immediately after planting. Monitor weeds.', hi: 'लगाने के तुरंत बाद सिंचाई करें। खरपतवार देखें।', bn: 'রোপণের পরপরই সেচ দিন। আগাছার নজর রাখুন।' }, tips: { en: 'Avoid deep planting in heavy soils.', hi: 'भारी मिट्टी में ज्यादा गहराई में न लगाएं।', bn: 'ভারী মাটিতে বেশি গভীরে রোপণ করবেন না।' } },
      { key: 'growing', icon: '🌾', days: '25–85', daysNum: [25,85], activities: { en: 'Tuber bulking phase. Earthing-up is critical twice.', hi: 'आलू फूलने की अवस्था। दो बार मिट्टी चढ़ाना बहुत जरूरी है।', bn: 'আলু পুষ্ট হওয়ার পর্যায়। দুবার মাটি তুলে দেওয়া খুব দরকার।' }, tips: { en: 'Late blight is a major threat in cloudy/wet weather.', hi: 'बादल / उमस में झुलसा रोग (Late blight) बड़ा खतरा है।', bn: 'মেঘলা বা ভেজা আবহাওয়ায় লেট ব্লাইট বড় সমস্যা।' } },
      { key: 'fertilizing', icon: '🌿', days: '15–60', daysNum: [15,60], activities: { en: 'High potassium (Potash) required for tuber sizing.', hi: 'आलू के आकार के लिए अधिक पोटाश की आवश्यकता है।', bn: 'আলু বড় হওয়ার জন্য প্রচুর পটাশ প্রয়োজন।' }, tips: { en: 'Excess nitrogen late in season reduces storage life.', hi: 'देर से अधिक नाइट्रोजन डालने से भंडारण क्षमता कम होती है।', bn: 'শেষ সময়ে বেশি নাইট্রোজেন দিলে সংরক্ষণের ক্ষমতা কমে যায়।' } },
      { key: 'harvesting', icon: '🚜', days: '85–100', daysNum: [85,100], activities: { en: 'Stop water 2 weeks prior. Remove vines (dehaulm).', hi: '2 हफ्ते पहले पानी बंद करें। बेलें काट दें (Dehaulm)।', bn: '২ সপ্তাহ আগে সেচ বন্ধ করুন। গাছের ডাল ছেঁটে ফেলুন।' }, tips: { en: 'Cure harvested potatoes for 10 days to skin toughen.', hi: 'त्वचा को सख्त करने के लिए आलुओं को 10 दिन सुखाएं।', bn: 'আলুর খোসা শক্ত করতে এটি ১০ দিন ছায়ায় বিছিয়ে রাখুন।' } },
    ],
  },
  Banana: {
    totalDays: 360,
    stages: [
      { key: 'sowing', icon: '🌱', days: '0–30', daysNum: [0,30], activities: { en: 'Plant healthy, disease-free suckers in deep pits.', hi: 'गहरे गड्ढों में स्वस्थ और रोगमुक्त पौधे (suckers) लगाएं।', bn: 'গভীর গর্তে সুস্থ ও রোগমুক্ত চারা রোপণ করুন।' }, tips: { en: 'Treat suckers with fungicide before planting.', hi: 'लगाने से पहले पौधों को फफूंदनाशक से उपचारित करें।', bn: 'রোপণের আগে চারা ছত্রাকনাশক দিয়ে শোধন করুন।' } },
      { key: 'germination', icon: '🌿', days: '30–120', daysNum: [30,120], activities: { en: 'Early vegetative growth. Maintain soil moisture.', hi: 'शुरुआती वानस्पतिक वृद्धि। मिट्टी की नमी बनाए रखें।', bn: 'প্রাথমিক বৃদ্ধি। মাটির আর্দ্রতা বজায় রাখুন।' }, tips: { en: 'Desuckering (remove extra shoots) is important.', hi: 'अतिरिक्त पौधों को निकालना (Desuckering) महत्वपूर्ण है।', bn: 'অতিরিক্ত চারা অপসারণ (ডিসাকাররিং) করা খুব জরুরি।' } },
      { key: 'growing', icon: '🌾', days: '120–270', daysNum: [120,270], activities: { en: 'Flower bud emergence. Propping of heavy bunches.', hi: 'फूल आने की अवस्था। भारी गुच्छों को सहारा दें।', bn: 'ফুল বা মোচা আসার পর্যায়। কলার কান্দিকে ঠেকনা দিন।' }, tips: { en: 'Banana needs high water and heavy composting.', hi: 'केले को अधिक पानी और भारी खाद की आवश्यकता होती है।', bn: 'কলা চাষে প্রচুর পানি ও সারের প্রয়োজন হয়।' } },
      { key: 'fertilizing', icon: '🌿', days: '60–240', daysNum: [60,240], activities: { en: 'Frequent split doses of NPK. Rich organic matter.', hi: 'NPK के बार-बार विभाजित खुराक। भरपूर जैविक खाद।', bn: 'NPK-এর ঘন ঘন বিভক্ত মাত্রা। প্রচুর জৈব সার দিন।' }, tips: { en: 'Potash deficiency leads to small, poor-quality fruit.', hi: 'पोटाश की कमी से फल छोटे और खराब गुणवत्ता के होते हैं।', bn: 'পটাশ সারের অভাবে ফল ছোট ও নিম্নমানের হয়।' } },
      { key: 'harvesting', icon: '🚜', days: '300–360', daysNum: [300,360], activities: { en: 'Harvest when fruit ridges turn round and dull green.', hi: 'जब फल के उभार गोल हो जाएं और रंग हल्का हरा हो जाए।', bn: 'ফলের শৈলশিরা বা উঁচ অংশ গোলাকার হলে সংগ্রহ করুন।' }, tips: { en: 'Handle bunches carefully to avoid visible bruising.', hi: 'निशान और चोट से बचाने के लिए गुच्छों को सावधानी से रखें।', bn: 'দাগ পড়া এড়াতে কলার কান্দি সাবধানে নাড়াচাড়া করুন।' } },
    ],
  },
  Onion: {
    totalDays: 140,
    stages: [
      { key: 'sowing', icon: '🌱', days: '0–45', daysNum: [0,45], activities: { en: 'Sow in nursery. Transplant 6-8 week old seedlings.', hi: 'नर्सरी में बोएं। 6-8 सप्ताह के पौधों का प्रत्यारोपण करें।', bn: 'বীজতলা প্রস্তুত করুন। ৬-৮ সপ্তাহের চারা রোপণ করুন।' }, tips: { en: 'Avoid deep transplanting for better bulb size.', hi: 'बेहतर आकार के लिए ज्यादा गहराई में रोपाई न करें।', bn: 'উন্নত মানের পেঁয়াজের জন্য বেশি গভীরে রোপণ করবেন না।' } },
      { key: 'germination', icon: '🌿', days: '45–70', daysNum: [45,70], activities: { en: 'Regular moisture. Keep field free of weeds.', hi: 'नियमित नमी। खेत को खरपतवार मुक्त रखें।', bn: 'নিয়মিত আর্দ্রতা রাখুন। মাঠ আগাছামুক্ত রাখুন।' }, tips: { en: 'Sensitive to weed competition in early stages.', hi: 'शुरुआती चरणों में खरपतवारों के प्रति बहुत संवेदनशील।', bn: 'শুরুর দিকে আগাছার প্রভাবে ফলন খুব বেশি কমে যায়।' } },
      { key: 'growing', icon: '🌾', days: '70–120', daysNum: [70,120], activities: { en: 'Bulb enlargement phase. Critical irrigation demand.', hi: 'गठाव बढ़ने की अवस्था। सिंचाई की बहुत मांग।', bn: 'পেঁয়াজ পুষ্ট হওয়ার পর্যায়। প্রচুর পানির চাহিদা।' }, tips: { en: 'Sudden dry-to-wet cycle causes bulb splitting.', hi: 'अचानक सूखे से गीले होने पर प्याज़ फट सकते हैं।', bn: 'মাটি শুকনো থাকা ও সেচ দেওয়ায় পেঁয়াজ ফেটে যাওয়ার সম্ভাবনা থাকে।' } },
      { key: 'fertilizing', icon: '🌿', days: '45–90', daysNum: [45,90], activities: { en: 'Apply NPK. Avoid late nitrogen to prevent rot.', hi: 'NPK डालें। सड़न रोकने के लिए देर से नाइट्रोजन न डालें।', bn: 'NPK দিন। পচন রোধে শেষ সময়ে নাইট্রোজেন দেবেন না।' }, tips: { en: 'Sulphur improves pungency and storage life.', hi: 'सल्फर तीखापन और भंडारण जीवन में सुधार करता है।', bn: 'সালফার পেঁয়াজের ঝাঁঝ ও মজুত ক্ষমতা বাড়ায়।' } },
      { key: 'harvesting', icon: '🚜', days: '120–140', daysNum: [120,140], activities: { en: 'Harvest when 50% tops fall over (neck break).', hi: 'जब 50% पौधों की ऊपरी गर्दन झुक जाए तब कटाई करें।', bn: 'গাছের ওপরের দিকের অর্ধেক অংশ শুকিয়ে ভেঙে পড়লে পেঁয়াজ তুলুন।' }, tips: { en: 'Field curing for 3 days before neck trimming.', hi: 'गर्दन काटने से पहले 3 दिनों तक खेत में सुखाएं।', bn: 'বোঁটা কাটার আগে ৩ দিন রৌদ্রে বিছিয়ে রাখুন।' } },
    ],
  },
  Lentil: {
    totalDays: 120,
    stages: [
      { key: 'sowing', icon: '🌱', days: '0–7', daysNum: [0,7], activities: { en: 'Sow at 4cm depth. Maintain row spacing 25cm.', hi: '4 सेमी गहराई पर बोएं। कतारों के बीच 25 सेमी दूरी रखें।', bn: '৪ সেমি গভীরে বুনুন। সারির দূরত্ব ২৫ সেমি রাখুন।' }, tips: { en: 'Use inoculants for effective nitrogen fixation.', hi: 'प्रभावी नाइट्रोजन स्थिरीकरण के लिए टीकों का प्रयोग करें।', bn: 'শিকড়ে ভালো নাইট্রোজেন জমার জন্য শোধন জরুরি।' } },
      { key: 'germination', icon: '🌿', days: '7–25', daysNum: [7,25], activities: { en: 'Keep soil moist. Watch for seedling rots.', hi: 'मिट्टी नम रखें। पौधों के सड़ने पर नजर रखें।', bn: 'মাটি আর্দ্র রাখুন। চারা পচন পর্যবেক্ষণ করুন।' }, tips: { en: 'Cold tolerant but sensitive to waterlogging.', hi: 'ठंड सहिष्णु लेकिन जलभराव के प्रति संवेदनशील।', bn: 'শীত সহ্য করতে পারে কিন্তু জলাবদ্ধতা সহ্য হয় না।' } },
      { key: 'growing', icon: '🌾', days: '25–100', daysNum: [25,100], activities: { en: 'Vegetative to flowering stage. Control aphids.', hi: 'वनस्पति से फूल आने की अवस्था। एफिड्स को नियंत्रित करें।', bn: 'প্রধান বৃদ্ধি থেকে ফুল আসার পর্যায়। জাব পোকা নিয়ন্ত্রণ করুন।' }, tips: { en: 'Critical water required at flowering and pod fill.', hi: 'फूल आने और फली भरने के समय पानी की मांग।', bn: 'ফুল ও শুঁটি পুষ্ট হওয়ার সময়ে সেচ দেওয়া দরকার।' } },
      { key: 'fertilizing', icon: '🌿', days: '0–30', daysNum: [0,30], activities: { en: 'Requires little nitrogen but benefits from P and S.', hi: 'कम नाइट्रोजन चाहिए लेकिन P और S से लाभ होता है।', bn: 'অল্প নাইট্রোজেন লাগে তবে ফসফরাস ও সালফার দিলে ভালো।' }, tips: { en: 'Avoid fertilizer contact with seeds.', hi: 'खाद को बीजों के संपर्क में आने से बचाएं।', bn: 'সারের যেন সরাসরি বীজের সংস্পর্শে না আসে।' } },
      { key: 'harvesting', icon: '🚜', days: '110–120', daysNum: [110,120], activities: { en: 'Harvest when pods turn golden brown and rattling.', hi: 'जब फलियाँ सुनहरी भूरी हो जाएँ और खड़खड़ाएँ।', bn: 'শুঁটি সোনালি বাদামী হয়ে আওয়াজ করলে সংগ্রহ করুন।' }, tips: { en: 'Immediate drying and safe storage to avoid bruchids.', hi: 'भुनगों (bruchids) से बचने के लिए तुरंत सुखाएं।', bn: 'পোকা থেকে বাঁচতে ফসল তুলে দ্রুত শুকিয়ে নিন।' } },
    ],
  },
};

const DEFAULT_CALENDAR = {
  totalDays: 90,
  stages: [
    { key: 'sowing', icon: '🌱', days: '0–10', daysNum: [0,10], activities: { en: 'Prepare field and sow seeds at proper depth and spacing.', hi: 'खेत तैयार करें और उचित गहराई व दूरी पर बीज बोएं।', bn: 'মাঠ প্রস্তুত করুন এবং সঠিক গভীরতায় বীজ বপন করুন।' }, tips: { en: 'Use certified seeds for better and uniform germination.', hi: 'बेहतर अंकुरण के लिए प्रमाणित बीज उपयोग करें।', bn: 'ভালো অঙ্কুরোদগমের জন্য প্রত্যয়িত বীজ ব্যবহার করুন।' } },
    { key: 'germination', icon: '🌿', days: '10–25', daysNum: [10,25], activities: { en: 'Ensure regular moisture. Thin seedlings if overcrowded.', hi: 'नियमित नमी सुनिश्चित करें। घने पौधों को पतला करें।', bn: 'নিয়মিত আর্দ্রতা নিশ্চিত করুন। ঘন চারা পাতলা করুন।' }, tips: { en: 'Protect seedlings from birds and insects.', hi: 'पक्षियों और कीड़ों से पौधों की रक्षा करें।', bn: 'পাখি ও পোকা থেকে চারা রক্ষা করুন।' } },
    { key: 'growing', icon: '🌾', days: '25–65', daysNum: [25,65], activities: { en: 'Water regularly. Control weeds. Monitor for pest and disease.', hi: 'नियमित पानी दें। खरपतवार नियंत्रण। कीट और रोग की निगरानी करें।', bn: 'নিয়মিত পানি দিন। আগাছা নিয়ন্ত্রণ। রোগ-পোকার নজর রাখুন।' }, tips: { en: 'Well-spaced plants get more sunlight and produce better.', hi: 'अच्छी दूरी वाले पौधों को अधिक धूप मिलती है।', bn: 'ভালো ব্যবধানে লাগানো গাছ বেশি সূর্যালোক পায়।' } },
    { key: 'fertilizing', icon: '🌿', days: '15–50', daysNum: [15,50], activities: { en: 'Apply NPK as per crop need. Top dress nitrogen at vegetative stage.', hi: 'फसल की जरूरत के अनुसार NPK डालें। वनस्पति अवस्था में नाइट्रोजन टॉप ड्रेसिंग।', bn: 'ফসলের চাহিদা অনুযায়ী NPK দিন। বনস্পতি পর্যায়ে নাইট্রোজেন টপ ড্রেসিং।' }, tips: { en: 'Do not apply too much fertilizer at once – split doses.', hi: 'एक बार में अधिक खाद न डालें – विभाजित खुराक दें।', bn: 'একবারে অনেক সার দেবেন না – ভাগ করে দিন।' } },
    { key: 'harvesting', icon: '🚜', days: '75–90', daysNum: [75,90], activities: { en: 'Harvest at right maturity. Dry properly before storage.', hi: 'सही पकने पर काटें। भंडारण से पहले अच्छी तरह सुखाएं।', bn: 'সঠিক পরিপক্কতায় কাটুন। সংরক্ষণের আগে ভালোভাবে শুকান।' }, tips: { en: 'Do not delay harvesting – over-ripe crops lead to losses.', hi: 'कटाई में देरी न करें – अधिक पकी फसल से नुकसान होता है।', bn: 'কাটাই দেরি করবেন না – অতিরিক্ত পাকা ফসল নষ্ট হয়।' } },
  ],
};

const STAGE_COLORS = {
  sowing: { bg: 'bg-yellow-50', border: 'border-yellow-300', badge: 'bg-yellow-500', text: 'text-yellow-800' },
  germination: { bg: 'bg-green-50', border: 'border-green-300', badge: 'bg-green-500', text: 'text-green-800' },
  growing: { bg: 'bg-emerald-50', border: 'border-emerald-300', badge: 'bg-emerald-600', text: 'text-emerald-800' },
  fertilizing: { bg: 'bg-blue-50', border: 'border-blue-300', badge: 'bg-blue-500', text: 'text-blue-800' },
  harvesting: { bg: 'bg-orange-50', border: 'border-orange-300', badge: 'bg-orange-500', text: 'text-orange-800' },
};

export default function CropCalendarTab() {
  const { t, lang, formData } = useApp();
  const [selectedCrop, setSelectedCrop] = useState(formData?.crop || '');
  const [calendar, setCalendar] = useState(null);

  function handleView() {
    if (!selectedCrop) return;
    const data = CALENDAR_DATA[selectedCrop] || DEFAULT_CALENDAR;
    setCalendar(data);
  }

  const inputClass = 'w-full border-2 border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:border-green-600 bg-white';

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-xl font-bold text-green-800 mb-4 flex items-center gap-2">
          📅 {t.calendar.title}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t.calendar.selectCrop} *</label>
            <select
              value={selectedCrop}
              onChange={e => { setSelectedCrop(e.target.value); setCalendar(null); }}
              className={inputClass}
            >
              <option value="">{t.calendar.selectCrop}</option>
              {cropDatabase.map(c => (
                <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleView}
            disabled={!selectedCrop}
            className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 rounded-lg text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            📅 {t.calendar.viewCalendar}
          </button>
        </div>
      </div>

      {calendar && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-bold text-gray-500 uppercase mb-3">Crop Timeline ({calendar.totalDays} days)</p>
            <div className="flex h-8 rounded-full overflow-hidden">
              {calendar.stages.map((stage, i) => {
                const colors = STAGE_COLORS[stage.key] || STAGE_COLORS.growing;
                const [start, end] = stage.daysNum;
                const width = ((end - start) / calendar.totalDays) * 100;
                return (
                  <div
                    key={i}
                    className={`${colors.badge} flex items-center justify-center text-white text-xs font-bold`}
                    style={{ width: `${Math.max(10, width)}%` }}
                    title={stage.key}
                  >
                    {stage.icon}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Day 0</span>
              <span>Day {calendar.totalDays}</span>
            </div>
          </div>

          {/* Stage cards */}
          {calendar.stages.map((stage, i) => {
            const colors = STAGE_COLORS[stage.key] || STAGE_COLORS.growing;
            return (
              <div key={i} className={`${colors.bg} border-2 ${colors.border} rounded-xl p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{stage.icon}</span>
                    <div>
                      <p className={`font-bold text-base ${colors.text}`}>{t.calendar[stage.key] || stage.key}</p>
                      <p className="text-xs text-gray-500">{t.calendar.daysAfterSowing}: {stage.days}</p>
                    </div>
                  </div>
                  <span className={`${colors.badge} text-white text-xs font-bold px-3 py-1 rounded-full`}>
                    Day {stage.days}
                  </span>
                </div>
                <div className="bg-white rounded-lg p-3 mb-2">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">📋 {t.calendar.activity}</p>
                  <p className="text-sm text-gray-700">{stage.activities[lang] || stage.activities.en}</p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-1">💡 {t.calendar.tips}</p>
                  <p className="text-sm text-gray-700">{stage.tips[lang] || stage.tips.en}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
