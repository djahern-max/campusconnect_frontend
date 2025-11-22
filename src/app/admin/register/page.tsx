// src/app/admin/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardBody } from '@/components/ui/Card';
import Link from 'next/link';
import axios from 'axios';
import { Sparkles, CheckCircle2 } from 'lucide-react';

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
  const [validatedInvitation, setValidatedInvitation] =
    useState<InvitationValidation | null>(null);
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
      const response = await axios.post(
        `${API_URL}/api/v1/admin/auth/validate-invitation`,
        {
          code: invitationCode.trim(),
        }
      );

      const data: InvitationValidation = response.data;

      if (data.valid) {
        setValidatedInvitation(data);
        setStep('register');
      } else {
        setError(data.message || 'Invalid invitation code');
      }
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Failed to validate invitation code'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

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
      await axios.post(`${API_URL}/api/v1/admin/auth/register`, {
        email: email.trim(),
        password,
        invitation_code: invitationCode.trim(),
      });

      router.push('/admin/login?registered=true');
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 'Registration failed. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Decorative sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Sparkles className="absolute top-20 left-10 h-6 w-6 text-cyan-400 opacity-20 animate-pulse" />
        <Sparkles className="absolute top-40 right-20 h-8 w-8 text-blue-400 opacity-15 animate-pulse" style={{ animationDelay: '1s' }} />
        <Sparkles className="absolute bottom-32 left-1/4 h-5 w-5 text-cyan-500 opacity-25 animate-pulse" style={{ animationDelay: '2s' }} />
        <Sparkles className="absolute bottom-20 right-1/3 h-7 w-7 text-blue-300 opacity-20 animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="max-w-md w-full relative z-10">
        <Card className="shadow-2xl border-0">
          <CardBody className="p-8">
            {/* Header with Sparkle */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mb-4">
                <Sparkles className="h-10 w-10 text-cyan-500" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                Admin Registration
              </h1>
              <p className="text-gray-600">
                {step === 'validate'
                  ? 'Enter your invitation code to get started'
                  : 'Complete your registration'}
              </p>
            </div>

            {step === 'validate' ? (
              <form onSubmit={validateInvitation} className="space-y-6">
                <div>
                  <label
                    htmlFor="invitation-code"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Invitation Code
                  </label>
                  <Input
                    id="invitation-code"
                    type="text"
                    placeholder="XXXX-XXXX-XXXX"
                    value={invitationCode}
                    onChange={(e) => setInvitationCode(e.target.value)}
                    required
                    className="text-center tracking-wider text-lg font-mono px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    You should have received this code via email
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                >
                  {isLoading ? 'Validating...' : 'Validate Code'}
                </button>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href="/admin/login"
                    className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-cyan-700"
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-6">
                {validatedInvitation && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 p-4 rounded-lg">
                    <div className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-green-900 mb-1">
                          Invitation Validated
                        </p>
                        <p className="text-sm text-green-700 font-medium">
                          {validatedInvitation.entity_name}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          {validatedInvitation.entity_type === 'institution'
                            ? 'Institution'
                            : 'Scholarship'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@institution.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
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
                    className="px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm Password
                  </label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="px-4 py-3 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('validate');
                      setValidatedInvitation(null);
                      setEmail('');
                      setPassword('');
                      setConfirmPassword('');
                      setError('');
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                  >
                    {isLoading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>

                <div className="text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href="/admin/login"
                    className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-cyan-700"
                  >
                    Sign in
                  </Link>
                </div>
              </form>
            )}
          </CardBody>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 mb-3">
            Don't have an invitation code?{' '}
            <Link
              href="/contact"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Contact us
            </Link>
          </p>
          <Link
            href="/"
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Abacadaba
          </Link>
        </div>
      </div>
    </div>
  );
}