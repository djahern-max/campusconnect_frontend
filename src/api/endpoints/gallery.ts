// src/api/endpoints/gallery.ts
import { apiClient } from '../client';

export interface GalleryImage {
  id: number;
  url: string;
  caption?: string;
  image_type: 'campus' | 'facility' | 'student_life' | 'academic' | 'athletics' | 'other';
  display_order: number;
  is_featured: boolean;
  institution_id?: number;
  scholarship_id?: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryImageUpload {
  file: File;
  caption?: string;
  image_type: 'campus' | 'facility' | 'student_life' | 'academic' | 'athletics' | 'other';
}

export interface GalleryImageUpdate {
  caption?: string;
  image_type?: 'campus' | 'facility' | 'student_life' | 'academic' | 'athletics' | 'other';
  display_order?: number;
}

export interface ImageUploadResponse {
  success: boolean;
  filename: string;
  url: string;
}

export interface ImageListItem {
  filename: string;
  url: string;
  size: number;
  uploaded_at: string;
}

export interface ReorderRequest {
  image_ids: number[];
}

export interface SetFeaturedRequest {
  image_id: number;
}

// ==================== ADMIN ENDPOINTS ====================

/**
 * Get all gallery images for the authenticated admin's entity
 * ✅ FIXED: Removed /api/v1 prefix (it's in the baseURL)
 */
export const getAdminGallery = async (): Promise<GalleryImage[]> => {
  const response = await apiClient.get<GalleryImage[]>('/admin/gallery');
  return response.data;
};

/**
 * Upload a new image to the gallery
 * ✅ FIXED: Removed /api/v1 prefix
 */
export const uploadGalleryImage = async (data: GalleryImageUpload): Promise<GalleryImage> => {
  const formData = new FormData();
  formData.append('file', data.file);
  if (data.caption) formData.append('caption', data.caption);
  formData.append('image_type', data.image_type);

  const response = await apiClient.post<GalleryImage>('/admin/gallery', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Update gallery image metadata
 * ✅ FIXED: Removed /api/v1 prefix
 */
export const updateGalleryImage = async (
  imageId: number,
  data: GalleryImageUpdate
): Promise<GalleryImage> => {
  const response = await apiClient.put<GalleryImage>(`/admin/gallery/${imageId}`, data);
  return response.data;
};

/**
 * Delete a gallery image
 * ✅ FIXED: Removed /api/v1 prefix
 */
export const deleteGalleryImage = async (imageId: number): Promise<void> => {
  await apiClient.delete(`/admin/gallery/${imageId}`);
};

/**
 * Reorder gallery images
 * ✅ FIXED: Removed /api/v1 prefix
 */
export const reorderGallery = async (imageIds: number[]): Promise<void> => {
  await apiClient.put('/admin/gallery/reorder', { image_ids: imageIds });
};

/**
 * Set an image as featured
 * ✅ FIXED: Removed /api/v1 prefix
 */
export const setFeaturedImage = async (imageId: number): Promise<void> => {
  await apiClient.post('/admin/gallery/set-featured', { image_id: imageId });
};

/**
 * Get the currently featured image
 * ✅ FIXED: Removed /api/v1 prefix
 */
export const getFeaturedImage = async (): Promise<GalleryImage | null> => {
  try {
    const response = await apiClient.get<GalleryImage>('/admin/gallery/featured');
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null; // No featured image set
    }
    throw error;
  }
};

// ==================== IMAGE MANAGEMENT ENDPOINTS ====================

/**
 * Upload an image to storage (without adding to gallery)
 * ✅ FIXED: Removed /api/v1 prefix
 */
export const uploadImage = async (file: File): Promise<ImageUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ImageUploadResponse>(
    '/admin/images/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * List all uploaded images
 * ✅ FIXED: Removed /api/v1 prefix
 */
export const listImages = async (): Promise<{ images: ImageListItem[] }> => {
  const response = await apiClient.get<{ images: ImageListItem[] }>('/admin/images/list');
  return response.data;
};

/**
 * Delete an uploaded image by filename
 * ✅ FIXED: Removed /api/v1 prefix
 */
export const deleteImage = async (filename: string): Promise<void> => {
  await apiClient.delete(`/admin/images/${filename}`);
};

// ==================== PUBLIC ENDPOINTS ====================

/**
 * Get institution gallery by database ID (public)
 * ✅ FIXED: Removed /api/v1 prefix
 */
export const getInstitutionGallery = async (institutionId: number): Promise<GalleryImage[]> => {
  const response = await apiClient.get<GalleryImage[]>(
    `/public/gallery/institutions/${institutionId}/gallery`
  );
  return response.data;
};

/**
 * Get institution gallery by IPEDS ID (public)
 * ✅ FIXED: Removed /api/v1 prefix
 */
export const getInstitutionGalleryByIpeds = async (ipedsId: number): Promise<GalleryImage[]> => {
  const response = await apiClient.get<GalleryImage[]>(
    `/public/gallery/institutions/ipeds/${ipedsId}/gallery`
  );
  return response.data;
};

/**
 * Get institution featured image (public)
 * ✅ FIXED: Removed /api/v1 prefix
 */
export const getInstitutionFeaturedImage = async (
  institutionId: number
): Promise<GalleryImage | null> => {
  try {
    const response = await apiClient.get<GalleryImage>(
      `/public/gallery/institutions/${institutionId}/featured-image`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Get scholarship gallery (public)
 * ✅ FIXED: Removed /api/v1 prefix
 */
export const getScholarshipGallery = async (scholarshipId: number): Promise<GalleryImage[]> => {
  const response = await apiClient.get<GalleryImage[]>(
    `/public/gallery/scholarships/${scholarshipId}/gallery`
  );
  return response.data;
};

/**
 * Get scholarship featured image (public)
 * ✅ FIXED: Removed /api/v1 prefix
 */
export const getScholarshipFeaturedImage = async (
  scholarshipId: number
): Promise<GalleryImage | null> => {
  try {
    const response = await apiClient.get<GalleryImage>(
      `/public/gallery/scholarships/${scholarshipId}/featured-image`
    );
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};