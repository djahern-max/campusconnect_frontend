// src/api/endpoints/institutions.ts
import apiClient from '../client';
import type { Institution, AdmissionData, TuitionData, FinancialOverview } from '@/types/api';

interface InstitutionListResponse {
  institutions: Institution[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export const institutionsApi = {
  getAll: async (params?: { state?: string; page?: number; limit?: number }): Promise<InstitutionListResponse> => {
    const response = await apiClient.get<InstitutionListResponse>('/institutions', { params });
    return response.data;
  },

  // NEW: Add search endpoint
  search: async (query: string): Promise<Institution[]> => {
    const response = await apiClient.get<Institution[]>(`/institutions/search`, {
      params: { q: query }
    });
    return response.data;
  },

  getById: async (ipeds_id: number): Promise<Institution> => {
    const response = await apiClient.get<Institution>(`/institutions/${ipeds_id}`);
    return response.data;
  },

  getAdmissions: async (ipeds_id: number, academic_year?: string): Promise<AdmissionData[]> => {
    const params = academic_year ? { academic_year } : {};
    const response = await apiClient.get<AdmissionData[]>(
      `/institutions/${ipeds_id}/admissions`,
      { params }
    );
    return response.data;
  },

  getTuition: async (ipeds_id: number, academic_year?: string): Promise<TuitionData[]> => {
    const params = academic_year ? { academic_year } : {};
    const response = await apiClient.get<TuitionData[]>(
      `/institutions/${ipeds_id}/tuition`,
      { params }
    );
    return response.data;
  },

  getFinancialOverview: async (ipeds_id: number): Promise<FinancialOverview> => {
    const response = await apiClient.get<FinancialOverview>(
      `/institutions/${ipeds_id}/financial-overview`
    );
    return response.data;
  },
};