// src/lib/api/institutions.ts
import apiClient from '../client';
import type { Institution } from '@/types/api';

export interface GetInstitutionsParams {
    state?: string;
    limit?: number;
    offset?: number;
}

export interface SearchInstitutionsParams {
    query?: string;
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

// PUBLIC ENDPOINTS (no /admin prefix)

// Get list of institutions
export const getInstitutions = async (params?: GetInstitutionsParams): Promise<Institution[]> => {
    const response = await apiClient.get<Institution[]>('/institutions', { params });
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

// Get filtered institutions
export const getFilteredInstitutions = async (params?: SearchInstitutionsParams): Promise<Institution[]> => {
    const response = await apiClient.get<Institution[]>('/institutions/search/filtered', { params });
    return response.data;
};

// Get completeness stats
export const getInstitutionStats = async (): Promise<InstitutionStats> => {
    const response = await apiClient.get<InstitutionStats>('/institutions/stats/completeness');
    return response.data;
};

// Get featured institutions
export const getFeaturedInstitutions = async (): Promise<Institution[]> => {
    const response = await apiClient.get<Institution[]>('/institutions/featured/list');
    return response.data;
};

// Get institutions by state summary
export const getInstitutionsByState = async (state: string): Promise<Institution[]> => {
    const response = await apiClient.get<Institution[]>(`/institutions/by-state/${state}/summary`);
    return response.data;
};

// Get complete institution data by internal ID
export const getInstitutionComplete = async (institution_id: number): Promise<Institution> => {
    const response = await apiClient.get<Institution>(`/institutions/complete/${institution_id}`);
    return response.data;
};

// Get complete institution data by IPEDS ID
export const getInstitutionCompleteByIpeds = async (ipeds_id: number): Promise<Institution> => {
    const response = await apiClient.get<Institution>(`/institutions/complete/ipeds/${ipeds_id}`);
    return response.data;
};

// Get admissions data
export const getInstitutionAdmissions = async (ipeds_id: number) => {
    const response = await apiClient.get(`/institutions/${ipeds_id}/admissions`);
    return response.data;
};

// Get tuition data
export const getInstitutionTuition = async (ipeds_id: number) => {
    const response = await apiClient.get(`/institutions/${ipeds_id}/tuition`);
    return response.data;
};

// Get financial overview
export const getInstitutionFinancialOverview = async (ipeds_id: number) => {
    const response = await apiClient.get(`/institutions/${ipeds_id}/financial-overview`);
    return response.data;
};

// ADMIN ENDPOINTS (require authentication)

// Update institution IPEDS data (Super Admin only)
export const updateInstitutionIpedsData = async (
    institution_id: number,
    data: Partial<Institution>
): Promise<Institution> => {
    const response = await apiClient.patch<Institution>(
        `/admin/admin/institutions/${institution_id}/ipeds-data`,
        data
    );
    return response.data;
};

// Verify institution IPEDS data (Super Admin only)
export const verifyInstitutionIpedsData = async (institution_id: number): Promise<void> => {
    await apiClient.post(`/admin/admin/institutions/${institution_id}/verify-ipeds-data`);
};

// Update featured status (Super Admin only)
export const updateInstitutionFeaturedStatus = async (
    institution_id: number,
    featured: boolean
): Promise<void> => {
    await apiClient.patch(`/admin/admin/institutions/${institution_id}/featured`, { featured });
};

// Get data quality dashboard (Super Admin only)
export const getDataQualityDashboard = async () => {
    const response = await apiClient.get('/admin/admin/institutions/data-quality/dashboard');
    return response.data;
};

// Get data quality by state (Super Admin only)
export const getDataQualityByState = async () => {
    const response = await apiClient.get('/admin/admin/institutions/data-quality/by-state');
    return response.data;
};

// Get institutions needing update (Super Admin only)
export const getInstitutionsNeedingUpdate = async () => {
    const response = await apiClient.get('/admin/admin/institutions/needs-update');
    return response.data;
};

// Bulk verify institutions (Super Admin only)
export const bulkVerifyInstitutions = async (institution_ids: number[]): Promise<void> => {
    await apiClient.post('/admin/admin/institutions/bulk-verify', { institution_ids });
};

// Get institution data for admin (Regular Admin)
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
export const verifyCurrentData = async (institution_id: number) => {
    const response = await apiClient.post(`/admin/institution-data/${institution_id}/verify-current`);
    return response.data;
};

// Get verification history (Regular Admin)
export const getVerificationHistory = async (institution_id: number) => {
    const response = await apiClient.get(`/admin/institution-data/${institution_id}/verification-history`);
    return response.data;
};

export const updateInstitutionData = async (institution_id: number, data: Partial<Institution>) => {
    const response = await apiClient.patch(`/admin/institutions/${institution_id}/ipeds-data`, data);
    return response.data;
};

// Export as object for backward compatibility
export const institutionsApi = {
    // Public
    getInstitutions,
    searchInstitutions,
    getInstitution,
    getInstitutionById,
    getFilteredInstitutions,
    getInstitutionStats,
    getFeaturedInstitutions,
    getInstitutionsByState,
    getInstitutionComplete,
    getInstitutionCompleteByIpeds,
    getInstitutionAdmissions,
    getInstitutionTuition,
    getInstitutionFinancialOverview,

    // Admin
    updateInstitutionIpedsData,
    verifyInstitutionIpedsData,
    updateInstitutionFeaturedStatus,
    getDataQualityDashboard,
    getDataQualityByState,
    getInstitutionsNeedingUpdate,
    bulkVerifyInstitutions,
    getInstitutionDataForAdmin,
    getInstitutionQuality,
    verifyCurrentData,
    getVerificationHistory,
};