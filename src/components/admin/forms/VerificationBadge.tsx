// src/components/admin/forms/VerificationBadge.tsx
'use client';

import { CheckCircle, Clock } from 'lucide-react';

interface VerificationBadgeProps {
    verified: boolean;
    verifiedAt?: string | null;
    verifiedBy?: string;
    size?: 'sm' | 'md' | 'lg';
}

export function VerificationBadge({
    verified,
    verifiedAt,
    verifiedBy,
    size = 'md',
}: VerificationBadgeProps) {
    const sizeClasses = {
        sm: 'text-xs px-2 py-1',
        md: 'text-sm px-3 py-1.5',
        lg: 'text-base px-4 py-2',
    };

    const iconSizes = {
        sm: 'h-3 w-3',
        md: 'h-4 w-4',
        lg: 'h-5 w-5',
    };

    if (verified) {
        return (
            <div className="space-y-1">
                <div
                    className={`inline-flex items-center gap-2 ${sizeClasses[size]} bg-green-50 text-green-700 border border-green-200 rounded-full font-medium`}
                >
                    <CheckCircle className={iconSizes[size]} />
                    <span>Verified</span>
                </div>

                {verifiedAt && (
                    <p className="text-xs text-gray-500">
                        {new Date(verifiedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        })}
                        {verifiedBy && ` by ${verifiedBy}`}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div
            className={`inline-flex items-center gap-2 ${sizeClasses[size]} bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-full font-medium`}
        >
            <Clock className={iconSizes[size]} />
            <span>Unverified</span>
        </div>
    );
}