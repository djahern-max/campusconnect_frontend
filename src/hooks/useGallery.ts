// src/hooks/useGallery.ts
import { useState, useCallback, useEffect } from 'react';
import {
  GalleryImage,
  GalleryImageUpload,
  GalleryImageUpdate,
  getAdminGallery,
  uploadGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  reorderGallery,
  setFeaturedImage,
  getFeaturedImage,
  getInstitutionGallery,
  getInstitutionGalleryByIpeds,
  getInstitutionFeaturedImage,
  getScholarshipGallery,
  getScholarshipFeaturedImage,
} from '@/api/endpoints/gallery';

interface UseGalleryOptions {
  autoLoad?: boolean;
  institutionId?: number;
  ipedsId?: number;
  scholarshipId?: number;
  isPublic?: boolean;
}

export const useGallery = (options: UseGalleryOptions = {}) => {
  const { autoLoad = false, institutionId, ipedsId, scholarshipId, isPublic = false } = options;

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [featuredImage, setFeaturedImageState] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load gallery images based on the provided options
   */
  const loadGallery = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let data: GalleryImage[];

      if (isPublic) {
        if (institutionId) {
          data = await getInstitutionGallery(institutionId);
        } else if (ipedsId) {
          data = await getInstitutionGalleryByIpeds(ipedsId);
        } else if (scholarshipId) {
          data = await getScholarshipGallery(scholarshipId);
        } else {
          throw new Error('Public gallery requires institutionId, ipedsId, or scholarshipId');
        }
      } else {
        // Admin gallery
        data = await getAdminGallery();
      }

      setImages(data);
      return data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load gallery';
      setError(errorMessage);
      console.error('Error loading gallery:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, [institutionId, ipedsId, scholarshipId, isPublic]);

  /**
   * Load the featured image
   */
  const loadFeaturedImage = useCallback(async () => {
    setError(null);

    try {
      let featured: GalleryImage | null;

      if (isPublic) {
        if (institutionId) {
          featured = await getInstitutionFeaturedImage(institutionId);
        } else if (scholarshipId) {
          featured = await getScholarshipFeaturedImage(scholarshipId);
        } else {
          return null;
        }
      } else {
        featured = await getFeaturedImage();
      }

      setFeaturedImageState(featured);
      return featured;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load featured image';
      setError(errorMessage);
      console.error('Error loading featured image:', err);
      return null;
    }
  }, [institutionId, scholarshipId, isPublic]);

  /**
   * Upload a new image to the gallery
   */
  const uploadImage = useCallback(async (data: GalleryImageUpload): Promise<GalleryImage | null> => {
    setUploading(true);
    setError(null);

    try {
      const newImage = await uploadGalleryImage(data);
      setImages((prev) => [...prev, newImage].sort((a, b) => a.display_order - b.display_order));
      return newImage;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to upload image';
      setError(errorMessage);
      console.error('Error uploading image:', err);
      return null;
    } finally {
      setUploading(false);
    }
  }, []);

  /**
   * Update an existing gallery image
   */
  const updateImage = useCallback(async (
    imageId: number,
    data: GalleryImageUpdate
  ): Promise<GalleryImage | null> => {
    setError(null);

    try {
      const updatedImage = await updateGalleryImage(imageId, data);
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? updatedImage : img))
          .sort((a, b) => a.display_order - b.display_order)
      );
      return updatedImage;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to update image';
      setError(errorMessage);
      console.error('Error updating image:', err);
      return null;
    }
  }, []);

  /**
   * Delete a gallery image
   */
  const deleteImage = useCallback(async (imageId: number): Promise<boolean> => {
    setError(null);

    try {
      await deleteGalleryImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));

      // If the deleted image was featured, clear featured state
      if (featuredImage?.id === imageId) {
        setFeaturedImageState(null);
      }

      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to delete image';
      setError(errorMessage);
      console.error('Error deleting image:', err);
      return false;
    }
  }, [featuredImage]);

  /**
   * Reorder gallery images
   */
  const reorder = useCallback(async (imageIds: number[]): Promise<boolean> => {
    setError(null);

    try {
      await reorderGallery(imageIds);

      // Update local state to reflect new order
      const reordered = imageIds
        .map((id) => images.find((img) => img.id === id))
        .filter((img): img is GalleryImage => img !== undefined);

      setImages(reordered);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to reorder images';
      setError(errorMessage);
      console.error('Error reordering images:', err);
      return false;
    }
  }, [images]);

  /**
   * Set an image as featured
   */
  const setFeatured = useCallback(async (imageId: number): Promise<boolean> => {
    setError(null);

    try {
      await setFeaturedImage(imageId);

      // Update local state
      setImages((prev) =>
        prev.map((img) => ({
          ...img,
          is_featured: img.id === imageId,
        }))
      );

      const featured = images.find((img) => img.id === imageId) || null;
      setFeaturedImageState(featured);

      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to set featured image';
      setError(errorMessage);
      console.error('Error setting featured image:', err);
      return false;
    }
  }, [images]);

  /**
   * Move an image up in the order
   */
  const moveUp = useCallback(async (imageId: number): Promise<boolean> => {
    const index = images.findIndex((img) => img.id === imageId);
    if (index <= 0) return false; // Already at the top

    const newOrder = [...images];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];

    return await reorder(newOrder.map((img) => img.id));
  }, [images, reorder]);

  /**
   * Move an image down in the order
   */
  const moveDown = useCallback(async (imageId: number): Promise<boolean> => {
    const index = images.findIndex((img) => img.id === imageId);
    if (index === -1 || index >= images.length - 1) return false; // Already at the bottom

    const newOrder = [...images];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];

    return await reorder(newOrder.map((img) => img.id));
  }, [images, reorder]);

  /**
   * Refresh the gallery (reload from server)
   */
  const refresh = useCallback(async () => {
    await Promise.all([loadGallery(), loadFeaturedImage()]);
  }, [loadGallery, loadFeaturedImage]);

  // Auto-load on mount if enabled
  useEffect(() => {
    if (autoLoad) {
      loadGallery();
      loadFeaturedImage();
    }
  }, [autoLoad, loadGallery, loadFeaturedImage]);

  return {
    // State
    images,
    featuredImage,
    loading,
    uploading,
    error,

    // Actions
    loadGallery,
    loadFeaturedImage,
    uploadImage,
    updateImage,
    deleteImage,
    reorder,
    setFeatured,
    moveUp,
    moveDown,
    refresh,

    // Helpers
    isEmpty: images.length === 0,
    count: images.length,
  };
};
