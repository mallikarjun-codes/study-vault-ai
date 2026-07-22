import React from 'react';
import { FileText, Tag, Bookmark } from 'lucide-react';

export default function SourceCard({ source, rank = 1 }) {
  const { documentName, chunkIndex } = source;

  // Assign clean human-readable relevance label instead of raw percentages
  let label = 'Referenced';
  let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';

  if (rank === 1) {
    label = 'Most Relevant';
    badgeStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  } else if (rank === 2) {
    label = 'Relevant';
    badgeStyle = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
  } else if (rank >= 3) {
    label = 'Also Referenced';
    badgeStyle = 'bg-slate-800 text-slate-400 border-slate-700';
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-xs shadow-sm">
      <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
      <span className="font-medium truncate max-w-[150px]" title={documentName}>
        {documentName}
      </span>
      <span className="text-slate-600">•</span>
      <span className="text-slate-400 flex items-center gap-1">
        <Tag className="w-3 h-3 text-slate-500" />
        Chunk #{chunkIndex}
      </span>
      <span className={`ml-auto px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badgeStyle}`}>
        {label}
      </span>
    </div>
  );
}
