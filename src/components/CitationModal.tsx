import React, { useState } from 'react';
import { X, Check, Copy } from 'lucide-react';
import { PaperRecord } from '../types';

interface CitationModalProps {
  paper: PaperRecord;
  onClose: () => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({ paper, onClose }) => {
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);

  const year = paper.publication_date ? paper.publication_date.substring(0, 4) : '2024';
  const authorString = paper.authors.join(', ');
  const firstAuthorLastName = paper.authors[0]?.split(' ').pop() || 'Author';

  const apaCitation = `${authorString} (${year}). ${paper.title}. ${paper.journal}. https://doi.org/${paper.DOI}`;
  
  const vancouverCitation = `${authorString}. ${paper.title}. ${paper.journal}. ${year}; doi:${paper.DOI}.`;

  const bibtexCitation = `@article{${firstAuthorLastName.toLowerCase()}${year}${paper.journal.toLowerCase().replace(/[^a-z]/g, '').substring(0, 6)},
  title = {${paper.title}},
  author = {${paper.authors.join(' and ')}},
  journal = {${paper.journal}},
  year = {${year}},
  doi = {${paper.DOI}}
}`;

  const copyToClipboard = (text: string, format: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormat(format);
    setTimeout(() => setCopiedFormat(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 dark:border-stone-800">
          <div>
            <h3 className="font-display text-base font-semibold text-stone-900 dark:text-stone-100">
              Export Citation
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate max-w-lg font-light">
              {paper.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 pt-4">
          {/* APA Format */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                APA 7th Edition
              </span>
              <button
                onClick={() => copyToClipboard(apaCitation, 'apa')}
                className="flex items-center gap-1.5 text-xs font-medium text-stone-800 dark:text-stone-200 hover:underline"
              >
                {copiedFormat === 'apa' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFormat === 'apa' ? 'Copied' : 'Copy APA'}</span>
              </button>
            </div>
            <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 select-all font-mono font-light">
              {apaCitation}
            </div>
          </div>

          {/* Vancouver Format */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Vancouver (NLM / PubMed)
              </span>
              <button
                onClick={() => copyToClipboard(vancouverCitation, 'vancouver')}
                className="flex items-center gap-1.5 text-xs font-medium text-stone-800 dark:text-stone-200 hover:underline"
              >
                {copiedFormat === 'vancouver' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFormat === 'vancouver' ? 'Copied' : 'Copy Vancouver'}</span>
              </button>
            </div>
            <div className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 select-all font-mono font-light">
              {vancouverCitation}
            </div>
          </div>

          {/* BibTeX */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400">
                BibTeX (LaTeX / Overleaf)
              </span>
              <button
                onClick={() => copyToClipboard(bibtexCitation, 'bibtex')}
                className="flex items-center gap-1.5 text-xs font-medium text-stone-800 dark:text-stone-200 hover:underline"
              >
                {copiedFormat === 'bibtex' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedFormat === 'bibtex' ? 'Copied' : 'Copy BibTeX'}</span>
              </button>
            </div>
            <pre className="p-3 bg-stone-50 dark:bg-stone-800/60 rounded-lg border border-stone-200 dark:border-stone-800 text-xs text-stone-700 dark:text-stone-300 select-all font-mono whitespace-pre overflow-x-auto font-light">
              {bibtexCitation}
            </pre>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-stone-100 dark:border-stone-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
