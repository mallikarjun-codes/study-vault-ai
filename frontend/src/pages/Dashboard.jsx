import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, LogOut, User, Cpu, FileText, ArrowRight, LayoutDashboard } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Nav */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-sm tracking-tight">Study Vault AI</span>
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <Link
                to="/documents"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <FileText className="w-3.5 h-3.5" />
                Documents
              </Link>
            </nav>
          </div>

          <button
            id="logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full space-y-4">

          {/* Welcome Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/20 mb-4">
              <User className="w-7 h-7 text-blue-400" />
            </div>
            <h1 className="text-xl font-bold text-white">
              Welcome, {user?.name}!
            </h1>
            <p className="text-slate-400 text-sm mt-1">{user?.email}</p>

            {/* Quick Action Button to Documents */}
            <div className="mt-5">
              <Link
                to="/documents"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20"
              >
                <FileText className="w-4 h-4" />
                Manage Documents Vault
                <ArrowRight className="w-3.5 h-3.5 ml-auto" />
              </Link>
            </div>
          </div>

          {/* Phase Indicator */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Platform Status</span>
            </div>
            <div className="space-y-2">
              {[
                { label: 'Phase 1 — Infrastructure', done: true },
                { label: 'Phase 2 — Authentication', done: true },
                { label: 'Phase 3 — File Upload & Extraction', done: true },
                { label: 'Phase 4 — Embeddings & Pinecone', done: false },
                { label: 'Phase 5 — RAG Chat Engine', done: false },
                { label: 'Phase 6 — Polish & Deploy', done: false },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2.5 text-sm">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${done ? 'bg-emerald-500' : 'bg-slate-700'}`} />
                  <span className={done ? 'text-slate-200' : 'text-slate-500'}>{label}</span>
                  {done && (
                    <span className="ml-auto text-xs text-emerald-400 font-medium">Done</span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

