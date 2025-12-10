//src/app/admin/scholarship-dashboard/page.tsx
'use client';

/**
 * Comprehensive Scholarship Admin Dashboard
 * Modeled after the institution dashboard with debounced auto-save
 */

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useScholarshipData } from '@/hooks/useScholarshipData';
import {
    ChevronDown,
    ChevronRight,
    DollarSign,
    Calendar,
    Award,
    FileText,
    Check,
    Loader2,
    AlertCircle,
    ExternalLink,
} from 'lucide-react';

interface CollapsibleSectionProps {
    title: string;
    icon: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
    saving: boolean;
    children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    icon,
    isOpen,
    onToggle,
    saving,
    children,
}) => {
    const [showSaved, setShowSaved] = useState(false);

    useEffect(() => {
        if (!saving && showSaved) {
            const timeout = setTimeout(() => setShowSaved(false), 2000);
            return () => clearTimeout(timeout);
        }
        if (saving) {
            setShowSaved(true);
        }
    }, [saving, showSaved]);

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center space-x-3">
                    {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        {icon}
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
                </div>

                <div className="flex items-center space-x-2">
                    {saving && (
                        <>
                            <Loader2 size={16} className="animate-spin text-blue-600" />
                            <span className="text-sm text-blue-600">Saving...</span>
                        </>
                    )}
                    {!saving && showSaved && (
                        <>
                            <Check size={16} className="text-green-600" />
                            <span className="text-sm text-green-600">Saved</span>
                        </>
                    )}
                </div>
            </button>

            {isOpen && <div className="px-6 py-4 border-t border-gray-200">{children}</div>}
        </div>
    );
};

