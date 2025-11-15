// src/components/public/AdmissionsCard.tsx
import React from 'react';
import Badge from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import { AdmissionData } from '@/types/api';

interface AdmissionsCardProps {
    admissions: AdmissionData;
    className?: string;
}

export default function AdmissionsCard({ admissions, className = '' }: AdmissionsCardProps) {
    const formatNumber = (num: number | null) => {
        if (!num) return 'N/A';
        return num.toLocaleString('en-US');
    };

    const formatPercentage = (num: number | null) => {
        if (!num) return 'N/A';
        return `${num}%`;
    };

    const hasSATData = admissions.sat_reading_50th || admissions.sat_math_50th;

    return (
        <div className={`bg-white rounded-lg shadow-md border border-gray-200 p-6 ${className}`}>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                        Admissions Statistics
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Academic Year {admissions.academic_year}
                    </p>
                </div>
                {admissions.is_admin_verified && (
                    <Badge variant="success">✓ Verified</Badge>
                )}
            </div>

            <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4">
                    <StatCard
                        label="Acceptance Rate"
                        value={formatPercentage(admissions.acceptance_rate)}
                        className="text-center"
                    />
                    <StatCard
                        label="Applications"
                        value={formatNumber(admissions.applications_total)}
                        className="text-center"
                    />
                    <StatCard
                        label="Enrolled"
                        value={formatNumber(admissions.enrolled_total)}
                        className="text-center"
                    />
                </div>

                {/* Detailed Stats */}
                {admissions.admissions_total && (
                    <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-gray-600">Students Admitted</span>
                            <span className="text-lg font-semibold text-gray-900">
                                {formatNumber(admissions.admissions_total)}
                            </span>
                        </div>
                    </div>
                )}

                {admissions.yield_rate && (
                    <div className="flex justify-between items-baseline">
                        <span className="text-sm text-gray-600">Yield Rate</span>
                        <span className="text-lg font-semibold text-gray-900">
                            {formatPercentage(admissions.yield_rate)}
                        </span>
                    </div>
                )}

                {/* SAT Scores */}
                {hasSATData && (
                    <div className="pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3">
                            SAT Score Ranges (25th-75th percentile)
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            {admissions.sat_reading_50th && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Evidence-Based Reading</p>
                                    <div className="flex items-baseline space-x-1">
                                        <span className="text-sm text-gray-600">{admissions.sat_reading_25th}</span>
                                        <span className="text-xs text-gray-400">-</span>
                                        <span className="text-lg font-bold text-gray-900">{admissions.sat_reading_50th}</span>
                                        <span className="text-xs text-gray-400">-</span>
                                        <span className="text-sm text-gray-600">{admissions.sat_reading_75th}</span>
                                    </div>
                                </div>
                            )}
                            {admissions.sat_math_50th && (
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Math</p>
                                    <div className="flex items-baseline space-x-1">
                                        <span className="text-sm text-gray-600">{admissions.sat_math_25th}</span>
                                        <span className="text-xs text-gray-400">-</span>
                                        <span className="text-lg font-bold text-gray-900">{admissions.sat_math_50th}</span>
                                        <span className="text-xs text-gray-400">-</span>
                                        <span className="text-sm text-gray-600">{admissions.sat_math_75th}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                        {admissions.percent_submitting_sat && (
                            <p className="text-xs text-gray-500 mt-3">
                                {formatPercentage(admissions.percent_submitting_sat)} of students submitted SAT scores
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}