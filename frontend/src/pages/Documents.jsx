import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, LogOut, UploadCloud, FileText, Loader2, AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react';
import { getDocuments, deleteDocument } from '../services/documentApi.js';
import DocumentCard from '../components/DocumentCard.jsx';
import UploadModal from '../components/UploadModal.jsx';

export default function DocumentsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDocs = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load documents.');
    } fontFinally: {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteDocument = async (id) => {
    await deleteDocument(id);
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
  };

  const handleUploadSuccess = (newDoc) => {
    setDocuments((prev) => [newDoc, ...prev.filter((d) => d.id !== newDoc.id)]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Navigation Header */}
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                Dashboard
              </Link>
              <Link
                to="/documents"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20"
              >
                <FileText className="w-3.5 h-3.5" />
                Documents
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

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Documents Vault</h1>
            <p className="text-slate-400 text-sm mt-1">
              Upload and manage your study materials, lecture notes, and papers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDocs}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
              title="Refresh documents"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchDocs}
              className="px-3 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content Area */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
            <p className="text-slate-400 text-sm">Loading your document library...</p>
          </div>
        ) : documents.length === 0 ? (
          /* Empty State */
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center max-w-md mx-auto my-8">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">No documents uploaded yet</h3>
            <p className="text-slate-400 text-sm mt-1 mb-6">
              Upload your PDF, DOCX, or TXT study files to start extracting text for AI analysis.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/25"
            >
              <UploadCloud className="w-4 h-4" />
              Upload First Document
            </button>
          </div>
        ) : (
          /* Documents Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {documents.map((doc) => (
              <DocumentCard key={doc.id} document={doc} onDelete={handleDeleteDocument} />
            ))}
          </div>
        )}
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
}
