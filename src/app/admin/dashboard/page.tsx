//src/app/admin/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useCurrentUser } from '@/hooks/useAuth';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { TrialBanner } from '@/components/TrialBanner';
import { SubscriptionCard } from '@/components/dashboard/SubscriptionCard';
import {
  ImageIcon,
  Video,
  FileText,
  Settings,
  CreditCard,
  TrendingUp
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const handleUpgradeClick = () => {
    router.push('/admin/subscription');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Trial Banner at the very top */}
      <TrialBanner />

      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user?.email}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Gallery Images"
              value="0"
              icon={<ImageIcon className="h-8 w-8 text-primary-600" />}
            />
            <StatCard
              title="Videos"
              value="0"
              icon={<Video className="h-8 w-8 text-accent-600" />}
            />
            <StatCard
              title="Page Views"
              value="0"
              icon={<TrendingUp className="h-8 w-8 text-success-600" />}
            />
            {/* Replaced with SubscriptionCard */}
            <SubscriptionCard onUpgradeClick={handleUpgradeClick} />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <ActionCard
                title="Manage Gallery"
                description="Upload and organize your campus photos"
                icon={<ImageIcon className="h-6 w-6" />}
                href="/admin/gallery"
                color="primary"
              />
              <ActionCard
                title="Manage Videos"
                description="Add campus tours and testimonials"
                icon={<Video className="h-6 w-6" />}
                href="/admin/videos"
                color="accent"
              />
              <ActionCard
                title="Edit Content"
                description="Update your institution information"
                icon={<FileText className="h-6 w-6" />}
                href="/admin/content"
                color="success"
              />
            </div>
          </div>

          {/* Settings & Billing */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-gray-600" />
                  <h3 className="text-lg font-semibold">Display Settings</h3>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600 mb-4">
                  Customize what appears on your public profile
                </p>
                <Link href="/admin/settings">
                  <Button variant="secondary" size="sm">
                    Manage Settings
                  </Button>
                </Link>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 mr-2 text-gray-600" />
                  <h3 className="text-lg font-semibold">Subscription Management</h3>
                </div>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600 mb-4">
                  View detailed billing information and manage your subscription
                </p>
                <Link href="/admin/subscription">
                  <Button variant="secondary" size="sm">
                    View Details
                  </Button>
                </Link>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <Card>
      <CardBody className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        {icon}
      </CardBody>
    </Card>
  );
}

function ActionCard({
  title,
  description,
  icon,
  href,
  color
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: 'primary' | 'accent' | 'success';
}) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-600',
    accent: 'bg-accent-50 text-accent-600',
    success: 'bg-success-50 text-success-600',
  };

  return (
    <Link href={href}>
      <Card hover className="h-full">
        <CardBody>
          <div className={`inline-flex p-3 rounded-lg ${colorClasses[color]} mb-4`}>
            {icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-600 text-sm">{description}</p>
        </CardBody>
      </Card>
    </Link>
  );
}