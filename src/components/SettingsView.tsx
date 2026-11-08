import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Shield,
  Download,
  Clock,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Award,
  RefreshCw,
  Database
} from 'lucide-react';
import { SystemSettings, AutomationLog, JournalMetric } from '../types';
import { updateSettings, fetchJournalMetrics, fetchLogs } from '../api';

interface SettingsViewProps {
  settings: SystemSettings | null;
  onSettingsUpdated: (updated: SystemSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSettingsUpdated
}) => {
  const [formData, setFormData] = useState<SystemSettings | null>(settings);
  const [newJournal, setNewJournal] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [journalMetrics, setJournalMetrics] = useState<JournalMetric[]>([]);
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const [logFilter, setLogFilter] = useState<'all' | 'success' | 'warning' | 'error'>('all');

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  useEffect(() => {
    fetchJournalMetrics()
      .then(res => setJournalMetrics(res.journals))
      .catch(console.error);

    fetchLogs(40)
      .then(res => setLogs(res.logs))
      .catch(console.error);
  }, []);

  if (!formData) return null;

  const handleAddJournal = () => {
    if (!newJournal.trim()) return;
    if (formData.journal_whitelist.includes(newJournal.trim())) return;
    setFormData({
      ...formData,
      journal_whitelist: [...formData.journal_whitelist, newJournal.trim()]
    });
    setNewJournal('');
  };

  const handleRemoveJournal = (journalName: string) => {
    setFormData({
      ...formData,
      journal_whitelist: formData.journal_whitelist.filter(j => j !== journalName)
    });
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      const updated = await updateSettings(formData);
      onSettingsUpdated(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (logFilter === 'all') return true;
    return log.execution_status === logFilter;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="font-display text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
            System & Whitelist Settings
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-light">
            Configure journal quality filtering, automation schedules, and database backups.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white dark:text-stone-900 bg-stone-900 dark:bg-stone-100 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-60"
        >
          {saveSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
              <span>Saved Successfully</span>
            </>
          ) : (
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          )}
        </button>
      </div>

      {/* SECTION 1: Journal Quality Filter & Whitelist */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800 mb-4">
          <Shield className="w-5 h-5 text-stone-600 dark:text-stone-400" />
          <h2 className="font-display text-base font-semibold text-stone-900 dark:text-stone-100">
            Journal Quality Filter & Whitelist
          </h2>
        </div>

        <p className="text-sm text-stone-700 dark:text-stone-300 mb-6 font-normal">
          The radar strictly admits papers from peer-reviewed journals meeting at least one criterion: Impact Factor &ge; threshold, Top 10% in Subject Category, or approved on this Whitelist.
        </p>

        {/* Impact Factor Threshold */}
        <div className="mb-6 max-w-sm">
          <label className="text-sm font-medium text-stone-800 dark:text-stone-200 block mb-1.5">
            Minimum Journal Impact Factor Threshold (JCR)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.5"
              min="1.0"
              max="50.0"
              value={formData.impact_factor_threshold}
              onChange={(e) => setFormData({
                ...formData,
                impact_factor_threshold: parseFloat(e.target.value) || 10.0
              })}
              className="w-24 p-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg font-mono text-stone-900 dark:text-stone-100 font-medium"
            />
            <span className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-normal">
              Default: 10.0 (High-Impact Tier)
            </span>
          </div>
        </div>

        {/* Whitelist Manager */}
        <div className="space-y-3">
          <label className="text-xs font-medium text-stone-800 dark:text-stone-200 block">
            Approved Specialty Journal Whitelist
          </label>

          <div className="flex items-center gap-2 max-w-md">
            <input
              type="text"
              value={newJournal}
              onChange={(e) => setNewJournal(e.target.value)}
              placeholder="e.g. Journal of Hypertension"
              className="flex-1 p-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder:text-stone-400 font-light"
            />
            <button
              onClick={handleAddJournal}
              className="flex items-center gap-1 px-3 py-2 text-xs font-medium bg-stone-900 dark:bg-stone-800 text-white rounded-lg hover:bg-stone-800 dark:hover:bg-stone-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-2">
            {formData.journal_whitelist.map(j => (
              <div
                key={j}
                className="flex items-center justify-between p-2.5 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800 rounded-lg text-xs"
              >
                <span className="font-normal text-stone-800 dark:text-stone-200 truncate pr-2">
                  {j}
                </span>
                <button
                  onClick={() => handleRemoveJournal(j)}
                  className="text-stone-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: Verified JCR Journal Metrics Registry */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800 mb-4">
          <Award className="w-5 h-5 text-stone-600 dark:text-stone-400" />
          <h2 className="font-display text-base font-semibold text-stone-900 dark:text-stone-100">
            Clarivate Journal Citation Reports (JCR) Verified Database
          </h2>
        </div>

        <p className="text-xs text-stone-500 mb-4 font-light">
          Official metrics verified from Journal Citation Reports. No estimated or fabricated metrics.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-stone-200 dark:border-stone-800 rounded-lg">
            <thead className="bg-stone-50 dark:bg-stone-800/70 text-stone-600 dark:text-stone-300 font-medium border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="py-2.5 px-3">Journal Name</th>
                <th className="py-2.5 px-3">Impact Factor</th>
                <th className="py-2.5 px-3">Year</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Quartile</th>
                <th className="py-2.5 px-3">Verification Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 font-mono tabular-nums text-stone-700 dark:text-stone-300 font-light">
              {journalMetrics.map(jm => (
                <tr key={jm.journalName} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/30">
                  <td className="py-2.5 px-3 font-sans font-medium text-stone-900 dark:text-stone-100">
                    {jm.journalName}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-stone-900 dark:text-stone-100">
                    {jm.impactFactor > 0 ? jm.impactFactor.toFixed(1) : 'Whitelist'}
                  </td>
                  <td className="py-2.5 px-3">{jm.impactFactorYear}</td>
                  <td className="py-2.5 px-3 font-sans">{jm.category}</td>
                  <td className="py-2.5 px-3 font-medium text-stone-800 dark:text-stone-200">
                    {jm.quartile}
                  </td>
                  <td className="py-2.5 px-3 font-sans text-stone-500 font-light">
                    {jm.verificationSource}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 3: Scheduler Automation Controls */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
        <div className="flex items-center gap-2 pb-3 border-b border-stone-100 dark:border-stone-800 mb-4">
          <Clock className="w-5 h-5 text-stone-600 dark:text-stone-400" />
          <h2 className="font-display text-base font-semibold text-stone-900 dark:text-stone-100">
            Automation Scheduler Configuration
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div>
            <label className="font-medium text-stone-800 dark:text-stone-200 block mb-1">
              Hourly Automated Discovery
            </label>
            <p className="text-stone-500 mb-3 font-light">
              Independent background daemon executes every 60 minutes, searches for eligible papers, runs scientific synthesis, and updates database.
            </p>
            <label className="flex items-center gap-2 cursor-pointer font-normal text-stone-700 dark:text-stone-300">
              <input
                type="checkbox"
                checked={formData.scheduling_enabled}
                onChange={(e) => setFormData({
                  ...formData,
                  scheduling_enabled: e.target.checked
                })}
                className="rounded border-stone-300 text-stone-800 focus:ring-stone-400"
              />
              <span>Enable Background Hourly Automation</span>
            </label>
          </div>

          <div>
            <label className="font-medium text-stone-800 dark:text-stone-200 block mb-1">
              Cycle Interval (Minutes)
            </label>
            <input
              type="number"
              min="15"
              max="1440"
              value={formData.hourly_interval_minutes}
              onChange={(e) => setFormData({
                ...formData,
                hourly_interval_minutes: parseInt(e.target.value) || 60
              })}
              className="w-24 p-2 text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg font-mono text-stone-900 dark:text-stone-100 mb-2 font-light"
            />
            <p className="text-stone-500 font-light">
              Standard: 60 minutes (1 paper per hourly slot).
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 4: Database Export */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-stone-600 dark:text-stone-400" />
            <h3 className="font-display text-base font-semibold text-stone-900 dark:text-stone-100">
              Permanent Database Export
            </h3>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-light">
            Export the complete archive including papers, structured analyses, figures, reading history, and logs.
          </p>
        </div>

        <a
          href="/api/export"
          download="vascular_research_radar_backup.json"
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-lg transition-colors whitespace-nowrap"
        >
          <Download className="w-4 h-4" />
          <span>Download JSON Backup</span>
        </a>
      </div>

      {/* SECTION 5: Automation Execution Logs */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800 mb-4">
          <div>
            <h2 className="font-display text-base font-semibold text-stone-900 dark:text-stone-100">
              Automation Execution Logs
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-light">
              Audit trail of background hourly discovery cycles and execution statuses.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-800/80 rounded-lg text-xs">
            {(['all', 'success', 'warning', 'error'] as const).map(f => (
              <button
                key={f}
                onClick={() => setLogFilter(f)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                  logFilter === f
                    ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto font-mono text-xs font-light">
          {filteredLogs.map(log => (
            <div
              key={log.id}
              className="p-3 bg-stone-50 dark:bg-stone-800/40 border border-stone-100 dark:border-stone-800 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  log.execution_status === 'success' ? 'bg-emerald-500' :
                  log.execution_status === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
                }`} />
                <span className="font-normal text-stone-800 dark:text-stone-200">
                  {log.selected_paper}
                </span>
                {log.journal && log.journal !== 'N/A' && (
                  <span className="text-stone-500 font-sans font-light">({log.journal})</span>
                )}
              </div>

              <div className="flex items-center gap-3 text-stone-400 text-[11px] shrink-0 font-light">
                <span>{new Date(log.execution_time).toLocaleTimeString()}</span>
                <span className="capitalize text-stone-600 dark:text-stone-300 font-normal">
                  {log.execution_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
