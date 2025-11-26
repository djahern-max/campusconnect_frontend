// src/app/admin/data-quality/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useInstitutionDataQuality } from '@/hooks/useInstitutionData';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import VerifyDataModal from '@/components/admin/VerifyDataModal';
import Link from 'next/link';
import {
    CheckCircle,
    AlertTriangle,
    TrendingUp,
    Calendar,
    Award,
    ExternalLink,
    Edit,
    Clock,
} from 'lucide-react';

export default function DataQualityPage() {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const [currentYear] = useState('2025-26');
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    const institutionId = user?.entity_type === 'institution' ? user.entity_id : null;
    const { quality, loading, error, refetch } = useInstitutionDataQuality(institutionId);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login');
        }
    }, [isAuthenticated, router]);

    if (!isAuthenticated) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 rounded-full border-b-2 border-gray-700 animate-spin" />
                    <p className="mt-4 text-gray-600">Loading data quality...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Card>
                        <CardBody>
                            <div className="flex items-center gap-3 text-red-600">
                                <AlertTriangle className="h-6 w-6" />
                                <div>
                                    <p className="font-semibold">Error Loading Data</p>
                                    <p className="text-sm text-gray-600">{error}</p>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </div>
            </div>
        );
    }

    if (!quality) {
        return null;
    }

    // Determine score color
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-blue-600';
        if (score >= 40) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'bg-green-600';
        if (score >= 60) return 'bg-blue-600';
        if (score >= 40) return 'bg-yellow-600';
        return 'bg-red-600';
    };

    const getScoreLabel = (score: number) => {
        if (score >= 80) return 'Excellent';
        if (score >= 60) return 'Good';
        if (score >= 40) return 'Fair';
        return 'Needs Improvement';
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const formatFieldName = (field: string) => {
        return field
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Quality Dashboard</h1>
                        <p className="text-gray-600">{quality.institution_name}</p>
                    </div>

                    {/* Completeness Score Card */}
                    <Card className="mb-8">
                        <CardBody>
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                {/* Score Circle */}
                                <div className="flex items-center gap-6">
                                    <div className="relative">
                                        <svg className="w-32 h-32 transform -rotate-90">
                                            {/* Background circle */}
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="none"
                                                className="text-gray-200"
                                            />
                                            {/* Progress circle */}
                                            <circle
                                                cx="64"
                                                cy="64"
                                                r="56"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeLinecap="round"
                                                className={getScoreColor(quality.completeness_score)}
                                                style={{
                                                    strokeDasharray: `${2 * Math.PI * 56}`,
                                                    strokeDashoffset: `${2 * Math.PI * 56 * (1 - quality.completeness_score / 100)}`,
                                                }}
                                            />
                                        </svg>
                                        {/* Score text */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className={`text-4xl font-bold ${getScoreColor(quality.completeness_score)}`}>
                                                {quality.completeness_score}%
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                            {getScoreLabel(quality.completeness_score)}
                                        </h2>
                                        <p className="text-gray-600 mb-4">
                                            Your data profile is {quality.completeness_score}% complete
                                        </p>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Award className="h-4 w-4" />
                                            <span className="capitalize">{quality.data_source} verified</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {quality.verified_fields.length}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">Verified Fields</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-900">
                                            {quality.missing_fields.length}
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">Missing Fields</div>
                                    </div>
                                    <div className="text-center p-4 bg-gray-50 rounded-lg col-span-2">
                                        <div className="text-sm text-gray-600 mb-1">Last Updated</div>
                                        <div className="font-semibold text-gray-900">
                                            {formatDate(quality.data_last_updated)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Action Cards */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                        <Card hover>
                            <CardBody>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                                            <Edit className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Update Information</h3>
                                            <p className="text-sm text-gray-600">Edit your institution data</p>
                                        </div>
                                    </div>
                                </div>
                                <Link href="/admin/edit-data">
                                    <Button variant="primary" size="sm" className="w-full">
                                        Edit Data
                                    </Button>
                                </Link>
                            </CardBody>
                        </Card>

                        <Card hover>
                            <CardBody>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-green-50 text-green-600 rounded-lg">
                                            <CheckCircle className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">Verify Current Data</h3>
                                            <p className="text-sm text-gray-600">Confirm data for {currentYear}</p>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => setShowVerifyModal(true)}
                                >
                                    Verify for {currentYear}
                                </Button>
                            </CardBody>
                        </Card>
                    </div>

                    {/* Data Status Grid */}
                    <div className="grid md:grid-cols-4 gap-6 mb-8">
                        <StatusCard
                            icon={<ExternalLink className="h-5 w-5" />}
                            label="Website"
                            status={quality.has_website}
                        />
                        <StatusCard
                            icon={<TrendingUp className="h-5 w-5" />}
                            label="Tuition Data"
                            status={quality.has_tuition_data}
                        />
                        <StatusCard
                            icon={<TrendingUp className="h-5 w-5" />}
                            label="Room & Board"
                            status={quality.has_room_board}
                        />
                        <StatusCard
                            icon={<TrendingUp className="h-5 w-5" />}
                            label="Admissions Data"
                            status={quality.has_admissions_data}
                        />
                    </div>

                    {/* Missing Fields */}
                    {quality.missing_fields.length > 0 && (
                        <Card className="mb-8">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                                    <h3 className="text-lg font-semibold text-gray-900">Missing Fields</h3>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <p className="text-sm text-gray-600 mb-4">
                                    Complete these fields to improve your data quality score
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {quality.missing_fields.map((field: string) => (
                                        <div
                                            key={field}
                                            className="flex items-center gap-2 px-3 py-2 bg-yellow-50 text-yellow-800 rounded-md text-sm"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-yellow-600" />
                                            {formatFieldName(field)}
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-4">
                                    <Link href="/admin/edit-data">
                                        <Button variant="primary" size="sm">
                                            <Edit className="h-4 w-4 mr-2" />
                                            Complete Missing Fields
                                        </Button>
                                    </Link>
                                </div>
                            </CardBody>
                        </Card>
                    )}

                    {/* Verification History Link */}
                    <Card>
                        <CardBody>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-gray-600" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Verification History</h3>
                                        <p className="text-sm text-gray-600">
                                            View all changes and updates ({quality.verification_count} total)
                                        </p>
                                    </div>
                                </div>
                                <Link href="/admin/verification-history">
                                    <Button variant="secondary" size="sm">
                                        View History
                                    </Button>
                                </Link>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Verify Data Modal */}
                    {institutionId && quality && (
                        <VerifyDataModal
                            isOpen={showVerifyModal}
                            onClose={() => setShowVerifyModal(false)}
                            institutionId={institutionId}
                            institutionName={quality.institution_name}
                            onSuccess={refetch}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusCard({
    icon,
    label,
    status,
}: {
    icon: React.ReactNode;
    label: string;
    status: boolean;
}) {
    return (
        <Card>
            <CardBody>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`${status ? 'text-green-600' : 'text-gray-400'}`}>{icon}</div>
                        <span className="text-sm font-medium text-gray-700">{label}</span>
                    </div>
                    {status ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                        <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                </div>
            </CardBody>
        </Card>
    );
}