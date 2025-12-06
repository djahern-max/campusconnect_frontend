// src/app/admin/costs/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { DataSection } from '@/components/admin/forms/DataSection';
import { CurrencyInput } from '@/components/admin/forms/CurrencyInput';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Institution } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function CostsPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthStore();

    const [institution, setInstitution] = useState<Institution | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Form state
    const [tuitionInState, setTuitionInState] = useState<number | null>(null);
    const [tuitionOutOfState, setTuitionOutOfState] = useState<number | null>(null);
    const [tuitionPrivate, setTuitionPrivate] = useState<number | null>(null);
    const [tuitionInDistrict, setTuitionInDistrict] = useState<number | null>(null);
    const [roomCost, setRoomCost] = useState<number | null>(null);
    const [boardCost, setBoardCost] = useState<number | null>(null);
    const [roomAndBoard, setRoomAndBoard] = useState<number | null>(null);
    const [applicationFeeUndergrad, setApplicationFeeUndergrad] = useState<number | null>(null);
    const [applicationFeeGrad, setApplicationFeeGrad] = useState<number | null>(null);

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
            setTuitionInState(inst.tuition_in_state);
            setTuitionOutOfState(inst.tuition_out_of_state);
            setTuitionPrivate(inst.tuition_private);
            setTuitionInDistrict(inst.tuition_in_district);
            setRoomCost(inst.room_cost);
            setBoardCost(inst.board_cost);
            setRoomAndBoard(inst.room_and_board);
            setApplicationFeeUndergrad(inst.application_fee_undergrad);
            setApplicationFeeGrad(inst.application_fee_grad);

        } catch (err) {
            setError('Failed to load cost data');
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
                    tuition_in_state: tuitionInState,
                    tuition_out_of_state: tuitionOutOfState,
                    tuition_private: tuitionPrivate,
                    tuition_in_district: tuitionInDistrict,
                    room_cost: roomCost,
                    board_cost: boardCost,
                    room_and_board: roomAndBoard,
                    application_fee_undergrad: applicationFeeUndergrad,
                    application_fee_grad: applicationFeeGrad,
                }),
            });

            if (!response.ok) throw new Error('Failed to save');

            setSuccessMessage('Cost data updated successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);

        } catch (err) {
            setError('Failed to save cost data');
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

    const isPublic = institution?.control_type === 'PUBLIC';
    const isPrivate = institution?.control_type === 'PRIVATE_NONPROFIT' || institution?.control_type === 'PRIVATE_FOR_PROFIT';

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <Link href="/admin/dashboard" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Costs & Tuition</h1>
                    <p className="text-gray-600">Update tuition rates, fees, and housing costs</p>
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

                {/* Tuition Section */}
                <DataSection title="Tuition" description="Annual tuition rates">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {isPublic && (
                            <>
                                <CurrencyInput
                                    label="In-State Tuition"
                                    value={tuitionInState}
                                    onChange={setTuitionInState}
                                    helpText="Annual tuition for state residents"
                                />
                                <CurrencyInput
                                    label="Out-of-State Tuition"
                                    value={tuitionOutOfState}
                                    onChange={setTuitionOutOfState}
                                    helpText="Annual tuition for non-residents"
                                />
                                <CurrencyInput
                                    label="In-District Tuition"
                                    value={tuitionInDistrict}
                                    onChange={setTuitionInDistrict}
                                    helpText="Special rate for local district (if applicable)"
                                />
                            </>
                        )}
                        {isPrivate && (
                            <CurrencyInput
                                label="Annual Tuition"
                                value={tuitionPrivate}
                                onChange={setTuitionPrivate}
                                helpText="Standard annual tuition"
                            />
                        )}
                    </div>
                </DataSection>

                {/* Housing Section */}
                <DataSection title="Housing Costs" description="Room and board expenses" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CurrencyInput
                            label="Room & Board (Combined)"
                            value={roomAndBoard}
                            onChange={setRoomAndBoard}
                            helpText="Total cost for room and meals"
                        />
                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <CurrencyInput
                                label="Room Only"
                                value={roomCost}
                                onChange={setRoomCost}
                                helpText="Housing cost only"
                            />
                            <CurrencyInput
                                label="Board Only"
                                value={boardCost}
                                onChange={setBoardCost}
                                helpText="Meal plan cost only"
                            />
                        </div>
                    </div>
                </DataSection>

                {/* Application Fees */}
                <DataSection title="Application Fees" description="Fees for applying to your institution" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <CurrencyInput
                            label="Undergraduate Application Fee"
                            value={applicationFeeUndergrad}
                            onChange={setApplicationFeeUndergrad}
                        />
                        <CurrencyInput
                            label="Graduate Application Fee"
                            value={applicationFeeGrad}
                            onChange={setApplicationFeeGrad}
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