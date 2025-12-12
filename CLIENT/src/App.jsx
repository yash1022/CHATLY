import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './PAGES/HomePage';
import ProfilePage from './PAGES/ProfilePage';
import LoginPage from './PAGES/LoginPage';
import ChatPage from './PAGES/ChatPage';
import SignupPage from './PAGES/SignupPage';
import AppLayout from './COMPONENTS/AppLayout';
import { AuthProvider } from './CONTEXT/AuthProvider';

export default function App() {
  return (
    <AuthProvider>

      <Router>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/chats" element={<ChatPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>
      </Routes>
    </Router>





    </AuthProvider>
    
  );
}
