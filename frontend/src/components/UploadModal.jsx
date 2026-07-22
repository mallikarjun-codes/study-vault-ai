import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2, File } from 'lucide-react';
import { uploadDocument } from '../services/documentApi.js';

export default function UploadModal({ isOpen, onClose, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setSuccessResult(null);

    const allowedTypes = ['.pdf', '.txt', '.docx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedTypes.includes(ext)) {
      setError(`Invalid file type "${ext}". Only PDF, TXT, and DOCX files are allowed.`);
      setSelectedFile(null);
      return;
    }

    const maxSizeBytes = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeBytes) {
      setError('File size exceeds the maximum limit of 10MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const fakeEvent = { target: { files: [file] } };
      handleFileChange(fakeEvent);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccessResult(null);

    try {
      const data = await uploadDocument(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      setSuccessResult(data);
      if (onUploadSuccess) {
        onUploadSuccess(data.document);
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message || 'Failed to upload and process document.';
      setError(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setError('');
    setSuccessResult(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Upload Document</h2>
              <p className="text-slate-400 text-xs">PDF, DOCX, or TXT up to 10MB</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {/* Success State */}
        {successResult ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-emerald-400">Document Uploaded & Processed!</h4>
                <p className="text-slate-300 text-xs mt-1">
                  Extracted <span className="font-semibold">{successResult.document.textLength?.toLocaleString()}</span> characters.
                </p>
              </div>
            </div>

            {/* Extracted Text Preview */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Text Preview (First 300 Chars)
              </span>
              <p className="text-slate-300 text-xs font-mono leading-relaxed bg-slate-900/50 p-2.5 rounded-lg max-h-36 overflow-y-auto whitespace-pre-wrap">
                {successResult.extractedTextPreview || 'No text preview available.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700 transition-colors"
              >
                Upload Another
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* File Drop / Selection Area */
          <div className="space-y-4">
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                selectedFile
                  ? 'border-blue-500/40 bg-blue-500/5'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-950/50'
              }`}
            >
              <input
                type="file"
                id="file-upload-input"
                accept=".pdf,.txt,.docx"
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              <label htmlFor="file-upload-input" className="cursor-pointer block">
                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
                      <FileText className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-white truncate max-w-xs">{selectedFile.name}</span>
                    <span className="text-xs text-slate-400 mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mb-2">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-medium text-slate-200">
                      Click to browse or drag & drop file
                    </span>
                    <span className="text-xs text-slate-500 mt-1">Supports .pdf, .docx, .txt (max 10MB)</span>
                  </div>
                )}
              </label>
            </div>

            {/* Upload Progress Bar */}
            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                    Uploading & extracting text...
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={isUploading}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-medium rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    Upload & Extract
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
