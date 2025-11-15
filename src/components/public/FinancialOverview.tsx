// src/components/public/FinancialOverview.tsx
import React from 'react';
import TuitionCard from './TuitionCard';
import AdmissionsCard from './AdmissionsCard';
import { FinancialOverview as FinancialOverviewType } from '@/types/api';

interface FinancialOverviewProps {
    data: FinancialOverviewType;
    className?: string;
}

export default function FinancialOverview({ data, className = '' }: FinancialOverviewProps) {
    const hasTuition = data.tuition !== null;
    const hasAdmissions = data.admissions !== null;

    if (!hasTuition && !hasAdmissions) {
        return (
            <div className={`bg-gray-50 rounded-lg p-8 text-center ${className}`}>
                <p className="text-gray-600">
                    Financial and admissions data is not currently available for this institution.
                </p>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Tuition & Admissions
                </h2>
                <p className="text-gray-600">
                    View current costs and admissions statistics for this institution.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {data.tuition !== null && <TuitionCard tuition={data.tuition} />}
                {data.admissions !== null && <AdmissionsCard admissions={data.admissions} />}
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                    <strong>Note:</strong> These costs represent published tuition rates. Most students receive financial aid.
                    Contact the institution's financial aid office to learn about scholarships and aid opportunities.
                </p>
            </div>
        </div>
    );
}