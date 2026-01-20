import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../API/axiosConfig';
import { useAuth } from '../CONTEXT/AuthProvider';

const SEARCH_MODES = [
  { value: 'email', label: 'Email' },
  { value: 'username', label: 'username' }
];

export default function FindUsersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState('email');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const safeQuery = query.trim();
//   const normalizedQuery = mode === 'username' && safeQuery && !safeQuery.startsWith('@')
//     ? `@${safeQuery}`
//     : safeQuery;

  const filteredResults = useMemo(() => {
    const currentUserId = user ? String(user.id ?? user._id) : null;
    return results.filter((entry) => String(entry?.id ?? entry?._id) !== currentUserId);
  }, [results, user]);

  const handleSearch = async (event) => {
    event.preventDefault();

    if (!safeQuery) {
      setError('Please enter an email or username.');
      setResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const response = await api.get('/feature/find-users', {
        params: { mode, query: safeQuery }
      });

      

      const payload = response?.data;
      if (Array.isArray(payload)) {
        setResults(payload);
      } else if (payload) {
        setResults([payload]);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Error searching users', err);
      setError('No users found or server error.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToChat = (targetUser) => {
    const normalizedId = String(targetUser?.id ?? targetUser?._id ?? '');
    if (!normalizedId) {
      return;
    }
    navigate('/chats', { state: { preselectUserId: normalizedId } });
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Find Users</p>
            <h1 className="text-3xl font-semibold text-slate-100">Search people to chat</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/chats')}
            className="px-4 py-2 rounded-2xl border border-slate-700 text-slate-300 text-sm font-semibold hover:text-blue-400 hover:border-blue-400 transition-colors"
          >
            Back to Chats
          </button>
        </div>

        <form
          onSubmit={handleSearch}
          className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="flex items-center gap-2">
              {SEARCH_MODES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setMode(option.value)}
                  className={`px-4 py-2 rounded-2xl text-xs font-semibold uppercase tracking-[0.2em] transition-colors ${
                    mode === option.value
                      ? 'bg-linear-to-r from-blue-500 to-purple-500 text-white'
                      : 'border border-slate-700 text-slate-400 hover:border-blue-400 hover:text-blue-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <div className="flex-1 flex items-center gap-3 rounded-3xl border border-slate-700 bg-slate-900 px-4 py-3">
              <input
                type={mode === 'email' ? 'email' : 'text'}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={mode === 'email' ? 'Enter email address' : 'Enter username'}
                className="flex-1 bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 rounded-3xl text-white font-semibold bg-linear-to-r from-blue-500 to-purple-500 shadow-lg shadow-purple-200/40 hover:shadow-purple-300/60 transition-all disabled:opacity-70"
            >
              {isLoading ? 'Searching...' : 'Find Users'}
            </button>
          </div>
          {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
        </form>

        <div className="mt-8 space-y-4">
          {filteredResults.length === 0 && !isLoading && !error && (
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 text-center text-slate-400">
              Search by email or username to discover people.
            </div>
          )}

          {filteredResults.map((result) => {
            const displayName = result?.name || result?.username || 'Unknown User';
            const username = result?.username ? `@${result.username}` : '';
            return (
              <div
                key={result?.id ?? result?._id ?? displayName}
                className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-lg sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-4">
                  {result?.ppUrl ? (
                    <img
                      src={result.ppUrl}
                      alt={displayName}
                      className="w-14 h-14 rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-slate-800 text-slate-100 flex items-center justify-center font-semibold">
                      {displayName.trim().slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="text-lg font-semibold text-slate-100">{displayName}</p>
                    <p className="text-sm text-slate-400">{username || result?.email || 'No details provided'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddToChat(result)}
                  className="px-5 py-2 rounded-2xl text-white font-semibold bg-linear-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-200/40 hover:shadow-emerald-300/60 transition-all"
                >
                  Add to Chat
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
