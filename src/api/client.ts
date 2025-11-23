// src/api/client.ts
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { API_URL } from '@/config/api';

const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/${API_VERSION}`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ PUBLIC ENDPOINTS - Don't require authentication
const PUBLIC_ENDPOINTS = [
  '/institutions',
  '/scholarships',
  '/public/gallery',
  '/contact/submit',
];

// Helper function to check if endpoint is public
const isPublicEndpoint = (url: string = ''): boolean => {
  return PUBLIC_ENDPOINTS.some(endpoint => url.startsWith(endpoint));
};

// Request interceptor - add auth token and validate expiry
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const url = config.url || '';

      // ✅ FIXED: Skip token validation for public endpoints
      if (isPublicEndpoint(url)) {
        // Public endpoint - don't add token, don't check validity
        return config;
      }

      // For protected endpoints, check token validity
      const { isTokenValid, logout } = useAuthStore.getState();

      if (!isTokenValid()) {
        // Token expired - log out and redirect
        logout();
        window.location.href = '/admin/login';
        return Promise.reject(new Error('Token expired'));
      }

      // Add token to header for protected endpoints
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
    // ✅ FIXED: Only redirect to login for protected endpoints
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        const url = error.config?.url || '';

        // Only redirect if it's NOT a public endpoint
        if (!isPublicEndpoint(url)) {
          const { logout } = useAuthStore.getState();
          logout();
          window.location.href = '/admin/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
