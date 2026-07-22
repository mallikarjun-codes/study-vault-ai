import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { register } from '../services/authApi.js';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const { saveAuth } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});
    try {
      const data = await register(form);
      saveAuth(data);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.details) {
        const fe = {};
        err.response.data.details.forEach(({ field, message }) => {
          fe[field] = message;
        });
        setFieldErrors(fe);
      } else {
        setError(
          err.response?.data?.error || 'Something went wrong. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Password strength indicator
  const pw = form.password;
  const pwChecks = {
    length: pw.length >= 8,
    number: /[0-9]/.test(pw),
    letter: /[a-zA-Z]/.test(pw),
  };
  const pwStrength = Object.values(pwChecks).filter(Boolean).length;
  const strengthColors = ['', 'bg-rose-500', 'bg-amber-400', 'bg-emerald-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong'];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Heading */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/25">
            <UserPlus className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Start building your personal knowledge vault</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          {error && (
            <div className="flex items-start gap-2.5 p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form id="register-form" onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="register-name" className="block text-xs font-medium text-slate-300 mb-1.5">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full bg-slate-800 border text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 transition-colors ${
                    fieldErrors.name
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/40'
                      : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/40'
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-rose-400 text-xs mt-1">{fieldErrors.name}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`w-full bg-slate-800 border text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 transition-colors ${
                    fieldErrors.email
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/40'
                      : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/40'
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-rose-400 text-xs mt-1">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full bg-slate-800 border text-slate-100 placeholder-slate-500 text-sm rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-1 transition-colors ${
                    fieldErrors.password
                      ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/40'
                      : 'border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/40'
                  }`}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-rose-400 text-xs mt-1">{fieldErrors.password}</p>
              )}

              {/* Password strength bar */}
              {pw.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= pwStrength ? strengthColors[pwStrength] : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    Strength: <span className="font-medium text-slate-200">{strengthLabels[pwStrength]}</span>
                  </p>
                  <div className="space-y-0.5">
                    {[
                      { key: 'length', label: 'At least 8 characters' },
                      { key: 'number', label: 'Contains a number' },
                      { key: 'letter', label: 'Contains a letter' },
                    ].map(({ key, label }) => (
                      <div key={key} className={`flex items-center gap-1.5 text-xs transition-colors ${pwChecks[key] ? 'text-emerald-400' : 'text-slate-500'}`}>
                        <CheckCircle2 className="w-3 h-3" />
                        {label}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              id="register-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl py-2.5 transition-all duration-200 shadow-lg shadow-indigo-500/20 mt-2"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-400 text-sm mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
