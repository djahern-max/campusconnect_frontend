import apiClient from '../client';
import type { Institution } from '@/types/api';

export const institutionsApi = {
  getAll: async (params?: { state?: string; limit?: number; offset?: number }) => {
    const response = await apiClient.get<Institution[]>('/institutions', { params });
    return response.data;
  },

  getById: async (ipeds_id: number) => {
    const response = await apiClient.get<Institution>(`/institutions/${ipeds_id}`);
    return response.data;
  },
};
