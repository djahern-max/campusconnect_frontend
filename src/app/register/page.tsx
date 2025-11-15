'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import Link from 'next/link';
import { UserPlus, CheckCircle, XCircle } from 'lucide-react';
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
        null,
        { params: { code: invitationCode } }
      );

      setCodeValidation(response.data);

      if (response.data.valid) {
        setStep('details');
      } else {
        setError(response.data.message || 'Invalid invitation code');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to validate invitation code');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
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
      // Register user
      const response = await apiClient.post('/admin/auth/register', {
        email,
        password,
        invitation_code: invitationCode
      });

      // Login to get token
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const loginResponse = await apiClient.post('/admin/auth/login', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const { access_token } = loginResponse.data;
      localStorage.setItem('access_token', access_token);

      // Redirect to Stripe checkout
      router.push('/admin/subscription/checkout');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-600">
            {step === 'code' 
              ? 'Enter your invitation code to get started' 
              : `Managing ${codeValidation?.entity_name}`
            }
          </p>
        </div>

        <Card>
          <CardBody className="p-8">
            {/* Step 1: Invitation Code */}
            {step === 'code' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invitation Code
                  </label>
                  <Input
                    type="text"
                    placeholder="ABC-DEF-GHI-JKL"
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
                    className="text-center text-lg font-mono tracking-wider"
                    maxLength={15}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Enter the invitation code from your email
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                    <XCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={validateInvitationCode}
                  isLoading={isValidating}
                >
                  Continue
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/admin/login" className="text-primary-600 hover:text-primary-700 font-medium">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Account Details */}
            {step === 'details' && codeValidation?.valid && (
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Success message */}
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Invitation Code Valid!</p>
                    <p className="mt-1">
                      You're registering as admin for: <strong>{codeValidation.entity_name}</strong>
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
                />

                <Input
                  type="password"
                  label="Password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <Input
                  type="password"
                  label="Confirm Password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    isLoading={isRegistering}
                  >
                    <UserPlus className="mr-2 h-5 w-5" />
                    Create Account & Start Trial
                  </Button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('code');
                      setCodeValidation(null);
                      setError('');
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 w-full"
                  >
                    ← Use a different code
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>After registration:</strong> You'll be redirected to start your 30-day free trial ($39.99/month after trial).
                  </p>
                </div>
              </form>
            )}
          </CardBody>
        </Card>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
