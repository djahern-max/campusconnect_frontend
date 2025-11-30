// src/app/admin/admissions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { DataSection } from '@/components/admin/forms/DataSection';
import { PercentageInput } from '@/components/admin/forms/PercentageInput';
import { ScoreInput } from '@/components/admin/forms/ScoreInput';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Institution } from '@/types/api';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdmissionsPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();

    const [institution, setInstitution] = useState<Institution | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form state
    const [acceptanceRate, setAcceptanceRate] = useState<number | null>(null);
    const [satReading25, setSatReading25] = useState<number | null>(null);
    const [satReading75, setSatReading75] = useState<number | null>(null);
    const [satMath25, setSatMath25] = useState<number | null>(null);
    const [satMath75, setSatMath75] = useState<number | null>(null);
    const [actComposite25, setActComposite25] = useState<number | null>(null);
    const [actComposite75, setActComposite75] = useState<number | null>(null);

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
                headers: { 'Authorization': `Bearer ${token}` },
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
            setAcceptanceRate(inst.acceptance_rate);
            setSatReading25(inst.sat_reading_25th);
            setSatReading75(inst.sat_reading_75th);
            setSatMath25(inst.sat_math_25th);
            setSatMath75(inst.sat_math_75th);
            setActComposite25(inst.act_composite_25th);
            setActComposite75(inst.act_composite_75th);

        } catch (err) {
            setError('Failed to load admissions data');
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

            // Validate score ranges
            if (satReading25 && satReading75 && satReading25 > satReading75) {
                setError('SAT Reading 25th percentile must be less than 75th percentile');
                setSaving(false);
                return;
            }
            if (satMath25 && satMath75 && satMath25 > satMath75) {
                setError('SAT Math 25th percentile must be less than 75th percentile');
                setSaving(false);
                return;
            }
            if (actComposite25 && actComposite75 && actComposite25 > actComposite75) {
                setError('ACT 25th percentile must be less than 75th percentile');
                setSaving(false);
                return;
            }

            const response = await fetch(`${API_URL}/api/v1/admin/institutions/${institution?.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    acceptance_rate: acceptanceRate,
                    sat_reading_25th: satReading25,
                    sat_reading_75th: satReading75,
                    sat_math_25th: satMath25,
                    sat_math_75th: satMath75,
                    act_composite_25th: actComposite25,
                    act_composite_75th: actComposite75,
                }),
            });

            if (!response.ok) throw new Error('Failed to save');

            setSuccessMessage('Admissions data updated successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save admissions data');
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Admissions Statistics</h1>
                    <p className="text-gray-600">Update acceptance rates and test score ranges</p>
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

                {/* General Admissions */}
                <DataSection title="General Admissions" description="Overall acceptance statistics">
                    <PercentageInput
                        label="Acceptance Rate"
                        value={acceptanceRate}
                        onChange={setAcceptanceRate}
                        helpText="Percentage of applicants admitted"
                        min={0}
                        max={100}
                    />
                </DataSection>

                {/* SAT Scores */}
                <DataSection title="SAT Score Ranges" description="25th to 75th percentile scores" className="mt-6">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ScoreInput
                                label="SAT Reading - 25th Percentile"
                                value={satReading25}
                                onChange={setSatReading25}
                                min={200}
                                max={800}
                                helpText="Bottom 25% scored at or below this"
                            />
                            <ScoreInput
                                label="SAT Reading - 75th Percentile"
                                value={satReading75}
                                onChange={setSatReading75}
                                min={200}
                                max={800}
                                helpText="Top 25% scored at or above this"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ScoreInput
                                label="SAT Math - 25th Percentile"
                                value={satMath25}
                                onChange={setSatMath25}
                                min={200}
                                max={800}
                                helpText="Bottom 25% scored at or below this"
                            />
                            <ScoreInput
                                label="SAT Math - 75th Percentile"
                                value={satMath75}
                                onChange={setSatMath75}
                                min={200}
                                max={800}
                                helpText="Top 25% scored at or above this"
                            />
                        </div>
                    </div>
                </DataSection>

                {/* ACT Scores */}
                <DataSection title="ACT Score Ranges" description="25th to 75th percentile composite scores" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ScoreInput
                            label="ACT Composite - 25th Percentile"
                            value={actComposite25}
                            onChange={setActComposite25}
                            min={1}
                            max={36}
                            helpText="Bottom 25% scored at or below this"
                        />
                        <ScoreInput
                            label="ACT Composite - 75th Percentile"
                            value={actComposite75}
                            onChange={setActComposite75}
                            min={1}
                            max={36}
                            helpText="Top 25% scored at or above this"
                        />
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