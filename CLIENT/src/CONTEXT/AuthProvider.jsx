import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../API/axiosConfig';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  async function fetchUserProfile(token) {
    try {
      const me = await api.get('/me', {
        headers: {
          Authorization: 'Bearer ' + token
        }
      });
      return me.data;
    } catch (err) {
      console.error('Unable to load profile', err);
      return null;
    }
  }

  // listen for token events from axios interceptor
  useEffect(() => {
    const onToken = e => setAccessToken(e.detail);
    const onLogout = () => { setAccessToken(null); setUser(null); };
    window.addEventListener('accessToken', onToken);
    window.addEventListener('logout', onLogout);
    return () => {
      window.removeEventListener('accessToken', onToken);
      window.removeEventListener('logout', onLogout);
    };
  }, []);

  // attach access token to requests
  useEffect(() => {
    const req = api.interceptors.request.use(config => {
      if (accessToken) config.headers['Authorization'] = 'Bearer ' + accessToken;
      return config;
    });
    return () => api.interceptors.request.eject(req);
  }, [accessToken]);

  useEffect(() => {
    let active = true;

    const hydrateSession = async () => {
      try {
        const resp = await api.post('/auth/refresh');
        if (!active) return;
        const token = resp.data.accessToken;
        setAccessToken(token);
        const profile = await fetchUserProfile(token);
        if (active) setUser(profile);
      } catch (err) {
        if (active) {
          setAccessToken(null);
          setUser(null);
        }
      }
    };

    hydrateSession();
    return () => { active = false; };
  }, []);

  async function login(email, password) {
    const resp = await api.post('/auth/login', { email, password, deviceName: 'web' });
    const token = resp.data.accessToken;
    console.log("LOGGED IN SUCCESSFULLY");
    setAccessToken(token);
    const profile = await fetchUserProfile(token);
    setUser(profile);
  }

  async function register(name , username , email , password , bio) {
    await api.post('/auth/register', { name, username, email, password, bio });
    
  }

  async function logout() {
    await api.post('/auth/logout');
    setAccessToken(null);
    setUser(null);
  }

  const value = { accessToken, user, login, register, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}