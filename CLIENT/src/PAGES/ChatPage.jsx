import React, { useMemo, useState } from 'react';
import users from '../UTILS/dummyUsers.json';

export default function ChatPage() {
  const [selectedUserId, setSelectedUserId] = useState(users[0]?.id ?? null);
  const [draftMessage, setDraftMessage] = useState('');

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId),
    [selectedUserId]
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 py-6 px-4">
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md border border-white/40 shadow-2xl rounded-4xl overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[650px]">
          {/* User List */}
          <aside className="w-full lg:w-1/3 bg-white/70 border-b lg:border-b-0 lg:border-r border-slate-100">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Chats</p>
                  <h2 className="text-2xl font-bold text-slate-900">Conversations</h2>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  12
                </div>
              </div>
              <div className="mt-5">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search people"
                    className="w-full rounded-2xl border border-slate-200 bg-white/90 py-3 pl-4 pr-10 text-sm text-slate-600 placeholder-slate-400 focus:border-blue-400 focus:outline-none"
                  />
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="overflow-y-auto max-h-[calc(650px-160px)]">
              {users.map((user) => {
                const isActive = user.id === selectedUserId;
                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUserId(user.id)}
                    className={`w-full flex items-center gap-4 px-6 py-4 text-left transition-all ${
                      isActive
                        ? 'bg-linear-to-r from-blue-50/80 to-purple-50/80 border-l-4 border-blue-500'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-2xl object-cover"
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                          user.status === 'Online' ? 'bg-emerald-400' : 'bg-slate-300'
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        {user.unread > 0 && (
                          <span className="text-xs font-semibold text-white bg-linear-to-r from-blue-500 to-purple-500 rounded-full px-2 py-0.5">
                            {user.unread}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 truncate">{user.lastMessage}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Chat Window */}
          <section className="flex-1 flex flex-col bg-white/80">
            {selectedUser ? (
              <>
                <header className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedUser.avatar}
                      alt={selectedUser.name}
                      className="w-14 h-14 rounded-2xl object-cover"
                    />
                    <div>
                      <h3 className="text-xl font-semibold text-slate-900">{selectedUser.name}</h3>
                      <p className="text-sm text-slate-500">{selectedUser.status}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button className="w-12 h-12 rounded-2xl border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors">
                      <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </button>
                    <button className="w-12 h-12 rounded-2xl border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 transition-colors">
                      <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A2 2 0 0122 9.618V14.5a2 2 0 01-2.447 1.894L15 14M4 6h8M4 10h8m-8 4h8" />
                      </svg>
                    </button>
                  </div>
                </header>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-linear-to-b from-white/80 to-slate-50">
                  {selectedUser.messages.map((message) => (
                    <div key={message.id} className="flex flex-col">
                      <div
                        className={`max-w-[75%] rounded-3xl px-5 py-3 text-sm leading-relaxed shadow-sm ${
                          message.sender === 'me'
                            ? 'self-end bg-linear-to-r from-blue-500 to-purple-500 text-white rounded-br-sm'
                            : 'self-start bg-white text-slate-700 border border-slate-100 rounded-bl-sm'
                        }`}
                      >
                        {message.text}
                      </div>
                      <span
                        className={`mt-1 text-xs ${
                          message.sender === 'me' ? 'self-end text-slate-400' : 'self-start text-slate-400'
                        }`}
                      >
                        {message.time}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="px-6 py-5 border-t border-slate-100 bg-white/90">
                  <div className="flex items-center gap-3">
                    <button className="w-12 h-12 rounded-2xl border border-slate-200 text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors">
                      <svg className="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-6 4h6M5 7h14M5 7l2-2m0 2L5 9" />
                      </svg>
                    </button>
                    <div className="flex-1 flex items-center gap-3 rounded-3xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                      <input
                        type="text"
                        value={draftMessage}
                        onChange={(event) => setDraftMessage(event.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent text-slate-600 placeholder-slate-400 focus:outline-none"
                      />
                      <button className="text-slate-400 hover:text-blue-500 transition-colors" title="Attach">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m0 0l3-3m-3 3l-3-3M5 12a7 7 0 1114 0 7 7 0 01-14 0z" />
                        </svg>
                      </button>
                    </div>
                    <button className="px-6 py-3 rounded-3xl text-white font-semibold bg-linear-to-r from-blue-500 to-purple-500 shadow-lg shadow-purple-200/60 hover:shadow-purple-300/80 transition-all">
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-400">
                Select a conversation to get started.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
