import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Lock, Mail, LogIn, KeyRound } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-stone-800">
      <Navbar />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-16 flex flex-col justify-center">
        <div className="text-center mb-8 space-y-2">
          <div className="w-12 h-12 bg-amber-100/60 border border-amber-200 text-amber-800 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">Team Portal Login</h1>
          <p className="text-stone-500 text-xs sm:text-sm">
            Sign in with your work email and password to access the platform.
          </p>
        </div>

        {/* Clean Ivory Login Card */}
        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-8 shadow-md shadow-stone-200/50">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@digitalheroes.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#fdfbf7] border border-stone-200 focus:border-stone-400 focus:bg-white rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-[#fdfbf7] border border-stone-200 focus:border-stone-400 focus:bg-white rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold bg-stone-900 hover:bg-stone-800 text-amber-100 shadow-sm transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50 mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Reference credentials note */}
          <div className="mt-6 pt-5 border-t border-stone-100 text-center text-xs text-stone-500">
            <span className="font-semibold text-stone-700">Testing Credentials:</span>
            <div className="mt-1 space-y-0.5 font-mono text-[11px] text-stone-600">
              <div>Admin: admin@digitalheroes.com / admin123</div>
              <div>Member: member@digitalheroes.com / member123</div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default LoginPage;
