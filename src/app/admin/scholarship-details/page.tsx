//src/app/admin/scholarship-details/page.tsx
'use client';

/**
 * Scholarship Details Page - FIXED VERSION
 * 
 * Allows scholarship admins to edit:
 * - Award amounts (min/max - maps to amount_min/amount_max)
 * - Renewable status (is_renewable)
 * - Number of awards
 * - Scholarship type
 * 
 * KEY FIXES:
 * 1. Uses /api/v1/scholarships/{id} endpoint instead of /api/v1/admin/profile/entity
 * 2. Maps database fields correctly
 * 3. Gets scholarship ID from user.entity_id
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import type { Scholarship } from '@/types';
import { DataSection } from '@/components/admin/forms/DataSection';
import { NumberInput } from '@/components/admin/forms/NumberInput';
import { SelectInput } from '@/components/admin/forms/SelectInput';
import { CheckboxInput } from '@/components/admin/forms/CheckboxInput';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export default function ScholarshipDetailsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [amountMin, setAmountMin] = useState<number | null>(null);
  const [amountMax, setAmountMax] = useState<number | null>(null);
  const [isRenewable, setIsRenewable] = useState(false);
  const [numberOfAwards, setNumberOfAwards] = useState<number | null>(null);
  const [scholarshipType, setScholarshipType] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);

  // Redirect if not a scholarship admin
  useEffect(() => {
    if (user && user.entity_type !== 'scholarship') {
      router.push('/admin/dashboard');
    }
  }, [user, router]);

  // Load scholarship data
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const loadScholarshipData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/admin/login');
          return;
        }

        const scholarshipId = user.entity_id;
        if (!scholarshipId) {
          setErrorMessage('No scholarship associated with this account');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/scholarships/${scholarshipId}`, {
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

        const scholarshipData = await response.json();

        // Map database fields to component state
        setScholarship(scholarshipData);
        setAmountMin(scholarshipData.amount_min || null);
        setAmountMax(scholarshipData.amount_max || null);
        setIsRenewable(scholarshipData.is_renewable || false);
        setNumberOfAwards(scholarshipData.number_of_awards || null);
        setScholarshipType(scholarshipData.scholarship_type || '');

      } catch (error) {
        console.error('Error loading scholarship data:', error);
        setErrorMessage('Failed to load scholarship data');
      } finally {
        setLoading(false);
      }
    };

    loadScholarshipData();
  }, [isAuthenticated, user, router]);

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const token = localStorage.getItem('access_token');
      if (!token || !scholarship) {
        throw new Error('Not authenticated or no scholarship data');
      }

      // Validate amounts
      if (amountMin && amountMax && amountMin > amountMax) {
        throw new Error('Minimum amount cannot be greater than maximum amount');
      }

      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/scholarships/${scholarship.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount_min: amountMin,
            amount_max: amountMax,
            is_renewable: isRenewable,
            number_of_awards: numberOfAwards,
            scholarship_type: scholarshipType,
          }),
        }
      );

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update scholarship');
      }

      setSuccessMessage('Scholarship details updated successfully!');

      const updatedData = await response.json();
      setScholarship(updatedData);
      setAmountMin(updatedData.amount_min || null);
      setAmountMax(updatedData.amount_max || null);
      setIsRenewable(updatedData.is_renewable || false);
      setNumberOfAwards(updatedData.number_of_awards || null);
      setScholarshipType(updatedData.scholarship_type || '');

    } catch (error) {
      console.error('Error saving scholarship:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save changes');
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

  if (errorMessage && !scholarship) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{errorMessage}</p>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="text-purple-600 hover:text-purple-700 mb-4 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scholarship Details</h1>
          <p className="text-gray-600">
            Manage financial information and award details
          </p>
        </div>

        {/* Success/Error Messages */}
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
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* Financial Information */}
          <DataSection title="Financial Information">
            <div className="space-y-4">
              <NumberInput
                label="Minimum Award Amount"
                value={amountMin}
                onChange={(value) => setAmountMin(value)}
                min={0}
                step={100}
                required
                helpText="The minimum scholarship award amount in dollars"
                placeholder="500"
              />

              <NumberInput
                label="Maximum Award Amount"
                value={amountMax}
                onChange={(value) => setAmountMax(value)}
                min={0}
                step={100}
                required
                helpText="The maximum scholarship award amount in dollars (can be same as minimum for fixed amount)"
                placeholder="2500"
              />

              <CheckboxInput
                label="Renewable Scholarship"
                checked={isRenewable}
                onChange={(checked) => setIsRenewable(checked)}
                helpText="Can students reapply for this scholarship in subsequent years?"
              />

              <NumberInput
                label="Number of Awards"
                value={numberOfAwards}
                onChange={(value) => setNumberOfAwards(value)}
                min={1}
                step={1}
                helpText="How many scholarships are available? Leave empty if not specified"
                placeholder="10"
              />

              {amountMin !== null && amountMax !== null && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Award Display:</strong>{' '}
                    {amountMin === amountMax
                      ? `$${amountMin.toLocaleString()}`
                      : `$${amountMin.toLocaleString()} - $${amountMax.toLocaleString()}`}
                  </p>
                </div>
              )}
            </div>
          </DataSection>

          {/* Scholarship Type */}
          <DataSection title="Scholarship Classification">
            <SelectInput
              label="Scholarship Type"
              value={scholarshipType}
              onChange={(e) => setScholarshipType(e.target.value)}
              options={[
                { value: 'MERIT', label: 'Merit-Based' },
                { value: 'NEED', label: 'Need-Based' },
                { value: 'ATHLETIC', label: 'Athletic' },
                { value: 'STEM', label: 'STEM' },
                { value: 'ARTS', label: 'Arts & Humanities' },
                { value: 'COMMUNITY', label: 'Community Service' },
                { value: 'MINORITY', label: 'Minority/Diversity' },
                { value: 'FIRST_GEN', label: 'First Generation' },
                { value: 'MILITARY', label: 'Military/Veterans' },
                { value: 'CAREER', label: 'Career-Specific' },
                { value: 'OTHER', label: 'Other' },
              ]}
              required
              helpText="Select the primary category for this scholarship"
            />
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