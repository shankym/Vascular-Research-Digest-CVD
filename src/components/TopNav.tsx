import React from 'react';
import { Play, Sun, Moon, Loader2 } from 'lucide-react';

export type NavTab = 
  | 'dashboard' 
  | 'today' 
  | 'library' 
  | 'saved' 
  | 'settings';

interface TopNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onRunNow: () => void;
  isRunningCycle: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  savedCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  onRunNow,
  isRunningCycle,
  isDarkMode,
  onToggleDarkMode,
  savedCount
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 transition-colors shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-4">
        
        {/* Zone 1: Wordmark with clear, readable typography */}
        <button
          onClick={() => onTabChange('dashboard')}
          className="text-left font-display text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap shrink-0 hover:opacity-80 transition-opacity"
        >
          Vascular Research Radar
        </button>

        {/* Zone 2: Navigation Links (Only valuable tabs: Dashboard, Today's Paper, Library, Saved, Settings) */}
        <nav className="hidden md:flex items-center gap-2 text-sm font-medium text-stone-600 dark:text-stone-400 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onTabChange('dashboard')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-stone-200/80 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                : 'hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            Dashboard
          </button>

          <button
            onClick={() => onTabChange('today')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'today'
                ? 'bg-stone-200/80 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                : 'hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            Today's Paper
          </button>

          <button
            onClick={() => onTabChange('library')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'library'
                ? 'bg-stone-200/80 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                : 'hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            Research Library
          </button>

          <button
            onClick={() => onTabChange('saved')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-stone-200/80 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                : 'hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            <span>Saved & Notes</span>
            {savedCount > 0 && (
              <span className="font-mono text-xs font-semibold tabular-nums px-1.5 py-0.5 rounded-full bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200">
                {savedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onTabChange('settings')}
            className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'settings'
                ? 'bg-stone-200/80 dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-semibold'
                : 'hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800/60'
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Zone 3: 1 primary action + dark mode switch */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onToggleDarkMode}
            aria-label="Toggle dark mode"
            className="p-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            onClick={onRunNow}
            disabled={isRunningCycle}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-stone-50 bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-50 whitespace-nowrap shrink-0"
          >
            {isRunningCycle ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running Cycle...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Cycle Now</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Secondary Navigation Row */}
      <div className="md:hidden flex items-center gap-2 px-4 py-2 border-t border-stone-100 dark:border-stone-800/60 overflow-x-auto text-xs font-medium text-stone-600 dark:text-stone-300">
        {(['dashboard', 'today', 'library', 'saved', 'settings'] as NavTab[]).map(tab => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 text-xs ${
              activeTab === tab
                ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 font-semibold'
                : 'bg-stone-100 dark:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            {tab === 'dashboard' ? 'Dashboard' :
             tab === 'today' ? "Today's Paper" :
             tab === 'library' ? 'Library' :
             tab === 'saved' ? `Saved (${savedCount})` : 'Settings'}
          </button>
        ))}
      </div>
    </header>
  );
};
