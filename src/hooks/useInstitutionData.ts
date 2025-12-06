// src/hooks/useInstitutionData.ts
import { useState, useEffect, useCallback } from 'react';
import {
    getInstitutionComplete,
    updateBasicInfo,
    updateCostData,
    updateAdmissionsData,
    getInstitutionQuality
} from '@/api/endpoints/institutions';
import type { Institution } from '@/types/api';

interface UseInstitutionDataReturn {
    data: Institution | null;
    loading: boolean;
    error: string | null;
    updateField: (field: keyof Institution, value: any) => Promise<void>;
    refetch: () => Promise<void>;
    saving: boolean;
}

interface QualityMetrics {
    completeness_score: number;
    data_freshness: string;
    missing_fields: string[];
    needs_verification: boolean;
    last_verified: string | null;
    verification_status: string;
}

interface UseInstitutionDataQualityReturn {
    quality: QualityMetrics | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

// Helper to determine which endpoint to use based on field
const getUpdateEndpoint = (field: keyof Institution) => {
    // Basic info fields
    const basicInfoFields = [
        'name', 'city', 'state', 'zip', 'website', 'type',
        'control', 'locale', 'size', 'founded'
    ];

    // Cost/tuition fields
    const costFields = [
        'tuition_in_state', 'tuition_out_of_state', 'room_and_board',
        'books_and_supplies', 'other_expenses', 'total_cost'
    ];

    // Admissions fields
    const admissionsFields = [
        'acceptance_rate', 'sat_reading_25th', 'sat_reading_75th',
        'sat_math_25th', 'sat_math_75th', 'act_composite_25th',
        'act_composite_75th', 'application_fee', 'application_deadline'
    ];

    if (basicInfoFields.includes(field as string)) {
        return 'basic';
    } else if (costFields.includes(field as string)) {
        return 'cost';
    } else if (admissionsFields.includes(field as string)) {
        return 'admissions';
    }

    return 'basic'; // default
};

/**
 * Custom hook for managing institution data
 * Handles loading, updating, and auto-saving institution fields
 */
export const useInstitutionData = (institutionId: number | null): UseInstitutionDataReturn => {
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

    // Update a single field
    const updateField = useCallback(async (field: keyof Institution, value: any) => {
        if (!institutionId) return;

        try {
            setSaving(true);
            setError(null);

            // Optimistic update
            setData(prev => prev ? { ...prev, [field]: value } : null);

            // Determine which endpoint to use and make API call
            const endpoint = getUpdateEndpoint(field);
            let updated: Institution;

            switch (endpoint) {
                case 'cost':
                    updated = await updateCostData(institutionId, { [field]: value });
                    break;
                case 'admissions':
                    updated = await updateAdmissionsData(institutionId, { [field]: value });
                    break;
                case 'basic':
                default:
                    updated = await updateBasicInfo(institutionId, { [field]: value });
                    break;
            }

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
export const useInstitutionDataQuality = (institutionId: number | null): UseInstitutionDataQualityReturn => {
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