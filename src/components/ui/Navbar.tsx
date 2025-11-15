'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/hooks/useAuth';
import { Button } from './Button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const logout = useLogout();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is super admin
  const isSuperAdmin = user?.role === 'super_admin';

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-primary-600">CampusConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/institutions" className="text-gray-700 hover:text-primary-600 transition">
              Institutions
            </Link>
            <Link href="/scholarships" className="text-gray-700 hover:text-primary-600 transition">
              Scholarships
            </Link>

            {isAuthenticated ? (
              <>
                {/* All Admins */}
                <Link href="/admin/dashboard" className="text-gray-700 hover:text-primary-600 transition">
                  Dashboard
                </Link>

                {/* SUPER ADMIN ONLY */}
                {isSuperAdmin && (
                  <>
                    <Link href="/admin/outreach" className="text-gray-700 hover:text-primary-600 transition">
                      Outreach
                    </Link>
                    <Link href="/admin/invitations" className="text-gray-700 hover:text-primary-600 transition">
                      Invitations
                    </Link>
                  </>
                )}

                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">{user?.email}</span>
                  <Button variant="ghost" size="sm" onClick={logout}>
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/admin/register">
                  <Button variant="secondary" size="sm">
                    Get Started
                  </Button>
                </Link>
                <Link href="/admin/login">
                  <Button variant="primary" size="sm">
                    Admin Login
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-4 py-4 space-y-3">
            <Link
              href="/institutions"
              className="block text-gray-700 hover:text-primary-600 transition py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Institutions
            </Link>
            <Link
              href="/scholarships"
              className="block text-gray-700 hover:text-primary-600 transition py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Scholarships
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/admin/dashboard"
                  className="block text-gray-700 hover:text-primary-600 transition py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>

                {/* SUPER ADMIN ONLY - Mobile */}
                {isSuperAdmin && (
                  <>
                    <Link
                      href="/admin/outreach"
                      className="block text-gray-700 hover:text-primary-600 transition py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Outreach
                    </Link>
                    <Link
                      href="/admin/invitations"
                      className="block text-gray-700 hover:text-primary-600 transition py-2"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Invitations
                    </Link>
                  </>
                )}

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">{user?.email}</p>
                  <Button variant="ghost" size="sm" onClick={logout} className="w-full">
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Link href="/admin/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="secondary" size="sm" className="w-full">
                    Get Started
                  </Button>
                </Link>
                <Link href="/admin/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="sm" className="w-full">
                    Admin Login
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}