

import apiClient from '../client';
import type { EntityImage, ImageReorderRequest, SetFeaturedImageRequest } from '@/types/api';

export const galleryApi = {
  upload: async (file: File, caption?: string, imageType?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (caption) formData.append('caption', caption);
    if (imageType) formData.append('image_type', imageType);

    const response = await apiClient.post<EntityImage>('/admin/gallery', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getAll: async () => {
    const response = await apiClient.get<EntityImage[]>('/admin/gallery');
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`/admin/gallery/${id}`);
  },

  update: async (id: number, data: { caption?: string; image_type?: string; is_featured?: boolean }) => {
    const response = await apiClient.put<EntityImage>(`/admin/gallery/${id}`, data);
    return response.data;
  },

  reorder: async (imageIds: number[]) => {
    await apiClient.put('/admin/gallery/reorder', { image_ids: imageIds });
  },

  setFeatured: async (imageId: number) => {
    const response = await apiClient.post<{ message: string; image: EntityImage }>(
      '/admin/gallery/set-featured',
      { image_id: imageId }
    );
    return response.data;
  },

  getFeatured: async () => {
    const response = await apiClient.get<EntityImage | null>('/admin/gallery/featured');
    return response.data;
  },
};

// Public API for MagicScholar App
export const publicGalleryApi = {
  getInstitutionGallery: async (institutionId: number) => {
    const response = await apiClient.get<EntityImage[]>(`/institutions/${institutionId}/gallery`);
    return response.data;
  },

  getInstitutionGalleryByIpeds: async (ipedsId: number) => {
    const response = await apiClient.get<EntityImage[]>(`/institutions/ipeds/${ipedsId}/gallery`);
    return response.data;
  },

  getScholarshipGallery: async (scholarshipId: number) => {
    const response = await apiClient.get<EntityImage[]>(`/scholarships/${scholarshipId}/gallery`);
    return response.data;
  },

  getFeaturedInstitutionImage: async (institutionId: number) => {
    const response = await apiClient.get<EntityImage | null>(`/institutions/${institutionId}/featured-image`);
    return response.data;
  },

  getFeaturedScholarshipImage: async (scholarshipId: number) => {
    const response = await apiClient.get<EntityImage | null>(`/scholarships/${scholarshipId}/featured-image`);
    return response.data;
  },
};
