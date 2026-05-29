import { useEffect } from 'react';
import { useApp } from '../context/StateCentral';
import { statesAndDistricts, soilTypes } from '../data/geographyData.js';
import { cropDatabase } from '../data/agriculturalRegistry.js';

export default function FarmerInput({ onSubmit, submitLabel, loading, showCropSelect }) {
  const { t, lang, formData, setFormData } = useApp();

  const districts = formData.state ? (statesAndDistricts[formData.state] || []) : [];

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'state') {
      setFormData(prev => ({ ...prev, state: value, district: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(formData);
  }

  const inputClass = "w-full border-2 border-gray-300 rounded-lg p-3 text-base focus:outline-none focus:border-green-600 bg-white";
  const labelClass = "block text-sm font-semibold text-gray-700 mb-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* State + District */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>{t.form.state} *</label>
          <select
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="">{t.form.selectState}</option>
            {Object.keys(statesAndDistricts).sort().map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{t.form.district} *</label>
          <select
            name="district"
            value={formData.district}
            onChange={handleChange}
            required
            disabled={!formData.state}
            className={inputClass + (formData.state ? '' : ' bg-gray-100 text-gray-400')}
          >
            <option value="">{t.form.selectDistrict}</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {showCropSelect && (
        <div>
          <label className={labelClass}>{lang === 'hi' ? 'फसल चुनें' : lang === 'bn' ? 'ফসল নির্বাচন করুন' : 'Select Crop'} *</label>
          <select
            name="crop"
            value={formData.crop || ''}
            onChange={handleChange}
            required
            className={inputClass}
          >
            <option value="">{lang === 'hi' ? 'फसल चुनें' : lang === 'bn' ? 'ফসল নির্বাচন করুন' : 'Select Crop'}</option>
            {cropDatabase.map(c => (
              <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Rainfall + Temperature + Humidity */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>{t.form.rainfall} *</label>
          <input
            type="number"
            name="rainfall"
            value={formData.rainfall}
            onChange={handleChange}
            required
            min="0" max="1000"
            placeholder={t.form.rainfallPlaceholder}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t.form.temperature} *</label>
          <input
            type="number"
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
            required
            min="-5" max="60"
            placeholder={t.form.tempPlaceholder}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t.form.humidity} *</label>
          <input
            type="number"
            name="humidity"
            value={formData.humidity}
            onChange={handleChange}
            required
            min="0" max="100"
            placeholder={t.form.humidityPlaceholder}
            className={inputClass}
          />
        </div>
      </div>

      {/* Soil Type */}
      <div>
        <label className={labelClass}>{t.form.soilType} *</label>
        <select
          name="soilType"
          value={formData.soilType}
          onChange={handleChange}
          required
          className={inputClass}
        >
          <option value="">{t.form.selectSoil}</option>
          {soilTypes.map(s => (
            <option key={s} value={s}>{t.soilTypes[s]}</option>
          ))}
        </select>
      </div>

      {/* NPK */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>{t.form.nitrogen} *</label>
          <input
            type="number"
            name="nitrogen"
            value={formData.nitrogen}
            onChange={handleChange}
            required
            min="0" max="300"
            placeholder={t.form.nPlaceholder}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t.form.phosphorus} *</label>
          <input
            type="number"
            name="phosphorus"
            value={formData.phosphorus}
            onChange={handleChange}
            required
            min="0" max="200"
            placeholder={t.form.pPlaceholder}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>{t.form.potassium} *</label>
          <input
            type="number"
            name="potassium"
            value={formData.potassium}
            onChange={handleChange}
            required
            min="0" max="200"
            placeholder={t.form.kPlaceholder}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-4 px-6 rounded-lg text-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? '⏳ ' + (t.prediction.loading || 'Loading...') : submitLabel}
      </button>
    </form>
  );
}
