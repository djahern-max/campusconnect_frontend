//src/app/admin/dashboard/page.tsx
'use client';

/**
 * COMPLETE Admin Dashboard - ALL 42 Institution Fields
 * Organized sections: Read-Only Info, Basic, Academic, Costs, Admissions, Data Quality
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useInstitutionData } from '@/hooks/useInstitutionData';
import {
  ChevronDown,
  ChevronRight,
  Image,
  Video,
  BarChart3,
  Settings,
  CreditCard,
  Check,
  Loader2,
  GraduationCap,
  AlertCircle,
} from 'lucide-react';

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: 'primary' | 'success' | 'accent' | 'warning';
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon, href, color }) => {
  const router = useRouter();

  const colorClasses = {
    primary: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
    success: 'bg-green-50 text-green-600 hover:bg-green-100',
    accent: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    warning: 'bg-amber-50 text-amber-600 hover:bg-amber-100',
  };






  return (
    <button
      onClick={() => router.push(href)}
      className="w-full text-left bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </button>
  );
};

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
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
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

      {isOpen && (
        <div className="px-6 py-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const institutionId = user?.entity_type === 'institution' ? user.entity_id : null;
  const { data, loading: dataLoading, error: dataError, updateField, saving } = useInstitutionData(institutionId);

  // Local state for formatted values
  const [formattedValues, setFormattedValues] = useState<Record<string, string>>({});
  const [fieldTimeouts, setFieldTimeouts] = useState<Record<string, NodeJS.Timeout>>({});
  const [studentFacultyRatio, setStudentFacultyRatio] = useState<string>('');

  // Update formatted values when data loads
  useEffect(() => {
    if (data) {
      const formatted: Record<string, string> = {};
      // Format all numeric cost fields
      const costFields = [
        'tuition_in_state', 'tuition_out_of_state', 'tuition_private', 'tuition_in_district',
        'room_cost', 'board_cost', 'room_and_board',
        'application_fee_undergrad', 'application_fee_grad'
      ];

      costFields.forEach(field => {
        const value = (data as any)[field];
        if (value) {
          formatted[field] = Number(value).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          });
        }
      });

      setFormattedValues(formatted);

      // ✅ ADD THIS: Initialize student-faculty ratio
      if (data.student_faculty_ratio) {
        setStudentFacultyRatio(data.student_faculty_ratio.toString());
      }
    }
  }, [data]);



  const handleFieldChange = (field: string, value: any) => {
    // Clear existing timeout for this field
    if (fieldTimeouts[field]) {
      clearTimeout(fieldTimeouts[field]);
    }

    // Set new timeout
    const timeoutId = setTimeout(() => {
      updateField(field as any, value);
    }, 500);

    // Store timeout ID
    setFieldTimeouts(prev => ({ ...prev, [field]: timeoutId }));
  };

  // Handle number input with formatting
  const handleNumberInput = (field: string, displayValue: string) => {
    // Store the formatted display value
    setFormattedValues(prev => ({ ...prev, [field]: displayValue }));

    // Parse and save the actual number
    const cleanValue = displayValue.replace(/,/g, '');
    const numValue = parseFloat(cleanValue);

    if (!isNaN(numValue)) {
      handleFieldChange(field, numValue);
    } else if (displayValue === '') {
      handleFieldChange(field, null);
    }
  };

  // Format on blur
  const handleNumberBlur = (field: string, value: string) => {
    const cleanValue = value.replace(/,/g, '');
    const numValue = parseFloat(cleanValue);

    if (!isNaN(numValue)) {
      const formatted = numValue.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      setFormattedValues(prev => ({ ...prev, [field]: formatted }));
    } else {
      setFormattedValues(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Remove formatting on focus
  const handleNumberFocus = (field: string, e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '');
    setFormattedValues(prev => ({ ...prev, [field]: value }));
    // Select all text for easy editing
    e.target.select();
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const isInstitutionAdmin = user?.entity_type === 'institution';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Manage your institution profile and content.</p>
        </div>

        {dataError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle size={20} className="text-red-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800">Error loading data</p>
              <p className="text-sm text-red-600">{dataError}</p>
            </div>
          </div>
        )}

        {dataLoading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Loader2 size={16} className="animate-spin text-blue-600" />
              <span className="text-sm text-blue-600">Loading your data...</span>
            </div>
          </div>
        )}

        {isInstitutionAdmin && data && (
          <div className="space-y-4 mb-8">
            <CollapsibleSection
              title="Institution Data"
              icon={<GraduationCap size={18} />}
              isOpen={isOpen}
              onToggle={() => setIsOpen(!isOpen)}
              saving={saving}
            >
              <div className="space-y-8">

                {/* READ-ONLY INSTITUTION INFO */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Institution Information (Read-Only)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Database ID:</span>
                      <span className="ml-2 text-gray-600">{data.id}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">IPEDS ID:</span>
                      <span className="ml-2 text-gray-600">{data.ipeds_id}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Institution Name:</span>
                      <span className="ml-2 text-gray-600">{data.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">City:</span>
                      <span className="ml-2 text-gray-600">{data.city}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">State:</span>
                      <span className="ml-2 text-gray-600">{data.state}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Control Type:</span>
                      <span className="ml-2 text-gray-600">{data.control_type}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Data Completeness Score:</span>
                      <span className="ml-2 text-gray-600">{data.data_completeness_score}%</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Completeness Score:</span>
                      <span className="ml-2 text-gray-600">{data.data_completeness_score}%</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Data Source:</span>
                      <span className="ml-2 text-gray-600">{data.data_source}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">IPEDS Year:</span>
                      <span className="ml-2 text-gray-600">{data.ipeds_year}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Created:</span>
                      <span className="ml-2 text-gray-600">{new Date(data.created_at).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Last Updated:</span>
                      <span className="ml-2 text-gray-600">{new Date(data.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* BASIC INFORMATION - EDITABLE */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
                      <input
                        type="url"
                        defaultValue={data.website || ''}
                        onChange={(e) => handleFieldChange('website', e.target.value || null)}
                        placeholder="https://www.example.edu"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* ACADEMIC INFO - EDITABLE */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                      <select
                        defaultValue={data.level?.toString() || ''}
                        onChange={(e) => handleFieldChange('level', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select level</option>
                        <option value="1">4-year</option>
                        <option value="2">2-year</option>
                        <option value="3">Less than 2-year</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Control</label>
                      <select
                        defaultValue={data.control?.toString() || ''}
                        onChange={(e) => handleFieldChange('control', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select control</option>
                        <option value="1">Public</option>
                        <option value="2">Private nonprofit</option>
                        <option value="3">Private for-profit</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Size Category</label>
                      <select
                        defaultValue={data.size_category || ''}
                        onChange={(e) => handleFieldChange('size_category', e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select size</option>
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                        <option value="very_large">Very Large</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Locale</label>
                      <select
                        defaultValue={data.locale || ''}
                        onChange={(e) => handleFieldChange('locale', e.target.value || null)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Select locale</option>
                        <option value="city">City</option>
                        <option value="suburb">Suburb</option>
                        <option value="town">Town</option>
                        <option value="rural">Rural</option>
                      </select>
                    </div>


                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student-Faculty Ratio</label>
                      <input
                        type="number"
                        step="0.01"
                        defaultValue={data.student_faculty_ratio || ''}
                        onChange={(e) => handleFieldChange('student_faculty_ratio', e.target.value ? parseFloat(e.target.value) : null)}
                        placeholder="15.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>


                  </div>
                </div>

                {/* COSTS & TUITION - ALL 9 FIELDS */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Costs & Tuition</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tuition (In-State)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="text"
                          value={formattedValues.tuition_in_state || ''}
                          onChange={(e) => handleNumberInput('tuition_in_state', e.target.value)}
                          onFocus={(e) => handleNumberFocus('tuition_in_state', e)}
                          onBlur={(e) => handleNumberBlur('tuition_in_state', e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tuition (Out-of-State)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="text"
                          value={formattedValues.tuition_out_of_state || ''}
                          onChange={(e) => handleNumberInput('tuition_out_of_state', e.target.value)}
                          onFocus={(e) => handleNumberFocus('tuition_out_of_state', e)}
                          onBlur={(e) => handleNumberBlur('tuition_out_of_state', e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tuition (Private)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="text"
                          value={formattedValues.tuition_private || ''}
                          onChange={(e) => handleNumberInput('tuition_private', e.target.value)}
                          onFocus={(e) => handleNumberFocus('tuition_private', e)}
                          onBlur={(e) => handleNumberBlur('tuition_private', e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tuition (In-District)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="text"
                          value={formattedValues.tuition_in_district || ''}
                          onChange={(e) => handleNumberInput('tuition_in_district', e.target.value)}
                          onFocus={(e) => handleNumberFocus('tuition_in_district', e)}
                          onBlur={(e) => handleNumberBlur('tuition_in_district', e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Room Cost</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="text"
                          value={formattedValues.room_cost || ''}
                          onChange={(e) => handleNumberInput('room_cost', e.target.value)}
                          onFocus={(e) => handleNumberFocus('room_cost', e)}
                          onBlur={(e) => handleNumberBlur('room_cost', e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Board Cost</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="text"
                          value={formattedValues.board_cost || ''}
                          onChange={(e) => handleNumberInput('board_cost', e.target.value)}
                          onFocus={(e) => handleNumberFocus('board_cost', e)}
                          onBlur={(e) => handleNumberBlur('board_cost', e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Room & Board (Combined)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="text"
                          value={formattedValues.room_and_board || ''}
                          onChange={(e) => handleNumberInput('room_and_board', e.target.value)}
                          onFocus={(e) => handleNumberFocus('room_and_board', e)}
                          onBlur={(e) => handleNumberBlur('room_and_board', e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Application Fee (Undergrad)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="text"
                          value={formattedValues.application_fee_undergrad || ''}
                          onChange={(e) => handleNumberInput('application_fee_undergrad', e.target.value)}
                          onFocus={(e) => handleNumberFocus('application_fee_undergrad', e)}
                          onBlur={(e) => handleNumberBlur('application_fee_undergrad', e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Application Fee (Graduate)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500">$</span>
                        <input
                          type="text"
                          value={formattedValues.application_fee_grad || ''}
                          onChange={(e) => handleNumberInput('application_fee_grad', e.target.value)}
                          onFocus={(e) => handleNumberFocus('application_fee_grad', e)}
                          onBlur={(e) => handleNumberBlur('application_fee_grad', e.target.value)}
                          placeholder="0.00"
                          className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ADMISSIONS - ALL 7 FIELDS */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Admissions Statistics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Acceptance Rate (%)</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          defaultValue={data.acceptance_rate || ''}
                          onChange={(e) => handleFieldChange('acceptance_rate', e.target.value ? parseFloat(e.target.value) : null)}
                          placeholder="0.00"
                          className="w-full pr-7 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <span className="absolute right-3 top-2 text-gray-500">%</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SAT Reading (25th Percentile)</label>
                      <input
                        type="number"
                        defaultValue={data.sat_reading_25th || ''}
                        onChange={(e) => handleFieldChange('sat_reading_25th', e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="200-800"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SAT Reading (75th Percentile)</label>
                      <input
                        type="number"
                        defaultValue={data.sat_reading_75th || ''}
                        onChange={(e) => handleFieldChange('sat_reading_75th', e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="200-800"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SAT Math (25th Percentile)</label>
                      <input
                        type="number"
                        defaultValue={data.sat_math_25th || ''}
                        onChange={(e) => handleFieldChange('sat_math_25th', e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="200-800"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">SAT Math (75th Percentile)</label>
                      <input
                        type="number"
                        defaultValue={data.sat_math_75th || ''}
                        onChange={(e) => handleFieldChange('sat_math_75th', e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="200-800"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ACT Composite (25th Percentile)</label>
                      <input
                        type="number"
                        defaultValue={data.act_composite_25th || ''}
                        onChange={(e) => handleFieldChange('act_composite_25th', e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="1-36"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ACT Composite (75th Percentile)</label>
                      <input
                        type="number"
                        defaultValue={data.act_composite_75th || ''}
                        onChange={(e) => handleFieldChange('act_composite_75th', e.target.value ? parseInt(e.target.value) : null)}
                        placeholder="1-36"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>


              </div>
            </CollapsibleSection>
          </div>
        )}

        {/* Content Management */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Content Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ActionCard
              title="Gallery"
              description="Upload and manage campus images"
              icon={<Image size={24} />}
              href="/admin/gallery"
              color="accent"
            />
            <ActionCard
              title="Videos"
              description="Add campus tour videos"
              icon={<Video size={24} />}
              href="/admin/videos"
              color="success"
            />
            {isInstitutionAdmin && (
              <ActionCard
                title="Data Quality"
                description="Track your profile completeness"
                icon={<BarChart3 size={24} />}
                href="/admin/data-quality"
                color="warning"
              />
            )}
          </div>
        </div>

        {/* Settings & Billing */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Settings & Billing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionCard
              title="Display Settings"
              description="Show/hide sections and customize your profile"
              icon={<Settings size={24} />}
              href="/admin/settings"
              color="primary"
            />
            <ActionCard
              title="Billing & Subscription"
              description="View billing and manage subscription"
              icon={<CreditCard size={24} />}
              href="/admin/subscription"
              color="accent"
            />
          </div>
        </div>

        {/* Quick Info */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Account Type:</strong> Institution Admin</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Status:</strong> <span className="text-green-600">Active</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}