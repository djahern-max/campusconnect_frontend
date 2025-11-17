// src/components/dashboard/SubscriptionCard.tsx
'use client';

import { useEffect, useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CreditCard, Clock, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '@/api/client';

interface SubscriptionStatus {
    status: 'none' | 'trialing' | 'active' | 'past_due' | 'canceled';
    plan_tier: 'free' | 'premium';
    current_period_start?: number;
    current_period_end?: number;
    trial_end?: number;
    cancel_at_period_end?: boolean;
    message?: string;
}

interface SubscriptionCardProps {
    onUpgradeClick: () => void;
}

export function SubscriptionCard({ onUpgradeClick }: SubscriptionCardProps) {
    const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                const response = await apiClient.get('/admin/subscriptions/current');
                setSubscription(response.data);

                // Calculate days remaining if on trial
                if (response.data.trial_end || response.data.current_period_end) {
                    const now = Date.now() / 1000; // Current time in seconds
                    const endTime = response.data.trial_end || response.data.current_period_end;
                    const secondsRemaining = endTime - now;
                    const days = Math.ceil(secondsRemaining / (60 * 60 * 24));
                    setDaysRemaining(Math.max(0, days));
                }
            } catch (error) {
                console.error('Failed to fetch subscription:', error);
                setSubscription({
                    status: 'none',
                    plan_tier: 'free',
                    message: 'No active subscription'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, []);

    if (loading) {
        return (
            <Card>
                <CardBody className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </CardBody>
            </Card>
        );
    }

    // No subscription or free tier
    if (!subscription || subscription.status === 'none' || subscription.plan_tier === 'free') {
        return (
            <Card>
                <CardBody>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <CreditCard className="h-6 w-6 text-gray-400 mr-2" />
                            <div>
                                <p className="text-sm text-gray-600">Subscription</p>
                                <p className="text-xl font-bold text-gray-900">Free Trial</p>
                            </div>
                        </div>
                    </div>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onUpgradeClick}
                        className="w-full"
                    >
                        Start Free Trial
                    </Button>
                </CardBody>
            </Card>
        );
    }

    // Trial expired - needs activation
    if (subscription.status === 'trialing' && daysRemaining === 0) {
        return (
            <Card className="border-2 border-red-200 bg-red-50">
                <CardBody>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <XCircle className="h-6 w-6 text-red-600 mr-2" />
                            <div>
                                <p className="text-sm text-red-700 font-medium">Trial Expired</p>
                                <p className="text-2xl font-bold text-red-900">0 days</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-red-700 mb-3">
                        Subscribe now to continue access
                    </p>
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onUpgradeClick}
                        className="w-full bg-red-600 hover:bg-red-700"
                    >
                        Subscribe Now
                    </Button>
                </CardBody>
            </Card>
        );
    }

    // Trialing
    if (subscription.status === 'trialing') {
        const borderColor = subscription.cancel_at_period_end ? 'border-yellow-200' : 'border-blue-200';
        const bgColor = subscription.cancel_at_period_end ? 'bg-yellow-50' : 'bg-blue-50';
        const textColor = subscription.cancel_at_period_end ? 'text-yellow-700' : 'text-blue-700';
        const headerColor = subscription.cancel_at_period_end ? 'text-yellow-900' : 'text-blue-900';
        const iconColor = subscription.cancel_at_period_end ? 'text-yellow-600' : 'text-blue-600';

        return (
            <Card className={`border-2 ${borderColor} ${bgColor}`}>
                <CardBody>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Clock className={`h-6 w-6 ${iconColor} mr-2`} />
                            <div>
                                <p className={`text-sm ${textColor} font-medium`}>
                                    {subscription.cancel_at_period_end ? 'Ending Soon' : 'Trial Active'}
                                </p>
                                <p className={`text-2xl font-bold ${headerColor}`}>
                                    {daysRemaining !== null ? `${daysRemaining} days` : 'Active'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <p className={`text-xs ${textColor} mb-3`}>
                        {subscription.cancel_at_period_end ? 'Access until' : 'Trial ends'}{' '}
                        {subscription.trial_end
                            ? new Date(subscription.trial_end * 1000).toLocaleDateString()
                            : 'soon'}
                    </p>
                    {subscription.cancel_at_period_end && (
                        <p className={`text-xs ${textColor} font-semibold mb-3`}>
                            ⚠️ Will not renew
                        </p>
                    )}
                    <Button
                        variant="primary"
                        size="sm"
                        onClick={onUpgradeClick}
                        className="w-full"
                    >
                        View Subscription
                    </Button>
                </CardBody>
            </Card>
        );
    }

    // Active subscription
    if (subscription.status === 'active') {
        return (
            <Card className="border-2 border-green-200 bg-green-50">
                <CardBody>
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                            <div>
                                <p className="text-sm text-green-700 font-medium">Premium</p>
                                <p className="text-2xl font-bold text-green-900">Active</p>
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-green-700 mb-3">
                        {subscription.cancel_at_period_end
                            ? `Cancels on ${new Date((subscription.current_period_end || 0) * 1000).toLocaleDateString()}`
                            : `Renews ${new Date((subscription.current_period_end || 0) * 1000).toLocaleDateString()}`
                        }
                    </p>
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onUpgradeClick}
                        className="w-full"
                    >
                        Manage Subscription
                    </Button>
                </CardBody>
            </Card>
        );
    }

    // Past due or other status
    return (
        <Card className="border-2 border-red-200 bg-red-50">
            <CardBody>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <CreditCard className="h-6 w-6 text-red-600 mr-2" />
                        <div>
                            <p className="text-sm text-red-700 font-medium">Subscription</p>
                            <p className="text-2xl font-bold text-red-900 capitalize">{subscription.status}</p>
                        </div>
                    </div>
                </div>
                <Button
                    variant="primary"
                    size="sm"
                    onClick={onUpgradeClick}
                    className="w-full bg-red-600 hover:bg-red-700"
                >
                    Update Payment
                </Button>
            </CardBody>
        </Card>
    );
}
