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
    BarChart3,
    Award,
    ExternalLink,
    Edit,
    Clock,
    Image,
    ChevronRight,
    Info
} from 'lucide-react';

interface ExtendedInstitutionDataQuality {
    institution_id: number;
    institution_name: string;
    completeness_score: number;
    data_source: string;
    data_last_updated: string | null;
    ipeds_year?: string | null;
    missing_fields: string[];
    verified_fields: string[];
    verification_count: number;
    has_website: boolean;
    has_tuition_data: boolean;
    has_room_board: boolean;
    has_admissions_data: boolean;
    image_count?: number;
    has_images?: boolean;
    score_breakdown?: {
        core_identity: number;
        cost_data: number;
        room_board: number;
        admissions: number;
        images: number;
        admin_verified: number;
    };
}

interface ScoreCategoryProps {
    title: string;
    points: number;
    earned: number;
    items: Array<{ label: string; complete: boolean; points: number }>;
    note?: string;
}

function ScoreCategory({
    title,
    points,
    earned,
    items,
    note
}: ScoreCategoryProps) {
    const isComplete = earned === points;
    const percentage = (earned / points) * 100;

    return (
        <div className="border-b border-gray-100 last:border-b-0 py-4 first:pt-0">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isComplete
                            ? 'bg-green-50 text-green-700'
                            : earned > 0
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-gray-50 text-gray-400'
                        }`}>
                        {isComplete && <CheckCircle className="h-5 w-5" />}
                        {!isComplete && earned > 0 && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                        {!isComplete && earned === 0 && <div className="w-2 h-2 rounded-full bg-gray-300" />}
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
                        <p className="text-xs text-gray-500">{items.length} {items.length === 1 ? 'requirement' : 'requirements'}</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-lg font-bold ${isComplete ? 'text-green-700' : earned > 0 ? 'text-blue-700' : 'text-gray-400'
                        }`}>
                        {earned}<span className="text-sm text-gray-400 font-normal">/{points}</span>
                    </div>
                    <p className="text-xs text-gray-500">points</p>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-3">
                <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${isComplete ? 'bg-green-600' : earned > 0 ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                    style={{ width: `${percentage}%` }}
                />
            </div>

            {/* Items */}
            <div className="space-y-2 ml-13">
                {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className={`w-1 h-1 rounded-full ${item.complete ? 'bg-green-600' : 'bg-gray-300'}`} />
                            <span className={`text-sm ${item.complete ? 'text-gray-700' : 'text-gray-500'}`}>
                                {item.label}
                            </span>
                        </div>
                        <span className="text-xs text-gray-400">+{item.points} pts</span>
                    </div>
                ))}
            </div>

            {note && (
                <div className="mt-3 ml-13 flex items-start gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
                    <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    <span>{note}</span>
                </div>
            )}
        </div>
    );
}

