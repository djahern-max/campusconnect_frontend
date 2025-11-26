// src/hooks/useInstitutionData.ts
import { useState, useEffect } from 'react';
import { institutionDataApi, InstitutionDataQuality } from '@/api/endpoints/institutionDataAPI';

export function useInstitutionDataQuality(institutionId: number | null) {
    const [quality, setQuality] = useState<InstitutionDataQuality | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchQuality = async () => {
        // Still check if institutionId exists to know if user is an institution admin
        if (!institutionId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            // ✅ Remove institutionId parameter - backend gets it from auth token
            const data = await institutionDataApi.getDataQuality(institutionId);
            setQuality(data);
        } catch (err: any) {
            console.error('Error fetching data quality:', err);
            setError(err.response?.data?.detail || 'Failed to load data quality');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuality();
    }, [institutionId]);

    return {
        quality,
        loading,
        error,
        refetch: fetchQuality,
    };
}