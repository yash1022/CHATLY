import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../API/axiosConfig';
import { connectSocket, disconnectSocket } from '../SOCKET/socketInit';
import {
  generateRsaKeyPair,
  loadKeyPairFromLocalStorage,
  storeKeyPairInLocalStorage,
  exportPublicKeyToPem
} from '../UTILS/CRYPTO/rsa';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);

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
    const onLogout = () => {
      setAccessToken(null);
      setUser(null);
      disconnectSocket();
      setSocket(null);
    };
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
    if (!accessToken) {
      disconnectSocket();
      setSocket(null);
      return;
    }
    const instance = connectSocket(accessToken);
    setSocket(instance);
  }, [accessToken]);

  useEffect(() => () => disconnectSocket(), []); // HANDLE CLEANUP ON UNMOUNT

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

  async function updateProfile(payload) {
    const resp = await api.put('/me', payload);
    setUser(resp.data);
    return resp.data;
  }

  // Ensures a single RSA key pair exists locally before first registration.
  const ensureRegistrationKeys = async () => {
    const existingPair = await loadKeyPairFromLocalStorage().catch(() => null);
    if (existingPair) {
      const publicPem = await exportPublicKeyToPem(existingPair.publicKey);
      return { publicPem };
    }

    const keyPair = await generateRsaKeyPair();
    const { publicPem } = await storeKeyPairInLocalStorage(keyPair.publicKey, keyPair.privateKey);
    return { publicPem };
  };

  async function register(name , username , email , password , bio) {
    const { publicPem } = await ensureRegistrationKeys();
    await api.post('/auth/register', { name, username, email, password, bio, publicKey: publicPem });
  }

  async function logout() {
    await api.post('/auth/logout');
    setAccessToken(null);
    setUser(null);
    disconnectSocket();
    setSocket(null);
  }



  const value = { accessToken, user, socket, login, register, logout, updateProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}