import apiClient from '../client';
import type { LoginResponse, AdminUser } from '@/types/api';

export const authApi = {
  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await apiClient.post<LoginResponse>('/admin/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  register: async (email: string, password: string, entity_type: string, entity_id: number) => {
    const response = await apiClient.post<LoginResponse>('/admin/auth/register', {
      email,
      password,
      entity_type,
      entity_id,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get<AdminUser>('/admin/auth/me');
    return response.data;
  },
};
