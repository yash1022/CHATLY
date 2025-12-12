import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <main className="pt-20 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl font-bold text-slate-800 leading-tight">
              Connect Instantly,
              <br />
              <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Chat Securely
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Experience seamless real-time messaging with end-to-end encryption. 
              Stay connected with your friends and family, anytime, anywhere.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center space-x-4 pt-8">
              <button className="px-8 py-4 bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-full hover:shadow-xl hover:scale-105 transition-all duration-200" onClick={()=> navigate('/chats')}>
                Get Started Free
              </button>
              <button className="px-8 py-4 bg-white text-slate-700 font-semibold rounded-full border-2 border-slate-200 hover:border-blue-500 hover:text-blue-600 transition-all duration-200">
                Learn More
              </button>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-24">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Lightning Fast</h3>
              <p className="text-slate-600">
                Experience real-time messaging with zero lag. Messages delivered instantly.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Secure & Private</h3>
              <p className="text-slate-600">
                End-to-end encryption ensures your conversations stay private and secure.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Group Chats</h3>
              <p className="text-slate-600">
                Create groups, share moments, and stay connected with multiple friends at once.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-600">
          <p>© 2025 Chatly. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}