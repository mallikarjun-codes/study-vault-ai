import React from 'react';
import { Plus, MessageSquare, Trash2 } from 'lucide-react';

export default function ChatSidebar({
  sessions = [],
  activeSessionId,
  onSelectSession,
  onCreateSession,
  onDeleteSession,
  isLoading,
}) {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full flex-shrink-0">
      {/* Header & Prominent New Chat Button */}
      <div className="p-4 border-b border-slate-800">
        <button
          onClick={onCreateSession}
          disabled={isLoading}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>New Study Session</span>
        </button>
      </div>

      {/* Chat Sessions History List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
          Chat History ({sessions.length})
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8 px-4 text-xs text-slate-500">
            No study sessions yet. Click above to start!
          </div>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === activeSessionId;
            return (
              <div
                key={session.id}
                onClick={() => onSelectSession(session.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2 truncate min-w-0 pr-2">
                  <MessageSquare className={`w-3.5 h-3.5 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{session.title}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className={`opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 rounded transition-opacity ${
                    isActive ? 'text-white/80 hover:text-white' : 'text-slate-500'
                  }`}
                  title="Delete Session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
