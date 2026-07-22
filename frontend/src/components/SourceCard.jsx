import React from 'react';
import { FileText, Tag } from 'lucide-react';

export default function SourceCard({ source }) {
  const { documentName, chunkIndex, score } = source;
  const scorePercent = typeof score === 'number' ? Math.round(score * 100) : null;

  return (
    <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs">
      <FileText className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
      <span className="font-medium truncate max-w-[140px]" title={documentName}>
        {documentName}
      </span>
      <span className="text-slate-500">•</span>
      <span className="text-slate-400 flex items-center gap-1">
        <Tag className="w-3 h-3 text-slate-500" />
        Chunk #{chunkIndex}
      </span>
      {scorePercent !== null && (
        <span className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
          {scorePercent}% match
        </span>
      )}
    </div>
  );
}
