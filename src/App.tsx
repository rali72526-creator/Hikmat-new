/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Leaf, Stethoscope, Search, Loader2, AlertCircle, Lock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getTreatment, analyzeRemedy } from './services/gemini';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'treatment' | 'remedy'>('treatment');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State - Treatment
  const [age, setAge] = useState('');
  const [city, setCity] = useState('');
  const [condition, setCondition] = useState('');

  // Form State - Remedy
  const [remedyInput, setRemedyInput] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const savedUsername = localStorage.getItem('admin_username');
      const savedPassword = localStorage.getItem('admin_password');
      if (savedUsername && savedPassword) {
        try {
          const res = await fetch('/api/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: savedUsername, password: savedPassword })
          });
          if (res.ok) {
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('admin_username');
            localStorage.removeItem('admin_password');
          }
        } catch (e) {
          console.error("Auth check failed", e);
        }
      }
      setIsCheckingAuth(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUsername, password: loginPassword })
      });
      
      if (res.ok) {
        localStorage.setItem('admin_username', loginUsername);
        localStorage.setItem('admin_password', loginPassword);
        setIsAuthenticated(true);
      } else {
        setLoginError('Incorrect username or password. Please try again.');
      }
    } catch (e) {
      setLoginError('Server error. Please try again later.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_username');
    localStorage.removeItem('admin_password');
    setIsAuthenticated(false);
    setResult(null);
    setError(null);
  };

  const handleTreatmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!age || !city || !condition) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await getTreatment(age, city, condition);
      setResult(response || "No response received.");
    } catch (err: any) {
      console.error(err);
      if (err.message === 'Unauthorized') {
        handleLogout();
      } else {
        setError("An error occurred while fetching the treatment. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemedySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remedyInput) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await analyzeRemedy(remedyInput);
      setResult(response || "No response received.");
    } catch (err: any) {
      console.error(err);
      if (err.message === 'Unauthorized') {
        handleLogout();
      } else {
        setError("An error occurred while analyzing the remedy. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#2d4a22]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center p-4 selection:bg-[#2d4a22] selection:text-white">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 w-full max-w-md">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="bg-[#d4af37] p-4 rounded-full mb-4 shadow-md">
              <Lock className="w-8 h-8 text-[#2d4a22]" />
            </div>
            <h1 className="text-2xl font-bold font-serif text-[#2d4a22]">Admin Login</h1>
            <p className="text-slate-500 mt-2">Please enter the admin password to access Tibb-e-Luqman AI.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Username</label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#2d4a22] focus:border-[#2d4a22] outline-none transition-all bg-slate-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#2d4a22] focus:border-[#2d4a22] outline-none transition-all bg-slate-50"
              />
            </div>

            {loginError && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl flex items-start gap-2 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>{loginError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-[#2d4a22] hover:bg-[#233a1a] text-white font-bold py-3.5 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {loginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5f0] text-slate-800 font-sans selection:bg-[#2d4a22] selection:text-white pb-12">
      {/* Header */}
      <header className="bg-[#2d4a22] text-[#f8f5f0] py-8 px-4 shadow-lg border-b-4 border-[#d4af37] relative">
        <button 
          onClick={handleLogout}
          className="absolute top-4 right-4 text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors"
        >
          Logout
        </button>
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
          <div className="bg-[#d4af37] p-3 rounded-full mb-4 shadow-md">
            <Leaf className="w-8 h-8 text-[#2d4a22]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 font-serif tracking-wide">Tibb-e-Luqman AI</h1>
          <p className="text-[#d4af37] text-lg max-w-2xl opacity-90">
            طبِ لقمان - Expert Herbal Treatments & Remedy Analysis based on the wisdom of Hazrat Luqman (A.S).
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8">
        {/* Tabs */}
        <div className="flex flex-col sm:flex-row gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
          <button
            onClick={() => { setActiveTab('treatment'); setResult(null); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'treatment'
                ? 'bg-[#2d4a22] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Stethoscope className="w-5 h-5" />
            Get Treatment (علاج)
          </button>
          <button
            onClick={() => { setActiveTab('remedy'); setResult(null); setError(null); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'remedy'
                ? 'bg-[#2d4a22] text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Search className="w-5 h-5" />
            Analyze Remedy (نسخہ کی پہچان)
          </button>
        </div>

        <div className="grid md:grid-cols-12 gap-8">
          {/* Input Section */}
          <div className="md:col-span-5 space-y-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
              {activeTab === 'treatment' ? (
                <form onSubmit={handleTreatmentSubmit} className="space-y-5">
                  <h2 className="text-xl font-semibold text-[#2d4a22] mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                    Patient Details
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Patient Age (عمر)</label>
                    <input
                      type="text"
                      required
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      placeholder="e.g., 45 years"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#2d4a22] focus:border-[#2d4a22] outline-none transition-all bg-slate-50"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City (شہر)</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g., Lahore"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#2d4a22] focus:border-[#2d4a22] outline-none transition-all bg-slate-50"
                    />
                    <p className="text-xs text-slate-500 mt-1">Used to determine current weather/climate for accurate prescription.</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Condition/Symptoms (بیماری کی نوعیت)</label>
                    <textarea
                      required
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      placeholder="Describe the disease, symptoms, and severity..."
                      rows={4}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#2d4a22] focus:border-[#2d4a22] outline-none transition-all bg-slate-50 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#d4af37] hover:bg-[#c5a028] text-[#2d4a22] font-bold py-3.5 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Get Prescription'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRemedySubmit} className="space-y-5">
                  <h2 className="text-xl font-semibold text-[#2d4a22] mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                    Remedy Details
                  </h2>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Enter Remedy/Nuskha (نسخہ درج کریں)</label>
                    <textarea
                      required
                      value={remedyInput}
                      onChange={(e) => setRemedyInput(e.target.value)}
                      placeholder="e.g., Honey with black seed oil..."
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#2d4a22] focus:border-[#2d4a22] outline-none transition-all bg-slate-50 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#d4af37] hover:bg-[#c5a028] text-[#2d4a22] font-bold py-3.5 px-6 rounded-xl transition-colors shadow-sm disabled:opacity-70 flex justify-center items-center gap-2"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Analyze Remedy'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Output Section */}
          <div className="md:col-span-7">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 min-h-[400px] flex flex-col">
              <h2 className="text-xl font-semibold text-[#2d4a22] mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                Expert Recommendation (تجویز)
              </h2>
              
              <div className="flex-1">
                {loading ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-12">
                    <Loader2 className="w-10 h-10 animate-spin text-[#d4af37]" />
                    <p className="animate-pulse">Consulting the wisdom of Tibb-e-Luqman...</p>
                  </div>
                ) : error ? (
                  <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                ) : result ? (
                  <div className="prose prose-slate max-w-none prose-headings:text-[#2d4a22] prose-a:text-[#d4af37] prose-strong:text-[#2d4a22] prose-ul:list-disc prose-ol:list-decimal text-right" dir="rtl">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {result}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 py-12 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                      <Leaf className="w-10 h-10 text-slate-300" />
                    </div>
                    <p>Fill out the form and submit to receive an expert recommendation based on Tibb-e-Luqman.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
