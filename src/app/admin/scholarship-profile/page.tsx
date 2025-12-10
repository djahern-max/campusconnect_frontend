//src/app/admin/scholarship-profile/page.tsx
'use client';

/**
 * Enhanced Scholarship Profile Page
 * Adds more editable fields while keeping the simpler UI structure
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import type { Scholarship } from '@/types';
import { DataSection } from '@/components/admin/forms/DataSection';
import { TextInput } from '@/components/admin/forms/TextInput';
import { TextAreaInput } from '@/components/admin/forms/TextArea';
import { NumberInput } from '@/components/admin/forms/NumberInput';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export default function ScholarshipProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state - expanded fields
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [description, setDescription] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [scholarshipType, setScholarshipType] = useState('');
  const [amountMin, setAmountMin] = useState<number | null>(null);
  const [amountMax, setAmountMax] = useState<number | null>(null);
  const [deadline, setDeadline] = useState('');
  const [applicationOpens, setApplicationOpens] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [minGpa, setMinGpa] = useState<number | null>(null);
  const [numberOfAwards, setNumberOfAwards] = useState<number | null>(null);
  const [isRenewable, setIsRenewable] = useState(false);

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
            Authorization: `Bearer ${token}`,
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

        setScholarship(data);
        setTitle(data.title || '');
        setOrganization(data.organization || '');
        setDescription(data.description || '');
        setWebsiteUrl(data.website_url || '');
        setScholarshipType(data.scholarship_type || '');
        setAmountMin(data.amount_min ?? null);
        setAmountMax(data.amount_max ?? null);
        setDeadline(data.deadline || '');
        setApplicationOpens(data.application_opens || '');
        setAcademicYear(data.for_academic_year || '');
        setMinGpa(data.min_gpa ?? null);
        setNumberOfAwards(data.number_of_awards ?? null);
        setIsRenewable(data.is_renewable || false);
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

      // Prepare update payload
      const updateData: any = {
        title,
        organization,
        description,
        website_url: websiteUrl,
        scholarship_type: scholarshipType,
      };

      // Add numeric fields if provided
      if (amountMin !== null) updateData.amount_min = amountMin;
      if (amountMax !== null) updateData.amount_max = amountMax;
      if (numberOfAwards !== null) updateData.number_of_awards = numberOfAwards;
      if (minGpa !== null) updateData.min_gpa = minGpa;

      // Add date fields
      if (deadline) updateData.deadline = deadline;
      if (applicationOpens) updateData.application_opens = applicationOpens;
      if (academicYear) updateData.for_academic_year = academicYear;

      // Add boolean
      updateData.is_renewable = isRenewable;

      const response = await fetch(`${API_BASE_URL}/api/v1/admin/scholarships/${scholarship.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.status === 401) {
        localStorage.removeItem('access_token');
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update scholarship');
      }

      setSuccessMessage('Scholarship profile updated successfully!');

      // Reload data
      const updatedData = await response.json();
      setScholarship(updatedData);
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scholarship Profile</h1>
          <p className="text-gray-600">Update your scholarship information</p>
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
          {/* Basic Information */}
          <DataSection title="Basic Information">
            <div className="space-y-4">
              <TextInput
                label="Scholarship Name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                helpText="The official name of your scholarship"
                placeholder="e.g., STEM Excellence Scholarship"
              />

              <TextInput
                label="Organization Name"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                required
                helpText="The name of your organization"
                placeholder="e.g., Tech Foundation"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Scholarship Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={scholarshipType}
                  onChange={(e) => setScholarshipType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select type</option>
                  <option value="ACADEMIC">Academic</option>
                  <option value="STEM">STEM</option>
                  <option value="ARTS">Arts</option>
                  <option value="ATHLETICS">Athletics</option>
                  <option value="COMMUNITY_SERVICE">Community Service</option>
                  <option value="NEED_BASED">Need-Based</option>
                  <option value="MERIT_BASED">Merit-Based</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <TextAreaInput
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                helpText="Provide a detailed description of the scholarship"
                placeholder="Tell students about this scholarship opportunity..."
              />

              <TextInput
                label="Website URL"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                type="url"
                helpText="Link to more information about the scholarship"
                placeholder="https://example.com/scholarship"
              />
            </div>
          </DataSection>

          {/* Award Details */}
          <DataSection title="Award Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberInput
                label="Minimum Amount"
                value={amountMin}
                onChange={setAmountMin}
                min={0}
                placeholder="5000"
                helpText="Minimum scholarship award in dollars"
              />

              <NumberInput
                label="Maximum Amount"
                value={amountMax}
                onChange={setAmountMax}
                min={0}
                placeholder="10000"
                helpText="Maximum scholarship award in dollars"
              />

              <NumberInput
                label="Number of Awards"
                value={numberOfAwards}
                onChange={setNumberOfAwards}
                min={1}
                placeholder="10"
                helpText="How many scholarships are available"
              />

              <div>
                <label className="flex items-center space-x-2 mt-6">
                  <input
                    type="checkbox"
                    checked={isRenewable}
                    onChange={(e) => setIsRenewable(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">Renewable Scholarship</span>
                </label>
              </div>
            </div>
          </DataSection>

          {/* Dates & Deadlines */}
          <DataSection title="Dates & Deadlines">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Application Opens
                </label>
                <input
                  type="date"
                  value={applicationOpens}
                  onChange={(e) => setApplicationOpens(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">When applications become available</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Application deadline</p>
              </div>

              <TextInput
                label="Academic Year"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="2025-2026"
                helpText="Which academic year this applies to"
              />
            </div>
          </DataSection>

          {/* Requirements */}
          <DataSection title="Requirements">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <NumberInput
                label="Minimum GPA"
                value={minGpa}
                onChange={setMinGpa}
                min={0}
                max={4}
                step={0.01}
                placeholder="3.5"
                helpText="Minimum GPA requirement (optional)"
              />
            </div>
          </DataSection>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>


          {/* 🔥 ADD THIS NEW SECTION */}
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Manage Content</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/admin/gallery')}
                className="flex items-center justify-center px-6 py-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Upload & Manage Images</span>
              </button>

              {websiteUrl && (
                <a
                  href={websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center px-6 py-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  <span className="font-medium">View Website</span>
                </a>
              )}

            </div>
          </div>



        </div>
      </div>
    </div>
  );
}