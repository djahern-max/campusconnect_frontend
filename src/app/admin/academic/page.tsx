// src/app/admin/academic/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { DataSection } from '@/components/admin/forms/DataSection';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Institution } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AcademicPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();

    const [institution, setInstitution] = useState<Institution | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form state
    const [studentFacultyRatio, setStudentFacultyRatio] = useState('');
    const [sizeCategory, setSizeCategory] = useState('');
    const [locale, setLocale] = useState('');

    const SIZE_CATEGORIES = [
        { value: '', label: 'Select size...' },
        { value: 'very_small', label: 'Very Small (< 1,000)' },
        { value: 'small', label: 'Small (1,000 - 2,999)' },
        { value: 'medium', label: 'Medium (3,000 - 9,999)' },
        { value: 'large', label: 'Large (10,000 - 19,999)' },
        { value: 'very_large', label: 'Very Large (20,000+)' },
    ];

    const LOCALE_OPTIONS = [
        { value: '', label: 'Select location type...' },
        { value: 'city', label: 'City: Large' },
        { value: 'city_small', label: 'City: Small' },
        { value: 'city_midsize', label: 'City: Midsize' },
        { value: 'suburb', label: 'Suburb: Large' },
        { value: 'suburb_small', label: 'Suburb: Small' },
        { value: 'suburb_midsize', label: 'Suburb: Midsize' },
        { value: 'town', label: 'Town: Fringe' },
        { value: 'town_distant', label: 'Town: Distant' },
        { value: 'town_remote', label: 'Town: Remote' },
        { value: 'rural', label: 'Rural: Fringe' },
        { value: 'rural_distant', label: 'Rural: Distant' },
        { value: 'rural_remote', label: 'Rural: Remote' },
    ];

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
            const response = await fetch(`${API_URL}/api/v1/admin/profile/entity`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                useAuthStore.getState().logout();
                router.push('/admin/login');
                return;
            }

            if (!response.ok) throw new Error('Failed to load data');

            const data = await response.json();
            const inst = data.institution || data;
            setInstitution(inst);

            // Set form values
            setStudentFacultyRatio(inst.student_faculty_ratio?.toString() || '');
            setSizeCategory(inst.size_category || '');
            setLocale(inst.locale || '');

        } catch (err) {
            setError('Failed to load academic data');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        try {
            setSaving(true);
            setError(null);

            const response = await fetch(`${API_URL}/api/v1/admin/institutions/${institution?.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    student_faculty_ratio: studentFacultyRatio ? parseFloat(studentFacultyRatio) : null,
                    size_category: sizeCategory || null,
                    locale: locale || null,
                }),
            });

            if (!response.ok) throw new Error('Failed to save');

            setSuccessMessage('Academic data updated successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);

        } catch (err) {
            setError('Failed to save academic data');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/admin/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Academic Information</h1>
                    <p className="text-gray-600">Update academic characteristics and statistics</p>
                </div>

                {successMessage && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800">{successMessage}</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                <DataSection title="Academic Details" description="Institutional characteristics">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Student-Faculty Ratio
                            </label>
                            <input
                                type="number"
                                step="0.1"
                                value={studentFacultyRatio}
                                onChange={(e) => setStudentFacultyRatio(e.target.value)}
                                placeholder="15.0"
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                            <p className="mt-1 text-xs text-gray-500">Example: 15.0 means 15 students per 1 faculty member</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Size Category
                            </label>
                            <select
                                value={sizeCategory}
                                onChange={(e) => setSizeCategory(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {SIZE_CATEGORIES.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Location Type (Locale)
                            </label>
                            <select
                                value={locale}
                                onChange={(e) => setLocale(e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                {LOCALE_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </DataSection>

                <div className="mt-8 flex justify-end gap-4">
                    <Button variant="secondary" onClick={() => router.push('/admin/dashboard')} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : <><Save className="mr-2 h-4 w-4" />Save Changes</>}
                    </Button>
                </div>
            </div>
        </div>
    );
}