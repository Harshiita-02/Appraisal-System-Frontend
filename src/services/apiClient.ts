import axios from 'axios';

// Base URL goes through Vite's dev proxy (see vite.config.ts) so this stays
// '/api' in dev and can be swapped to an absolute URL via env var in prod.
const baseURL = import.meta.env.VITE_API_BASE_URL ?? '/api';

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT to every request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralized 401 handling, PLUS sliding-expiry token refresh.
//
// The backend's JwtAuthFilter reissues a fresh token (full new 20-minute
// window) whenever the current one has used up more than half its life,
// and sends it back via the X-Refreshed-Token response header. If we
// never read that header, the user gets logged out exactly 20 minutes
// after login, no matter how active they are — this block is what makes
// it "logged out after 20 minutes of inactivity" instead.
apiClient.interceptors.response.use(
  (response) => {
    const refreshedToken = response.headers['x-refreshed-token'];
    if (refreshedToken) {
      localStorage.setItem('auth_token', refreshedToken);
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);