// src/config/api.ts
// Centralized API configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
export const API_BASE_URL = `${API_URL}/api/v1`;