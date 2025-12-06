// src/hooks/useInstitutionData.ts
// src/hooks/useInstitutionData.ts
import { useState, useEffect, useCallback } from 'react';
import {
    getInstitutionComplete,
    updateInstitutionData,
    getInstitutionQuality
} from '@/api/endpoints/institutions';
import type { Institution } from '@/types';

interface UseInstitutionDataReturn {
    data: Institution | null;
    loading: boolean;
    error: string | null;
    updateField: (field: keyof Institution, value: any) => Promise<void>;
    refetch: () => Promise<void>;
    saving: boolean;
}

interface QualityMetrics {
    institution_id: number;
    institution_name: string;
    completeness_score: number;
    data_source: string;
    data_last_updated: string;
    ipeds_year: string | null;
    missing_fields: string[];
    verified_fields: string[];
    verification_count: number;
    has_website: boolean;
    has_tuition_data: boolean;
    has_room_board: boolean;
    has_admissions_data: boolean;
}

interface UseInstitutionDataQualityReturn {
    quality: QualityMetrics | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook for managing institution data
 * Handles loading, updating, and auto-saving institution fields
 */
export const useInstitutionData = (institutionId: number | null | undefined): UseInstitutionDataReturn => {
    const [data, setData] = useState<Institution | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch institution data
    const fetchData = useCallback(async () => {
        if (!institutionId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const institution = await getInstitutionComplete(institutionId);
            setData(institution);
        } catch (err: any) {
            console.error('Error fetching institution data:', err);
            setError(err.response?.data?.detail || 'Failed to load institution data');
        } finally {
            setLoading(false);
        }
    }, [institutionId]);

    // Initial data load
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Update a single field using the consolidated endpoint
    const updateField = useCallback(async (field: keyof Institution, value: any) => {
        if (!institutionId) return;

        try {
            setSaving(true);
            setError(null);

            // Optimistic update
            setData(prev => prev ? { ...prev, [field]: value } : null);

            // Use single consolidated endpoint for all updates
            const updated = await updateInstitutionData(institutionId, { [field]: value });

            // Update with server response
            setData(updated);
        } catch (err: any) {
            console.error('Error updating institution:', err);
            setError(err.response?.data?.detail || 'Failed to save changes');

            // Revert optimistic update on error
            await fetchData();
        } finally {
            setSaving(false);
        }
    }, [institutionId, fetchData]);

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

/**
 * Custom hook for managing institution data quality metrics
 * Fetches and tracks data quality, completeness, and verification status
 */
export const useInstitutionDataQuality = (institutionId: number | null | undefined): UseInstitutionDataQualityReturn => {
    const [quality, setQuality] = useState<QualityMetrics | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch quality metrics
    const fetchQuality = useCallback(async () => {
        if (!institutionId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const qualityData = await getInstitutionQuality(institutionId);
            setQuality(qualityData);
        } catch (err: any) {
            console.error('Error fetching quality metrics:', err);
            setError(err.response?.data?.detail || 'Failed to load quality metrics');
        } finally {
            setLoading(false);
        }
    }, [institutionId]);

    // Initial load
    useEffect(() => {
        fetchQuality();
    }, [fetchQuality]);

    // Manual refetch
    const refetch = useCallback(async () => {
        await fetchQuality();
    }, [fetchQuality]);

    return {
        quality,
        loading,
        error,
        refetch,
    };
};