export default function ScholarshipDashboard() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [isBasicOpen, setIsBasicOpen] = useState(false);
    const [isAmountOpen, setIsAmountOpen] = useState(false);
    const [isDatesOpen, setIsDatesOpen] = useState(false);
    const [isRequirementsOpen, setIsRequirementsOpen] = useState(false);

    const scholarshipId = user?.entity_type === 'scholarship' ? user.entity_id : null;
    const { data, loading: dataLoading, error: dataError, updateField, saving } = useScholarshipData(scholarshipId);

    // Refs to track pending updates per field
    const pendingUpdatesRef = useRef<Record<string, NodeJS.Timeout>>({});

    // Local state for display values (what user sees)
    const [localValues, setLocalValues] = useState<Record<string, string>>({});

    // Initialize local values from server data ONCE
    useEffect(() => {
        if (data && Object.keys(localValues).length === 0) {
            const initial: Record<string, string> = {};

            const fields = [
                'title',
                'organization',
                'description',
                'website_url',
                'scholarship_type',
                'status',
                'difficulty_level',
                'amount_min',
                'amount_max',
                'number_of_awards',
                'deadline',
                'application_opens',
                'for_academic_year',
                'min_gpa',
            ];

            fields.forEach((field) => {
                const value = (data as any)[field];
                if (value !== null && value !== undefined) {
                    initial[field] = String(value);
                }
            });

            setLocalValues(initial);
        }
    }, [data, localValues]);

    // Debounced update function (called after typing stops)
    const debouncedUpdate = (field: string, value: any) => {
        // Clear existing timeout for this field
        if (pendingUpdatesRef.current[field]) {
            clearTimeout(pendingUpdatesRef.current[field]);
        }

        // Set new timeout
        const timeoutId = setTimeout(() => {
            updateField(field as any, value);
            delete pendingUpdatesRef.current[field];
        }, 1000);

        pendingUpdatesRef.current[field] = timeoutId;
    };

    // Handle text input (title, organization, dropdowns, etc.)
    const handleTextChange = (field: string, rawValue: string) => {
        // Update local display immediately
        setLocalValues((prev) => ({ ...prev, [field]: rawValue }));

        // Send to backend after debounce
        debouncedUpdate(field, rawValue || null);
    };

    // Handle number input (amounts, awards, GPA)
    const handleNumberChange = (field: string, rawValue: string, isDecimal: boolean = true) => {
        // Update local display immediately
        setLocalValues((prev) => ({ ...prev, [field]: rawValue }));

        // Parse and validate
        if (rawValue === '' || rawValue === null) {
            debouncedUpdate(field, null);
            return;
        }

        // Remove commas for parsing
        const cleanValue = rawValue.replace(/,/g, '');

        if (isDecimal) {
            const numValue = parseFloat(cleanValue);
            if (!isNaN(numValue) && numValue >= 0) {
                debouncedUpdate(field, numValue);
            }
        } else {
            const intValue = parseInt(cleanValue);
            if (!isNaN(intValue) && intValue >= 0) {
                debouncedUpdate(field, intValue);
            }
        }
    };

    // Handle boolean checkboxes
    const handleBooleanChange = (field: string, checked: boolean) => {
        setLocalValues((prev) => ({ ...prev, [field]: String(checked) }));
        updateField(field as any, checked);
    };

    // Format currency on blur
    const formatCurrency = (field: string) => {
        const value = localValues[field];
        if (!value) return;

        const cleanValue = value.replace(/,/g, '');
        const numValue = parseFloat(cleanValue);

        if (!isNaN(numValue)) {
            const formatted = numValue.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });
            setLocalValues((prev) => ({ ...prev, [field]: formatted }));
        }
    };

    // Clean up timeouts on unmount
    useEffect(() => {
        return () => {
            Object.values(pendingUpdatesRef.current).forEach((timeout) => clearTimeout(timeout));
        };
    }, []);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login');
        } else if (user?.entity_type !== 'scholarship') {
            router.push('/admin/dashboard');
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, user, router]);

    if (loading || !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Scholarship Dashboard</h1>
                        <p className="text-gray-600 mt-2">Manage your scholarship details and settings.</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                        </svg>
                        Refresh Data
                    </button>
                </div>

                {/* Error Message */}
                {dataError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                        <AlertCircle size={20} className="text-red-600 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-red-800">Error loading data</p>
                            <p className="text-sm text-red-600">{dataError}</p>
                        </div>
                    </div>
                )}

                {/* Loading Message */}
                {dataLoading && (
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                            <Loader2 size={16} className="animate-spin text-blue-600" />
                            <span className="text-sm text-blue-600">Loading your data...</span>
                        </div>
                    </div>
                )}

                {/* Read-Only Scholarship Info */}
                {data && (
                    <div className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Scholarship Information (Read-Only)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">Database ID:</span>
                                <span className="ml-2 text-gray-600">{data.id}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Views:</span>
                                <span className="ml-2 text-gray-600">{data.views_count}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Applications:</span>
                                <span className="ml-2 text-gray-600">{data.applications_count}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Verified:</span>
                                <span className="ml-2 text-gray-600">{data.verified ? 'Yes' : 'No'}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Featured:</span>
                                <span className="ml-2 text-gray-600">{data.featured ? 'Yes' : 'No'}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Created:</span>
                                <span className="ml-2 text-gray-600">{new Date(data.created_at).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Last Updated:</span>
                                <span className="ml-2 text-gray-600">
                                    {data.updated_at ? new Date(data.updated_at).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Editable Sections */}
                {data && (
                    <div className="space-y-4">
                        {/* BASIC INFORMATION */}
                        <CollapsibleSection
                            title="Basic Information"
                            icon={<FileText size={18} />}
                            isOpen={isBasicOpen}
                            onToggle={() => setIsBasicOpen(!isBasicOpen)}
                            saving={saving}
                        >
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship Title *</label>
                                        <input
                                            type="text"
                                            value={localValues.title || ''}
                                            onChange={(e) => handleTextChange('title', e.target.value)}
                                            placeholder="e.g., STEM Excellence Scholarship"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Organization *</label>
                                        <input
                                            type="text"
                                            value={localValues.organization || ''}
                                            onChange={(e) => handleTextChange('organization', e.target.value)}
                                            placeholder="e.g., Tech Foundation"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={localValues.description || ''}
                                        onChange={(e) => handleTextChange('description', e.target.value)}
                                        placeholder="Detailed description of the scholarship..."
                                        rows={4}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                                    <input
                                        type="url"
                                        value={localValues.website_url || ''}
                                        onChange={(e) => handleTextChange('website_url', e.target.value)}
                                        placeholder="https://example.com/scholarship"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Scholarship Type *</label>
                                        <select
                                            value={localValues.scholarship_type || ''}
                                            onChange={(e) => handleTextChange('scholarship_type', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Select type</option>
                                            <option value="ACADEMIC">Academic</option>
                                            <option value="STEM">STEM</option>
                                            <option value="ARTS">Arts</option>
                                            <option value="ATHLETICS">Athletics</option>
                                            <option value="COMMUNITY_SERVICE">Community Service</option>
                                            <option value="NEED_BASED">Need-Based</option>
                                            <option value="MERIT_BASED">Merit-Based</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select
                                            value={localValues.status || ''}
                                            onChange={(e) => handleTextChange('status', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="ACTIVE">Active</option>
                                            <option value="INACTIVE">Inactive</option>
                                            <option value="EXPIRED">Expired</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                                        <select
                                            value={localValues.difficulty_level || ''}
                                            onChange={(e) => handleTextChange('difficulty_level', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="EASY">Easy</option>
                                            <option value="MODERATE">Moderate</option>
                                            <option value="COMPETITIVE">Competitive</option>
                                            <option value="HIGHLY_COMPETITIVE">Highly Competitive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* AWARD AMOUNTS */}
                        <CollapsibleSection
                            title="Award Amounts"
                            icon={<DollarSign size={18} />}
                            isOpen={isAmountOpen}
                            onToggle={() => setIsAmountOpen(!isAmountOpen)}
                            saving={saving}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Amount *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                                        <input
                                            type="text"
                                            value={localValues.amount_min || ''}
                                            onChange={(e) => handleNumberChange('amount_min', e.target.value, false)}
                                            onBlur={() => formatCurrency('amount_min')}
                                            placeholder="0"
                                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Amount *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                                        <input
                                            type="text"
                                            value={localValues.amount_max || ''}
                                            onChange={(e) => handleNumberChange('amount_max', e.target.value, false)}
                                            onBlur={() => formatCurrency('amount_max')}
                                            placeholder="0"
                                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Number of Awards</label>
                                    <input
                                        type="text"
                                        value={localValues.number_of_awards || ''}
                                        onChange={(e) => handleNumberChange('number_of_awards', e.target.value, false)}
                                        placeholder="Optional"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_renewable}
                                    onChange={(e) => handleBooleanChange('is_renewable', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 text-sm font-medium text-gray-700">Renewable Scholarship</label>
                            </div>
                        </CollapsibleSection>

                        {/* DATES & DEADLINES */}
                        <CollapsibleSection
                            title="Dates & Deadlines"
                            icon={<Calendar size={18} />}
                            isOpen={isDatesOpen}
                            onToggle={() => setIsDatesOpen(!isDatesOpen)}
                            saving={saving}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Application Opens</label>
                                    <input
                                        type="date"
                                        value={localValues.application_opens || ''}
                                        onChange={(e) => handleTextChange('application_opens', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                                    <input
                                        type="date"
                                        value={localValues.deadline || ''}
                                        onChange={(e) => handleTextChange('deadline', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                                    <input
                                        type="text"
                                        value={localValues.for_academic_year || ''}
                                        onChange={(e) => handleTextChange('for_academic_year', e.target.value)}
                                        placeholder="e.g., 2025-2026"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </CollapsibleSection>

                        {/* REQUIREMENTS */}
                        <CollapsibleSection
                            title="Requirements"
                            icon={<Award size={18} />}
                            isOpen={isRequirementsOpen}
                            onToggle={() => setIsRequirementsOpen(!isRequirementsOpen)}
                            saving={saving}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Minimum GPA</label>
                                    <input
                                        type="text"
                                        value={localValues.min_gpa || ''}
                                        onChange={(e) => handleNumberChange('min_gpa', e.target.value, true)}
                                        placeholder="e.g., 3.5"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Optional: Leave blank if no GPA requirement</p>
                                </div>
                            </div>
                        </CollapsibleSection>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => router.push('/admin/gallery')}
                            className="flex items-center justify-center px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                            <span className="font-medium">Manage Gallery</span>
                            <ExternalLink size={16} className="ml-2" />
                        </button>
                        <button
                            onClick={() => data?.website_url && window.open(data.website_url, '_blank')}
                            disabled={!data?.website_url}
                            className="flex items-center justify-center px-4 py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="font-medium">View Public Page</span>
                            <ExternalLink size={16} className="ml-2" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}