// src/app/admin/edit-data/page.tsx
// src/app/admin/edit-data/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useInstitutionDataQuality } from '@/hooks/useInstitutionData';
import { institutionDataApi } from '@/api/endpoints/institutionDataAPI';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import {
    Building,
    DollarSign,
    GraduationCap,
    AlertTriangle,
    CheckCircle,
    Info,
    Save,
    ArrowLeft,
} from 'lucide-react';

type TabType = 'basic' | 'costs' | 'admissions';

export default function EditDataPage() {
    const router = useRouter();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);

    const institutionId = user?.entity_type === 'institution' ? user.entity_id : null;
    const { quality, loading: loadingQuality, refetch } = useInstitutionDataQuality(institutionId);

    const [activeTab, setActiveTab] = useState<TabType>('basic');
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Form states
    const [basicInfo, setBasicInfo] = useState({
        website: '',
        student_faculty_ratio: '',
        size_category: '',
    });

    const [costData, setCostData] = useState({
        tuition_in_state: '',
        tuition_out_of_state: '',
        room_cost: '',
        board_cost: '',
        application_fee_undergrad: '',
    });

    const [admissionsData, setAdmissionsData] = useState({
        acceptance_rate: '',
        sat_reading_25th: '',
        sat_reading_75th: '',
        sat_math_25th: '',
        sat_math_75th: '',
        act_composite_25th: '',
        act_composite_75th: '',
    });

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login');
        }
    }, [isAuthenticated, router]);

    // Load current data when quality data is available
    useEffect(() => {
        if (quality && institutionId) {
            loadCurrentData();
        }
    }, [quality, institutionId]);

    const loadCurrentData = async () => {
        if (!institutionId) return;

        try {
            const data = await institutionDataApi.getInstitutionData(institutionId);

            // Populate basic info
            setBasicInfo({
                website: data.website || '',
                student_faculty_ratio: data.student_faculty_ratio?.toString() || '',
                size_category: data.size_category || '',
            });

            // Populate cost data
            setCostData({
                tuition_in_state: data.tuition_in_state?.toString() || '',
                tuition_out_of_state: data.tuition_out_of_state?.toString() || '',
                room_cost: data.room_cost?.toString() || '',
                board_cost: data.board_cost?.toString() || '',
                application_fee_undergrad: data.application_fee_undergrad?.toString() || '',
            });

            // Populate admissions data
            setAdmissionsData({
                acceptance_rate: data.acceptance_rate?.toString() || '',
                sat_reading_25th: data.sat_reading_25th?.toString() || '',
                sat_reading_75th: data.sat_reading_75th?.toString() || '',
                sat_math_25th: data.sat_math_25th?.toString() || '',
                sat_math_75th: data.sat_math_75th?.toString() || '',
                act_composite_25th: data.act_composite_25th?.toString() || '',
                act_composite_75th: data.act_composite_75th?.toString() || '',
            });
        } catch (error) {
            console.error('Error loading current data:', error);
        }
    };

    const handleSaveBasicInfo = async () => {
        if (!institutionId) return;

        setSaving(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        try {
            const updateData: any = {};

            if (basicInfo.website) updateData.website = basicInfo.website;
            if (basicInfo.student_faculty_ratio) {
                updateData.student_faculty_ratio = parseFloat(basicInfo.student_faculty_ratio);
            }
            if (basicInfo.size_category) updateData.size_category = basicInfo.size_category;

            await institutionDataApi.updateBasicInfo(institutionId, updateData);

            setSuccessMessage('Basic information updated successfully!');
            await refetch();

            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (error: any) {
            console.error('Error updating basic info:', error);
            setErrorMessage(error.response?.data?.detail || 'Failed to update basic information');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveCostData = async () => {
        if (!institutionId) return;

        setSaving(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        try {
            const updateData: any = {};

            if (costData.tuition_in_state) {
                updateData.tuition_in_state = parseFloat(costData.tuition_in_state);
            }
            if (costData.tuition_out_of_state) {
                updateData.tuition_out_of_state = parseFloat(costData.tuition_out_of_state);
            }
            if (costData.room_cost) {
                updateData.room_cost = parseFloat(costData.room_cost);
            }
            if (costData.board_cost) {
                updateData.board_cost = parseFloat(costData.board_cost);
            }
            if (costData.application_fee_undergrad) {
                updateData.application_fee_undergrad = parseFloat(costData.application_fee_undergrad);
            }

            await institutionDataApi.updateCostData(institutionId, updateData);

            setSuccessMessage('Cost data updated successfully!');
            await refetch();

            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (error: any) {
            console.error('Error updating cost data:', error);
            setErrorMessage(error.response?.data?.detail || 'Failed to update cost data');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveAdmissionsData = async () => {
        if (!institutionId) return;

        setSaving(true);
        setSuccessMessage(null);
        setErrorMessage(null);

        try {
            const updateData: any = {};

            if (admissionsData.acceptance_rate) {
                updateData.acceptance_rate = parseFloat(admissionsData.acceptance_rate);
            }
            if (admissionsData.sat_reading_25th) {
                updateData.sat_reading_25th = parseInt(admissionsData.sat_reading_25th);
            }
            if (admissionsData.sat_reading_75th) {
                updateData.sat_reading_75th = parseInt(admissionsData.sat_reading_75th);
            }
            if (admissionsData.sat_math_25th) {
                updateData.sat_math_25th = parseInt(admissionsData.sat_math_25th);
            }
            if (admissionsData.sat_math_75th) {
                updateData.sat_math_75th = parseInt(admissionsData.sat_math_75th);
            }
            if (admissionsData.act_composite_25th) {
                updateData.act_composite_25th = parseInt(admissionsData.act_composite_25th);
            }
            if (admissionsData.act_composite_75th) {
                updateData.act_composite_75th = parseInt(admissionsData.act_composite_75th);
            }

            await institutionDataApi.updateAdmissionsData(institutionId, updateData);

            setSuccessMessage('Admissions data updated successfully!');
            await refetch();

            setTimeout(() => setSuccessMessage(null), 5000);
        } catch (error: any) {
            console.error('Error updating admissions data:', error);
            setErrorMessage(error.response?.data?.detail || 'Failed to update admissions data');
        } finally {
            setSaving(false);
        }
    };

    if (!isAuthenticated) {
        return null;
    }

    if (loadingQuality) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 rounded-full border-b-2 border-gray-700 animate-spin" />
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'basic' as TabType, label: 'Basic Info', icon: Building },
        { id: 'costs' as TabType, label: 'Cost Data', icon: DollarSign },
        { id: 'admissions' as TabType, label: 'Admissions', icon: GraduationCap },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="py-8">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Back to Dashboard Link */}
                    <Link
                        href="/admin/dashboard"
                        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Institution Data</h1>
                        <p className="text-gray-600">
                            Update your institution information to improve your data quality score
                        </p>
                    </div>

                    {/* Success/Error Messages */}
                    {successMessage && (
                        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-green-800">{successMessage}</p>
                            </div>
                            <button
                                onClick={() => setSuccessMessage(null)}
                                className="text-green-600 hover:text-green-800"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {errorMessage && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-3">
                            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-red-800">{errorMessage}</p>
                            </div>
                            <button
                                onClick={() => setErrorMessage(null)}
                                className="text-red-600 hover:text-red-800"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                      flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                      transition-colors
                      ${isActive
                                                ? 'border-gray-900 text-gray-900'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                            }
                    `}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'basic' && (
                        <BasicInfoTab
                            data={basicInfo}
                            onChange={setBasicInfo}
                            onSave={handleSaveBasicInfo}
                            saving={saving}
                        />
                    )}

                    {activeTab === 'costs' && (
                        <CostDataTab
                            data={costData}
                            onChange={setCostData}
                            onSave={handleSaveCostData}
                            saving={saving}
                        />
                    )}

                    {activeTab === 'admissions' && (
                        <AdmissionsDataTab
                            data={admissionsData}
                            onChange={setAdmissionsData}
                            onSave={handleSaveAdmissionsData}
                            saving={saving}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

// Basic Info Tab Component
function BasicInfoTab({
    data,
    onChange,
    onSave,
    saving,
}: {
    data: any;
    onChange: (data: any) => void;
    onSave: () => void;
    saving: boolean;
}) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                </div>
            </CardHeader>
            <CardBody>
                <div className="space-y-6">
                    {/* Info Banner */}
                    <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">
                            Update your basic institution information. Changes will be reflected on your public
                            profile.
                        </p>
                    </div>

                    {/* Website */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Website URL
                        </label>
                        <input
                            type="url"
                            value={data.website}
                            onChange={(e) => onChange({ ...data, website: e.target.value })}
                            placeholder="https://university.edu"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                        />
                        <p className="mt-1 text-xs text-gray-500">Enter your official institution website</p>
                    </div>

                    {/* Student Faculty Ratio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Student-Faculty Ratio
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={data.student_faculty_ratio}
                            onChange={(e) => onChange({ ...data, student_faculty_ratio: e.target.value })}
                            placeholder="15.5"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                        />
                        <p className="mt-1 text-xs text-gray-500">Average number of students per faculty member</p>
                    </div>

                    {/* Size Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Size Category
                        </label>
                        <select
                            value={data.size_category}
                            onChange={(e) => onChange({ ...data, size_category: e.target.value })}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                        >
                            <option value="">Select size</option>
                            <option value="Very Small">Very Small (under 1,000)</option>
                            <option value="Small">Small (1,000 - 5,000)</option>
                            <option value="Medium">Medium (5,000 - 15,000)</option>
                            <option value="Large">Large (15,000 - 30,000)</option>
                            <option value="Very Large">Very Large (over 30,000)</option>
                        </select>
                        <p className="mt-1 text-xs text-gray-500">Total undergraduate enrollment</p>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-6 border-t border-gray-200">
                        <button
                            onClick={onSave}
                            disabled={saving}
                            className="inline-flex items-center justify-center px-6 py-2.5 min-w-[140px] bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}

// Cost Data Tab Component
function CostDataTab({
    data,
    onChange,
    onSave,
    saving,
}: {
    data: any;
    onChange: (data: any) => void;
    onSave: () => void;
    saving: boolean;
}) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Cost & Tuition Data</h3>
                </div>
            </CardHeader>
            <CardBody>
                <div className="space-y-6">
                    {/* Info Banner */}
                    <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">
                            Enter costs for the current academic year. All amounts should be annual costs in USD.
                        </p>
                    </div>

                    {/* Tuition Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                In-State Tuition
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    value={data.tuition_in_state}
                                    onChange={(e) => onChange({ ...data, tuition_in_state: e.target.value })}
                                    placeholder="12000"
                                    className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Annual tuition for in-state students</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Out-of-State Tuition
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    value={data.tuition_out_of_state}
                                    onChange={(e) => onChange({ ...data, tuition_out_of_state: e.target.value })}
                                    placeholder="35000"
                                    className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Annual tuition for out-of-state students</p>
                        </div>
                    </div>

                    {/* Housing Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Room Cost
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    value={data.room_cost}
                                    onChange={(e) => onChange({ ...data, room_cost: e.target.value })}
                                    placeholder="8500"
                                    className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Annual on-campus housing cost</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Board Cost
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2 text-gray-500">$</span>
                                <input
                                    type="number"
                                    value={data.board_cost}
                                    onChange={(e) => onChange({ ...data, board_cost: e.target.value })}
                                    placeholder="5500"
                                    className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Annual meal plan cost</p>
                        </div>
                    </div>

                    {/* Application Fee */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Application Fee (Undergraduate)
                        </label>
                        <div className="relative max-w-xs">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input
                                type="number"
                                value={data.application_fee_undergrad}
                                onChange={(e) => onChange({ ...data, application_fee_undergrad: e.target.value })}
                                placeholder="75"
                                className="w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                            />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Fee to submit undergraduate application</p>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-200">
                        <Button
                            variant="primary"
                            onClick={onSave}
                            disabled={saving}
                            className="min-w-[120px]"
                        >
                            {saving ? (
                                <>
                                    <div className="inline-block h-4 w-4 rounded-full border-b-2 border-white animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}

// Admissions Data Tab Component
function AdmissionsDataTab({
    data,
    onChange,
    onSave,
    saving,
}: {
    data: any;
    onChange: (data: any) => void;
    onSave: () => void;
    saving: boolean;
}) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Admissions Data</h3>
                </div>
            </CardHeader>
            <CardBody>
                <div className="space-y-6">
                    {/* Info Banner */}
                    <div className="rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-blue-800">
                            Enter admissions statistics for the most recent entering class. Use percentile ranges (25th-75th) for test scores.
                        </p>
                    </div>

                    {/* Acceptance Rate */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Acceptance Rate
                        </label>
                        <div className="relative max-w-xs">
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="100"
                                value={data.acceptance_rate}
                                onChange={(e) => onChange({ ...data, acceptance_rate: e.target.value })}
                                placeholder="65.5"
                                className="w-full rounded-lg border border-gray-300 pr-8 pl-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                            />
                            <span className="absolute right-3 top-2 text-gray-500">%</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Percentage of applicants admitted (0-100)</p>
                    </div>

                    {/* SAT Scores */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">SAT Score Ranges</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    SAT Reading 25th Percentile
                                </label>
                                <input
                                    type="number"
                                    min="200"
                                    max="800"
                                    value={data.sat_reading_25th}
                                    onChange={(e) => onChange({ ...data, sat_reading_25th: e.target.value })}
                                    placeholder="580"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    SAT Reading 75th Percentile
                                </label>
                                <input
                                    type="number"
                                    min="200"
                                    max="800"
                                    value={data.sat_reading_75th}
                                    onChange={(e) => onChange({ ...data, sat_reading_75th: e.target.value })}
                                    placeholder="680"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    SAT Math 25th Percentile
                                </label>
                                <input
                                    type="number"
                                    min="200"
                                    max="800"
                                    value={data.sat_math_25th}
                                    onChange={(e) => onChange({ ...data, sat_math_25th: e.target.value })}
                                    placeholder="590"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    SAT Math 75th Percentile
                                </label>
                                <input
                                    type="number"
                                    min="200"
                                    max="800"
                                    value={data.sat_math_75th}
                                    onChange={(e) => onChange({ ...data, sat_math_75th: e.target.value })}
                                    placeholder="690"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                                />
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">SAT scores range from 200 to 800 per section</p>
                    </div>

                    {/* ACT Scores */}
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3">ACT Score Ranges</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ACT Composite 25th Percentile
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="36"
                                    value={data.act_composite_25th}
                                    onChange={(e) => onChange({ ...data, act_composite_25th: e.target.value })}
                                    placeholder="24"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    ACT Composite 75th Percentile
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="36"
                                    value={data.act_composite_75th}
                                    onChange={(e) => onChange({ ...data, act_composite_75th: e.target.value })}
                                    placeholder="29"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                                />
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">ACT composite scores range from 1 to 36</p>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-4 border-t border-gray-200">
                        <button
                            onClick={onSave}
                            disabled={saving}
                            className="inline-flex items-center justify-center px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {saving ? (
                                <>
                                    <div className="inline-block h-4 w-4 rounded-full border-b-2 border-white animate-spin mr-2" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </button>

                    </div>
                </div>
            </CardBody>
        </Card>
    );
}