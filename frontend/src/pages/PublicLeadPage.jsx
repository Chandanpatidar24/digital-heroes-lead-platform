import React, { useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Send, CheckCircle2, Sparkles } from 'lucide-react';

const PublicLeadPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    value: '',
    source: 'Website Form',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post('/leads/public', formData);
      setLoading(false);
      setSubmitted(true);
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'Failed to submit form');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfbf7] text-stone-800">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        <div className="text-center mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100/60 border border-amber-200 text-amber-900 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-800" />
            <span>Digital Heroes Lead Platform</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900">
            Let's Build Something Exceptional Together
          </h1>
          <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto">
            Fill out the request form below to connect directly with our sales & development team.
          </p>
        </div>

        <div className="bg-white border border-stone-200/90 rounded-2xl p-6 sm:p-10 shadow-md shadow-stone-200/50 relative overflow-hidden">
          {submitted ? (
            <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-stone-900">Thank You! Request Received</h2>
              <p className="text-stone-600 text-sm max-w-md mx-auto">
                Your lead has been logged into our active sales pipeline. An account representative will review your inquiry shortly.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    company: '',
                    value: '',
                    source: 'Website Form',
                    message: '',
                  });
                }}
                className="mt-4 px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-900 border border-stone-300 rounded-xl text-sm font-bold transition-all"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                    Full Name <span className="text-amber-800">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Alice Smith"
                    className="w-full bg-[#fdfbf7] border border-stone-200 focus:border-stone-400 focus:bg-white rounded-xl p-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                    Email Address <span className="text-amber-800">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="e.g. alice@acme.com"
                    className="w-full bg-[#fdfbf7] border border-stone-200 focus:border-stone-400 focus:bg-white rounded-xl p-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. +1 (555) 019-2831"
                    className="w-full bg-[#fdfbf7] border border-stone-200 focus:border-stone-400 focus:bg-white rounded-xl p-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="e.g. Acme Innovations"
                    className="w-full bg-[#fdfbf7] border border-stone-200 focus:border-stone-400 focus:bg-white rounded-xl p-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Estimated Project Budget ($ USD)
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  placeholder="e.g. 15000"
                  className="w-full bg-[#fdfbf7] border border-stone-200 focus:border-stone-400 focus:bg-white rounded-xl p-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Project Requirements & Notes
                </label>
                <textarea
                  rows="4"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your project requirements..."
                  className="w-full bg-[#fdfbf7] border border-stone-200 focus:border-stone-400 focus:bg-white rounded-xl p-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold bg-stone-900 hover:bg-stone-800 text-amber-100 shadow-sm transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting Request...' : 'Submit Lead Request'}</span>
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicLeadPage;
