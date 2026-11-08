import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Bookmark,
  CheckCircle,
  ExternalLink,
  Award,
  ChevronDown,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { PaperRecord } from '../types';

interface ResearchLibraryViewProps {
  papers: PaperRecord[];
  onSelectPaper: (paper: PaperRecord) => void;
  onToggleSave: (id: string) => void;
  onToggleRead: (id: string) => void;
}

export const ResearchLibraryView: React.FC<ResearchLibraryViewProps> = ({
  papers,
  onSelectPaper,
  onToggleSave,
  onToggleRead
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [journalFilter, setJournalFilter] = useState('All');
  const [articleTypeFilter, setArticleTypeFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'impact_factor' | 'citations' | 'title'>('newest');
  const [savedOnly, setSavedOnly] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  // Extract unique filter options from current papers
  const uniqueJournals = useMemo(() => {
    const set = new Set(papers.map(p => p.journal));
    return Array.from(set).sort();
  }, [papers]);

  const uniqueArticleTypes = useMemo(() => {
    const set = new Set(papers.map(p => p.article_type));
    return Array.from(set).sort();
  }, [papers]);

  const uniqueYears = useMemo(() => {
    const set = new Set(papers.map(p => p.publication_date.substring(0, 4)));
    return Array.from(set).sort().reverse();
  }, [papers]);

  // Client filtering & sorting
  const filteredPapers = useMemo(() => {
    let list = [...papers];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.authors.some(a => a.toLowerCase().includes(q)) ||
        p.DOI.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q)
      );
    }

    if (categoryFilter !== 'All') {
      list = list.filter(p => p.category === categoryFilter);
    }

    if (journalFilter !== 'All') {
      list = list.filter(p => p.journal === journalFilter);
    }

    if (articleTypeFilter !== 'All') {
      list = list.filter(p => p.article_type === articleTypeFilter);
    }

    if (yearFilter !== 'All') {
      list = list.filter(p => p.publication_date.startsWith(yearFilter));
    }

    if (savedOnly) {
      list = list.filter(p => p.history?.saved_status === true);
    }

    if (readOnly) {
      list = list.filter(p => p.history?.read_status === true);
    }

    // Sort
    list.sort((a, b) => {
      if (sortBy === 'citations') {
        return (b.citation_count || 0) - (a.citation_count || 0);
      }
      if (sortBy === 'impact_factor') {
        return (b.journal_metric || 0) - (a.journal_metric || 0);
      }
      if (sortBy === 'oldest') {
        return new Date(a.publication_date).getTime() - new Date(b.publication_date).getTime();
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      // default: newest
      return new Date(b.publication_date).getTime() - new Date(a.publication_date).getTime();
    });

    return list;
  }, [papers, searchTerm, categoryFilter, journalFilter, articleTypeFilter, yearFilter, sortBy, savedOnly, readOnly]);

  const resetFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setJournalFilter('All');
    setArticleTypeFilter('All');
    setYearFilter('All');
    setSortBy('newest');
    setSavedOnly(false);
    setReadOnly(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="font-display text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
            Research Library Archive
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-light">
            Permanent repository of verified peer-reviewed cardiovascular & arterial stiffness research papers.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-stone-600 dark:text-stone-400">
          <span>Showing </span>
          <span className="font-medium text-stone-900 dark:text-white tabular-nums">{filteredPapers.length}</span>
          <span> of </span>
          <span className="font-medium text-stone-900 dark:text-white tabular-nums">{papers.length}</span>
          <span> papers</span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-xs space-y-4">
        
        {/* Search Input Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, author name, DOI, or keywords (e.g., cfPWV, FMD, aortic stiffness)..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 rounded-lg text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-stone-400 focus:border-stone-400 font-light"
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Saved Toggle */}
            <button
              onClick={() => setSavedOnly(!savedOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                savedOnly
                  ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-stone-300 dark:border-stone-600'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-50'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${savedOnly ? 'fill-current' : ''}`} />
              <span>Saved Only</span>
            </button>

            {/* Read Toggle */}
            <button
              onClick={() => setReadOnly(!readOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border transition-colors ${
                readOnly
                  ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-stone-300 dark:border-stone-600'
                  : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:bg-stone-50'
              }`}
            >
              <CheckCircle className={`w-3.5 h-3.5 ${readOnly ? 'fill-current' : ''}`} />
              <span>Read Only</span>
            </button>

            {/* Reset */}
            <button
              onClick={resetFilters}
              title="Reset all filters"
              className="p-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 border border-stone-200 dark:border-stone-700 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Dropdowns Row: Category, Journal, Article Type, Year, Sort */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 border-t border-stone-100 dark:border-stone-800">
          {/* Category */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">
              Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-1.5 px-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-800 dark:text-stone-200 font-light"
            >
              <option value="All">All Categories</option>
              <option value="Arterial Stiffness">Arterial Stiffness</option>
              <option value="Endothelial Function">Endothelial Function</option>
              <option value="Cardiovascular Disease">Cardiovascular Disease</option>
              <option value="Related Research">Related Research</option>
            </select>
          </div>

          {/* Journal */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">
              Journal
            </label>
            <select
              value={journalFilter}
              onChange={(e) => setJournalFilter(e.target.value)}
              className="w-full py-1.5 px-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-800 dark:text-stone-200 font-light"
            >
              <option value="All">All High-Impact Journals</option>
              {uniqueJournals.map(j => (
                <option key={j} value={j}>{j}</option>
              ))}
            </select>
          </div>

          {/* Article Type */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">
              Article Type
            </label>
            <select
              value={articleTypeFilter}
              onChange={(e) => setArticleTypeFilter(e.target.value)}
              className="w-full py-1.5 px-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-800 dark:text-stone-200 font-light"
            >
              <option value="All">All Article Types</option>
              {uniqueArticleTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Year */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">
              Publication Year
            </label>
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="w-full py-1.5 px-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-800 dark:text-stone-200 font-light"
            >
              <option value="All">All Years</option>
              {uniqueYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-[10px] uppercase font-semibold text-stone-400 block mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-1.5 px-2 text-xs bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md text-stone-800 dark:text-stone-200 font-light"
            >
              <option value="newest">Newest First</option>
              <option value="citations">Number of Citations (Highest)</option>
              <option value="impact_factor">Impact Factor (Highest)</option>
              <option value="oldest">Oldest First</option>
              <option value="title">Paper Title (A-Z)</option>
            </select>
          </div>
        </div>

      </div>

      {/* Papers Results Grid */}
      {filteredPapers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPapers.map(paper => (
            <div
              key={paper.paper_id}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 flex flex-col justify-between hover:border-stone-300 dark:hover:border-stone-700 transition-colors shadow-2xs"
            >
              <div>
                {/* Metadata strip */}
                <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 font-mono mb-2">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-medium text-stone-700 dark:text-stone-300">{paper.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-stone-600 dark:text-stone-400 truncate">{paper.journal}</span>
                    {paper.journal_metric > 0 && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">IF: {paper.journal_metric.toFixed(1)}</span>
                      </>
                    )}
                    {typeof paper.citation_count === 'number' && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums font-semibold text-stone-800 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                          {paper.citation_count.toLocaleString()} cit.
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onToggleSave(paper.paper_id)}
                      className={`p-1 rounded text-xs transition-colors ${
                        paper.history?.saved_status
                          ? 'text-stone-900 dark:text-stone-100'
                          : 'text-stone-400 hover:text-stone-600'
                      }`}
                      title={paper.history?.saved_status ? 'Remove Bookmark' : 'Bookmark'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${paper.history?.saved_status ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={() => onToggleRead(paper.paper_id)}
                      className={`p-1 rounded text-xs transition-colors ${
                        paper.history?.read_status
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-stone-400 hover:text-stone-600'
                      }`}
                      title={paper.history?.read_status ? 'Mark Unread' : 'Mark Read'}
                    >
                      <CheckCircle className={`w-3.5 h-3.5 ${paper.history?.read_status ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3
                  onClick={() => onSelectPaper(paper)}
                  className="cursor-pointer font-display text-base sm:text-lg font-semibold text-stone-900 dark:text-stone-100 hover:text-stone-600 dark:hover:text-stone-300 transition-colors leading-snug line-clamp-2 mb-2"
                >
                  {paper.title}
                </h3>

                {/* Authors */}
                <p className="text-sm text-stone-600 dark:text-stone-400 truncate mb-3 font-normal">
                  {paper.authors.join(' · ')}
                </p>

                {/* Abstract snippet */}
                <p className="text-sm text-stone-700 dark:text-stone-300 line-clamp-3 leading-relaxed mb-4 font-normal">
                  {paper.abstract}
                </p>
              </div>

              {/* Bottom footer */}
              <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>
                    {paper.citation_count ? `${paper.citation_count.toLocaleString()} Citations · ` : ''}
                    Verified · {paper.publication_date.substring(0, 4)}
                  </span>
                </span>

                <button
                  onClick={() => onSelectPaper(paper)}
                  className="font-medium text-stone-900 dark:text-stone-100 hover:underline"
                >
                  Examine Analysis &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
          <BookOpen className="w-8 h-8 mx-auto text-stone-400 mb-2" />
          <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100">
            No papers matched your search criteria
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4 font-light">
            Try adjusting your keyword query, category filter, or reset all active filters.
          </p>
          <button
            onClick={resetFilters}
            className="px-3.5 py-1.5 text-xs font-medium text-stone-900 dark:text-stone-100 bg-stone-200 dark:bg-stone-800 rounded-lg hover:bg-stone-300 dark:hover:bg-stone-700"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
};
