'use client';

/**
 * Scholarship Eligibility Page
 * 
 * Allows scholarship admins to edit:
 * - GPA requirement
 * - Additional eligibility criteria
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import type { Scholarship } from '@/types/api';
import { DataSection } from '@/components/admin/forms/DataSection';
import { GpaInput } from '@/components/admin/forms/GpaInput';

export default function ScholarshipEligibilityPage() {
  const router = useRouter();
  const { isAuthenticated, adminUser } = useAuthStore();
  
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
        setGpaRequirement(scholarshipData.gpa_requirement);
      } catch (error) {
        console.error('Error loading scholarship data:', error);
        setErrorMessage('Failed to load scholarship data');
      } finally {
        setLoading(false);
      }
    };

    loadScholarshipData();
  }, [isAuthenticated, router]);

  const handleSave = async () => {
    if (!scholarship) return;

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
          gpa_requirement: gpaRequirement,
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

      setSuccessMessage('Eligibility requirements updated successfully!');
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
          <h1 className="text-3xl font-bold text-gray-900">Eligibility Requirements</h1>
          <p className="text-gray-600 mt-2">
            Set academic requirements for scholarship eligibility
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
          {/* GPA Requirement Section */}
          <DataSection title="Academic Requirements">
            <div className="space-y-4">
              <GpaInput
                label="Minimum GPA Requirement"
                value={gpaRequirement}
                onChange={setGpaRequirement}
                helpText="Set minimum GPA required (0.0 - 4.0 scale). Leave empty for no requirement."
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
