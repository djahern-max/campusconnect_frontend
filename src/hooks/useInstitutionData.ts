// src/hooks/useInstitutionData.ts
import { useState, useEffect } from 'react';
import { institutionDataApi, InstitutionDataQuality } from '@/api/endpoints/institutionDataAPI';

export function useInstitutionDataQuality(institutionId: number | null) {
    const [quality, setQuality] = useState<InstitutionDataQuality | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchQuality = async () => {
        if (!institutionId) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
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