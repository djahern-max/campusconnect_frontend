// src/api/endpoints/institutions.ts
// FIXED VERSION - Uses correct endpoint path

import apiClient from '../client';
import type { Institution } from '@/types';

export interface GetInstitutionsParams {
    state?: string;
    limit?: number;
    page?: number;
}

export interface SearchInstitutionsParams {
    q?: string;
    state?: string;
    type?: string;
    limit?: number;
    offset?: number;
}

export interface InstitutionStats {
    total: number;
    complete: number;
    incomplete: number;
    completeness_percentage: number;
}

export interface PaginatedInstitutionsResponse {
    institutions: Institution[];
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
}

// PUBLIC ENDPOINTS (no /admin prefix)

// Get list of institutions
export const getInstitutions = async (params?: GetInstitutionsParams): Promise<PaginatedInstitutionsResponse> => {
    const response = await apiClient.get<PaginatedInstitutionsResponse>('/institutions', { params });
    return response.data;
};

// Search institutions
export const searchInstitutions = async (params?: SearchInstitutionsParams): Promise<Institution[]> => {
    const response = await apiClient.get<Institution[]>('/institutions/search', { params });
    return response.data;
};

// Get single institution by IPEDS ID
export const getInstitution = async (ipeds_id: number): Promise<Institution> => {
    const response = await apiClient.get<Institution>(`/institutions/${ipeds_id}`);
    return response.data;
};

// Get institution by internal ID
export const getInstitutionById = async (institution_id: number): Promise<Institution> => {
    const response = await apiClient.get<Institution>(`/institutions/by-id/${institution_id}`);
    return response.data;
};

// Get complete institution data
export const getInstitutionComplete = async (institution_id: number): Promise<Institution> => {
    const response = await apiClient.get<Institution>(`/institutions/complete/${institution_id}`);
    return response.data;
};

// Get complete institution data by IPEDS ID
export const getInstitutionCompleteByIpeds = async (ipeds_id: number): Promise<Institution> => {
    const response = await apiClient.get<Institution>(`/institutions/complete/ipeds/${ipeds_id}`);
    return response.data;
};

// ADMIN ENDPOINTS (with /admin prefix)

/**
 * ✅ FIXED: Update institution data using the correct endpoint
 * Endpoint: PATCH /api/v1/admin/institutions/{institution_id}/ipeds-data
 * 
 * This endpoint accepts ANY of these fields:
 * - Basic: website, level, control, size_category, locale, student_faculty_ratio
 * - Costs: tuition_*, room_cost, board_cost, room_and_board, application_fee_*
 * - Admissions: acceptance_rate, sat_*, act_*
 * - Academic year: ipeds_year
 */
export const updateInstitutionData = async (institution_id: number, data: Partial<Institution>) => {
    // ✅ FIXED: Removed double /admin prefix - apiClient already has /api/v1, we just need /admin/institutions
    const response = await apiClient.patch(`/admin/institutions/${institution_id}/ipeds-data`, data);
    return response.data;
};

// Get institution data for admin
export const getInstitutionDataForAdmin = async (institution_id: number) => {
    const response = await apiClient.get(`/admin/institution-data/${institution_id}`);
    return response.data;
};

// Get institution quality metrics (Regular Admin)
export const getInstitutionQuality = async (institution_id: number) => {
    const response = await apiClient.get(`/admin/institution-data/${institution_id}/quality`);
    return response.data;
};

// Verify current data (Regular Admin)
export const verifyCurrentData = async (institution_id: number, data: { academic_year: string; notes?: string }) => {
    const response = await apiClient.post(`/admin/institution-data/${institution_id}/verify-current`, data);
    return response.data;
};

// Get verification history (Regular Admin)
export const getVerificationHistory = async (institution_id: number, limit?: number) => {
    const params = limit ? { limit } : {};
    const response = await apiClient.get(`/admin/institution-data/${institution_id}/verification-history`, { params });
    return response.data;
};

// Verify institution IPEDS data (for compatibility)
export const verifyInstitutionIpedsData = async (institution_id: number, academic_year: string): Promise<void> => {
    await apiClient.post(`/admin/institutions/${institution_id}/verify-ipeds-data`, { academic_year });
};

// DEPRECATED - kept for backward compatibility
export const updateInstitutionIpedsData = updateInstitutionData;

// Export as object for backward compatibility
export const institutionsApi = {
    // Public
    getInstitutions,
    searchInstitutions,
    getInstitution,
    getInstitutionById,
    getInstitutionComplete,
    getInstitutionCompleteByIpeds,

    // Admin
    updateInstitutionData,
    updateInstitutionIpedsData, // deprecated alias
    verifyInstitutionIpedsData,
    getInstitutionDataForAdmin,
    getInstitutionQuality,
    verifyCurrentData,
    getVerificationHistory,
};