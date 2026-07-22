import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import {
  BookOpen,
  LogOut,
  User,
  FileText,
  ArrowRight,
  LayoutDashboard,
  MessageSquare,
  Clock,
  Layers,
  Sparkles,
  Loader2,
  ChevronRight,
  FileCheck,
} from 'lucide-react';
import { getDocuments } from '../services/documentApi.js';
import { fetchChatSessions } from '../services/chatApi.js';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [docsData, sessionsData] = await Promise.all([
          getDocuments().catch(() => []),
          fetchChatSessions().catch(() => []),
        ]);
        setDocuments(docsData || []);
        setSessions(sessionsData || []);
      } catch (err) {
        console.error('Failed to load dashboard statistics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const recentDocs = documents.slice(0, 3);
  const recentSessions = sessions.slice(0, 3);
  const lastActiveChat = sessions[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">Study Vault AI</span>
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
              <Link
                to="/chat"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                AI Study Chat
              </Link>
            </nav>
          </div>

          <button
            id="logout-btn"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="space-y-2 max-w-xl z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Personal Knowledge Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your personal study repository is active. Upload materials to extract knowledge, build instant vector indices, and chat directly with your sources.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto flex-shrink-0 z-10">
            <Link
              to="/chat"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/25"
            >
              <MessageSquare className="w-4 h-4" />
              Start AI Study Chat
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
            <Link
              to="/documents"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all"
            >
              <FileText className="w-4 h-4" />
              Manage Documents Vault
            </Link>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {/* Stat 1: Uploaded Docs */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Documents Vault</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-blue-400 inline" /> : documents.length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Files indexed for AI search</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <FileCheck className="w-6 h-6" />
            </div>
          </div>

          {/* Stat 2: Total Sessions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Chat Sessions</p>
              <h3 className="text-2xl font-bold text-white mt-1">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-indigo-400 inline" /> : sessions.length}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Saved study conversations</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <MessageSquare className="w-6 h-6" />
            </div>
          </div>

          {/* Stat 3: Last Active Chat */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Last Active Chat</p>
              <h3 className="text-sm font-semibold text-white mt-1 truncate max-w-[170px]" title={lastActiveChat?.title || 'None'}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400 inline" />
                ) : (
                  lastActiveChat?.title || 'No chats yet'
                )}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">
                {lastActiveChat ? new Date(lastActiveChat.updatedAt || lastActiveChat.createdAt).toLocaleDateString() : 'Ready to start'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Dashboard Activity Content: Recent Sessions & Recent Documents */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Chat Sessions */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-400" />
                  <h2 className="text-base font-bold text-white">Recent Study Chats</h2>
                </div>
                <Link
                  to="/chat"
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                >
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {isLoading ? (
                <div className="py-8 flex justify-center text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : recentSessions.length === 0 ? (
                <div className="text-center py-8 bg-slate-950/50 rounded-xl border border-slate-800/80">
                  <p className="text-xs text-slate-400">No chat sessions found.</p>
                  <Link
                    to="/chat"
                    className="inline-block text-xs font-semibold text-blue-400 hover:underline mt-2"
                  >
                    + Create First Chat
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentSessions.map((session) => (
                    <div
                      key={session.id}
                      onClick={() => navigate(`/chat/${session.id}`)}
                      className="group flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-850 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 flex-shrink-0">
                          <MessageSquare className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                            {session.title}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {new Date(session.updatedAt || session.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors flex-shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recently Uploaded Documents */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-base font-bold text-white">Recent Documents</h2>
                </div>
                <Link
                  to="/documents"
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                >
                  View Vault <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {isLoading ? (
                <div className="py-8 flex justify-center text-slate-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : recentDocs.length === 0 ? (
                <div className="text-center py-8 bg-slate-950/50 rounded-xl border border-slate-800/80">
                  <p className="text-xs text-slate-400">No documents in vault.</p>
                  <Link
                    to="/documents"
                    className="inline-block text-xs font-semibold text-indigo-400 hover:underline mt-2"
                  >
                    + Upload Document
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => navigate('/documents')}
                      className="group flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-850 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-200 group-hover:text-white truncate">
                            {doc.name}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="uppercase font-medium text-slate-400">{doc.fileType}</span>
                            <span>•</span>
                            <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0 ml-2">
                        {doc.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
