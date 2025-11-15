'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Calendar, DollarSign, GraduationCap, Award, MapPin, ExternalLink, CheckCircle } from 'lucide-react';
import scholarshipsApi from '@/api/endpoints/scholarships';
import { Scholarship } from '@/types/api';

export default function ScholarshipDetailPage() {
    const router = useRouter();
    const params = useParams();
    const scholarshipId = params.id ? parseInt(params.id as string) : null;

    const [scholarship, setScholarship] = useState<Scholarship | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (scholarshipId) {
            fetchScholarship();
        }
    }, [scholarshipId]);

    const fetchScholarship = async () => {
        if (!scholarshipId) return;

        try {
            setLoading(true);
            const data = await scholarshipsApi.getById(scholarshipId);
            setScholarship(data);
        } catch (error) {
            console.error('Error fetching scholarship:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const formatScholarshipType = (type: string) => {
        return type.split('_').map(word =>
            word.charAt(0) + word.slice(1).toLowerCase()
        ).join(' ');
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'EASY': return 'bg-green-100 text-green-800';
            case 'MODERATE': return 'bg-yellow-100 text-yellow-800';
            case 'HARD': return 'bg-orange-100 text-orange-800';
            case 'VERY_HARD': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                        <p className="mt-4 text-gray-600">Loading scholarship details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!scholarship) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <p className="text-gray-600">Scholarship not found</p>
                        <button
                            onClick={() => router.push('/scholarships')}
                            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            Back to Scholarships
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const amountDisplay = scholarship.amount_min === scholarship.amount_max
        ? formatCurrency(scholarship.amount_min)
        : formatCurrency(scholarship.amount_max);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/scholarships')}
                    className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Scholarships
                </button>

                {/* Header Image */}
                {scholarship.primary_image_url && (
                    <div className="mb-6 rounded-lg overflow-hidden">
                        <img
                            src={scholarship.primary_image_url}
                            alt={scholarship.title}
                            className="w-full h-64 object-cover"
                        />
                    </div>
                )}

                {/* Main Content */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-8">
                        {/* Title and Organization */}
                        <div className="mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                {scholarship.title}
                            </h1>
                            <div className="flex items-center text-gray-600">
                                <MapPin className="h-5 w-5 mr-2" />
                                <span className="text-lg">{scholarship.organization}</span>
                            </div>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {formatScholarshipType(scholarship.scholarship_type)}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(scholarship.difficulty_level)}`}>
                                {scholarship.difficulty_level.replace('_', ' ')}
                            </span>
                            {scholarship.is_renewable && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                    Renewable
                                </span>
                            )}
                            {scholarship.verified && (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Verified
                                </span>
                            )}
                        </div>

                        {/* Award Information */}
                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Award Information</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Award Amount */}
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">Award Range</div>
                                    <div className="flex items-center">
                                        <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                                        <span className="text-2xl font-bold text-green-600">{amountDisplay}</span>
                                    </div>
                                    {scholarship.amount_min !== scholarship.amount_max && (
                                        <div className="text-sm text-gray-500 mt-1">
                                            {formatCurrency(scholarship.amount_min)} - {formatCurrency(scholarship.amount_max)}
                                        </div>
                                    )}
                                </div>

                                {/* Number of Awards */}
                                {scholarship.number_of_awards && (
                                    <div>
                                        <div className="text-sm text-gray-600 mb-1">Number of Awards</div>
                                        <div className="flex items-center">
                                            <Award className="h-5 w-5 text-gray-600 mr-2" />
                                            <span className="text-2xl font-bold text-gray-900">{scholarship.number_of_awards}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Important Dates */}
                        <div className="bg-gray-50 rounded-lg p-6 mb-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Important Dates</h2>

                            <div className="space-y-3">
                                {scholarship.application_opens && (
                                    <div className="flex items-center">
                                        <Calendar className="h-5 w-5 text-gray-600 mr-3" />
                                        <div>
                                            <div className="text-sm text-gray-600">Application Opens</div>
                                            <div className="font-medium text-gray-900">{formatDate(scholarship.application_opens)}</div>
                                        </div>
                                    </div>
                                )}

                                {scholarship.deadline && (
                                    <div className="flex items-center">
                                        <Calendar className="h-5 w-5 text-red-600 mr-3" />
                                        <div>
                                            <div className="text-sm text-gray-600">Deadline</div>
                                            <div className="font-medium text-red-600">{formatDate(scholarship.deadline)}</div>
                                        </div>
                                    </div>
                                )}

                                {scholarship.for_academic_year && (
                                    <div className="flex items-center">
                                        <GraduationCap className="h-5 w-5 text-gray-600 mr-3" />
                                        <div>
                                            <div className="text-sm text-gray-600">Academic Year</div>
                                            <div className="font-medium text-gray-900">{scholarship.for_academic_year}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* About This Scholarship */}
                        {scholarship.description && (
                            <div className="mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-3">About This Scholarship</h2>
                                <p className="text-gray-700 leading-relaxed">{scholarship.description}</p>
                            </div>
                        )}

                        {/* Requirements */}
                        {scholarship.min_gpa && (
                            <div className="bg-blue-50 rounded-lg p-6 mb-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-3">Requirements</h2>
                                <div className="flex items-center">
                                    <GraduationCap className="h-5 w-5 text-blue-600 mr-3" />
                                    <div>
                                        <div className="text-sm text-gray-600">Minimum GPA</div>
                                        <div className="font-medium text-gray-900">{scholarship.min_gpa}</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Visit Website Button */}
                        {scholarship.website_url && (
                            <div className="mt-8">
                                <a
                                    href={scholarship.website_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    Visit Website
                                    <ExternalLink className="h-5 w-5 ml-2" />
                                </a>
                                <p className="mt-3 text-sm text-gray-500">
                                    Note: Information shown is subject to change. Please visit the scholarship website for the most current details and to verify all requirements before applying.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}