//app/admin/register/page.tsx

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import Link from 'next/link';
import { UserPlus, CheckCircle, XCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import apiClient from '@/api/client';

interface InvitationValidation {
    valid: boolean;
    entity_type?: string;
    entity_id?: number;
    entity_name?: string;
    message?: string;
}

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState<'code' | 'details'>('code');

    // Form state
    const [invitationCode, setInvitationCode] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // UI state
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Validation state
    const [codeValidation, setCodeValidation] = useState<InvitationValidation | null>(null);
    const [isValidating, setIsValidating] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState('');

    const validateInvitationCode = async () => {
        if (!invitationCode.trim()) {
            setError('Please enter an invitation code');
            return;
        }

        setIsValidating(true);
        setError('');

        try {
            const response = await apiClient.post<InvitationValidation>(
                '/admin/auth/validate-invitation',
                { code: invitationCode }
            );

            setCodeValidation(response.data);

            if (response.data.valid) {
                setStep('details');
            } else {
                setError(response.data.message || 'Invalid invitation code');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to validate invitation code');
            setCodeValidation(null);
        } finally {
            setIsValidating(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setIsRegistering(true);
        setError('');

        try {
            await apiClient.post('/admin/auth/register', {
                email,
                password,
                invitation_code: invitationCode
            });

            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const loginResponse = await apiClient.post('/admin/auth/login', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const { access_token } = loginResponse.data;
            localStorage.setItem('auth_token', access_token);

            router.push('/admin/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Registration failed. Please try again.');
        } finally {
            setIsRegistering(false);
        }
    };

    const handleBackToCode = () => {
        setStep('code');
        setCodeValidation(null);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full">

                <Card>
                    <CardBody className="p-8">
                        {/* Unified header inside card */}
                        <div className="text-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-1">Create Admin Account</h1>
                            <p className="text-gray-600 text-sm">
                                {step === 'code'
                                    ? 'Enter your invitation code to continue'
                                    : 'Complete your registration'}
                            </p>
                        </div>

                        {/* Step 1: Invitation Code */}
                        {step === 'code' && (
                            <div className="space-y-6">
                                <Input
                                    type="text"
                                    label="Invitation Code"
                                    placeholder="Enter your code"
                                    value={invitationCode}
                                    onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                                    required
                                    autoFocus
                                />

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                                        <XCircle className="h-5 w-5 mr-2 mt-0.5" />
                                        <span className="text-sm">{error}</span>
                                    </div>
                                )}

                                {/* Grey action button */}
                                <button
                                    type="button"
                                    onClick={validateInvitationCode}
                                    disabled={isValidating}
                                    className="
                    w-full flex items-center justify-center
                    px-4 py-2
                    bg-gray-600 hover:bg-gray-700
                    text-white font-medium rounded-lg
                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                  "
                                >
                                    {isValidating ? 'Validating…' : 'Continue'}
                                </button>

                                <div className="text-center pt-4">
                                    <p className="text-sm text-gray-600">
                                        Already have an account?{' '}
                                        <Link
                                            href="/admin/login"
                                            className="text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            Sign in
                                        </Link>
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Account Details */}
                        {step === 'details' && codeValidation?.valid && (
                            <form onSubmit={handleRegister} className="space-y-6">
                                {/* Back button */}
                                <button
                                    type="button"
                                    onClick={handleBackToCode}
                                    className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Change invitation code
                                </button>

                                {/* Success message */}
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
                                    <CheckCircle className="h-5 w-5 mr-2 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-medium">Invitation Code Valid!</p>
                                        <p className="mt-1">
                                            Registering as admin for: <strong>{codeValidation.entity_name}</strong>
                                        </p>
                                        <p className="text-xs text-green-600 mt-1">
                                            Type: {codeValidation.entity_type}
                                        </p>
                                    </div>
                                </div>

                                <Input
                                    type="email"
                                    label="Email Address"
                                    placeholder="admin@university.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoFocus
                                />

                                {/* Password with toggle */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="mt-1 text-sm text-gray-500">Must be at least 8 characters</p>
                                </div>

                                {/* Confirm Password with toggle */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Confirm Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-5 w-5" />
                                            ) : (
                                                <Eye className="h-5 w-5" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="w-full"
                                        isLoading={isRegistering}
                                    >
                                        <UserPlus className="mr-2 h-5 w-5" />
                                        Create Account
                                    </Button>
                                </div>

                                <div className="text-center pt-4">
                                    <p className="text-sm text-gray-600">
                                        Already have an account?{' '}
                                        <Link
                                            href="/admin/login"
                                            className="text-primary-600 hover:text-primary-700 font-medium"
                                        >
                                            Sign in
                                        </Link>
                                    </p>
                                </div>
                            </form>
                        )}
                    </CardBody>
                </Card>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>Need an invitation code?</p>
                    <p className="mt-1">Contact your system administrator</p>
                </div>
            </div>
        </div>
    );
}
