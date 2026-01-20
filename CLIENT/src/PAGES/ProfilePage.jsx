import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../CONTEXT/AuthProvider';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const safeContacts = useMemo(() => (Array.isArray(user?.contacts) ? user.contacts : []), [user]);
  const safeBlocked = useMemo(() => (Array.isArray(user?.blockedUsers) ? user.blockedUsers : []), [user]);

  const avatarSrc = user?.ppUrl?.trim()
    ? user.ppUrl
    : `https://ui-avatars.com/api/?background=4f46e5&color=fff&name=${encodeURIComponent(
        user?.name || user?.username || 'Chatly User'
      )}`;

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : null;

  const infoGrid = [
    { label: 'Display Name', value: user?.name || 'Not provided' },
    { label: 'Username', value: user?.username ? `@${user.username}` : 'Not provided' },
    { label: 'Email Address', value: user?.email || 'Not provided' }
  ];

  const statCards = [
    { label: 'Contacts', value: safeContacts.length, accent: 'from-blue-500 to-indigo-500' },
    { label: 'Blocked', value: safeBlocked.length, accent: 'from-rose-500 to-orange-500' }
  ];

  const renderRefLabel = (entry, fallback) => {
    if (!entry) return fallback;
    if (typeof entry === 'string') {
      return `ID • ${entry.slice(0, 6)}…`;
    }
    if (typeof entry === 'object') {
      if (entry.username) return `@${entry.username}`;
      if (entry.name) return entry.name;
      if (entry._id) return `ID • ${String(entry._id).slice(0, 6)}…`;
    }
    return fallback;
  };

  if (!user) {
    return (
      <section className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6">
        <div className="max-w-xl w-full bg-slate-900/80 border border-slate-800 rounded-3xl p-10 text-center shadow-2xl">
          <p className="text-sm font-semibold tracking-[0.35em] text-slate-400 uppercase mb-4">Profile</p>
          <h1 className="text-3xl font-bold text-slate-100 mb-4">You are not signed in</h1>
          <p className="text-slate-300 mb-8">
            Log in to see your personalized profile, contact list, and account insights.
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
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="relative overflow-hidden rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg">
          <div className="absolute inset-0 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10" />
          <div className="relative p-8 md:p-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold tracking-[0.35em] text-slate-400 uppercase">Profile</p>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mt-2">Your Space on Chatly</h1>
              <p className="text-slate-300 mt-4 max-w-2xl">
                Keep track of your identity, connections, and preferences across the Chatly network.
              </p>
            </div>
            <div className="self-start md:self-auto flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate('/profile/edit')}
                className="px-6 py-3 rounded-full font-semibold text-slate-200 border border-slate-700 hover:border-blue-400 hover:text-blue-400 transition-colors"
              >
                Edit Profile
              </button>
              <button
                type="button"
                onClick={() => navigate('/chats')}
                className="px-6 py-3 rounded-full text-white font-semibold bg-linear-to-r from-blue-500 to-purple-600 shadow-md hover:shadow-xl hover:scale-105 transition-all"
              >
                Jump to Chats
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[320px,1fr]">
          <div className="space-y-8">
            <article className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-xl border border-slate-800">
              <div className="absolute inset-0 bg-linear-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5" />
              <div className="relative px-10 py-12 text-center flex flex-col items-center gap-6">
                <div className="w-36 h-36 rounded-3xl overflow-hidden border-4 border-slate-800 shadow-2xl">
                  <img src={avatarSrc} alt={user?.name || 'Profile avatar'} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="text-3xl font-semibold text-slate-100">{user?.name || 'Unnamed User'}</h2>
                  <p className="text-slate-400 mt-1 text-lg">{user?.username ? `@${user.username}` : 'username pending'}</p>
                </div>
                <div className="w-full flex flex-col gap-1 text-sm">
                  <p className="font-semibold text-slate-400 uppercase tracking-[0.3em]">Email</p>
                  <p className="text-slate-200 text-base">{user?.email || 'Not provided'}</p>
                </div>
                {memberSince && (
                  <div className="text-sm text-slate-400">
                    Member since <span className="font-semibold text-slate-200">{memberSince}</span>
                  </div>
                )}
              </div>
            </article>

            <article className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm p-8">
              <p className="text-sm font-semibold tracking-[0.3em] text-slate-400 uppercase">Bio</p>
              <p className="text-lg text-slate-300 mt-4 leading-relaxed">
                {user?.bio?.trim() ? user.bio : 'Tell the world a little bit about yourself to make your profile feel more personal.'}
              </p>
            </article>
          </div>

          <div className="space-y-8">
            <article className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm p-8">
              <p className="text-sm font-semibold tracking-[0.3em] text-slate-400 uppercase">Account Details</p>
              <div className="grid md:grid-cols-2 gap-6 mt-6">
                {infoGrid.map(item => (
                  <div key={item.label} className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                    <p className="text-xs font-semibold text-slate-400 tracking-[0.25em] uppercase">{item.label}</p>
                    <p className="text-lg font-medium text-slate-100 mt-2 break-all">{item.value}</p>
                  </div>
                ))}
              </div>
            </article>

            <div className="grid md:grid-cols-2 gap-5">
              {statCards.map(card => (
                <div
                  key={card.label}
                  className={`rounded-3xl p-6 text-white shadow-lg bg-linear-to-r ${card.accent}`}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">{card.label}</p>
                  <p className="text-5xl font-bold mt-4">{card.value}</p>
                  <p className="text-white/80 mt-2 text-sm">
                    {card.label === 'Contacts' ? 'People you can reach instantly.' : 'Users you have muted for now.'}
                  </p>
                </div>
              ))}
            </div>

            <article className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm p-8 space-y-8">
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold tracking-[0.3em] text-slate-400 uppercase">Contacts</p>
                  <span className="text-slate-400 text-sm">{safeContacts.length} saved</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {safeContacts.length ? (
                    safeContacts.slice(0, 8).map((contact, idx) => (
                      <span
                        key={contact?._id || contact || idx}
                        className="px-3 py-1.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-sm"
                      >
                        {renderRefLabel(contact, `Contact ${idx + 1}`)}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm">You have not added anyone yet.</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold tracking-[0.3em] text-slate-400 uppercase">Blocked Users</p>
                  <span className="text-slate-400 text-sm">{safeBlocked.length} hidden</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {safeBlocked.length ? (
                    safeBlocked.slice(0, 8).map((blocked, idx) => (
                      <span
                        key={blocked?._id || blocked || idx}
                        className="px-3 py-1.5 rounded-full bg-rose-500/10 text-rose-300 border border-rose-500/20 text-sm"
                      >
                        {renderRefLabel(blocked, `User ${idx + 1}`)}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-400 text-sm">No one is blocked right now.</p>
                  )}
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
