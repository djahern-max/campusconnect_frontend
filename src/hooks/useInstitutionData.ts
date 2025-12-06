// src/hooks/useInstitutionData.ts
import { useState, useEffect, useCallback } from 'react';
import { getInstitutionComplete, updateInstitution } from '@/api/endpoints/institutions';
import type { Institution } from '@/types/api';

interface UseInstitutionDataReturn {
    data: Institution | null;
    loading: boolean;
    error: string | null;
    updateField: (field: keyof Institution, value: any) => Promise<void>;
    refetch: () => Promise<void>;
    saving: boolean;
}

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

            // Make API call
            const updated = await updateInstitution(institutionId, { [field]: value });

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