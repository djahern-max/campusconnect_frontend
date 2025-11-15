// src/api/endpoints/scholarship.ts
import apiClient from '@/api/client';
import { Scholarship } from '@/types/api';

export const scholarshipsApi = {
    getAll: async (params?: {
        scholarship_type?: string;
        limit?: number;
        offset?: number;
    }) => {
        const response = await apiClient.get<Scholarship[]>('/scholarships', { params });
        return response.data;
    },

    getById: async (id: number) => {
        const response = await apiClient.get<Scholarship>(`/scholarships/${id}`);
        return response.data;
    },
};

export default scholarshipsApi;