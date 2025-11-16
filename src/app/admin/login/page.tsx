// src/app/admin/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { useAuthStore } from '@/stores/authStore'; // ADD THIS

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login); // ADD THIS
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

      const response = await fetch('http://localhost:8000/api/v1/admin/auth/login', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Login failed');

      const data = await response.json();
      const { access_token } = data;

      const userResponse = await fetch('http://localhost:8000/api/v1/admin/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      if (!userResponse.ok) throw new Error('Failed to fetch user data');

      const userData = await userResponse.json();

      // THIS IS THE KEY CHANGE - Use the store's login function
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <Card>
          <CardBody className="p-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Admin Login</h1>
              <p className="text-gray-600 text-sm">Sign in to manage your institution</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="dane@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="
                  w-full flex items-center justify-center
                  px-4 py-2
                  bg-gray-600 hover:bg-gray-700
                  text-white font-medium rounded-lg
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {isLoading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Need an account?{' '}
                <Link
                  href="/admin/register"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Register with invitation code
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Regular admins: Register at /admin/register with your invitation code
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}