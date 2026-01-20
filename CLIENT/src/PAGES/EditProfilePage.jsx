import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../CONTEXT/AuthProvider';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: '',
    username: '',
    bio: '',
    ppUrl: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm({
      name: user?.name || '',
      username: user?.username || '',
      bio: user?.bio || '',
      ppUrl: user?.ppUrl || ''
    });
  }, [user]);

  const avatarPreview = useMemo(() => {
    if (form.ppUrl?.trim()) {
      return form.ppUrl.trim();
    }
    return `https://ui-avatars.com/api/?background=4f46e5&color=fff&name=${encodeURIComponent(
      form.name || form.username || 'Chatly User'
    )}`;
  }, [form.name, form.username, form.ppUrl]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!updateProfile) {
      setError('Profile updates are not available right now.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateProfile({
        name: form.name.trim(),
        username: form.username.trim(),
        bio: form.bio,
        ppUrl: form.ppUrl.trim()
      });
      navigate('/profile');
    } catch (err) {
      const message = err?.response?.data?.message || 'Unable to update profile.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <section className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6">
        <div className="max-w-xl w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-10 text-center shadow-2xl">
          <p className="text-sm font-semibold tracking-[0.35em] text-slate-400 uppercase mb-4">Profile</p>
          <h1 className="text-3xl font-bold text-slate-100 mb-4">You are not signed in</h1>
          <p className="text-slate-300 mb-8">
            Log in to update your display name, username, bio, and profile picture.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="px-6 py-3 rounded-full text-white font-semibold bg-linear-to-r from-blue-500 to-purple-600 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              Go to Login
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-full font-semibold text-slate-200 border border-slate-700 hover:border-blue-400 hover:text-blue-400 transition-colors"
            >
              Back Home
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 py-16 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="relative p-8 md:p-10">
            <p className="text-sm font-semibold tracking-[0.35em] text-slate-400 uppercase">Edit Profile</p>
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mt-2">Update your identity</h1>
            <p className="text-slate-300 mt-3 max-w-2xl">
              Change your name, username, bio, and profile picture. Your updates will appear across Chatly.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg p-8 md:p-10 space-y-8">
          <div className="flex flex-col md:flex-row gap-8 md:items-center">
            <div className="w-36 h-36 rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl">
              <img src={avatarPreview} alt="Profile preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 tracking-[0.25em] uppercase">Profile Picture URL</label>
                <input
                  type="url"
                  name="ppUrl"
                  value={form.ppUrl}
                  onChange={handleChange}
                  placeholder="https://"
                  className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-400 focus:outline-none"
                />
              </div>
              <p className="text-sm text-slate-400">
                Use a direct image URL (JPG, PNG, or WebP). Leave blank to keep the default avatar.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-semibold text-slate-400 tracking-[0.25em] uppercase">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-400 tracking-[0.25em] uppercase">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="@handle"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-400 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 tracking-[0.25em] uppercase">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handleChange}
              rows={4}
              placeholder="Tell people about yourself"
              className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-400 focus:outline-none"
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="px-6 py-3 rounded-full font-semibold text-slate-200 border border-slate-700 hover:border-blue-400 hover:text-blue-400 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-full text-white font-semibold bg-linear-to-r from-blue-500 to-purple-600 shadow-md hover:shadow-xl hover:scale-105 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
