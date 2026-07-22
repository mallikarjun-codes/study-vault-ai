import React, { useState } from 'react';
import { Send, Loader2, Filter, Check } from 'lucide-react';

export default function ChatInput({ onSendMessage, isLoading, documents = [] }) {
  const [content, setContent] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [showDocSelector, setShowDocSelector] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;

    onSendMessage({
      content,
      documentIds: selectedDocIds.length > 0 ? selectedDocIds : null,
    });

    setContent('');
  };

  const toggleDocSelect = (id) => {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-2">
      {/* Optional Document Scoping Bar */}
      {documents.length > 0 && (
        <div className="flex items-center gap-2 px-1">
          <button
            type="button"
            onClick={() => setShowDocSelector(!showDocSelector)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              selectedDocIds.length > 0
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>
              {selectedDocIds.length > 0
                ? `Filter: ${selectedDocIds.length} Document${selectedDocIds.length > 1 ? 's' : ''} Selected`
                : 'Scope Search to Specific Docs (All Documents by default)'}
            </span>
          </button>
        </div>
      )}

      {/* Document Selection Dropdown Checklist */}
      {showDocSelector && documents.length > 0 && (
        <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2 max-h-40 overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1">
            <span>Select target documents to scope RAG search:</span>
            {selectedDocIds.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedDocIds([])}
                className="text-blue-400 hover:underline"
              >
                Clear Selection
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
            {documents.map((doc) => {
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => toggleDocSelect(doc.id)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs text-left border transition-all ${
                    isSelected
                      ? 'bg-blue-600/15 border-blue-500/40 text-blue-300 font-medium'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate max-w-[200px]">{doc.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 ml-1 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            isLoading
              ? 'Study Vault AI is thinking and retrieving context...'
              : 'Ask anything about your study notes, lectures, or documents...'
          }
          disabled={isLoading}
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!content.trim() || isLoading}
          className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-all disabled:opacity-50 shadow-md shadow-blue-500/20"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <span>Ask</span>
              <Send className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
