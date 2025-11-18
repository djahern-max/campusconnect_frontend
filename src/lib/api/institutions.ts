// src/lib/api/institutions.ts
import apiClient from '../../api/client';
import type { Institution, AdmissionData, TuitionData, FinancialOverview } from '@/types/api';

interface InstitutionListResponse {
    institutions: Institution[];
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
}

export const institutionsApi = {
    getAll: async (params?: { state?: string; page?: number; limit?: number }) => {
        // Backend expects 'page' and 'limit' with pagination
        const queryParams = {
            page: params?.page || 1,
            limit: params?.limit || 50,
            ...(params?.state && { state: params.state })
        };

        const response = await apiClient.get<InstitutionListResponse>('/institutions/', {
            params: queryParams
        });

        // Return the institutions array for compatibility with existing code
        return response.data.institutions;
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