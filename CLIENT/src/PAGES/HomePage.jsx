import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../CONTEXT/AuthProvider';

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleGetStarted = () => {
    if (user) {
      navigate('/chats');
      return;
    }
    setShowLoginPrompt(true);
  };
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <main className="pt-20 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl font-bold text-slate-100 leading-tight">
              Connect Instantly,
              <br />
              <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Chat Securely
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Experience seamless real-time messaging with end-to-end encryption. 
             
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center space-x-4 pt-8">
              <button
                className="px-8 py-4 bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-200"
                onClick={handleGetStarted}
              >
                Get Started
              </button>
             
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 gap-9 mt-24">
            {/* Card 1 */}
            <div className="bg-slate-900/80 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-800">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Lightning Fast</h3>
              <p className="text-slate-300">
                Experience real-time messaging with zero lag. Messages delivered instantly.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-900/80 rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-800">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-2">Secure & Private</h3>
              <p className="text-slate-300">
                End-to-end encryption ensures your conversations stay private and secure.
              </p>
            </div>

           
            
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-400">
         
        </div>
      </footer>

      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-950/70"
            onClick={() => setShowLoginPrompt(false)}
          />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-slate-100">Please login</h2>
              <button
                className="text-slate-400 hover:text-slate-200"
                onClick={() => setShowLoginPrompt(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="mt-3 text-slate-300">
              You need to be logged in to start chatting.
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                className="rounded-full border border-slate-700 px-4 py-2 text-slate-200 hover:bg-slate-800"
                onClick={() => setShowLoginPrompt(false)}
              >
                Close
              </button>
              <button
                className="rounded-full bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
                onClick={() => {
                  setShowLoginPrompt(false);
                  navigate('/login');
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}