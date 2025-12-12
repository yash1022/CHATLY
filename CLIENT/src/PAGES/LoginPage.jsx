import React, { useState } from 'react';
import { useAuth } from '../CONTEXT/AuthProvider';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {

   const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await login(email, password);
      nav('/');
    } catch (error) {
      setErr(error.response?.data?.message || 'Login failed');
    }
  }
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur rounded-3xl border border-white/60 shadow-xl p-8">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Welcome back</p>
          <h1 className="text-3xl font-semibold text-slate-900 mt-3">Sign in to Chatly</h1>
          <p className="text-sm text-slate-500 mt-2">Join the conversation and pick up where you left off.</p>
        </div>

        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Username or Email
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="name@domain.com"
                value ={email}
                onChange={e=>setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
              />
              <span className="absolute inset-y-0 right-4 flex items-center text-slate-300">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 12a4 4 0 10-8 0 4 4 0 008 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14v7" />
                </svg>
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-700 placeholder-slate-400 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 focus:outline-none transition"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-4 text-xs font-semibold text-slate-400 hover:text-slate-600"
              >
                Show
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="inline-flex items-center gap-2 text-slate-500">
              <input type="checkbox" className="rounded-lg border-slate-300 text-blue-500 focus:ring-blue-400" />
              Remember me
            </label>
            <button type="button" className="text-blue-500 font-semibold hover:text-purple-500 transition">
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

        <div className="mt-8 text-center text-sm text-slate-500">
          <p>
            Don&apos;t have an account?{' '}
            <button type="button" className="font-semibold text-purple-500 hover:text-blue-500 transition" onClick={() => nav("/signup")}>
              Create one
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
