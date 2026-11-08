import React, { useState, useEffect, useCallback } from 'react';
import {
  PaperRecord,
  SystemStatusResponse,
  SystemSettings
} from './types';
import {
  fetchSystemStatus,
  fetchPapers,
  fetchSettings,
  triggerManualCycle,
  toggleSavePaper,
  toggleReadPaper
} from './api';
import { TopNav, NavTab } from './components/TopNav';
import { DashboardView } from './components/DashboardView';
import { PaperDetailView } from './components/PaperDetailView';
import { ResearchLibraryView } from './components/ResearchLibraryView';
import { SavedPapersView } from './components/SavedPapersView';
import { SettingsView } from './components/SettingsView';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [papers, setPapers] = useState<PaperRecord[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<PaperRecord | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatusResponse | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [isRunningCycle, setIsRunningCycle] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Sync dark class on document element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const loadData = useCallback(async () => {
    try {
      const [statusRes, papersRes, settingsRes] = await Promise.all([
        fetchSystemStatus(),
        fetchPapers(),
        fetchSettings()
      ]);
      setSystemStatus(statusRes);
      setPapers(papersRes.papers);
      setSettings(settingsRes);

      // If on 'today' tab and no paper selected yet, default to the latest paper
      if (papersRes.papers.length > 0 && !selectedPaper) {
        setSelectedPaper(papersRes.papers[0]);
      }
    } catch (err) {
      console.error('Failed to load initial data:', err);
    }
  }, [selectedPaper]);

  useEffect(() => {
    loadData();
    // Poll status every 30 seconds for background scheduler updates
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(prev => (prev?.text === text ? null : prev));
    }, 4500);
  };

  const handleRunNow = async () => {
    setIsRunningCycle(true);
    try {
      const res = await triggerManualCycle();
      if (res.success) {
        showToast('success', res.message);
        await loadData();
        if (res.paper) {
          setSelectedPaper(res.paper);
          setActiveTab('today');
        }
      } else {
        showToast('info', res.message);
      }
    } catch (err: any) {
      showToast('error', err?.message || 'Manual cycle failed');
    } finally {
      setIsRunningCycle(false);
    }
  };

  const handleSelectPaper = (paper: PaperRecord) => {
    setSelectedPaper(paper);
    setActiveTab('today');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSave = async (id: string) => {
    try {
      const res = await toggleSavePaper(id);
      setPapers(prev => prev.map(p => {
        if (p.paper_id === id) {
          return { ...p, history: res.history };
        }
        return p;
      }));
      if (selectedPaper?.paper_id === id) {
        setSelectedPaper(prev => prev ? { ...prev, history: res.history } : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRead = async (id: string) => {
    try {
      const res = await toggleReadPaper(id);
      setPapers(prev => prev.map(p => {
        if (p.paper_id === id) {
          return { ...p, history: res.history };
        }
        return p;
      }));
      if (selectedPaper?.paper_id === id) {
        setSelectedPaper(prev => prev ? { ...prev, history: res.history } : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaperUpdated = (updated: PaperRecord) => {
    setPapers(prev => prev.map(p => (p.paper_id === updated.paper_id ? updated : p)));
    if (selectedPaper?.paper_id === updated.paper_id) {
      setSelectedPaper(updated);
    }
  };

  const savedCount = papers.filter(p => p.history?.saved_status).length;
  const latestPaper = papers.length > 0 ? papers[0] : null;

  return (
    <div className="min-h-screen bg-[#fafaf9] dark:bg-[#121212] text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Bar adhering to Top Bar Contract */}
      <TopNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onRunNow={handleRunNow}
        isRunningCycle={isRunningCycle}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
        savedCount={savedCount}
      />

      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-lg flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : toastMessage.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-stone-500 shrink-0 mt-0.5" />
          )}
          <div className="flex-1 text-xs text-stone-700 dark:text-stone-300">
            {toastMessage.text}
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 pb-16">
        {activeTab === 'dashboard' && (
          <DashboardView
            latestPaper={latestPaper}
            recentPapers={papers.slice(0, 5)}
            stats={systemStatus?.stats || null}
            isProcessing={isRunningCycle || (systemStatus?.scheduler?.isProcessing || false)}
            onSelectPaper={handleSelectPaper}
            onTabChange={setActiveTab}
            onToggleSave={handleToggleSave}
            onToggleRead={handleToggleRead}
          />
        )}

        {activeTab === 'today' && (
          selectedPaper ? (
            <PaperDetailView
              paper={selectedPaper}
              onBack={() => setActiveTab('dashboard')}
              onPaperUpdated={handlePaperUpdated}
            />
          ) : (
            <div className="max-w-xl mx-auto py-20 text-center">
              <p className="text-sm text-stone-500 font-light">Loading today's paper analysis...</p>
            </div>
          )
        )}

        {activeTab === 'library' && (
          <ResearchLibraryView
            papers={papers}
            onSelectPaper={handleSelectPaper}
            onToggleSave={handleToggleSave}
            onToggleRead={handleToggleRead}
          />
        )}

        {activeTab === 'saved' && (
          <SavedPapersView
            papers={papers}
            onSelectPaper={handleSelectPaper}
            onPaperUpdated={handlePaperUpdated}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onSettingsUpdated={setSettings}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print border-t border-stone-200 dark:border-stone-800/80 bg-white dark:bg-stone-900 py-6 text-xs text-stone-500 dark:text-stone-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-medium text-stone-800 dark:text-stone-200">
              Vascular Research Radar
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-light">Hourly Arterial Stiffness & CVD Digest</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span>Continuous Systematic Surveillance</span>
            <span aria-hidden="true">·</span>
            <span>Clarivate JCR Q1 Filter</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setActiveTab('settings')}
              className="text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:underline"
            >
              System Controls
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
