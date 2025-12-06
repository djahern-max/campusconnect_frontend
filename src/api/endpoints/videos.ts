import apiClient from '../client';
import type { InstitutionVideo } from '@/types';

export const videosApi = {
  getAll: async () => {
    const response = await apiClient.get<InstitutionVideo[]>('/admin/videos');
    return response.data;
  },

  add: async (data: {
    video_url: string;
    title?: string;
    description?: string;
    video_type?: string;
  }) => {
    const response = await apiClient.post<InstitutionVideo>('/admin/videos', data);
    return response.data;
  },

  update: async (id: number, data: {
    title?: string;
    description?: string;
    video_type?: string;
  }) => {
    const response = await apiClient.put<InstitutionVideo>(`/admin/videos/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/admin/videos/${id}`);
  },
};
