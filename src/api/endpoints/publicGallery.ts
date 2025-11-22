// src/api/endpoints/publicGallery.ts
import { apiClient } from '../client';

export interface GalleryImage {
    id: number;
    entity_type: string;
    entity_id: number;
    image_url: string;
    thumbnail_url?: string;
    caption?: string;
    category?: string;
    display_order: number;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

export const publicGalleryApi = {
    // Get gallery images for an institution by internal ID
    getInstitutionGallery: async (institutionId: number): Promise<GalleryImage[]> => {
        const response = await apiClient.get(
            `/public/gallery/institutions/${institutionId}/gallery`
        );
        return response.data;
    },

    // Get gallery images for an institution by IPEDS ID
    getInstitutionGalleryByIpeds: async (ipedsId: number): Promise<GalleryImage[]> => {
        const response = await apiClient.get(
            `/public/gallery/institutions/ipeds/${ipedsId}/gallery`
        );
        return response.data;
    },

    // Get featured image for an institution
    getInstitutionFeaturedImage: async (institutionId: number): Promise<GalleryImage | null> => {
        const response = await apiClient.get(
            `/public/gallery/institutions/${institutionId}/featured-image`
        );
        return response.data;
    },

    // Get gallery images for a scholarship
    getScholarshipGallery: async (scholarshipId: number): Promise<GalleryImage[]> => {
        const response = await apiClient.get(
            `/public/gallery/scholarships/${scholarshipId}/gallery`
        );
        return response.data;
    },

    // Get featured image for a scholarship
    getScholarshipFeaturedImage: async (scholarshipId: number): Promise<GalleryImage | null> => {
        const response = await apiClient.get(
            `/public/gallery/scholarships/${scholarshipId}/featured-image`
        );
        return response.data;
    },
};