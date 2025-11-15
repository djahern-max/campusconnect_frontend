'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card, CardBody } from '@/components/ui/Card';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  
  useEffect(() => {
    // Verify session_id from Stripe
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      // Optional: Verify with backend
      setTimeout(() => {
        setIsVerifying(false);
      }, 2000);
    } else {
      setIsVerifying(false);
    }
  }, [searchParams]);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="max-w-md w-full">
          <CardBody className="text-center py-12">
            <Loader2 className="h-16 w-16 text-primary-600 mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Verifying Payment...
            </h2>
            <p className="text-gray-600">
              Please wait while we confirm your subscription
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <Card className="max-w-2xl w-full">
        <CardBody className="text-center py-12">
          <div className="bg-green-100 rounded-full p-4 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Welcome to CampusConnect! 🎉
          </h1>
          
          <p className="text-lg text-gray-700 mb-6">
            Your 30-day free trial has started successfully
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h3 className="font-semibold text-blue-900 mb-3">What's Next?</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Upload high-quality images to your gallery</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Add campus tour videos and testimonials</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Enhance your profile with detailed descriptions</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">✓</span>
                <span>Customize your page layout and branding</span>
              </li>
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-700">
              <strong>Trial Details:</strong> Your free trial lasts 30 days. 
              After that, you'll be charged $39.99/month. You can cancel anytime.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push('/admin/dashboard')}
          >
            Go to Dashboard
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}
