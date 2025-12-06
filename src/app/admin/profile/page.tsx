// src/app/admin/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataSection } from '@/components/admin/forms/DataSection';
import { ArrowLeft, Save, Loader2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Institution } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function ProfilePage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();

    const [institution, setInstitution] = useState<Institution | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form state - only editable fields
    const [website, setWebsite] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login');
            return;
        }
        loadInstitution();
    }, [isAuthenticated]);

    const loadInstitution = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/admin/login');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Try to get institution data from the existing admin endpoints
            // This matches your existing backend structure
            const response = await fetch(`${API_URL}/api/v1/admin/profile/entity`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                useAuthStore.getState().logout();
                router.push('/admin/login');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to load institution profile');
            }

            const data = await response.json();

            // Handle different response formats
            const institutionData = data.institution || data;
            setInstitution(institutionData);

            // Set editable fields
            setWebsite(institutionData.website || '');

        } catch (err) {
            console.error('Error loading profile:', err);
            setError('Failed to load institution profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/admin/login');
            return;
        }

        try {
            setSaving(true);
            setError(null);
            setSuccessMessage(null);

            // Validate website URL
            if (website && !isValidUrl(website)) {
                setError('Please enter a valid website URL');
                setSaving(false);
                return;
            }

            // Use PUT to update the institution
            const response = await fetch(`${API_URL}/api/v1/admin/institutions/${institution?.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    website: website || null,
                }),
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                useAuthStore.getState().logout();
                router.push('/admin/login');
                return;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to save profile');
            }

            const updatedData = await response.json();
            setInstitution(updatedData);
            setSuccessMessage('Profile updated successfully!');

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);

        } catch (err) {
            console.error('Error saving profile:', err);
            setError(err instanceof Error ? err.message : 'Failed to save profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const isValidUrl = (url: string): boolean => {
        try {
            const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch {
            return false;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="inline-block animate-spin h-12 w-12 text-primary-600 mb-4" />
                    <p className="text-gray-600">Loading institution profile...</p>
                </div>
            </div>
        );
    }

    if (!institution) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Institution not found</p>
                    <Button onClick={() => router.push('/admin/dashboard')}>
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Institution Profile
                    </h1>
                    <p className="text-gray-600">
                        Manage your institution's basic information
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">{successMessage}</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {/* Basic Information Section */}
                <DataSection
                    title="Basic Information"
                    description="Core institution details from IPEDS"
                >
                    {/* Read-only fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Institution Name
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                                {institution.name}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">From IPEDS (read-only)</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                IPEDS ID
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                                {institution.ipeds_id}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Unique identifier (read-only)</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                                {institution.city}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">From IPEDS (read-only)</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                State
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900">
                                {institution.state}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">From IPEDS (read-only)</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Institution Type
                            </label>
                            <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 capitalize">
                                {institution.control_type?.replace(/_/g, ' ')}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">From IPEDS (read-only)</p>
                        </div>
                    </div>
                </DataSection>

                {/* Editable Information Section */}
                <DataSection
                    title="Editable Information"
                    description="Information you can update"
                    className="mt-6"
                >
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Website URL
                            </label>
                            <div className="relative">
                                <Input
                                    type="url"
                                    value={website}
                                    onChange={(e) => setWebsite(e.target.value)}
                                    placeholder="https://www.university.edu"
                                    className="pr-10"
                                />
                                {website && (
                                    <a
                                        href={website.startsWith('http') ? website : `https://${website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        <ExternalLink className="h-5 w-5" />
                                    </a>
                                )}
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                Your institution's official website
                            </p>
                        </div>
                    </div>
                </DataSection>

                {/* Quick Links to Other Edit Pages */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-blue-900 mb-3">
                        Update More Information
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Link
                            href="/admin/academic"
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors"
                        >
                            <span className="text-sm font-medium text-gray-900">Academic Details</span>
                            <span className="text-xs text-gray-500">→</span>
                        </Link>
                        <Link
                            href="/admin/costs"
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors"
                        >
                            <span className="text-sm font-medium text-gray-900">Costs & Tuition</span>
                            <span className="text-xs text-gray-500">→</span>
                        </Link>
                        <Link
                            href="/admin/admissions"
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors"
                        >
                            <span className="text-sm font-medium text-gray-900">Admissions Data</span>
                            <span className="text-xs text-gray-500">→</span>
                        </Link>
                        <Link
                            href="/admin/gallery"
                            className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors"
                        >
                            <span className="text-sm font-medium text-gray-900">Gallery</span>
                            <span className="text-xs text-gray-500">→</span>
                        </Link>
                    </div>
                </div>

                {/* Save Button */}
                <div className="mt-8 flex justify-end gap-4">
                    <Button
                        variant="secondary"
                        onClick={() => router.push('/admin/dashboard')}
                        disabled={saving}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={saving}
                        className="min-w-[120px]"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}