//src/app/admin/scholarship-dates/page.tsx
'use client';

/**
 * Scholarship Dates Page - FIXED VERSION
 * 
 * Allows scholarship admins to edit:
 * - Application deadline (maps to database 'deadline')
 * - Application opens date (application_opens)
 * - Academic year (for_academic_year)
 * 
 * KEY FIXES:
 * 1. Uses /api/v1/scholarships/{id} endpoint instead of /api/v1/admin/profile/entity
 * 2. Maps database fields correctly (deadline, not application_deadline)
 * 3. Gets scholarship ID from user.entity_id
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import type { Scholarship } from '@/types';
import { DataSection } from '@/components/admin/forms/DataSection';
import { DateInput } from '@/components/admin/forms/DateInput';
import { TextInput } from '@/components/admin/forms/TextInput';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export default function ScholarshipDatesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [applicationDeadline, setApplicationDeadline] = useState<string | null>(null);
  const [applicationOpens, setApplicationOpens] = useState<string | null>(null);
  const [academicYear, setAcademicYear] = useState('');

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
        // Database uses 'deadline' not 'application_deadline'
        setScholarship(scholarshipData);
        setApplicationDeadline(scholarshipData.deadline || null);
        setApplicationOpens(scholarshipData.application_opens || null);
        setAcademicYear(scholarshipData.for_academic_year || '');

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

      // Validate dates
      if (applicationOpens && applicationDeadline) {
        const opensDate = new Date(applicationOpens);
        const deadlineDate = new Date(applicationDeadline);
        if (opensDate > deadlineDate) {
          throw new Error('Application opening date cannot be after the deadline');
        }
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
            deadline: applicationDeadline,  // Database uses 'deadline'
            application_opens: applicationOpens,
            for_academic_year: academicYear || null,
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

      setSuccessMessage('Scholarship dates updated successfully!');

      const updatedData = await response.json();
      setScholarship(updatedData);
      setApplicationDeadline(updatedData.deadline || null);
      setApplicationOpens(updatedData.application_opens || null);
      setAcademicYear(updatedData.for_academic_year || '');

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Important Dates</h1>
          <p className="text-gray-600">
            Manage application timeline and deadlines
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
          {/* Application Timeline */}
          <DataSection title="Application Timeline">
            <div className="space-y-4">
              <DateInput
                label="Application Opens"
                value={applicationOpens}
                onChange={(date) => setApplicationOpens(date)}
                helpText="When does the application period begin?"
              />

              <DateInput
                label="Application Deadline"
                value={applicationDeadline}
                onChange={(date) => setApplicationDeadline(date)}
                required
                helpText="Final date for students to submit applications"
              />

              <TextInput
                label="Academic Year"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                helpText="Which academic year is this scholarship for? (e.g., 2025-2026)"
                placeholder="2025-2026"
              />

              {applicationOpens && applicationDeadline && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Timeline Preview:</h4>
                  <p className="text-sm text-blue-800">
                    Application window: {new Date(applicationOpens).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })} to {new Date(applicationDeadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </DataSection>

          {/* Deadline Warning */}
          {applicationDeadline && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="text-sm font-medium text-yellow-900 mb-2">⚠️ Important:</h4>
              <p className="text-sm text-yellow-800">
                Make sure your deadline is accurate. Students rely on this date to plan their applications.
                Consider setting the deadline at least a few days before you actually need to review applications
                to allow processing time.
              </p>
            </div>
          )}

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