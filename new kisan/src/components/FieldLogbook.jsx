import { useState } from 'react';
import { useApp } from '../context/StateCentral';
import { cropDatabase } from '../data/agriculturalRegistry.js';

const ACTIVITY_ICONS = {
  irrigation: '💧', spraying: '🌿', sowing: '🌱',
  harvesting: '🚜', ploughing: '🌾', weeding: '🔨',
};
const EXPENSE_ICONS = {
  seeds: '🌱', fertilizer: '🌿', pesticide: '🧪',
  labor: '👷', equipment: '⚙️', other: '📦',
};

export default function TrackerTab() {
  const { t, lang, tracker, setTracker, formData } = useApp();
  const [activeSection, setActiveSection] = useState('activities');

  const [actForm, setActForm] = useState({ type: '', date: new Date().toISOString().slice(0, 10), notes: '' });
  const [expForm, setExpForm] = useState({ category: '', amount: '', crop: formData?.crop || '', date: new Date().toISOString().slice(0, 10) });

  const inputClass = 'w-full border-2 border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:border-green-600 bg-white';
  const labelClass = 'block text-sm font-semibold text-gray-700 mb-1';

  function addActivity(e) {
    e.preventDefault();
    if (!actForm.type || !actForm.date) return;
    setTracker(prev => ({
      ...prev,
      activities: [{ id: Date.now(), ...actForm }, ...prev.activities],
    }));
    setActForm({ type: '', date: new Date().toISOString().slice(0, 10), notes: '' });
  }

  function addExpense(e) {
    e.preventDefault();
    if (!expForm.category || !expForm.amount) return;
    setTracker(prev => ({
      ...prev,
      expenses: [{ id: Date.now(), ...expForm }, ...prev.expenses],
    }));
    setExpForm({ category: '', amount: '', crop: formData?.crop || '', date: new Date().toISOString().slice(0, 10) });
  }

  function deleteActivity(id) {
    setTracker(prev => ({ ...prev, activities: prev.activities.filter(a => a.id !== id) }));
  }
  function deleteExpense(id) {
    setTracker(prev => ({ ...prev, expenses: prev.expenses.filter(ex => ex.id !== id) }));
  }

  const totalExpense = tracker.expenses.reduce((sum, ex) => sum + parseFloat(ex.amount || 0), 0);

  const activityTypes = Object.keys(t.tracker.activityTypes);
  const expenseCategories = Object.keys(t.tracker.expenseCategories);

  return (
    <div className="space-y-5">
      {/* Total Summary Card */}
      <div className="bg-green-700 text-white rounded-xl p-5">
        <p className="text-green-300 text-sm font-semibold uppercase">{t.tracker.totalExpense}</p>
        <p className="text-4xl font-bold">₹{totalExpense.toLocaleString('en-IN')}</p>
        <div className="flex gap-4 mt-2 text-sm text-green-200">
          <span>📋 {tracker.activities.length} {t.tracker.activities}</span>
          <span>💰 {tracker.expenses.length} {t.tracker.expenses}</span>
        </div>
      </div>

      {/* Tab Toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {['activities', 'expenses'].map(s => (
          <button
            key={s}
            onClick={() => setActiveSection(s)}
            className={`flex-1 py-2 rounded-lg font-semibold text-sm transition-colors ${activeSection === s ? 'bg-white text-green-800 shadow-sm' : 'text-gray-500'}`}
          >
            {s === 'activities' ? `📋 ${t.tracker.activities}` : `💰 ${t.tracker.expenses}`}
          </button>
        ))}
      </div>

      {/* Activities Section */}
      {activeSection === 'activities' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-800 mb-4">➕ {t.tracker.addActivity}</h3>
            <form onSubmit={addActivity} className="space-y-3">
              <div>
                <label className={labelClass}>{t.tracker.activityType} *</label>
                <select value={actForm.type} onChange={e => setActForm(p => ({ ...p, type: e.target.value }))} required className={inputClass}>
                  <option value="">{t.tracker.activityType}</option>
                  {activityTypes.map(k => (
                    <option key={k} value={k}>{ACTIVITY_ICONS[k]} {t.tracker.activityTypes[k]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>{t.tracker.date} *</label>
                <input type="date" value={actForm.date} onChange={e => setActForm(p => ({ ...p, date: e.target.value }))} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t.tracker.notes}</label>
                <input type="text" value={actForm.notes} onChange={e => setActForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes..." className={inputClass} />
              </div>
              <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-lg">
                ✅ {t.tracker.save}
              </button>
            </form>
          </div>

          <div className="space-y-2">
            {tracker.activities.length === 0 ? (
              <div className="text-center text-gray-400 py-8 bg-white rounded-xl border border-gray-200">
                <div className="text-4xl mb-2">📋</div>
                <p>{t.tracker.noActivityRecords}</p>
              </div>
            ) : tracker.activities.map(a => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{ACTIVITY_ICONS[a.type] || '📋'}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{t.tracker.activityTypes[a.type] || a.type}</p>
                    <p className="text-xs text-gray-400">{a.date}{a.notes ? ` • ${a.notes}` : ''}</p>
                  </div>
                </div>
                <button onClick={() => deleteActivity(a.id)} className="text-red-500 hover:text-red-700 text-lg font-bold">✕</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expenses Section */}
      {activeSection === 'expenses' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-800 mb-4">➕ {t.tracker.addExpense}</h3>
            <form onSubmit={addExpense} className="space-y-3">
              <div>
                <label className={labelClass}>{t.tracker.category} *</label>
                <select value={expForm.category} onChange={e => setExpForm(p => ({ ...p, category: e.target.value }))} required className={inputClass}>
                  <option value="">{t.tracker.category}</option>
                  {expenseCategories.map(k => (
                    <option key={k} value={k}>{EXPENSE_ICONS[k]} {t.tracker.expenseCategories[k]}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>{t.tracker.amount} *</label>
                  <input type="number" min="0" value={expForm.amount} onChange={e => setExpForm(p => ({ ...p, amount: e.target.value }))} required placeholder="₹ 0" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>{t.tracker.date} *</label>
                  <input type="date" value={expForm.date} onChange={e => setExpForm(p => ({ ...p, date: e.target.value }))} required className={inputClass} />
                </div>
              </div>
              <div>
                <label className={labelClass}>{t.tracker.crop}</label>
                <select value={expForm.crop} onChange={e => setExpForm(p => ({ ...p, crop: e.target.value }))} className={inputClass}>
                  <option value="">{lang === 'hi' ? 'फसल चुनें (वैकल्पिक)' : lang === 'bn' ? 'ফসল নির্বাচন করুন (ঐচ্ছিক)' : 'Select crop (optional)'}</option>
                  {cropDatabase.map(c => (<option key={c.name} value={c.name}>{c.icon} {c.name}</option>))}
                </select>
              </div>
              <button type="submit" className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-3 rounded-lg">
                ✅ {t.tracker.save}
              </button>
            </form>
          </div>

          {/* By Category Summary */}
          {tracker.expenses.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs font-bold text-gray-500 uppercase mb-3">📊 {t.tracker.summary}</p>
              <div className="space-y-2">
                {expenseCategories.map(cat => {
                  const catTotal = tracker.expenses.filter(e => e.category === cat).reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
                  if (catTotal === 0) return null;
                  return (
                    <div key={cat} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{EXPENSE_ICONS[cat]} {t.tracker.expenseCategories[cat]}</span>
                      <span className="font-bold text-gray-800">₹{catTotal.toLocaleString('en-IN')}</span>
                    </div>
                  );
                })}
                <div className="border-t pt-2 flex justify-between font-bold">
                  <span className="text-gray-800">Total</span>
                  <span className="text-green-700">₹{totalExpense.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {tracker.expenses.length === 0 ? (
              <div className="text-center text-gray-400 py-8 bg-white rounded-xl border border-gray-200">
                <div className="text-4xl mb-2">💰</div>
                <p>{t.tracker.noExpenseRecords}</p>
              </div>
            ) : tracker.expenses.map(ex => (
              <div key={ex.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{EXPENSE_ICONS[ex.category] || '💰'}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{t.tracker.expenseCategories[ex.category] || ex.category}</p>
                    <p className="text-xs text-gray-400">{ex.date}{ex.crop ? ` • ${ex.crop}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-green-700">₹{parseFloat(ex.amount).toLocaleString('en-IN')}</span>
                  <button onClick={() => deleteExpense(ex.id)} className="text-red-500 hover:text-red-700 text-lg font-bold">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
