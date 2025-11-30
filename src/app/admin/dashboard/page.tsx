//src/app/admin/dashboard/page.tsx
'use client';

/**
 * Updated Admin Dashboard
 * 
 * Conditionally shows either:
 * - Institution management cards (for entity_type === 'institution')
 * - Scholarship management cards (for entity_type === 'scholarship')
 */

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  User,
  BookOpen,
  DollarSign,
  GraduationCap,
  Image,
  Video,
  BarChart3,
  Settings,
  CreditCard,
  Award,
  Calendar,
  CheckCircle,
  Target
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

export default function AdminDashboard() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, router]);

  // ADD: Wait for user data to be loaded from storage
  useEffect(() => {
    if (isAuthenticated && user) {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  if (loading || !user) {  // ✅ Also check for user
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
  const isScholarshipAdmin = user?.entity_type === 'scholarship';

  console.log('Rendering dashboard for:', { isInstitutionAdmin, isScholarshipAdmin });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Manage your {isInstitutionAdmin ? 'institution' : 'scholarship'} profile and content.
          </p>
        </div>

        {/* Institution Admin Cards */}
        {isInstitutionAdmin && (
          <>
            {/* Institution Data Section */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Institution Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ActionCard
                  title="Profile"
                  description="Edit basic institution information"
                  icon={<User size={24} />}
                  href="/admin/profile"
                  color="primary"
                />
                <ActionCard
                  title="Academic Info"
                  description="Update academic data and metrics"
                  icon={<BookOpen size={24} />}
                  href="/admin/academic"
                  color="success"
                />
                <ActionCard
                  title="Costs & Tuition"
                  description="Manage tuition and fees"
                  icon={<DollarSign size={24} />}
                  href="/admin/costs"
                  color="accent"
                />
                <ActionCard
                  title="Admissions"
                  description="Update admissions statistics"
                  icon={<GraduationCap size={24} />}
                  href="/admin/admissions"
                  color="primary"
                />
              </div>
            </div>

            {/* Content Management Section */}
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
                <ActionCard
                  title="Data Quality"
                  description="Track your profile completeness"
                  icon={<BarChart3 size={24} />}
                  href="/admin/data-quality"
                  color="warning"
                />
              </div>
            </div>
          </>
        )}

        {/* Scholarship Admin Cards */}
        {isScholarshipAdmin && (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Scholarship Data</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <ActionCard
                  title="Profile"
                  description="Edit scholarship name and description"
                  icon={<Award size={24} />}
                  href="/admin/scholarship-profile"
                  color="primary"
                />
                <ActionCard
                  title="Details"
                  description="Manage award amounts and requirements"
                  icon={<DollarSign size={24} />}
                  href="/admin/scholarship-details"
                  color="success"
                />
                <ActionCard
                  title="Eligibility"
                  description="Set GPA and academic requirements"
                  icon={<CheckCircle size={24} />}
                  href="/admin/scholarship-eligibility"
                  color="accent"
                />
                <ActionCard
                  title="Important Dates"
                  description="Application deadlines and notifications"
                  icon={<Calendar size={24} />}
                  href="/admin/scholarship-dates"
                  color="warning"
                />
              </div>
            </div>
          </>
        )}

        {/* Settings & Billing - Common to both */}
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
              href="/admin/billing"
              color="accent"
            />
          </div>
        </div>

        {/* Quick Stats or Info Panel */}
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Info</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Account Type:</strong> {isInstitutionAdmin ? 'Institution Admin' : 'Scholarship Admin'}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Status:</strong> <span className="text-green-600">Active</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}