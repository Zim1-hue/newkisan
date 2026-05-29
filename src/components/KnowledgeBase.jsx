import { useState } from 'react';
import { useApp } from '../context/StateCentral';
import { supportQuestions } from '../data/supportQuestions.js';

const CATEGORY_ICONS = {
  soil: '🌍', crop: '🌾', disease: '🦠', irrigation: '💧', weather: '🌤️', general: '❓',
};

export default function FAQTab() {
  const { t, lang } = useApp();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [openId, setOpenId] = useState(null);

  const categories = ['all', ...Object.keys(t.faq.categories)];

  const filtered = supportQuestions.filter(item => {
    const matchCat = activeCategory === 'all' || item.category === activeCategory;
    const q = item.question[lang] || item.question.en;
    const a = item.answer[lang] || item.answer.en;
    const matchSearch = !search || q.toLowerCase().includes(search.toLowerCase()) || a.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <h2 className="text-xl font-bold text-green-800 mb-1 flex items-center gap-2">
          ❓ {t.faq.title}
        </h2>
        <p className="text-sm text-gray-500 mb-4">{t.faq.subtitle}</p>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t.faq.search}
          className="w-full border-2 border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:border-green-600 mb-4"
        />

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-2 rounded-full border transition-colors ${
                activeCategory === cat
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
              }`}
            >
              {cat === 'all' ? `🌿 ${t.faq.all}` : `${CATEGORY_ICONS[cat]} ${t.faq.categories[cat]}`}
            </button>
          ))}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-10 bg-white rounded-xl border border-gray-200">
            <div className="text-4xl mb-2">🔍</div>
            <p>
              {lang === 'hi'
                ? 'कोई प्रश्न नहीं मिला। कोई अन्य खोजें।'
                : lang === 'bn'
                ? 'কোনো প্রশ্ন পাওয়া যায়নি। অন্য কিছু অনুসন্ধান করুন।'
                : 'No questions found. Try a different search.'}
            </p>
          </div>
        ) : filtered.map(item => {
          const question = item.question[lang] || item.question.en;
          const answer = item.answer[lang] || item.answer.en;
          const isOpen = openId === item.id;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl border-2 transition-colors overflow-hidden ${isOpen ? 'border-green-400' : 'border-gray-200'}`}
            >
              <button
                className="w-full text-left p-4 flex items-center justify-between gap-3"
                onClick={() => setOpenId(isOpen ? null : item.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl flex-shrink-0">{CATEGORY_ICONS[item.category] || '❓'}</span>
                  <span className="font-semibold text-gray-800 text-sm leading-snug">{question}</span>
                </div>
                <span className={`text-green-700 font-bold text-xl flex-shrink-0 transition-transform ${isOpen ? 'rotate-45' : ''}`}>+</span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-0">
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-sm text-gray-700 leading-relaxed">{answer}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Count */}
      {filtered.length > 0 && (
        <p className="text-center text-xs text-gray-400">
          {lang === 'hi' 
            ? `${supportQuestions.length} में से ${filtered.length} प्रश्न दिखा रहे हैं`
            : lang === 'bn' 
            ? `${supportQuestions.length} টি প্রশ্নের মধ্যে ${filtered.length} টি দেখাচ্ছে`
            : `Showing ${filtered.length} of ${supportQuestions.length} questions`}
        </p>
      )}
    </div>
  );
}
