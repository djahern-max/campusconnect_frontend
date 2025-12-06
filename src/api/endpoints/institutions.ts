// src/api/endpoints/institutions.ts
import { apiClient } from '../client';
import type { Institution } from '@/types/api';

/**
 * Institution API endpoints
 */

// Get all institutions (paginated)
export const getInstitutions = async (params?: {
  state?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get('/institutions', { params });
  return response.data;
};

// Get single institution by IPEDS ID
export const getInstitution = async (ipeds_id: number) => {
  const response = await apiClient.get(`/institutions/${ipeds_id}`);
  return response.data;
};

// Get single institution by database ID
export const getInstitutionById = async (id: number) => {
  const response = await apiClient.get(`/institutions/by-id/${id}`);
  return response.data;
};

// ============================================================================
// NEW: Get complete institution data (all fields)
// ============================================================================
export const getInstitutionComplete = async (id: number): Promise<Institution> => {
  const response = await apiClient.get(`/institutions/complete/${id}`);
  return response.data;
};

// ============================================================================
// NEW: Update institution data (partial update)
// ============================================================================
export const updateInstitution = async (
  id: number,
  data: Partial<Institution>
): Promise<Institution> => {
  const response = await apiClient.patch(`/admin/institutions/${id}`, data);
  return response.data;
};

// Search institutions
export const searchInstitutions = async (query: string) => {
  const response = await apiClient.get('/institutions/search', {
    params: { q: query },
  });
  return response.data;
};

// Get featured institutions
export const getFeaturedInstitutions = async (limit: number = 10) => {
  const response = await apiClient.get('/institutions/featured/list', {
    params: { limit },
  });
  return response.data;
};

// Advanced filtered search
export const getFilteredInstitutions = async (filters: {
  query_text?: string;
  state?: string;
  min_completeness?: number;
  data_source?: string;
  level?: number;
  is_featured?: boolean;
  has_cost_data?: boolean;
  max_tuition?: number;
  has_admissions_data?: boolean;
  max_acceptance_rate?: number;
  limit?: number;
  offset?: number;
}) => {
  const response = await apiClient.get('/institutions/search/filtered', {
    params: filters,
  });
  return response.data;
};

// Get state summary
export const getStateSummary = async (
  state: string,
  min_completeness: number = 60
) => {
  const response = await apiClient.get(`/institutions/by-state/${state}/summary`, {
    params: { min_completeness },
  });
  return response.data;
};

// Get completeness statistics
export const getCompletenessStats = async () => {
  const response = await apiClient.get('/institutions/stats/completeness');
  return response.data;
};