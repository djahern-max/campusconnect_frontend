'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import Link from 'next/link';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface InvitationValidation {
  valid: boolean;
  entity_type?: string;
  entity_id?: number;
  entity_name?: string;
  message: string;
}

export default function AdminRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'validate' | 'register'>('validate');
  const [invitationCode, setInvitationCode] = useState('');
  const [validatedInvitation, setValidatedInvitation] = useState<InvitationValidation | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/v1/admin/auth/validate-invitation`, {
        code: invitationCode.trim()
      });

      const data: InvitationValidation = response.data;

      if (data.valid) {
        setValidatedInvitation(data);
        setStep('register');
      } else {
        setError(data.message || 'Invalid invitation code');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to validate invitation code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API_URL}/api/v1/admin/auth/register`, {
        email: email.trim(),
        password,
        invitation_code: invitationCode.trim()
      });

      // Registration successful - redirect to login
      router.push('/admin/login?registered=true');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Registration</h1>
          <p className="mt-2 text-gray-600">
            {step === 'validate' 
              ? 'Enter your invitation code to get started'
              : 'Complete your registration'
            }
          </p>
        </div>

        <Card>
          <CardBody>
            {step === 'validate' ? (
              <form onSubmit={validateInvitation} className="space-y-6">
                <div>
                  <label htmlFor="invitation-code" className="block text-sm font-medium text-gray-700 mb-2">
                    Invitation Code
                  </label>
                  <Input
                    id="invitation-code"
                    type="text"
                    placeholder="Enter your invitation code"
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value)}
                    required
                    className="text-center tracking-wider"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    You should have received an invitation code via email
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full bg-gray-900 hover:bg-gray-800"
                >
                  Validate Code
                </Button>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/admin/login" className="text-gray-900 font-medium hover:underline">
                    Sign in
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Show validated entity */}
                {validatedInvitation && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded">
                    <p className="text-sm font-medium text-green-900 mb-1">
                      Invitation Validated
                    </p>
                    <p className="text-sm text-green-700">
                      {validatedInvitation.entity_name}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      {validatedInvitation.entity_type === 'institution' ? 'Institution' : 'Scholarship'}
                    </p>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters
                  </p>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setStep('validate');
                      setValidatedInvitation(null);
                      setEmail('');
                      setPassword('');
                      setConfirmPassword('');
                      setError('');
                    }}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isLoading}
                    className="flex-1 bg-gray-900 hover:bg-gray-800"
                  >
                    Create Account
                  </Button>
                </div>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/admin/login" className="text-gray-900 font-medium hover:underline">
                    Sign in
                  </Link>
                </div>
              </form>
            )}
          </CardBody>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            Don't have an invitation code?{' '}
            <Link href="/contact" className="text-gray-900 font-medium hover:underline">
              Contact us
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
