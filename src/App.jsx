import { useState } from 'react';
import { AppProvider, useApp } from './context/StateCentral';
import HarvestPredictor from './components/HarvestPredictor';
import PlantConsultant from './components/PlantConsultant';
import HealthScanner from './components/HealthScanner';
import FarmInsights from './components/FarmInsights';
import SkyWatcher from './components/SkyWatcher';
import HydrationHelper from './components/HydrationHelper';
import SoilNutritionist from './components/SoilNutritionist';
import ThreatAnalyzer from './components/ThreatAnalyzer';
import SeasonPlanner from './components/SeasonPlanner';
import FieldLogbook from './components/FieldLogbook';
import KnowledgeBase from './components/KnowledgeBase';
import './index.css';

const MAIN_TABS = ['prediction', 'recommendation', 'disease', 'report'];
const SIDEBAR_TABS = ['weather', 'irrigation', 'fertilizer', 'riskPredict', 'calendar', 'tracker', 'faq'];

const TAB_ICONS = {
  prediction: '🌾',
  recommendation: '🌱',
  disease: '🔬',
  report: '📋',
  weather: '🌤️',
  irrigation: '💧',
  fertilizer: '🌿',
  riskPredict: '⚠️',
  calendar: '📅',
  tracker: '💰',
  faq: '❓',
};

function AppContent() {
  const { t, lang, setLang } = useApp();
  const [activeTab, setActiveTab] = useState('prediction');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const LANGS = [
    { code: 'en', label: 'English', short: 'EN' },
    { code: 'hi', label: 'हिंदी', short: 'हि' },
    { code: 'bn', label: 'বাংলা', short: 'বাং' },
  ];

  return (
    <div className="min-h-screen bg-green-50 flex flex-col">
      {/* Header */}
      <header className="bg-green-800 text-white shadow-md no-print">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🌾</span>
            <div>
              <h1 className="text-lg font-bold leading-tight">{t.appTitle}</h1>
              <p className="text-green-300 text-xs hidden sm:block">{t.appSubtitle}</p>
            </div>
          </div>

          {/* Language Toggle & Menu */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-green-900 rounded-lg p-1">
              {LANGS.map(l => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code)}
                  className={`px-2 py-1 rounded text-xs font-bold transition-colors ${
                    lang === l.code
                      ? 'bg-white text-green-800'
                      : 'text-green-300 hover:text-white'
                  }`}
                  title={l.label}
                >
                  {l.short}
                </button>
              ))}
            </div>

            {/* Hamburger Menu */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="text-white hover:text-green-300 focus:outline-none p-1"
              aria-label="Menu"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}
      
      {/* Sidebar Drawer */}
      <div className={`fixed inset-y-0 right-0 w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold text-green-800">{t.tabs.weather ? "Menu" : "मेनू"}</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-gray-800 p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div className="p-3 space-y-1 overflow-y-auto h-full pb-20">
          {SIDEBAR_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                activeTab === tab ? 'bg-green-100 text-green-800 font-semibold' : 'hover:bg-green-50 text-gray-700 font-medium'
              }`}
            >
              <span className="text-2xl">{TAB_ICONS[tab]}</span>
              <span className="text-sm">{t.tabs[tab]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Navigation - Fixed 4 Tabs */}
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-10 no-print">
        <div className="max-w-2xl mx-auto flex justify-between">
          {MAIN_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-1 transition-colors ${
                activeTab === tab
                  ? 'border-b-[4px] border-green-700 text-green-800 bg-green-50'
                  : 'border-b-[4px] border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span className="text-xl leading-none">{TAB_ICONS[tab]}</span>
              <span className="leading-tight text-center font-bold text-[10px] sm:text-xs">{t.tabs[tab]}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-3 py-5 pb-10">
        {activeTab === 'prediction' && <HarvestPredictor />}
        {activeTab === 'recommendation' && <PlantConsultant />}
        {activeTab === 'disease' && <HealthScanner />}
        {activeTab === 'report' && <FarmInsights />}
        {activeTab === 'weather' && <SkyWatcher />}
        {activeTab === 'irrigation' && <HydrationHelper />}
        {activeTab === 'fertilizer' && <SoilNutritionist />}
        {activeTab === 'riskPredict' && <ThreatAnalyzer />}
        {activeTab === 'calendar' && <SeasonPlanner />}
        {activeTab === 'tracker' && <FieldLogbook />}
        {activeTab === 'faq' && <KnowledgeBase />}
      </main>

      {/* Footer */}
      <footer className="bg-green-800 text-green-300 text-center py-3 text-xs no-print">
        {t.footer}
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
