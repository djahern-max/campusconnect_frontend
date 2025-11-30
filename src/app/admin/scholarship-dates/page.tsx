'use client';

/**
 * Scholarship Dates Page
 * 
 * Allows scholarship admins to edit:
 * - Application deadline
 * - Notification date
 * - Application URL
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import type { Scholarship } from '@/types/api';
import { DataSection } from '@/components/admin/forms/DataSection';
import { DateInput } from '@/components/admin/forms/DateInput';

export default function ScholarshipDatesPage() {
  const router = useRouter();
  const { isAuthenticated, adminUser } = useAuthStore();
  
  const [scholarship, setScholarship] = useState<Scholarship | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form state
  const [applicationDeadline, setApplicationDeadline] = useState<string | null>(null);
  const [notificationDate, setNotificationDate] = useState<string | null>(null);
  const [applicationUrl, setApplicationUrl] = useState('');

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
        setApplicationDeadline(scholarshipData.application_deadline);
        setNotificationDate(scholarshipData.notification_date);
        setApplicationUrl(scholarshipData.application_url || '');
      } catch (error) {
        console.error('Error loading scholarship data:', error);
        setErrorMessage('Failed to load scholarship data');
      } finally {
        setLoading(false);
      }
    };

    loadScholarshipData();
  }, [isAuthenticated, router]);

  const validateDates = (): string | null => {
    if (applicationDeadline && notificationDate) {
      const deadline = new Date(applicationDeadline);
      const notification = new Date(notificationDate);
      
      if (notification <= deadline) {
        return 'Notification date must be after the application deadline';
      }
    }
    return null;
  };

  const handleSave = async () => {
    if (!scholarship) return;

    const validationError = validateDates();
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
          application_deadline: applicationDeadline,
          notification_date: notificationDate,
          application_url: applicationUrl || null,
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

      setSuccessMessage('Dates and application information updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving changes:', error);
      setErrorMessage('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getDaysUntilDeadline = (): string | null => {
    if (!applicationDeadline) return null;
    
    const deadline = new Date(applicationDeadline);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Deadline passed ${Math.abs(diffDays)} days ago`;
    } else if (diffDays === 0) {
      return 'Deadline is today!';
    } else if (diffDays === 1) {
      return '1 day until deadline';
    } else {
      return `${diffDays} days until deadline`;
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
          <h1 className="text-3xl font-bold text-gray-900">Important Dates</h1>
          <p className="text-gray-600 mt-2">
            Manage application deadlines and notification timeline
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
          {/* Dates Section */}
          <DataSection title="Application Timeline">
            <div className="space-y-4">
              <DateInput
                label="Application Deadline"
                value={applicationDeadline}
                onChange={setApplicationDeadline}
                helpText="Last day students can submit applications"
              />

              {applicationDeadline && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    📅 {getDaysUntilDeadline()}
                  </p>
                </div>
              )}

              <DateInput
                label="Notification Date"
                value={notificationDate}
                onChange={setNotificationDate}
                helpText="When recipients will be notified of their award"
                minDate={applicationDeadline || undefined}
              />

              {applicationDeadline && notificationDate && (
                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <p className="text-sm text-purple-800">
                    <strong>Timeline:</strong> Applications close on{' '}
                    {new Date(applicationDeadline).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}, with winners announced on{' '}
                    {new Date(notificationDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </DataSection>

          {/* Application URL Section */}
          <DataSection title="Application Information">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Application URL
              </label>
              <input
                type="url"
                value={applicationUrl}
                onChange={(e) => setApplicationUrl(e.target.value)}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/apply"
              />
              <p className="text-xs text-gray-500 mt-1">
                Direct link where students can apply for this scholarship
              </p>
            </div>

            {applicationUrl && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600 mb-2">Preview link:</p>
                <a
                  href={applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-purple-600 hover:text-purple-700 underline break-all"
                >
                  {applicationUrl}
                </a>
              </div>
            )}
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
