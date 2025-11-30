// src/components/admin/forms/DataSection.tsx
'use client';

import { ReactNode } from 'react';
import { VerificationBadge } from './VerificationBadge';

interface DataSectionProps {
    title: string;
    description?: string;
    children: ReactNode;
    verified?: boolean;
    verifiedAt?: string | null;
    verifiedBy?: string;
    className?: string;
}

export function DataSection({
    title,
    description,
    children,
    verified = false,
    verifiedAt,
    verifiedBy,
    className = '',
}: DataSectionProps) {
    return (
        <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
            {/* Header */}
            <div className="mb-6 pb-4 border-b border-gray-200">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                        {description && (
                            <p className="mt-1 text-sm text-gray-600">{description}</p>
                        )}
                    </div>

                    {verified && (
                        <VerificationBadge
                            verified={verified}
                            verifiedAt={verifiedAt}
                            verifiedBy={verifiedBy}
                        />
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
                {children}
            </div>
        </div>
    );
}