export default function DataQualityPage() {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const [currentYear] = useState('2025-26');
    const [showVerifyModal, setShowVerifyModal] = useState(false);

    const institutionId = user?.entity_type === 'institution' ? user.entity_id : null;

    const { quality: rawQuality, loading, error, refetch } = useInstitutionDataQuality(institutionId);
    const quality = rawQuality as ExtendedInstitutionDataQuality | null;

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
                    <p className="mt-4 text-gray-600">Loading data quality metrics...</p>
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

    const getScoreColor = (score: number) => {
        if (score >= 90) return 'text-green-700';
        if (score >= 70) return 'text-blue-700';
        if (score >= 50) return 'text-yellow-700';
        return 'text-red-700';
    };

    const getScoreStatus = (score: number) => {
        if (score >= 90) return { label: 'Excellent', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' };
        if (score >= 70) return { label: 'Good', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' };
        if (score >= 50) return { label: 'Fair', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' };
        return { label: 'Needs Attention', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' };
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'Not available';
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

    const scoreStatus = getScoreStatus(quality.completeness_score);

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                            <span>Admin Portal</span>
                            <ChevronRight className="h-4 w-4" />
                            <span className="text-gray-900 font-medium">Data Quality</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">Data Quality Overview</h1>
                        <p className="text-gray-600">{quality.institution_name}</p>
                    </div>

                    {/* Top Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {/* Completeness Score */}
                        <Card className="md:col-span-2">
                            <CardBody>
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <BarChart3 className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm font-medium text-gray-600">Completeness Score</span>
                                        </div>
                                        <div className="flex items-baseline gap-3">
                                            <span className={`text-4xl font-bold ${getScoreColor(quality.completeness_score)}`}>
                                                {quality.completeness_score}%
                                            </span>
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${scoreStatus.bg} ${scoreStatus.text}`}>
                                                {scoreStatus.label}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="relative w-20 h-20">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="40"
                                                cy="40"
                                                r="36"
                                                stroke="currentColor"
                                                strokeWidth="6"
                                                fill="none"
                                                className="text-gray-100"
                                            />
                                            <circle
                                                cx="40"
                                                cy="40"
                                                r="36"
                                                stroke="currentColor"
                                                strokeWidth="6"
                                                fill="none"
                                                strokeLinecap="round"
                                                className={getScoreColor(quality.completeness_score)}
                                                style={{
                                                    strokeDasharray: `${2 * Math.PI * 36}`,
                                                    strokeDashoffset: `${2 * Math.PI * 36 * (1 - quality.completeness_score / 100)}`,
                                                    transition: 'stroke-dashoffset 1s ease-in-out'
                                                }}
                                            />
                                        </svg>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Last Updated */}
                        <Card>
                            <CardBody>
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium text-gray-600">Last Updated</span>
                                </div>
                                <div className="text-lg font-semibold text-gray-900 mb-1">
                                    {formatDate(quality.data_last_updated)}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {quality.verification_count} admin {quality.verification_count === 1 ? 'update' : 'updates'}
                                </div>
                            </CardBody>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Score Breakdown */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Score Breakdown Card */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold text-gray-900">Score Breakdown</h3>
                                    <p className="text-sm text-gray-500 mt-1">Complete all categories to reach 100%</p>
                                </CardHeader>
                                <CardBody>
                                    <div className="space-y-0">
                                        <ScoreCategory
                                            title="Core Identity"
                                            points={15}
                                            earned={quality.score_breakdown?.core_identity || 0}
                                            items={[
                                                { label: 'Institution name & location', complete: true, points: 8 },
                                                { label: 'Official website URL', complete: quality.has_website, points: 7 },
                                            ]}
                                        />

                                        <ScoreCategory
                                            title="Cost Data"
                                            points={30}
                                            earned={quality.score_breakdown?.cost_data || 0}
                                            items={[
                                                { label: 'Tuition & fees information', complete: quality.has_tuition_data, points: 30 },
                                            ]}
                                            note="Public institutions must provide both in-state and out-of-state tuition (15 pts each)"
                                        />

                                        <ScoreCategory
                                            title="Housing Costs"
                                            points={15}
                                            earned={quality.score_breakdown?.room_board || 0}
                                            items={[
                                                { label: 'Room & board pricing', complete: quality.has_room_board, points: 15 },
                                            ]}
                                        />

                                        <ScoreCategory
                                            title="Admissions Data"
                                            points={10}
                                            earned={quality.score_breakdown?.admissions || 0}
                                            items={[
                                                { label: 'Acceptance rate', complete: quality.has_admissions_data, points: 5 },
                                                { label: 'Test scores (SAT/ACT)', complete: quality.has_admissions_data, points: 5 },
                                            ]}
                                        />

                                        <ScoreCategory
                                            title="Campus Gallery"
                                            points={20}
                                            earned={quality.score_breakdown?.images || 0}
                                            items={[
                                                { label: 'At least 1 campus image', complete: (quality.image_count || 0) >= 1, points: 10 },
                                                { label: '3 or more campus images', complete: (quality.image_count || 0) >= 3, points: 10 },
                                            ]}
                                        />

                                        <ScoreCategory
                                            title="Admin Verification"
                                            points={10}
                                            earned={quality.score_breakdown?.admin_verified || 0}
                                            items={[
                                                { label: 'Data verified for current year', complete: quality.data_source === 'admin', points: 10 },
                                            ]}
                                        />
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Missing Fields */}
                            {quality.missing_fields.length > 0 && (
                                <Card>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">Missing Data Fields</h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {quality.missing_fields.length} {quality.missing_fields.length === 1 ? 'field requires' : 'fields require'} attention
                                                </p>
                                            </div>
                                            <Link href="/admin/edit-data">
                                                <Button variant="secondary" size="sm">
                                                    <Edit className="h-4 w-4 mr-2" />
                                                    Complete Fields
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardHeader>
                                    <CardBody>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {quality.missing_fields.map((field: string) => (
                                                <div
                                                    key={field}
                                                    className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700"
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                                                    {formatFieldName(field)}
                                                </div>
                                            ))}
                                        </div>
                                    </CardBody>
                                </Card>
                            )}
                        </div>

                        {/* Right Column: Actions & Status */}
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                                </CardHeader>
                                <CardBody>
                                    <div className="space-y-3">
                                        <Link href="/admin/edit-data" className="block">
                                            <button className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-lg transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-100">
                                                        <Edit className="h-5 w-5" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-semibold text-gray-900 text-sm">Update Data</div>
                                                        <div className="text-xs text-gray-500">Edit institution info</div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600" />
                                            </button>
                                        </Link>

                                        <button
                                            onClick={() => setShowVerifyModal(true)}
                                            className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 hover:border-green-300 hover:bg-green-50 rounded-lg transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100">
                                                    <CheckCircle className="h-5 w-5" />
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-semibold text-gray-900 text-sm">Verify Data</div>
                                                    <div className="text-xs text-gray-500">For {currentYear}</div>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600" />
                                        </button>

                                        <Link href="/admin/gallery" className="block">
                                            <button className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-lg transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-100">
                                                        <Image className="h-5 w-5" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-semibold text-gray-900 text-sm">Manage Gallery</div>
                                                        <div className="text-xs text-gray-500">{quality.image_count || 0} images</div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600" />
                                            </button>
                                        </Link>

                                        <Link href="/admin/verification-history" className="block">
                                            <button className="w-full flex items-center justify-between px-4 py-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-lg transition-all group">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center group-hover:bg-gray-100">
                                                        <Clock className="h-5 w-5" />
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-semibold text-gray-900 text-sm">View History</div>
                                                        <div className="text-xs text-gray-500">{quality.verification_count} updates</div>
                                                    </div>
                                                </div>
                                                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
                                            </button>
                                        </Link>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Data Status */}
                            <Card>
                                <CardHeader>
                                    <h3 className="text-lg font-semibold text-gray-900">Data Status</h3>
                                </CardHeader>
                                <CardBody>
                                    <div className="space-y-3">
                                        <StatusRow
                                            label="Website"
                                            status={quality.has_website}
                                        />
                                        <StatusRow
                                            label="Tuition Data"
                                            status={quality.has_tuition_data}
                                        />
                                        <StatusRow
                                            label="Room & Board"
                                            status={quality.has_room_board}
                                        />
                                        <StatusRow
                                            label="Admissions"
                                            status={quality.has_admissions_data}
                                        />
                                        <StatusRow
                                            label="Campus Images"
                                            status={quality.has_images || false}
                                            detail={(quality.image_count || 0) > 0 ? `${quality.image_count} uploaded` : undefined}
                                        />
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Data Source Info */}
                            <Card>
                                <CardBody>
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 text-gray-600 flex items-center justify-center flex-shrink-0">
                                            <Award className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 mb-1">Data Source</h4>
                                            <p className="text-sm text-gray-600 capitalize mb-2">
                                                {quality.data_source}
                                                {quality.ipeds_year && ` (${quality.ipeds_year})`}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {quality.data_source === 'admin'
                                                    ? 'All data has been verified by your team'
                                                    : 'Some data is from IPEDS and requires verification'}
                                            </p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Recommendation Banner */}
                            {quality.completeness_score < 100 && (quality.image_count || 0) < 3 && (
                                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                                    <CardBody>
                                        <div className="flex items-start gap-3">
                                            <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-semibold text-gray-900 text-sm mb-1">
                                                    Recommended Action
                                                </h4>
                                                <p className="text-sm text-gray-700 mb-3">
                                                    {quality.completeness_score >= 85
                                                        ? 'Upload 1 campus photo to reach 100% completeness'
                                                        : quality.completeness_score >= 70
                                                            ? 'Upload 3 campus photos to reach 100% completeness'
                                                            : 'Add 3 campus photos for +30 points'}
                                                </p>
                                                <Link href="/admin/gallery">
                                                    <Button variant="primary" size="sm" className="w-full">
                                                        <Image className="h-4 w-4 mr-2" />
                                                        Upload Images
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            )}

                            {/* Success Banner */}
                            {quality.completeness_score >= 100 && (
                                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                                    <CardBody>
                                        <div className="flex items-start gap-3">
                                            <Award className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <h4 className="font-semibold text-green-900 text-sm mb-1">
                                                    Perfect Score
                                                </h4>
                                                <p className="text-sm text-green-800">
                                                    Your profile is complete and optimized for student discovery
                                                </p>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            )}
                        </div>
                    </div>

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

function StatusRow({
    label,
    status,
    detail
}: {
    label: string;
    status: boolean;
    detail?: string;
}) {
    return (
        <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${status ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span className="text-sm text-gray-700">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                {detail && <span className="text-xs text-gray-500">{detail}</span>}
                {status ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                )}
            </div>
        </div>
    );
}