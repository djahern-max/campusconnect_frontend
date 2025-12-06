// src/app/admin/subscription/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/api/client';
import { CreditCard, Calendar, XCircle, ExternalLink, CheckCircle } from 'lucide-react';

interface PricingInfo {
    entity_type: 'institution' | 'scholarship';
    price_cents: number;
    price_monthly: string;
    trial_days: number;
}

interface SubscriptionStatus {
    status: 'none' | 'trialing' | 'active' | 'past_due' | 'canceled';
    plan_tier: 'free' | 'premium';
    current_period_start?: number;
    current_period_end?: number;
    trial_end?: number;
    cancel_at_period_end?: boolean;
}

export default function SubscriptionPage() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [pricingInfo, setPricingInfo] = useState<PricingInfo | null>(null);
    const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
    const [loadingPrice, setLoadingPrice] = useState(true);
    const [loadingSubscription, setLoadingSubscription] = useState(true);

    // Fetch subscription status and pricing
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch current subscription
                const subResponse = await apiClient.get('/admin/subscriptions/current');
                setSubscription(subResponse.data);

                // Fetch pricing
                const priceResponse = await apiClient.get('/admin/subscriptions/pricing');
                setPricingInfo(priceResponse.data);
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoadingPrice(false);
                setLoadingSubscription(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    const handleCheckout = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiClient.post('/admin/subscriptions/create-checkout');
            if (response.data.checkout_url) {
                window.location.href = response.data.checkout_url;
            }
        } catch (error: any) {
            console.error('Failed to create checkout session:', error);
            setError(error.response?.data?.detail || 'Failed to start checkout. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancelSubscription = async () => {
        if (!confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your billing period.')) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await apiClient.post('/admin/subscriptions/cancel');
            // Refresh subscription data
            const subResponse = await apiClient.get('/admin/subscriptions/current');
            setSubscription(subResponse.data);
            alert('Subscription canceled. You will retain access until the end of your billing period.');
        } catch (error: any) {
            console.error('Failed to cancel subscription:', error);
            setError(error.response?.data?.detail || 'Failed to cancel subscription. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleManageBilling = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await apiClient.get('/admin/subscriptions/portal');
            if (response.data.portal_url) {
                window.location.href = response.data.portal_url;
            }
        } catch (error: any) {
            console.error('Failed to open billing portal:', error);
            setError(error.response?.data?.detail || 'Failed to open billing portal. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (loadingPrice || loadingSubscription) {
        return (
            <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading subscription information...</p>
                </div>
            </div>
        );
    }

    const hasActiveSubscription = subscription &&
        (subscription.status === 'trialing' || subscription.status === 'active') &&
        subscription.plan_tier === 'premium';

    const entityTypeDisplay = pricingInfo?.entity_type === 'scholarship' ? 'Scholarship' : 'Institution';
    const priceDisplay = pricingInfo?.price_monthly || '$39.99';
    const isScholarship = pricingInfo?.entity_type === 'scholarship';
    const buttonColor = isScholarship ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700';

    // Calculate days remaining for trial
    const daysRemaining = subscription?.trial_end
        ? Math.max(0, Math.ceil((subscription.trial_end * 1000 - Date.now()) / (1000 * 60 * 60 * 24)))
        : null;

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <button
                    onClick={() => router.push('/admin/dashboard')}
                    className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </button>

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Subscription Management
                    </h1>
                    <p className="text-lg text-gray-600">
                        {hasActiveSubscription
                            ? 'Manage your subscription and billing'
                            : `Choose the plan that works best for your ${entityTypeDisplay.toLowerCase()}`
                        }
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* EXISTING SUBSCRIPTION VIEW */}
                {hasActiveSubscription ? (
                    <div className="space-y-6">
                        {/* Current Plan Card */}
                        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                            <div className={`${isScholarship ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-blue-600 to-blue-700'} px-8 py-6`}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-2xl font-bold text-white mb-2">
                                            Premium Plan
                                        </h2>
                                        <div className="flex items-baseline text-white">
                                            <span className="text-5xl font-extrabold">{priceDisplay}</span>
                                            <span className="text-xl ml-2">/month</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        {subscription.status === 'trialing' ? (
                                            <div className="bg-white/20 px-4 py-2 rounded-lg">
                                                <p className="text-white text-sm font-semibold">Trial Active</p>
                                                <p className="text-white/90 text-lg font-bold">{daysRemaining} days left</p>
                                            </div>
                                        ) : (
                                            <div className="flex items-center bg-white/20 px-4 py-2 rounded-lg">
                                                <CheckCircle className="h-5 w-5 text-white mr-2" />
                                                <span className="text-white font-semibold">Active</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-6 bg-gray-50">
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Billing Information */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                                            <Calendar className="h-5 w-5 mr-2 text-gray-600" />
                                            Billing Information
                                        </h3>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Status:</span>
                                                <span className="font-semibold text-gray-900 capitalize">
                                                    {subscription.status}
                                                </span>
                                            </div>
                                            {subscription.trial_end && subscription.status === 'trialing' && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Trial Ends:</span>
                                                    <span className="font-semibold text-gray-900">
                                                        {new Date(subscription.trial_end * 1000).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            {subscription.current_period_end && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">
                                                        {subscription.cancel_at_period_end ? 'Access Until:' : 'Next Billing:'}
                                                    </span>
                                                    <span className="font-semibold text-gray-900">
                                                        {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            )}
                                            {subscription.cancel_at_period_end && (
                                                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                    <p className="text-yellow-800 text-xs font-semibold">
                                                        ⚠️ Subscription will cancel at the end of the billing period
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Features */}
                                    <div>
                                        <h3 className="font-semibold text-gray-900 mb-4">Your Benefits</h3>
                                        <div className="space-y-2 text-sm">
                                            <Feature text="Full dashboard access" />
                                            <Feature text="Unlimited gallery images" />
                                            <Feature text="Unlimited video uploads" />
                                            <Feature text="Custom branding" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="px-8 py-6 bg-white border-t border-gray-200">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={handleManageBilling}
                                        disabled={isLoading}
                                        className="flex-1 flex items-center justify-center py-3 px-6 rounded-lg font-semibold transition-all bg-gray-100 hover:bg-gray-200 text-gray-900"
                                    >
                                        <CreditCard className="h-5 w-5 mr-2" />
                                        Update Payment Method
                                        <ExternalLink className="h-4 w-4 ml-2" />
                                    </button>

                                    {!subscription.cancel_at_period_end && (
                                        <button
                                            onClick={handleCancelSubscription}
                                            disabled={isLoading}
                                            className="flex-1 flex items-center justify-center py-3 px-6 rounded-lg font-semibold transition-all bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                                        >
                                            <XCircle className="h-5 w-5 mr-2" />
                                            Cancel Subscription
                                        </button>
                                    )}
                                </div>
                                <p className="text-center text-gray-500 text-xs mt-4">
                                    Changes to your subscription will be reflected in your next billing cycle
                                </p>
                            </div>
                        </div>

                        {/* Information Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="font-semibold text-blue-900 mb-2">Need Help?</h3>
                            <p className="text-sm text-blue-800">
                                If you have any questions about your subscription or billing, please contact our support team at support@campusconnect.com
                            </p>
                        </div>
                    </div>
                ) : (
                    /* NEW SUBSCRIPTION VIEW (Original pricing card) */
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className={`${isScholarship ? 'bg-gradient-to-r from-green-600 to-green-700' : 'bg-gradient-to-r from-blue-600 to-blue-700'} px-8 py-6`}>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Premium Plan for {entityTypeDisplay}s
                            </h2>
                            <div className="flex items-baseline text-white">
                                <span className="text-5xl font-extrabold">{priceDisplay}</span>
                                <span className="text-xl ml-2">/month</span>
                            </div>
                            {isScholarship && (
                                <p className="text-green-100 text-sm mt-2">
                                    Special pricing for scholarship providers
                                </p>
                            )}
                        </div>

                        <div className="px-8 py-10">
                            <div className="space-y-4 mb-8">
                                <Feature text="Full dashboard access" />
                                <Feature text="Unlimited gallery images" />
                                <Feature text="Unlimited video uploads" />
                                <Feature text="Custom branding options" />
                                <Feature text="Advanced analytics" />
                                <Feature text="Priority support" />
                                <Feature text="No advertisements" />
                                <Feature text="Monthly feature updates" />
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={isLoading}
                                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${isLoading ? 'bg-gray-400 cursor-not-allowed' : `${buttonColor} shadow-lg hover:shadow-xl`
                                    } text-white`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : (
                                    'Subscribe Now'
                                )}
                            </button>

                            <p className="text-center text-gray-500 text-xs mt-6">
                                Cancel anytime. No long-term contracts.
                            </p>
                        </div>

                        {/* FAQ Section */}
                        <div className="mt-12 bg-white rounded-lg shadow-md p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6">
                                Frequently Asked Questions
                            </h3>
                            <div className="space-y-6">
                                <FAQ
                                    question="Can I cancel anytime?"
                                    answer="Yes! You can cancel your subscription at any time from your dashboard. You'll continue to have access until the end of your billing period."
                                />
                                <FAQ
                                    question="What payment methods do you accept?"
                                    answer="We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe."
                                />
                                <FAQ
                                    question="What happens after my trial ends?"
                                    answer="If you don't subscribe before your trial ends, your access to premium features will be limited. You can subscribe at any time to restore full access."
                                />
                                <FAQ
                                    question="Is there a refund policy?"
                                    answer="We offer a 14-day money-back guarantee. If you're not satisfied within the first 14 days, contact us for a full refund."
                                />
                                {isScholarship && (
                                    <FAQ
                                        question="Why is pricing different for scholarships?"
                                        answer="We offer special discounted pricing for scholarship providers to help make education more accessible to students."
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Feature({ text }: { text: string }) {
    return (
        <div className="flex items-start">
            <svg
                className="flex-shrink-0 h-6 w-6 text-green-500 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                />
            </svg>
            <span className="ml-3 text-gray-700">{text}</span>
        </div>
    );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
    return (
        <div>
            <h4 className="font-semibold text-gray-900 mb-2">{question}</h4>
            <p className="text-gray-600">{answer}</p>
        </div>
    );
}