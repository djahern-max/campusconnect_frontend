// src/components/admin/VerifyDataModal.tsx
'use client';

import { useState } from 'react';
import { institutionDataApi } from '@/api/endpoints/institutionDataAPI';
import { Button } from '@/components/ui/Button';
import { CheckCircle, X, AlertTriangle, Info } from 'lucide-react';

interface VerifyDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    institutionId: number;
    institutionName: string;
    onSuccess?: () => void;
}

export default function VerifyDataModal({
    isOpen,
    onClose,
    institutionId,
    institutionName,
    onSuccess,
}: VerifyDataModalProps) {
    const [academicYear, setAcademicYear] = useState('2025-26');
    const [notes, setNotes] = useState('');
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [result, setResult] = useState<{
        fields_verified: number;
        completeness_score: number;
    } | null>(null);

    const handleVerify = async () => {
        setVerifying(true);
        setError(null);

        try {
            const response = await institutionDataApi.verifyCurrent(institutionId, {
                academic_year: academicYear,
                notes: notes || undefined,
            });

            setResult({
                fields_verified: response.fields_verified,
                completeness_score: response.completeness_score,
            });
            setSuccess(true);

            // Call onSuccess callback after a short delay
            setTimeout(() => {
                if (onSuccess) onSuccess();
                handleClose();
            }, 2000);
        } catch (err: any) {
            console.error('Error verifying data:', err);
            setError(err.response?.data?.detail || 'Failed to verify data');
        } finally {
            setVerifying(false);
        }
    };

    const handleClose = () => {
        setAcademicYear('2025-26');
        setNotes('');
        setError(null);
        setSuccess(false);
        setResult(null);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                    <h2 className="text-xl font-bold text-gray-900">Verify Current Data</h2>
                    <button
                        onClick={handleClose}
                        disabled={verifying}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    {success && result ? (
                        // Success State
                        <div className="text-center py-4">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                <CheckCircle className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Data Verified Successfully!
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Your institution data for {academicYear} has been verified.
                            </p>
                            <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                                <div className="bg-blue-50 rounded-lg p-3">
                                    <div className="text-2xl font-bold text-blue-900">
                                        {result.fields_verified}
                                    </div>
                                    <div className="text-xs text-blue-700 mt-1">Fields Verified</div>
                                </div>
                                <div className="bg-green-50 rounded-lg p-3">
                                    <div className="text-2xl font-bold text-green-900">
                                        {result.completeness_score}%
                                    </div>
                                    <div className="text-xs text-green-700 mt-1">Quality Score</div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Form State
                        <>
                            {/* Info Banner */}
                            <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 flex items-start gap-3 mb-6">
                                <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">What does verification do?</p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Confirms your data is current and accurate</li>
                                        <li>Adds +10 points to your completeness score</li>
                                        <li>Updates data source to "Admin Verified"</li>
                                        <li>Creates an audit trail record</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Institution Name */}
                            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-600">Verifying data for:</p>
                                <p className="font-semibold text-gray-900">{institutionName}</p>
                            </div>

                            {/* Academic Year */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Academic Year *
                                </label>
                                <select
                                    value={academicYear}
                                    onChange={(e) => setAcademicYear(e.target.value)}
                                    disabled={verifying}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700 disabled:opacity-50"
                                >
                                    <option value="2024-25">2024-25</option>
                                    <option value="2025-26">2025-26</option>
                                    <option value="2026-27">2026-27</option>
                                </select>
                                <p className="mt-1 text-xs text-gray-500">
                                    Select the academic year this data represents
                                </p>
                            </div>

                            {/* Notes */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    disabled={verifying}
                                    placeholder="Add any additional notes about this verification..."
                                    rows={3}
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700 disabled:opacity-50 resize-none"
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-red-800">{error}</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {!success && (
                    <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
                        <Button
                            variant="secondary"
                            onClick={handleClose}
                            disabled={verifying}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleVerify}
                            disabled={verifying}
                            className="min-w-[120px]"
                        >
                            {verifying ? (
                                <>
                                    <div className="inline-block h-4 w-4 rounded-full border-b-2 border-white animate-spin mr-2" />
                                    Verifying...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Verify Data
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}