//src/app/admin/scholarship-eligibility/page.tsx
'use client';

/**
 * Scholarship Eligibility Page - FIXED VERSION
 * 
 * Allows scholarship admins to edit:
 * - GPA requirement (maps to database 'min_gpa')
 * 
 * KEY FIXES:
 * 1. Uses /api/v1/scholarships/{id} endpoint instead of /api/v1/admin/profile/entity
 * 2. Maps database field correctly (min_gpa instead of gpa_requirement)
 * 3. Gets scholarship ID from user.entity_id
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import type { Scholarship } from '@/types';
import { DataSection } from '@/components/admin/forms/DataSection';
import { GpaInput } from '@/components/admin/forms/GpaInput';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export default function ScholarshipEligibilityPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [gpaRequirement, setGpaRequirement] = useState<number | null>(null);

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
        // Database uses 'min_gpa' not 'gpa_requirement'
        setScholarship(scholarshipData);
        setGpaRequirement(scholarshipData.min_gpa ? parseFloat(scholarshipData.min_gpa) : null);

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

      // Validate GPA
      if (gpaRequirement !== null && (gpaRequirement < 0 || gpaRequirement > 4.0)) {
        throw new Error('GPA must be between 0.0 and 4.0');
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
            min_gpa: gpaRequirement,  // Database uses 'min_gpa'
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

      setSuccessMessage('GPA requirement updated successfully!');

      const updatedData = await response.json();
      setScholarship(updatedData);
      setGpaRequirement(updatedData.min_gpa ? parseFloat(updatedData.min_gpa) : null);

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Eligibility Requirements</h1>
          <p className="text-gray-600">
            Set GPA and other eligibility criteria
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
          {/* GPA Requirement */}
          <DataSection title="GPA Requirement">
            <div className="space-y-4">
              <GpaInput
                label="Minimum GPA Required"
                value={gpaRequirement}
                onChange={(value) => setGpaRequirement(value)}
                helpText="Set the minimum GPA required to be eligible for this scholarship (0.0-4.0 scale). Leave empty for no requirement."
                placeholder="3.50"
              />

              {gpaRequirement !== null && (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Current Requirement:</strong> Students must have a minimum {gpaRequirement.toFixed(2)} GPA to be eligible
                  </p>
                </div>
              )}

              {gpaRequirement === null && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>No GPA requirement set</strong> - This scholarship is available to students of all academic levels
                  </p>
                </div>
              )}
            </div>
          </DataSection>

          {/* Additional Eligibility Info */}
          <DataSection title="Additional Eligibility Information">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Note:</h4>
              <p className="text-sm text-blue-800">
                Other eligibility criteria like field of study and citizenship requirements can be managed
                in the <button
                  onClick={() => router.push('/admin/scholarship-details')}
                  className="underline hover:text-blue-900"
                >
                  Scholarship Details
                </button> page.
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