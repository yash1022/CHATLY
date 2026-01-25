import React, { useState } from 'react';
import { useAuth } from '../CONTEXT/AuthProvider';
import { useNavigate } from 'react-router-dom';

export default function SignupPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [userName , setUserName] = useState('');
  const [bio, setBio] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusType, setStatusType] = useState(null);
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await register(name , userName , email , password , bio);
      setStatusType('success');
      setShowStatusModal(true);
    } catch {
      setStatusType('error');
      setShowStatusModal(true);
    }
  }
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-4xl bg-slate-900/85 backdrop-blur rounded-4xl border border-slate-800 shadow-2xl">
        <div className="grid md:grid-cols-[1.1fr_0.9fr] gap-0">
          <section className="p-10 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-900/80">
            <div className="mb-8">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Join Chatly</p>
              <h1 className="text-3xl font-semibold text-slate-100 mt-3">Create your account</h1>
              <p className="text-sm text-slate-400 mt-2">Tell us a bit about yourself to get started.</p>
            </div>

            <form className="space-y-6" onSubmit={onSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 block mb-2">Name</label>
                  <input
                    type="text"
                    value ={name}
                    onChange ={e => setName(e.target.value)}
                    placeholder="John Carter"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 block mb-2">Username</label>
                  <input
                    type="text"
                    value ={userName}
                    onChange ={e => setUserName(e.target.value)}
                    placeholder="@johncarter"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 block mb-2">Email</label>
                  <input
                    type="email"
                    value ={email}
                    onChange ={e => setEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 block mb-2">Password</label>
                  <input
                    type="password"
                    value ={password}
                    onChange ={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-400 block mb-2">Bio</label>
                <textarea
                  rows={4}
                  value ={bio}
                  onChange ={e => setBio(e.target.value)}
                  placeholder="Tell us what brings you to Chatly..."
                  className="w-full rounded-3xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-3xl bg-linear-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 shadow-lg shadow-purple-200/60 hover:shadow-purple-300/80 transition-all"
              >
                Create account
              </button>
            </form>
          </section>

          <aside className="p-10 bg-linear-to-br from-slate-900/80 to-slate-800/80 border-t md:border-t-0 border-slate-800">
            <div className="flex flex-col items-center text-center h-full justify-center gap-6">
              <div className="w-32 h-32 rounded-3xl border border-dashed border-slate-700 bg-slate-900/70 flex items-center justify-center text-slate-400">
                <label className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 16V4m0 0l3 3m-3-3L9 7m-4 6v7h14v-7" />
                  </svg>
                  <span className="text-xs font-semibold text-slate-400">Upload</span>
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Profile image</h2>
                <p className="text-sm text-slate-400 mt-2">PNG or JPG, max 3 MB. A friendly face helps others recognize you.</p>
              </div>
              <div className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4 text-left shadow-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tip</p>
                <p className="text-sm text-slate-300 mt-1">Keep your bio short and personality-packed. You can edit everything later.</p>
              </div>
            </div>
          </aside>
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
                {statusType === 'success' ? 'Registration successful' : 'Registration failed'}
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
                ? 'Your account is ready. Please login to continue.'
                : 'We could not create your account. Please try again.'}
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
                  onClick={() => {
                    setShowStatusModal(false);
                    nav('/login');
                  }}
                >
                  Go to Login
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
 