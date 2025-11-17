// src/components/TrialBanner.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/api/client';
import { useAuthStore } from '@/stores/authStore';
import { XCircle, Clock, AlertTriangle } from 'lucide-react';

interface SubscriptionStatus {
    status: 'none' | 'trialing' | 'active' | 'past_due' | 'canceled';
    plan_tier: 'free' | 'premium';
    current_period_end?: number;
    trial_end?: number;
    cancel_at_period_end?: boolean;
}

export function TrialBanner() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const response = await apiClient.get('/admin/subscriptions/current');
                setSubscription(response.data);

                // Calculate days remaining
                if (response.data.trial_end) {
                    const now = Date.now() / 1000;
                    const endTime = response.data.trial_end;
                    const secondsRemaining = endTime - now;
                    const days = Math.ceil(secondsRemaining / (60 * 60 * 24));
                    setDaysRemaining(Math.max(0, days));
                }
            } catch (error) {
                console.error('Failed to fetch subscription:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, []);

    if (loading || !subscription) {
        return null;
    }

    // Don't show banner for active paid subscriptions (unless canceling)
    if (subscription.status === 'active' && !subscription.cancel_at_period_end) {
        return null;
    }

    // Don't show if no subscription
    if (subscription.status === 'none' || subscription.plan_tier === 'free') {
        return null;
    }

    // Subscription is set to cancel
    if (subscription.cancel_at_period_end) {
        const endDate = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            })
            : 'soon';

        return (
            <div className="bg-yellow-50 border-b-2 border-yellow-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3" />
                            <div>
                                <p className="text-sm font-semibold text-yellow-900">
                                    Subscription Ending
                                </p>
                                <p className="text-sm text-yellow-800">
                                    Your subscription will end on {endDate}. You'll lose access to premium features.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/admin/subscription')}
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                        >
                            Reactivate
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Trial is active
    if (subscription.status === 'trialing' && daysRemaining !== null) {
        // Only show banner in last 3 days of trial
        if (daysRemaining > 3) {
            return null; // ✅ Don't show banner during early/mid trial
        }

        // Last 3 days - show warning
        const bgColor = 'bg-yellow-50';
        const borderColor = 'border-yellow-200';
        const textColor = 'text-yellow-900';
        const subtextColor = 'text-yellow-700';
        const iconColor = 'text-yellow-600';

        const trialEndDate = subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
            })
            : 'soon';

        // Get charge amount from user's entity type
        const chargeAmount = user?.entity_type === 'scholarship' ? '$19.99' : '$39.99';

        return (
            <div className={`${bgColor} border-b-2 ${borderColor}`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Clock className={`h-6 w-6 ${iconColor} mr-3`} />
                            <div>
                                <p className={`text-sm font-semibold ${textColor}`}>
                                    Trial Ending in {daysRemaining} Day{daysRemaining !== 1 ? 's' : ''}
                                </p>
                                <p className={`text-sm ${subtextColor}`}>
                                    Your card will be charged {chargeAmount} on {trialEndDate}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/admin/subscription')}
                            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                        >
                            Manage Subscription
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Trial expired
    if (subscription.status === 'trialing' && daysRemaining === 0) {
        return (
            <div className="bg-red-50 border-b-2 border-red-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <XCircle className="h-6 w-6 text-red-600 mr-3" />
                            <div>
                                <p className="text-sm font-semibold text-red-900">
                                    Trial Expired
                                </p>
                                <p className="text-sm text-red-700">
                                    Subscribe now to regain access to all premium features.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/admin/subscription')}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                        >
                            Subscribe Now
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Past due
    if (subscription.status === 'past_due') {
        return (
            <div className="bg-red-50 border-b-2 border-red-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <XCircle className="h-6 w-6 text-red-600 mr-3" />
                            <div>
                                <p className="text-sm font-semibold text-red-900">
                                    Payment Failed
                                </p>
                                <p className="text-sm text-red-700">
                                    Please update your payment method to continue your subscription.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push('/admin/subscription')}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
                        >
                            Update Payment
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}