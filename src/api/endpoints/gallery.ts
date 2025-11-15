import apiClient from '../client';
import type { InstitutionImage } from '@/types/api';

export const galleryApi = {
  upload: async (file: File, caption?: string, imageType?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);
    if (imageType) formData.append('image_type', imageType);

    const response = await apiClient.post<InstitutionImage>('/admin/gallery', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get<InstitutionImage[]>('/admin/gallery');
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/admin/gallery/${id}`);
  },

  update: async (id: number, data: { caption?: string; image_type?: string }) => {
    const response = await apiClient.put<InstitutionImage>(`/admin/gallery/${id}`, data);
    return response.data;
  },

  reorder: async (imageIds: number[]) => {
    await apiClient.put('/admin/gallery/reorder', { image_ids: imageIds });
  },
};
