import apiClient from '../client';
import type { Institution, AdmissionData, TuitionData, FinancialOverview } from '@/types/api';

export const institutionsApi = {
  getAll: async (params?: { state?: string; limit?: number; offset?: number }) => {
    const response = await apiClient.get<Institution[]>('/institutions', { params });
    return response.data;
  },

  getById: async (ipeds_id: number) => {
    const response = await apiClient.get<Institution>(`/institutions/${ipeds_id}`);
    return response.data;
  },
  getAdmissions: async (ipeds_id: number, academic_year?: string) => {
    const params = academic_year ? { academic_year } : {};
    const response = await apiClient.get<AdmissionData[]>(
      `/institutions/${ipeds_id}/admissions`,
      { params }
    );
    return response.data;
  },

  getTuition: async (ipeds_id: number, academic_year?: string) => {
    const params = academic_year ? { academic_year } : {};
    const response = await apiClient.get<TuitionData[]>(
      `/institutions/${ipeds_id}/tuition`,
      { params }
    );
    return response.data;
  },

  getFinancialOverview: async (ipeds_id: number) => {
    const response = await apiClient.get<FinancialOverview>(
      `/institutions/${ipeds_id}/financial-overview`
    );
    return response.data;
  },
};