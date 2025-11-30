'use client';

/**
 * Scholarship Details Page
 * 
 * Allows scholarship admins to edit:
 * - Award amount (min and max)
 * - Renewable status
 * - Field of study
 * - Citizenship requirements
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import type { Scholarship } from '@/types/api';
import { DataSection } from '@/components/admin/forms/DataSection';
import { CurrencyInput } from '@/components/admin/forms/CurrencyInput';
import { CheckboxInput } from '@/components/admin/forms/CheckboxInput';

export default function ScholarshipDetailsPage() {
  const router = useRouter();
  const { isAuthenticated, adminUser } = useAuthStore();
  
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [amountMin, setAmountMin] = useState<number | null>(null);
  const [amountMax, setAmountMax] = useState<number | null>(null);
  const [isRenewable, setIsRenewable] = useState(false);
  const [fieldOfStudy, setFieldOfStudy] = useState('');
  const [citizenshipRequirements, setCitizenshipRequirements] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);

  // Redirect if not a scholarship admin
  useEffect(() => {
    if (adminUser && adminUser.entity_type !== 'scholarship') {
      router.push('/admin/dashboard');
    }
  }, [adminUser, router]);

  // Load scholarship data
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadScholarshipData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        const response = await fetch('http://localhost:8001/api/v1/admin/profile/entity', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          localStorage.removeItem('access_token');
          router.push('/admin/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to load scholarship data');
        }

        const data = await response.json();
        const scholarshipData = data.scholarship;
        
        setScholarship(scholarshipData);
        setAmountMin(scholarshipData.amount_min);
        setAmountMax(scholarshipData.amount_max);
        setIsRenewable(scholarshipData.is_renewable || false);
        setFieldOfStudy(scholarshipData.field_of_study || '');
        setCitizenshipRequirements(scholarshipData.citizenship_requirements || '');
      } catch (error) {
        console.error('Error loading scholarship data:', error);
        setErrorMessage('Failed to load scholarship data');
      } finally {
        setLoading(false);
      }
    };

    loadScholarshipData();
  }, [isAuthenticated, router]);

  const validateAmounts = (): string | null => {
    if (amountMin !== null && amountMax !== null && amountMin > amountMax) {
      return 'Minimum amount cannot be greater than maximum amount';
    }
    return null;
  };

  const handleSave = async () => {
    if (!scholarship) return;

    const validationError = validateAmounts();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/admin/login');
        return;
      }

      const response = await fetch(`http://localhost:8001/api/v1/admin/scholarships/${scholarship.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount_min: amountMin,
          amount_max: amountMax,
          is_renewable: isRenewable,
          field_of_study: fieldOfStudy || null,
          citizenship_requirements: citizenshipRequirements || null,
        }),
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      setSuccessMessage('Details updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving changes:', error);
      setErrorMessage('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading scholarship data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Scholarship Details</h1>
          <p className="text-gray-600 mt-2">
            Manage award amounts, eligibility, and requirements
          </p>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Award Amount Section */}
          <DataSection title="Award Amount">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CurrencyInput
                label="Minimum Award Amount"
                value={amountMin}
                onChange={setAmountMin}
                helpText="Minimum scholarship award"
                placeholder="0"
              />
              <CurrencyInput
                label="Maximum Award Amount"
                value={amountMax}
                onChange={setAmountMax}
                helpText="Maximum scholarship award (if range)"
                placeholder="0"
              />
            </div>
            {amountMin !== null && amountMax !== null && (
              <p className="text-sm text-gray-600 mt-2">
                Award Range: ${amountMin.toLocaleString()} - ${amountMax.toLocaleString()}
              </p>
            )}
          </DataSection>

          {/* Renewable Status */}
          <DataSection title="Renewable Status">
            <CheckboxInput
              label="This scholarship is renewable"
              checked={isRenewable}
              onChange={setIsRenewable}
              helpText="Check if students can receive this award for multiple years"
            />
          </DataSection>

          {/* Field of Study */}
          <DataSection title="Field of Study">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Preferred Field of Study
              </label>
              <input
                type="text"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., Engineering, Computer Science, Business, or 'Any'"
              />
              <p className="text-xs text-gray-500 mt-1">
                Specify if scholarship is limited to certain majors or fields
              </p>
            </div>
          </DataSection>

          {/* Citizenship Requirements */}
          <DataSection title="Citizenship Requirements">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Citizenship/Residency Requirements
              </label>
              <textarea
                value={citizenshipRequirements}
                onChange={(e) => setCitizenshipRequirements(e.target.value)}
                rows={3}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="e.g., U.S. Citizen or Permanent Resident, Open to International Students, etc."
              />
              <p className="text-xs text-gray-500 mt-1">
                Describe any citizenship or residency requirements
              </p>
            </div>
          </DataSection>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
