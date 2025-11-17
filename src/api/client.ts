import axios from 'axios';
import { useAuthStore } from '@/stores/authStore'; // ADD THIS IMPORT

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token and validate expiry
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      // NEW: Get auth store methods
      const { isTokenValid, logout } = useAuthStore.getState();

      // NEW: Check if token is expired before making request
      if (!isTokenValid()) {
        // Token expired - log out and redirect
        logout();
        window.location.href = '/admin/login';
        return Promise.reject(new Error('Token expired'));
      }

      // Original code - add token to header
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid from backend
      if (typeof window !== 'undefined') {
        // UPDATED: Use logout from store instead of manual removal
        const { logout } = useAuthStore.getState();
        logout();
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;