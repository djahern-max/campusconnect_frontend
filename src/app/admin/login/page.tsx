// src/app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore';
import { Sparkles } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${API_URL}/api/v1/admin/auth/login`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      const { access_token } = data;

      const userResponse = await fetch(`${API_URL}/api/v1/admin/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!userResponse.ok) throw new Error('Failed to fetch user data');

      const userData = await userResponse.json();

      // Use the store's login function
      login(access_token, userData);

      // Redirect based on role
      if (userData.role === 'super_admin') {
        router.push('/admin/invitations');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
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
                Admin Login
              </h1>
              <p className="text-gray-600">Sign in to manage your institution</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="admin@institution.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                             transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="
                  w-full flex items-center justify-center
                  px-4 py-3
                  bg-gradient-to-r from-blue-600 to-cyan-600
                  hover:from-blue-700 hover:to-cyan-700
                  text-white font-semibold rounded-lg
                  transition-all duration-200
                  shadow-lg hover:shadow-xl
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transform hover:scale-[1.02]
                "
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need an account?{' '}
                <Link
                  href="/admin/register"
                  className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-cyan-700 transition-all"
                >
                  Register with invitation code
                </Link>
              </p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Regular admins: Register at{' '}
                <Link href="/admin/register" className="text-blue-600 hover:text-blue-700">
                  /admin/register
                </Link>
                {' '}with your invitation code
              </p>
            </div>
          </CardBody>
        </Card>

        {/* Back to home link */}
        <div className="mt-6 text-center">
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