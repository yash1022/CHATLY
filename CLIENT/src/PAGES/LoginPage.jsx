import React, { useState } from 'react';
import { useAuth } from '../CONTEXT/AuthProvider';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusType, setStatusType] = useState(null);
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      setStatusType('success');
      setShowStatusModal(true);
      window.setTimeout(() => {
        nav('/');
      }, 5000);
    } catch (error) {
      setErr(error.response?.data?.message || 'Login failed');
      setStatusType('error');
      setShowStatusModal(true);
    }
  }
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur rounded-3xl border border-slate-800 shadow-xl p-8">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Welcome back</p>
          <h1 className="text-3xl font-semibold text-slate-100 mt-3">Sign in to Chatly</h1>
          <p className="text-sm text-slate-400 mt-2">Join the conversation and pick up where you left off.</p>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
              Username or Email
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="name@domain.com"
                value ={email}
                onChange={e=>setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
              />
              <span className="absolute inset-y-0 right-4 flex items-center text-slate-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14v7" />
                </svg>
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-4 text-xs font-semibold text-slate-400 hover:text-slate-200"
              >
                Show
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 text-slate-400">
              <input type="checkbox" className="rounded-lg border-slate-600 bg-slate-900 text-blue-500 focus:ring-blue-500/40" />
              Remember me
            </label>
            <button type="button" className="text-blue-400 font-semibold hover:text-purple-400 transition">
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-linear-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 shadow-lg shadow-blue-200/60 hover:shadow-purple-300/80 transition-all"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-400">
          <p>
            Don&apos;t have an account?{' '}
            <button type="button" className="font-semibold text-purple-400 hover:text-blue-400 transition" onClick={() => nav("/signup")}>
              Create one
            </button>
          </p>
        </div>
      </div>

      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-slate-950/70"
            onClick={() => setShowStatusModal(false)}
          />
          <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <h2 className="text-lg font-semibold text-slate-100">
                {statusType === 'success' ? 'Logged in successfully' : 'Failed to login retry'}
              </h2>
              <button
                className="text-slate-400 hover:text-slate-200"
                onClick={() => setShowStatusModal(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <p className="mt-3 text-slate-300">
              {statusType === 'success'
                ? 'Welcome back! Redirecting you to home.'
                : err || 'Please check your credentials and try again.'}
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                className="rounded-full border border-slate-700 px-4 py-2 text-slate-200 hover:bg-slate-800"
                onClick={() => setShowStatusModal(false)}
              >
                Close
              </button>
              {statusType === 'success' && (
                <button
                  className="rounded-full bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-500"
                  onClick={() => nav('/')}
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
