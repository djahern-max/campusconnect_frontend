// src/app/admin/settings/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Settings, Eye, EyeOff, Palette, Save, Loader2 } from 'lucide-react';

interface DisplaySettings {
    id: number;
    entity_type: string;
    entity_id: number;
    show_stats: boolean;
    show_financial: boolean;
    show_requirements: boolean;
    show_image_gallery: boolean;
    show_video: boolean;
    show_extended_info: boolean;
    custom_tagline: string | null;
    custom_description: string | null;
    extended_description: string | null;
    layout_style: string;
    primary_color: string | null;
}

export default function SettingsPage() {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<DisplaySettings | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push('/admin/login');
            return;
        }
        fetchSettings();
    }, [isAuthenticated, router]);

    const fetchSettings = async () => {
        try {
            // Get token from Zustand store or fallback to access_token
            let token = null;

            // Try to get from Zustand store first
            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
                try {
                    const parsed = JSON.parse(authStorage);
                    token = parsed?.state?.token;
                } catch (e) {
                    console.error('Failed to parse auth-storage:', e);
                }
            }

            // Fallback to access_token if Zustand store doesn't have it
            if (!token) {
                token = localStorage.getItem('access_token');
            }

            // Check if token exists
            if (!token) {
                setError('No authentication token found. Please log in again.');
                setLoading(false);
                setTimeout(() => router.push('/admin/login'), 2000);
                return;
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/profile/display-settings`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSettings(data);
            } else if (response.status === 401) {
                // Token is invalid or expired
                setError('Your session has expired. Please log in again.');
                localStorage.removeItem('auth_token');
                setTimeout(() => router.push('/admin/login'), 2000);
            } else if (response.status === 404) {
                // Settings don't exist yet - this is okay, we'll show default values
                setError('Display settings not yet configured. Contact support to initialize your settings.');
            } else {
                throw new Error('Failed to fetch settings');
            }
        } catch (err) {
            setError('Failed to load settings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;

        setSaving(true);
        setError(null);
        setSuccessMessage(null);

        try {
            // Get token from Zustand store or fallback to access_token
            let token = null;

            const authStorage = localStorage.getItem('auth-storage');
            if (authStorage) {
                try {
                    const parsed = JSON.parse(authStorage);
                    token = parsed?.state?.token;
                } catch (e) {
                    console.error('Failed to parse auth-storage:', e);
                }
            }

            if (!token) {
                token = localStorage.getItem('access_token');
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/profile/display-settings`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    show_stats: settings.show_stats,
                    show_financial: settings.show_financial,
                    show_requirements: settings.show_requirements,
                    show_image_gallery: settings.show_image_gallery,
                    show_video: settings.show_video,
                    show_extended_info: settings.show_extended_info,
                    custom_tagline: settings.custom_tagline,
                    custom_description: settings.custom_description,
                    extended_description: settings.extended_description,
                    layout_style: settings.layout_style,
                    primary_color: settings.primary_color,
                }),
            });

            if (response.ok) {
                const updatedSettings = await response.json();
                setSettings(updatedSettings);
                setSuccessMessage('Settings saved successfully!');
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                throw new Error('Failed to save settings');
            }
        } catch (err) {
            setError('Failed to save settings');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const toggleSetting = (field: keyof DisplaySettings) => {
        if (!settings) return;
        setSettings({
            ...settings,
            [field]: !settings[field],
        });
    };

    const updateField = (field: keyof DisplaySettings, value: string) => {
        if (!settings) return;
        setSettings({
            ...settings,
            [field]: value,
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Loading settings...</p>
                </div>
            </div>
        );
    }

    if (error && !settings) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-800">{error}</p>
                        <Button onClick={() => router.push('/admin/dashboard')} className="mt-4">
                            Back to Dashboard
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center space-x-3 mb-2">
                        <Settings className="h-8 w-8 text-purple-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Display Settings</h1>
                    </div>
                    <p className="text-gray-600">
                        Show/hide sections and customize your profile appearance
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-green-800">{successMessage}</p>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {settings && (
                    <div className="space-y-6">
                        {/* Section Visibility */}
                        <Card>
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <Eye className="h-5 w-5 mr-2 text-gray-600" />
                                    Section Visibility
                                </h2>
                                <p className="text-sm text-gray-600 mb-6">
                                    Control which sections appear on your public profile
                                </p>

                                <div className="space-y-4">
                                    {[
                                        { key: 'show_stats', label: 'Statistics Section', description: 'Display key metrics and statistics' },
                                        { key: 'show_financial', label: 'Financial Information', description: 'Show tuition and costs' },
                                        { key: 'show_requirements', label: 'Requirements Section', description: 'Display admission requirements' },
                                        { key: 'show_image_gallery', label: 'Image Gallery', description: 'Show campus photo gallery' },
                                        { key: 'show_video', label: 'Video Section', description: 'Display campus tour videos' },
                                        { key: 'show_extended_info', label: 'Extended Information', description: 'Show additional details' },
                                    ].map(({ key, label, description }) => (
                                        <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{label}</p>
                                                <p className="text-sm text-gray-600">{description}</p>
                                            </div>
                                            <button
                                                onClick={() => toggleSetting(key as keyof DisplaySettings)}
                                                className={`ml-4 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings[key as keyof DisplaySettings]
                                                        ? 'bg-purple-600'
                                                        : 'bg-gray-300'
                                                    }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings[key as keyof DisplaySettings]
                                                            ? 'translate-x-6'
                                                            : 'translate-x-1'
                                                        }`}
                                                />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>

                        {/* Custom Content */}
                        <Card>
                            <div className="p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                                    <Palette className="h-5 w-5 mr-2 text-gray-600" />
                                    Custom Content
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Custom Tagline (max 200 characters)
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={200}
                                            value={settings.custom_tagline || ''}
                                            onChange={(e) => updateField('custom_tagline', e.target.value)}
                                            placeholder="e.g., 'Excellence in Education Since 1950'"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            {(settings.custom_tagline?.length || 0)}/200 characters
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Custom Description
                                        </label>
                                        <textarea
                                            rows={4}
                                            value={settings.custom_description || ''}
                                            onChange={(e) => updateField('custom_description', e.target.value)}
                                            placeholder="Brief description of your institution..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Primary Color (Hex)
                                        </label>
                                        <div className="flex items-center space-x-3">
                                            <input
                                                type="color"
                                                value={settings.primary_color || '#6B21A8'}
                                                onChange={(e) => updateField('primary_color', e.target.value)}
                                                className="h-10 w-20 rounded cursor-pointer"
                                            />
                                            <input
                                                type="text"
                                                value={settings.primary_color || ''}
                                                onChange={(e) => updateField('primary_color', e.target.value)}
                                                placeholder="#6B21A8"
                                                maxLength={7}
                                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Save Button */}
                        <div className="flex justify-end space-x-4">
                            <Button
                                variant="secondary"
                                onClick={() => router.push('/admin/dashboard')}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={saving}
                                className="flex items-center space-x-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-4 w-4" />
                                        <span>Save Changes</span>
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}