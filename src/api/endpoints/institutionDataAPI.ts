// src/api/endpoints/institutionDataAPI.ts
import { apiClient } from '../client';

export interface InstitutionDataQuality {
    institution_id: number;
    institution_name: string;
    completeness_score: number;
    data_source: string;
    data_last_updated: string | null;
    missing_fields: string[];
    verified_fields: string[];
    verification_count: number;
    has_website: boolean;
    has_tuition_data: boolean;
    has_room_board: boolean;
    has_admissions_data: boolean;
}

export interface InstitutionBasicInfoUpdate {
    website?: string;
    student_faculty_ratio?: number;
    size_category?: string;
}

export interface InstitutionCostDataUpdate {
    tuition_in_state?: number;
    tuition_out_of_state?: number;
    room_cost?: number;
    board_cost?: number;
    application_fee_undergrad?: number;
}

export interface InstitutionAdmissionsDataUpdate {
    acceptance_rate?: number;
    sat_reading_25th?: number;
    sat_reading_75th?: number;
    sat_math_25th?: number;
    sat_math_75th?: number;
    act_composite_25th?: number;
    act_composite_75th?: number;
}

export interface VerificationRecord {
    id: number;
    field_name: string;
    old_value: string | null;
    new_value: string | null;
    verified_by: string;
    verified_at: string;
    notes: string | null;
}

export interface VerifyCurrentRequest {
    academic_year: string;
    notes?: string;
}

export interface VerifyCurrentResponse {
    message: string;
    fields_verified: number;
    academic_year: string;
    completeness_score: number;
    data_source: string;
}

export const institutionDataApi = {
    // Get current institution data
    // Endpoint: GET /api/v1/admin/institution-data/{institution_id}
    getInstitutionData: async (institutionId: number) => {
        const response = await apiClient.get(`/admin/institution-data/${institutionId}`);
        return response.data;
    },

    // Get data quality report
    // Endpoint: GET /api/v1/admin/institution-data/{institution_id}/quality
    getDataQuality: async (institutionId: number): Promise<InstitutionDataQuality> => {
        const response = await apiClient.get(`/admin/institution-data/${institutionId}/quality`);
        return response.data;
    },

    // Update basic info
    // Endpoint: PUT /api/v1/admin/institution-data/{institution_id}/basic-info
    updateBasicInfo: async (institutionId: number, data: InstitutionBasicInfoUpdate) => {
        const response = await apiClient.put(`/admin/institution-data/${institutionId}/basic-info`, data);
        return response.data;
    },

    // Update cost data
    // Endpoint: PUT /api/v1/admin/institution-data/{institution_id}/cost-data
    updateCostData: async (institutionId: number, data: InstitutionCostDataUpdate) => {
        const response = await apiClient.put(`/admin/institution-data/${institutionId}/cost-data`, data);
        return response.data;
    },

    // Update admissions data
    // Endpoint: PUT /api/v1/admin/institution-data/{institution_id}/admissions-data
    updateAdmissionsData: async (institutionId: number, data: InstitutionAdmissionsDataUpdate) => {
        const response = await apiClient.put(`/admin/institution-data/${institutionId}/admissions-data`, data);
        return response.data;
    },

    // Verify current data
    // Endpoint: POST /api/v1/admin/institution-data/{institution_id}/verify-current
    verifyCurrent: async (institutionId: number, data: VerifyCurrentRequest): Promise<VerifyCurrentResponse> => {
        const response = await apiClient.post(`/admin/institution-data/${institutionId}/verify-current`, data);
        return response.data;
    },

    // Get verification history
    // Endpoint: GET /api/v1/admin/institution-data/{institution_id}/verification-history
    getVerificationHistory: async (institutionId: number, limit?: number): Promise<VerificationRecord[]> => {
        const params = limit ? { limit } : {};
        const response = await apiClient.get(`/admin/institution-data/${institutionId}/verification-history`, { params });
        return response.data;
    },
};