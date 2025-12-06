// src/api/endpoints/scholarships.ts
import apiClient from '@/api/client';
import { Scholarship } from '@/types';

interface ScholarshipListResponse {
    scholarships: Scholarship[];
    total: number;
    page: number;
    limit: number;
    has_more: boolean;
}

export const scholarshipsApi = {
    getAll: async (params?: {
        page?: number;
        limit?: number;
        scholarship_type?: string;
        status?: string;
        featured?: boolean;
    }): Promise<ScholarshipListResponse> => {
        const response = await apiClient.get<ScholarshipListResponse>('/scholarships', { params });
        return response.data;
    },

    getById: async (id: number): Promise<Scholarship> => {
        const response = await apiClient.get<Scholarship>(`/scholarships/${id}`);
        return response.data;
    },
};

export default scholarshipsApi;