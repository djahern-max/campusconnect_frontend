'use client';

/**
 * Scholarship Profile Page
 * 
 * Allows scholarship admins to edit:
 * - Scholarship name
 * - Organization name
 * - Description
 * - More info URL
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import type { Scholarship } from '@/types/api';
import { DataSection } from '@/components/admin/forms/DataSection';

export default function ScholarshipProfilePage() {
  const router = useRouter();
  const { isAuthenticated, adminUser } = useAuthStore();
  
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
        setName(scholarshipData.name || '');
        setOrganization(scholarshipData.organization || '');
        setDescription(scholarshipData.description || '');
        setMoreInfoUrl(scholarshipData.more_info_url || '');
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
          name,
          organization,
          description: description || null,
          more_info_url: moreInfoUrl || null,
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

      setSuccessMessage('Profile updated successfully!');
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
          <h1 className="text-3xl font-bold text-gray-900">Scholarship Profile</h1>
          <p className="text-gray-600 mt-2">
            Manage basic information about your scholarship
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
          <DataSection title="Basic Information">
            <div className="space-y-4">
              {/* Scholarship Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Scholarship Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter scholarship name"
                  required
                />
              </div>

              {/* Organization */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Organization
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Organization or sponsor name"
                />
                <p className="text-xs text-gray-500 mt-1">
                  The organization offering this scholarship
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Describe the scholarship, its purpose, and what makes it unique..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Provide a detailed description of the scholarship
                </p>
              </div>

              {/* More Info URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  More Information URL
                </label>
                <input
                  type="url"
                  value={moreInfoUrl}
                  onChange={(e) => setMoreInfoUrl(e.target.value)}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://example.com/scholarship-info"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Link to additional information about the scholarship
                </p>
              </div>
            </div>
          </DataSection>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving || !name}
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
