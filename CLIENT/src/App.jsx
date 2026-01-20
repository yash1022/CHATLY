import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './PAGES/HomePage';
import ProfilePage from './PAGES/ProfilePage';
import EditProfilePage from './PAGES/EditProfilePage';
import LoginPage from './PAGES/LoginPage';
import ChatPage from './PAGES/ChatPage';
import SignupPage from './PAGES/SignupPage';
import FindUsersPage from './PAGES/FindUsersPage';
import AppLayout from './COMPONENTS/AppLayout';
import { AuthProvider } from './CONTEXT/AuthProvider';
import { OnlineUsersProvider } from './CONTEXT/OnlineUsersContext';

export default function App() {
  return (
    <AuthProvider>
      <OnlineUsersProvider>
        <Router>
          <Routes>
            <Route element={<AppLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/edit" element={<EditProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/chats" element={<ChatPage />} />
              <Route path="/find-users" element={<FindUsersPage />} />
              <Route path="/signup" element={<SignupPage />} />
            </Route>
          </Routes>
        </Router>
      </OnlineUsersProvider>
    </AuthProvider>
    
  );
}
