import React from 'react';

interface StatCardProps {
    label: string;
    value: string | number;
    subtext?: string;
    className?: string;
}

export default function StatCard({ label, value, subtext, className = '' }: StatCardProps) {
    return (
        <div className={`flex flex-col ${className}`}>
            <dt className="text-sm font-medium text-gray-600 mb-1">{label}</dt>
            <dd className="text-2xl font-bold text-gray-900">{value}</dd>
            {subtext && <dd className="text-sm text-gray-500 mt-1">{subtext}</dd>}
        </div>
    );
}
