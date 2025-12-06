//src/app/admin/scholarship-profile/page.tsx
'use client';

/**
 * Scholarship Profile Page - FIXED VERSION
 * 
 * Allows scholarship admins to edit:
 * - Scholarship name (maps to database 'title')
 * - Organization name
 * - Description
 * - Website URL (maps to database 'website_url')
 * 
 * KEY FIXES:
 * 1. Uses /api/v1/scholarships/{id} endpoint instead of /api/v1/admin/profile/entity
 * 2. Maps database fields correctly (title → name, website_url → more_info_url)
 * 3. Gets scholarship ID from user.entity_id
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import type { Scholarship } from '@/types';
import { DataSection } from '@/components/admin/forms/DataSection';
import { TextInput } from '@/components/admin/forms/TextInput';
import { TextAreaInput } from '@/components/admin/forms/TextArea';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export default function ScholarshipProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [organization, setOrganization] = useState('');
  const [description, setDescription] = useState('');
  const [moreInfoUrl, setMoreInfoUrl] = useState('');

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

        // Get scholarship ID from user entity_id
        const scholarshipId = user.entity_id;
        if (!scholarshipId) {
          setErrorMessage('No scholarship associated with this account');
          setLoading(false);
          return;
        }

        // Use the public scholarships endpoint - it returns the correct data
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
        // Database uses: title, organization, description, website_url
        // Component expects: name, organization, description, more_info_url
        setScholarship(scholarshipData);
        setName(scholarshipData.title || '');  // Database uses 'title'
        setOrganization(scholarshipData.organization || '');
        setDescription(scholarshipData.description || '');
        setMoreInfoUrl(scholarshipData.website_url || '');  // Database uses 'website_url'

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

      // Use the admin scholarships update endpoint
      const response = await fetch(
        `${API_BASE_URL}/api/v1/admin/scholarships/${scholarship.id}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: name,  // Map back to database 'title' field
            organization,
            description,
            website_url: moreInfoUrl,  // Map back to database 'website_url' field
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

      setSuccessMessage('Scholarship profile updated successfully!');

      // Reload scholarship data to confirm changes
      const updatedData = await response.json();
      setScholarship(updatedData);
      setName(updatedData.title || '');
      setOrganization(updatedData.organization || '');
      setDescription(updatedData.description || '');
      setMoreInfoUrl(updatedData.website_url || '');

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scholarship Profile</h1>
          <p className="text-gray-600">
            Manage your scholarship's basic information
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
          {/* Basic Information */}
          <DataSection title="Basic Information">
            <div className="space-y-4">
              <TextInput
                label="Scholarship Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                helpText="The official name of your scholarship"
                placeholder="e.g., AAU Scholarship"
              />

              <TextInput
                label="Organization Name"
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                required
                helpText="The name of your organization"
                placeholder="e.g., Amateur Athletic Union"
              />

              <TextAreaInput
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                helpText="Provide a detailed description of the scholarship, including its purpose and what makes it unique"
                placeholder="Tell students about this scholarship opportunity..."
              />

              <TextInput
                label="Website URL"
                value={moreInfoUrl}
                onChange={(e) => setMoreInfoUrl(e.target.value)}
                type="url"
                helpText="Link to your scholarship's website or application page"
                placeholder="https://example.org/scholarships"
              />
            </div>
          </DataSection>

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Need to edit other fields?</h4>
            <p className="text-sm text-blue-800">
              • Financial details (amounts, renewable status) can be edited in{' '}
              <button
                onClick={() => router.push('/admin/scholarship-details')}
                className="underline hover:text-blue-900"
              >
                Scholarship Details
              </button>
              <br />
              • GPA requirements can be edited in{' '}
              <button
                onClick={() => router.push('/admin/scholarship-eligibility')}
                className="underline hover:text-blue-900"
              >
                Eligibility
              </button>
              <br />
              • Deadlines can be edited in{' '}
              <button
                onClick={() => router.push('/admin/scholarship-dates')}
                className="underline hover:text-blue-900"
              >
                Dates
              </button>
            </p>
          </div>

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