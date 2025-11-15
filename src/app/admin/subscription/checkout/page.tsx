'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody } from '@/components/ui/Card';
import { Loader2, AlertCircle } from 'lucide-react';
import apiClient from '@/api/client';

export default function SubscriptionCheckoutPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    const createCheckoutSession = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          router.push('/admin/login');
          return;
        }

        // Create Stripe checkout session
        const response = await apiClient.post(
          '/admin/subscriptions/create-checkout',
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const { checkout_url } = response.data;

        // Redirect to Stripe
        window.location.href = checkout_url;
      } catch (err: any) {
        console.error('Checkout error:', err);
        setError(err.response?.data?.detail || 'Failed to create checkout session');
      }
    };

    createCheckoutSession();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardBody className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Checkout Error
            </h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Go to Dashboard
            </button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-md w-full">
        <CardBody className="text-center py-12">
          <Loader2 className="h-16 w-16 text-primary-600 mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Redirecting to Checkout...
          </h2>
          <p className="text-gray-600">
            Please wait while we prepare your 30-day free trial
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
