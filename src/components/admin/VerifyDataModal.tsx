// src/components/admin/VerifyDataModal.tsx
// Updated with accurate information about what verification does

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { institutionDataApi } from '@/api/endpoints/institutionDataAPI';
import { CheckCircle, Info, X, Shield } from 'lucide-react';

interface VerifyDataModalProps {
    isOpen: boolean;
    onClose: () => void;
    institutionId: number;
    institutionName: string;
    onSuccess: () => void;
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleVerify = async () => {
        setLoading(true);
        setError(null);

        try {
            await institutionDataApi.verifyCurrent(institutionId, {
                academic_year: academicYear,
                notes: notes || undefined,
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Error verifying data:', err);
            setError(err.response?.data?.detail || 'Failed to verify data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-center justify-center p-4">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal */}
                <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Verify Current Data</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* What does verification do? */}
                    <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 flex items-start gap-3 mb-6">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-blue-900 mb-2">What does verification do?</p>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Confirms your data is current and accurate for this academic year</li>
                                <li>• Shows "Verified by Institution" badge to prospective students</li>
                                <li>• Builds trust with students viewing your profile</li>
                                <li>• Updates your "Last Verified" date</li>
                            </ul>
                        </div>
                    </div>

                    {/* Public Badge Preview */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-600 mb-2 font-medium">STUDENTS WILL SEE:</p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                            <Shield className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-sm font-semibold text-green-900">
                                    Verified by Institution
                                </p>
                                <p className="text-xs text-green-700">
                                    Data verified for {academicYear}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Institution Name */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-600">Verifying data for:</p>
                        <p className="text-lg font-semibold text-gray-900">{institutionName}</p>
                    </div>

                    {/* Academic Year */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Academic Year <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={academicYear}
                            onChange={(e) => setAcademicYear(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="2025-26">2025-26</option>
                            <option value="2024-25">2024-25</option>
                            <option value="2026-27">2026-27</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">Select the academic year this data represents</p>
                    </div>

                    {/* Notes */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add any additional notes about this verification..."
                            rows={3}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleVerify}
                            disabled={loading}
                            className="flex-1"
                        >
                            {loading ? (
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
                </div>
            </div>
        </div>
    );
}