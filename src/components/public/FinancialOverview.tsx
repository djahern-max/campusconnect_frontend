import React from 'react';
import TuitionCard from './TuitionCard';
import AdmissionsCard from './AdmissionsCard';
import { FinancialOverview as FinancialOverviewType } from '@/types/api';

interface FinancialOverviewProps {
    data: FinancialOverviewType;
    className?: string;
}

export default function FinancialOverview({ data, className = '' }: FinancialOverviewProps) {
    const { tuition, admissions } = data;

    // If no data available
    if (!tuition && !admissions) {
        return (
            <div className={`text-center py-12 ${className}`}>
                <p className="text-gray-500 text-lg">Financial and admissions data not yet available</p>
                <p className="text-gray-400 text-sm mt-2">Check back soon for updates</p>
            </div>
        );
    }

    return (
        <div className={className}>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial & Admissions Overview</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tuition && <TuitionCard tuition={tuition} />}
                {admissions && <AdmissionsCard admissions={admissions} />}
            </div>

            {/* Note about data */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This data is sourced from official records and may be verified by the institution.
                    Financial aid and scholarships may significantly reduce the actual cost of attendance.
                </p>
            </div>
        </div>
    );
}