// src/hooks/useScholarshipData.ts
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/api/client';

export interface Scholarship {
    id: number;
    title: string;
    organization: string;
    scholarship_type: string;
    status: string;
    difficulty_level: string;
    amount_min: number;
    amount_max: number;
    is_renewable: boolean;
    number_of_awards: number | null;
    deadline: string | null;
    application_opens: string | null;
    for_academic_year: string | null;
    description: string | null;
    website_url: string | null;
    min_gpa: number | null;
    primary_image_url: string | null;
    verified: boolean;
    featured: boolean;
    views_count: number;
    applications_count: number;
    created_at: string;
    updated_at: string | null;
}

interface UseScholarshipDataReturn {
    data: Scholarship | null;
    loading: boolean;
    error: string | null;
    updateField: (field: keyof Scholarship, value: any) => Promise<void>;
    refetch: () => Promise<void>;
    saving: boolean;
}

/**
 * Custom hook for managing scholarship data
 * Handles loading, updating, and auto-saving scholarship fields
 */
export const useScholarshipData = (
    scholarshipId: number | null | undefined
): UseScholarshipDataReturn => {
    const [data, setData] = useState<Scholarship | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch scholarship data
    const fetchData = useCallback(async () => {
        if (!scholarshipId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await apiClient.get<Scholarship>(`/scholarships/${scholarshipId}`);
            setData(response.data);
        } catch (err: any) {
            console.error('Error fetching scholarship data:', err);
            setError(err.response?.data?.detail || 'Failed to load scholarship data');
        } finally {
            setLoading(false);
        }
    }, [scholarshipId]);

    // Initial data load
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Update a single field using the admin endpoint
    const updateField = useCallback(
        async (field: keyof Scholarship, value: any) => {
            if (!scholarshipId) return;

            try {
                setSaving(true);
                setError(null);

                // Optimistic update
                setData((prev) => (prev ? { ...prev, [field]: value } : null));

                // Use admin endpoint for updates
                const response = await apiClient.patch<Scholarship>(
                    `/admin/scholarships/${scholarshipId}`,
                    { [field]: value }
                );

                // Update with server response
                setData(response.data);
            } catch (err: any) {
                console.error('Error updating scholarship:', err);
                setError(err.response?.data?.detail || 'Failed to save changes');

                // Revert optimistic update on error
                await fetchData();
            } finally {
                setSaving(false);
            }
        },
        [scholarshipId, fetchData]
    );

    // Manual refetch
    const refetch = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

    return {
        data,
        loading,
        error,
        updateField,
        refetch,
        saving,
    };
};