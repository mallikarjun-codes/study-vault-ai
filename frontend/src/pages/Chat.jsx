import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  fetchChatSessions,
  createChatSession,
  fetchChatSession,
  deleteChatSession,
  sendMessage,
} from '../services/chatApi.js';
import { getDocuments } from '../services/documentApi.js';
import ChatSidebar from '../components/ChatSidebar.jsx';
import ChatMessage from '../components/ChatMessage.jsx';
import ChatInput from '../components/ChatInput.jsx';
import {
  BookOpen,
  LogOut,
  FileText,
  LayoutDashboard,
  Sparkles,
  MessageSquare,
  Plus,
  Bot,
  Loader2,
} from 'lucide-react';

export default function ChatPage() {
  const { user, logout } = useAuth();
  const { sessionId: routeSessionId } = useParams();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Load initial chat sessions & indexed documents
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const [sessionList, docList] = await Promise.all([
          fetchChatSessions(),
          getDocuments().catch(() => []),
        ]);
        setSessions(sessionList);
        setDocuments(docList.filter((d) => d.status === 'READY'));

        if (routeSessionId) {
          await loadSessionDetails(routeSessionId);
        } else if (sessionList.length > 0) {
          navigate(`/chat/${sessionList[0].id}`, { replace: true });
        } else {
          const newSess = await createChatSession('New Study Chat');
          setSessions([newSess]);
          navigate(`/chat/${newSess.id}`, { replace: true });
        }
      } catch (err) {
        console.error('Failed to load chat data:', err);
        setError('Failed to load chat sessions.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [routeSessionId]);

  const loadSessionDetails = async (id) => {
    try {
      setError(null);
      const session = await fetchChatSession(id);
      setActiveSession(session);
      setMessages(session.messages || []);
    } catch (err) {
      console.error('Failed to load session details:', err);
      setError('Could not load chat messages.');
    }
  };

  const handleCreateSession = async () => {
    try {
      setError(null);
      const newSess = await createChatSession('New Study Chat');
      setSessions([newSess, ...sessions]);
      navigate(`/chat/${newSess.id}`);
    } catch (err) {
      console.error('Failed to create session:', err);
      setError('Failed to create new chat session.');
    }
  };

  const handleDeleteSession = async (id) => {
    try {
      await deleteChatSession(id);
      const updated = sessions.filter((s) => s.id !== id);
      setSessions(updated);

      if (activeSession?.id === id) {
        if (updated.length > 0) {
          navigate(`/chat/${updated[0].id}`);
        } else {
          handleCreateSession();
        }
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
      setError('Could not delete session.');
    }
  };

  const handleSendMessage = async ({ content, documentIds }) => {
    if (!activeSession) return;

    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsSending(true);

    try {
      const { userMessage, assistantMessage } = await sendMessage(activeSession.id, {
        content,
        documentIds,
      });

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempUserMsg.id),
        userMessage,
        assistantMessage,
      ]);

      const updatedSessions = await fetchChatSessions();
      setSessions(updatedSessions);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to get answer. Please check your connection or Pinecone/Groq configuration.');
    } fontFinally: {
      setIsSending(false);
    }
  };

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden">
      {/* Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur flex-shrink-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white text-sm tracking-tight">
                Study Vault AI
              </span>
            </Link>

            <nav className="flex items-center gap-1">
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                AI Study Chat
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Top Bar Quick + New Chat Button */}
            <button
              onClick={handleCreateSession}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-sm"
              title="Start a new study chat session"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>

            <span className="text-xs text-slate-400">{user?.name}</span>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Body: Always Visible Sidebar + Chat Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat Sidebar (Always Visible on Left) */}
        <ChatSidebar
          sessions={sessions}
          activeSessionId={activeSession?.id}
          onSelectSession={(id) => navigate(`/chat/${id}`)}
          onCreateSession={handleCreateSession}
          onDeleteSession={handleDeleteSession}
          isLoading={isLoading}
        />

        {/* Chat Conversation Thread & Input Area */}
        <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          {error && (
            <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-2 text-xs text-red-400 flex items-center justify-between">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="underline hover:text-white">
                Dismiss
              </button>
            </div>
          )}

          {/* Active Session Title Sub-Header */}
          <div className="px-6 py-2 bg-slate-900/50 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-slate-200">
                {activeSession?.title || 'Study Chat'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              {messages.length} message{messages.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Messages Thread */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4 my-auto">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Ask Study Vault AI</h2>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                    Ask any question about your uploaded lecture notes, textbooks, or papers. Your AI assistant retrieves exact context chunks from Pinecone and generates source-cited answers!
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg, idx) => <ChatMessage key={msg.id || idx} message={msg} />)
            )}

            {/* Assistant Thinking Loading Indicator */}
            {isSending && (
              <div className="flex gap-3 my-4 justify-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white flex-shrink-0 shadow-md shadow-blue-500/20">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl rounded-tl-none text-xs text-slate-400 flex items-center gap-2.5">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  <span>Searching vault & generating answer...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Container */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/60 max-w-4xl mx-auto w-full">
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={isSending}
              documents={documents}
            />
          </div>
        </main>
      </div>
    </div>
  );
}
