// ============================================================================
// FIXED: src/api/endpoints/gallery.ts
// Proper null handling for featured images and all responses
// ============================================================================

import { apiClient } from '../client';

export interface GalleryImage {
  id: number;
  entity_type: 'institution' | 'scholarship';
  entity_id: number;
  image_url: string;
  cdn_url: string;
  filename: string;
  caption: string | null;
  image_type: 'campus' | 'facility' | 'student_life' | 'academic' | 'athletics' | 'other' | null;
  display_order: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string | null;

  // Computed property for convenience
  url: string;
}

export interface GalleryImageUpload {
  file: File;
  caption?: string;
  image_type?: 'campus' | 'facility' | 'student_life' | 'academic' | 'athletics' | 'other';
}

export interface GalleryImageUpdate {
  caption?: string;
  image_type?: 'campus' | 'facility' | 'student_life' | 'academic' | 'athletics' | 'other';
  display_order?: number;
}

// ✅ FIXED: Better null handling with validation
function transformGalleryImage(image: any): GalleryImage {
  if (!image) {
    throw new Error('Cannot transform null image');
  }

  // Ensure we have a valid URL - prefer CDN, fallback to image_url
  const url = image.cdn_url || image.image_url || '';

  return {
    ...image,
    url,
    cdn_url: image.cdn_url || image.image_url || '',
    image_url: image.image_url || image.cdn_url || '',
  };
}

// ==================== ADMIN ENDPOINTS ====================

/**
 * Get all gallery images for the authenticated admin's entity
 */
export const getAdminGallery = async (): Promise<GalleryImage[]> => {
  const response = await apiClient.get<GalleryImage[]>('/admin/gallery');
  return response.data.map(transformGalleryImage);
};

/**
 * Upload a new image to the gallery
 */
export const uploadGalleryImage = async (data: GalleryImageUpload): Promise<GalleryImage> => {
  const formData = new FormData();
  formData.append('file', data.file);
  if (data.caption) formData.append('caption', data.caption);
  if (data.image_type) formData.append('image_type', data.image_type);

  const response = await apiClient.post<GalleryImage>('/admin/gallery', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return transformGalleryImage(response.data);
};

/**
 * Update gallery image metadata
 */
export const updateGalleryImage = async (
  imageId: number,
  data: GalleryImageUpdate
): Promise<GalleryImage> => {
  const response = await apiClient.put<GalleryImage>(`/admin/gallery/${imageId}`, data);
  return transformGalleryImage(response.data);
};

/**
 * Delete a gallery image
 */
export const deleteGalleryImage = async (imageId: number): Promise<void> => {
  await apiClient.delete(`/admin/gallery/${imageId}`);
};

/**
 * Reorder gallery images
 */
export const reorderGallery = async (imageIds: number[]): Promise<void> => {
  await apiClient.put('/admin/gallery/reorder', { image_ids: imageIds });
};

/**
 * Set an image as featured
 */
export const setFeaturedImage = async (imageId: number): Promise<void> => {
  await apiClient.post('/admin/gallery/set-featured', { image_id: imageId });
};

/**
 * Get the currently featured image
 * ✅ FIXED: Don't transform if response is null/empty
 */
export const getFeaturedImage = async (): Promise<GalleryImage | null> => {
  try {
    const response = await apiClient.get<GalleryImage>('/admin/gallery/featured');
    // ✅ Check if response.data exists and is not null before transforming
    if (!response.data) {
      return null;
    }
    return transformGalleryImage(response.data);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

// ==================== PUBLIC ENDPOINTS ====================

/**
 * Get institution gallery by database ID (public)
 */
export const getInstitutionGallery = async (institutionId: number): Promise<GalleryImage[]> => {
  const response = await apiClient.get<GalleryImage[]>(
    `/public/gallery/institutions/${institutionId}/gallery`
  );
  return response.data.map(transformGalleryImage);
};

/**
 * Get institution gallery by IPEDS ID (public)
 */
export const getInstitutionGalleryByIpeds = async (ipedsId: number): Promise<GalleryImage[]> => {
  const response = await apiClient.get<GalleryImage[]>(
    `/public/gallery/institutions/ipeds/${ipedsId}/gallery`
  );
  return response.data.map(transformGalleryImage);
};

/**
 * Get institution featured image (public)
 * ✅ FIXED: Don't transform if response is null/empty
 */
export const getInstitutionFeaturedImage = async (
  institutionId: number
): Promise<GalleryImage | null> => {
  try {
    const response = await apiClient.get<GalleryImage>(
      `/public/gallery/institutions/${institutionId}/featured-image`
    );
    if (!response.data) {
      return null;
    }
    return transformGalleryImage(response.data);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

/**
 * Get scholarship gallery (public)
 */
export const getScholarshipGallery = async (scholarshipId: number): Promise<GalleryImage[]> => {
  const response = await apiClient.get<GalleryImage[]>(
    `/public/gallery/scholarships/${scholarshipId}/gallery`
  );
  return response.data.map(transformGalleryImage);
};

/**
 * Get scholarship featured image (public)
 * ✅ FIXED: Don't transform if response is null/empty
 */
export const getScholarshipFeaturedImage = async (
  scholarshipId: number
): Promise<GalleryImage | null> => {
  try {
    const response = await apiClient.get<GalleryImage>(
      `/public/gallery/scholarships/${scholarshipId}/featured-image`
    );
    if (!response.data) {
      return null;
    }
    return transformGalleryImage(response.data);
  } catch (error: any) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};