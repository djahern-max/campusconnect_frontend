import apiClient from '../client';
import type { Token, AdminUser } from '@/types';

export const authApi = {
  login: async (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await apiClient.post<Token>('/admin/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data;
  },

  validateInvitation: async (code: string) => {
    const response = await apiClient.post<{
      valid: boolean;
      entity_type?: string | null;
      entity_id?: number | null;
      entity_name?: string | null;
      message: string;
    }>('/admin/auth/validate-invitation', { code });
    return response.data;
  },

  register: async (email: string, password: string, invitation_code: string) => {
    const response = await apiClient.post<AdminUser>('/admin/auth/register', {
      email,
      password,
      invitation_code,
    });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await apiClient.get<AdminUser>('/admin/auth/me');
    return response.data;
  },
};