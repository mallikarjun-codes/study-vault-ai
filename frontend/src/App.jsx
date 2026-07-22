import React, { useEffect, useState } from 'react';
import { fetchHealthStatus } from './services/api';
import { Database, Server, Cpu, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export default function App() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadHealthStatus = async () => {
    setLoading(true);
    const data = await fetchHealthStatus();
    setHealthData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadHealthStatus();
  }, []);

  const renderBadge = (connected) => {
    if (connected) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4" /> Connected
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <XCircle className="w-4 h-4" /> Disconnected
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-900/80 backdrop-blur border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Study Vault AI
            </h1>
            <p className="text-xs text-slate-400 mt-1">Phase 1 Connectivity Verification</p>
          </div>
          <button
            onClick={loadHealthStatus}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors disabled:opacity-50"
            title="Refresh status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* System Status Banner */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-3">
              <Server className="w-5 h-5 text-blue-400" />
              <span className="font-medium text-sm text-slate-200">Backend Express API</span>
            </div>
            {healthData?.status === 'ok' || healthData?.status === 'degraded' ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <CheckCircle2 className="w-4 h-4" /> Reachable
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <XCircle className="w-4 h-4" /> Unreachable
              </span>
            )}
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-3">
              <Database className="w-5 h-5 text-cyan-400" />
              <span className="font-medium text-sm text-slate-200">Neon PostgreSQL</span>
            </div>
            {renderBadge(healthData?.db)}
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-purple-400" />
              <span className="font-medium text-sm text-slate-200">Pinecone Vector DB</span>
            </div>
            {renderBadge(healthData?.pinecone)}
          </div>
        </div>

        {/* Footer timestamp */}
        <div className="px-6 py-4 bg-slate-950/40 border-t border-slate-800/60 text-xs text-slate-500 flex justify-between items-center">
          <span>Overall: <strong className="text-slate-300 uppercase">{healthData?.status || 'UNKNOWN'}</strong></span>
          <span>{healthData?.timestamp ? new Date(healthData.timestamp).toLocaleTimeString() : 'N/A'}</span>
        </div>

      </div>
    </div>
  );
}
