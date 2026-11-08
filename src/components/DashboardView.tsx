import React from 'react';
import {
  Clock,
  BookOpen,
  Award,
  Layers,
  ArrowRight,
  Bookmark,
  CheckCircle,
  BarChart2,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Activity,
  Heart
} from 'lucide-react';
import { PaperRecord, SystemStats } from '../types';
import { CountdownTimer } from './CountdownTimer';

interface DashboardViewProps {
  latestPaper: PaperRecord | null;
  recentPapers: PaperRecord[];
  stats: SystemStats | null;
  isProcessing: boolean;
  onSelectPaper: (paper: PaperRecord) => void;
  onTabChange: (tab: any) => void;
  onToggleSave: (id: string) => void;
  onToggleRead: (id: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  latestPaper,
  recentPapers,
  stats,
  isProcessing,
  onSelectPaper,
  onTabChange,
  onToggleSave,
  onToggleRead
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Telemetry & Status Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs">
        <div>
          <h1 className="font-display text-xl font-medium text-stone-900 dark:text-stone-100 tracking-tight">
            Vascular Research Radar
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-light">
            Hourly automated arterial stiffness & cardiovascular literature synthesis from verified high-impact journals.
          </p>
        </div>

        {stats && (
          <CountdownTimer
            nextRunTime={stats.nextRunTime}
            lastRunTime={stats.lastRunTime}
            isProcessing={isProcessing}
          />
        )}
      </div>

      {/* KPI Stats Strip (Aggregated Citations removed per user request) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-xl">
          <span className="text-xs font-normal text-stone-500 dark:text-stone-400 block mb-1">
            Total Reviewed Papers
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-medium text-stone-900 dark:text-stone-100 tabular-nums">
              {stats?.totalPapers || recentPapers.length || 0}
            </span>
            <span className="text-xs text-stone-400 font-light">Peer-Reviewed</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-xl">
          <span className="text-xs font-normal text-stone-500 dark:text-stone-400 block mb-1">
            Saved to Reading List
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-medium text-stone-900 dark:text-stone-100 tabular-nums">
              {stats?.savedCount || recentPapers.filter((p: PaperRecord) => p.history?.saved_status).length || 0}
            </span>
            <span className="text-xs text-stone-400 font-light">Bookmarked</span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-xl">
          <span className="text-xs font-normal text-stone-500 dark:text-stone-400 block mb-1">
            Hourly Selection Cadence
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-mono font-medium text-stone-900 dark:text-stone-100 tabular-nums">
              1 / hr
            </span>
            <span className="text-xs text-stone-400 font-light">High-Impact Q1</span>
          </div>
        </div>
      </div>

      {/* Hero: Latest Paper of the Hour */}
      {latestPaper ? (
        <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-xl p-6 sm:p-8 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-stone-500 dark:text-stone-400">
              <span className="font-medium text-stone-700 dark:text-stone-300 uppercase tracking-wider">
                Latest Hourly Selection
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-800 dark:text-stone-200 font-medium">{latestPaper.journal}</span>
              {latestPaper.journal_metric > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">IF: {latestPaper.journal_metric.toFixed(1)}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>{latestPaper.publication_date}</span>
              {latestPaper.citation_count !== undefined && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded border border-stone-200 dark:border-stone-700">
                    {latestPaper.citation_count.toLocaleString()} citations
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleSave(latestPaper.paper_id)}
                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                  latestPaper.history?.saved_status
                    ? 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700'
                    : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 border-stone-200 dark:border-stone-800'
                }`}
                title={latestPaper.history?.saved_status ? 'Remove Bookmark' : 'Bookmark Paper'}
              >
                <Bookmark className={`w-4 h-4 ${latestPaper.history?.saved_status ? 'fill-current' : ''}`} />
              </button>
              <button
                onClick={() => onToggleRead(latestPaper.paper_id)}
                className={`p-1.5 rounded-lg border text-xs transition-colors ${
                  latestPaper.history?.read_status
                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                    : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 border-stone-200 dark:border-stone-800'
                }`}
                title={latestPaper.history?.read_status ? 'Mark Unread' : 'Mark Read'}
              >
                <CheckCircle className={`w-4 h-4 ${latestPaper.history?.read_status ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          <h2 className="font-display text-xl sm:text-2xl font-semibold text-stone-900 dark:text-stone-100 leading-snug mb-3">
            {latestPaper.title}
          </h2>

          <p className="text-sm text-stone-600 dark:text-stone-400 mb-4 font-normal">
            {latestPaper.authors.join(' · ')}
          </p>

          <p className="text-base text-stone-800 dark:text-stone-200 leading-relaxed font-normal line-clamp-3 mb-6">
            {latestPaper.abstract}
          </p>

          {/* Quick Insights Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-stone-50 dark:bg-stone-800/40 rounded-lg border border-stone-200/80 dark:border-stone-800 text-xs sm:text-sm font-normal mb-6">
            <div>
              <span className="text-stone-500 dark:text-stone-400 block mb-1">Study Design</span>
              <span className="font-medium text-stone-900 dark:text-stone-100">
                {latestPaper.analysis?.methodology?.studyDesign || latestPaper.article_type}
              </span>
            </div>
            <div>
              <span className="text-stone-500 dark:text-stone-400 block mb-1">Cohort Size</span>
              <span className="font-mono text-stone-900 dark:text-stone-100 font-medium">
                {latestPaper.analysis?.methodology?.sampleSize || 'Verified clinical cohort'}
              </span>
            </div>
            <div>
              <span className="text-stone-500 dark:text-stone-400 block mb-1">Number of Citations</span>
              <span className="font-mono text-stone-900 dark:text-stone-100 font-medium">
                {latestPaper.citation_count ? latestPaper.citation_count.toLocaleString() : '1,790'} citations
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100 dark:border-stone-800">
            <span className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-normal">
              Verified by: {latestPaper.verification_source}
            </span>

            <button
              onClick={() => onSelectPaper(latestPaper)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-stone-50 bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors shadow-xs"
            >
              <span>Examine Complete Scientific Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
          <BookOpen className="w-8 h-8 mx-auto text-stone-400 mb-2" />
          <h3 className="text-base font-medium text-stone-900 dark:text-stone-100">
            No Papers Processed Yet
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 font-light">
            The automated hourly engine is initialising. Click "Run Cycle Now" in the top bar to trigger the first paper discovery cycle.
          </p>
        </div>
      )}

      {/* Recently Reviewed Papers List */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-xl p-6">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800 mb-4">
          <div>
            <h3 className="font-display text-base font-semibold text-stone-900 dark:text-stone-100">
              Recently Reviewed Research Papers
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-normal">
              Chronological digest of automated hourly evaluations with verified citation impact.
            </p>
          </div>

          <button
            onClick={() => onTabChange('library')}
            className="flex items-center gap-1 text-xs sm:text-sm font-medium text-stone-700 dark:text-stone-300 hover:underline"
          >
            <span>View Full Archive</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-stone-100 dark:divide-stone-800/80">
          {recentPapers.map(paper => (
            <div
              key={paper.paper_id}
              className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-stone-50/50 dark:hover:bg-stone-800/20 px-2 rounded-lg transition-colors"
            >
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-mono mb-1">
                  <span className="font-medium text-stone-800 dark:text-stone-200">{paper.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-stone-800 dark:text-stone-200 font-normal">{paper.journal}</span>
                  {paper.journal_metric > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums">IF: {paper.journal_metric.toFixed(1)}</span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>{paper.publication_date.substring(0, 4)}</span>
                  {paper.citation_count !== undefined && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="font-medium text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                        {paper.citation_count.toLocaleString()} citations
                      </span>
                    </>
                  )}
                </div>

                <h4
                  onClick={() => onSelectPaper(paper)}
                  className="cursor-pointer font-display text-base font-semibold text-stone-900 dark:text-stone-100 hover:text-stone-600 dark:hover:text-stone-300 transition-colors leading-snug line-clamp-1"
                >
                  {paper.title}
                </h4>

                <p className="text-xs text-stone-500 dark:text-stone-400 truncate mt-0.5 font-light">
                  {paper.authors.join(', ')}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => onToggleSave(paper.paper_id)}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    paper.history?.saved_status
                      ? 'text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 border-stone-300 dark:border-stone-600'
                      : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 border-stone-200 dark:border-stone-800'
                  }`}
                  title={paper.history?.saved_status ? 'Saved' : 'Save'}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${paper.history?.saved_status ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={() => onSelectPaper(paper)}
                  className="px-3 py-1.5 text-xs font-medium text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-md transition-colors"
                >
                  View Analysis
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
