import React, { useState } from 'react';
import { FileText, FileCode, File, Trash2, CheckCircle2, AlertCircle, Clock, Loader2 } from 'lucide-react';

export default function DocumentCard({ document: doc, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType, name) => {
    const ext = name ? name.split('.').pop().toLowerCase() : '';
    if (mimeType?.includes('pdf') || ext === 'pdf') {
      return <FileText className="w-5 h-5 text-rose-400" />;
    }
    if (mimeType?.includes('word') || ext === 'docx' || ext === 'doc') {
      return <FileCode className="w-5 h-5 text-blue-400" />;
    }
    return <File className="w-5 h-5 text-emerald-400" />;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            Ready
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3 h-3 animate-spin" />
            Processing
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${doc.name}"?`)) {
      try {
        setIsDeleting(true);
        await onDelete(doc.id);
      } catch (err) {
        alert(err.message || 'Failed to delete document');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm flex flex-col justify-between">
      <div>
        {/* Card Header: Icon + Name + Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center flex-shrink-0 mt-0.5">
              {getFileIcon(doc.mimeType, doc.name)}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-slate-100 text-sm truncate leading-snug" title={doc.name}>
                {doc.name}
              </h3>
              <p className="text-slate-400 text-xs mt-0.5 uppercase tracking-wider font-mono">
                {doc.name.split('.').pop() || 'FILE'} • {formatFileSize(doc.fileSize)}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0">{getStatusBadge(doc.status)}</div>
        </div>

        {/* Info stats */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div>
            {doc.textLength !== null && doc.textLength !== undefined ? (
              <span>{doc.textLength.toLocaleString()} characters extracted</span>
            ) : (
              <span>Text length unavailable</span>
            )}
          </div>
          <div>{new Date(doc.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 flex items-center justify-end">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
          title="Delete document"
        >
          {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}
