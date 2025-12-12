
import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // proxied to backend by Vite dev server
  timeout: 10000, // Request timeout in milliseconds
  withCredentials: true, // Send cookies with requests
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;
    if (err.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const r = await api.post('/auth/refresh'); // cookie auto-sent
        const newAccessToken = r.data.accessToken;
        console.log("TOKEN REFRESHED:", newAccessToken);
        // broadcast new token to app (AuthProvider listens)
        window.dispatchEvent(new CustomEvent('accessToken', { detail: newAccessToken }));
        processQueue(null, newAccessToken);
        originalRequest.headers['Authorization'] = 'Bearer ' + newAccessToken;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        window.dispatchEvent(new Event('logout'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);



export default api;
  