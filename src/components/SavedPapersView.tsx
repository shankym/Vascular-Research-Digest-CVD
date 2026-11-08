import React, { useState } from 'react';
import { Bookmark, FileText, ArrowRight, CheckCircle, Trash2, Edit3, Save } from 'lucide-react';
import { PaperRecord } from '../types';
import { updatePaperNotes, toggleSavePaper, toggleReadPaper } from '../api';

interface SavedPapersViewProps {
  papers: PaperRecord[];
  onSelectPaper: (paper: PaperRecord) => void;
  onPaperUpdated: (paper: PaperRecord) => void;
}

export const SavedPapersView: React.FC<SavedPapersViewProps> = ({
  papers,
  onSelectPaper,
  onPaperUpdated
}) => {
  const savedPapers = papers.filter(p => p.history?.saved_status === true);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const startEditNotes = (paper: PaperRecord) => {
    setEditingNotesId(paper.paper_id);
    setTempNotes(paper.history?.personal_notes || '');
  };

  const handleSaveNotes = async (paperId: string) => {
    setIsSaving(true);
    try {
      const updatedHistory = await updatePaperNotes(paperId, tempNotes);
      const target = papers.find(p => p.paper_id === paperId);
      if (target) {
        onPaperUpdated({
          ...target,
          history: updatedHistory
        });
      }
      setEditingNotesId(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveBookmark = async (paperId: string) => {
    try {
      const res = await toggleSavePaper(paperId);
      const target = papers.find(p => p.paper_id === paperId);
      if (target) {
        onPaperUpdated({
          ...target,
          history: res.history
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleRead = async (paperId: string) => {
    try {
      const res = await toggleReadPaper(paperId);
      const target = papers.find(p => p.paper_id === paperId);
      if (target) {
        onPaperUpdated({
          ...target,
          history: res.history
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="font-display text-2xl font-semibold text-stone-900 dark:text-stone-100 tracking-tight">
            Saved Research & Notes
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-light">
            Personal reading list with annotations and clinical observations.
          </p>
        </div>

        <div className="text-xs font-mono text-stone-500 dark:text-stone-400 font-light">
          <span className="font-medium text-stone-900 dark:text-stone-100 tabular-nums">{savedPapers.length}</span>
          <span> saved</span>
        </div>
      </div>

      {savedPapers.length > 0 ? (
        <div className="space-y-6">
          {savedPapers.map(paper => (
            <div
              key={paper.paper_id}
              className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 shadow-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-400 font-mono mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-stone-700 dark:text-stone-300">{paper.category}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-stone-700 dark:text-stone-300 font-light">{paper.journal}</span>
                  {paper.journal_metric > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums font-light">IF: {paper.journal_metric.toFixed(1)}</span>
                    </>
                  )}
                  {typeof paper.citation_count === 'number' && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="tabular-nums font-medium text-stone-700 dark:text-stone-300">
                        {paper.citation_count.toLocaleString()} citations
                      </span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span className="font-light">{paper.publication_date.substring(0, 4)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleRead(paper.paper_id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs border transition-colors ${
                      paper.history?.read_status
                        ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-100 border-stone-300 dark:border-stone-600'
                        : 'border-stone-200 dark:border-stone-800 text-stone-500 hover:text-stone-700'
                    }`}
                  >
                    <CheckCircle className={`w-3.5 h-3.5 ${paper.history?.read_status ? 'fill-current' : ''}`} />
                    <span>{paper.history?.read_status ? 'Read' : 'Mark Read'}</span>
                  </button>

                  <button
                    onClick={() => handleRemoveBookmark(paper.paper_id)}
                    className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h2
                onClick={() => onSelectPaper(paper)}
                className="cursor-pointer font-display text-lg sm:text-xl font-semibold text-stone-900 dark:text-stone-100 hover:text-stone-600 dark:hover:text-stone-300 transition-colors leading-snug mb-2"
              >
                {paper.title}
              </h2>

              <p className="text-sm text-stone-600 dark:text-stone-400 mb-4 font-normal">
                {paper.authors.join(' · ')}
              </p>

              {/* Personal Notes Section */}
              <div className="p-4 bg-stone-50 dark:bg-stone-800/40 border border-stone-200/80 dark:border-stone-800 rounded-lg mb-4 text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-stone-600 dark:text-stone-400" />
                    <span>Personal Clinical Notes</span>
                  </span>

                  {editingNotesId !== paper.paper_id && (
                    <button
                      onClick={() => startEditNotes(paper)}
                      className="text-stone-800 dark:text-stone-200 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{paper.history?.personal_notes ? 'Edit' : 'Add Note'}</span>
                    </button>
                  )}
                </div>

                {editingNotesId === paper.paper_id ? (
                  <div className="space-y-2 mt-2">
                    <textarea
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      rows={3}
                      placeholder="Enter personal notes on this publication..."
                      className="w-full p-3 text-sm bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-md text-stone-900 dark:text-stone-100 focus:outline-hidden focus:ring-1 focus:ring-stone-400 font-normal"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingNotesId(null)}
                        className="px-3 py-1.5 text-stone-600 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 text-xs font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveNotes(paper.paper_id)}
                        disabled={isSaving}
                        className="flex items-center gap-1 px-3.5 py-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded font-medium text-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{isSaving ? 'Saving...' : 'Save Notes'}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-stone-800 dark:text-stone-200 font-normal leading-relaxed">
                    {paper.history?.personal_notes || 'No personal notes added yet.'}
                  </p>
                )}
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800 text-xs sm:text-sm">
                <span className="text-stone-500 font-mono">
                  Saved on {new Date(paper.history?.processed_at || paper.created_at).toLocaleDateString()}
                </span>

                <button
                  onClick={() => onSelectPaper(paper)}
                  className="font-medium text-stone-900 dark:text-stone-100 hover:underline flex items-center gap-1.5"
                >
                  <span>Open Full Analysis</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl">
          <Bookmark className="w-8 h-8 mx-auto text-stone-400 mb-2" />
          <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100">
            No papers bookmarked yet
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 font-light">
            Browse the Research Library or Today's Paper and click the bookmark icon to save publications for your reading list.
          </p>
        </div>
      )}

    </div>
  );
};
