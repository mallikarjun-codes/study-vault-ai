import React, { useState } from 'react';
import { User, Bot, Layers, ChevronDown, ChevronUp } from 'lucide-react';
import SourceCard from './SourceCard.jsx';

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';
  const [showSources, setShowSources] = useState(true);

  const sources = message.sources
    ? typeof message.sources === 'string'
      ? JSON.parse(message.sources)
      : message.sources
    : [];

  return (
    <div className={`flex gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-blue-500/20">
          <Bot className="w-4 h-4" />
        </div>
      )}

      <div className={`max-w-[82%] space-y-2`}>
        {/* Message Content Bubble */}
        <div
          className={`p-4 rounded-2xl text-sm leading-relaxed ${
            isUser
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none shadow-md shadow-blue-500/10'
              : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
          }`}
        >
          <div className="whitespace-pre-wrap">{message.content}</div>
        </div>

        {/* Assistant Sources Citations */}
        {!isUser && sources && sources.length > 0 && (
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 space-y-2">
            <button
              onClick={() => setShowSources(!showSources)}
              className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Retrieved Context Sources ({sources.length})</span>
              </div>
              {showSources ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showSources && (
              <div className="flex flex-wrap gap-2 pt-1">
                {sources.map((source, idx) => (
                  <SourceCard key={idx} source={source} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 flex-shrink-0">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
