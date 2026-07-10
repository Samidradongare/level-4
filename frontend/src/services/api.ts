import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE_URL = rawApiUrl.endsWith('/api') || rawApiUrl.endsWith('/api/')
  ? rawApiUrl
  : `${rawApiUrl.replace(/\/$/, '')}/api`;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('usagepay_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / unauthenticated requests
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect if session expired
      localStorage.removeItem('usagepay_token');
      localStorage.removeItem('usagepay_user');
      window.location.hash = '#/login';
    }
    return Promise.reject(error);
  }
);
export default api;
