'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from './Button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthActionLoading, setIsAuthActionLoading] = useState(false);

  const isSuperAdmin = user?.role === 'super_admin';

  const handleAuthClick = () => {
    if (isAuthenticated) {
      setIsAuthActionLoading(true);
      clearAuth();
      setIsAuthActionLoading(false);
      router.push('/');
    } else {
      router.push('/admin/login');
    }
    setMobileMenuOpen(false);
  };

  const authButtonLabel = isAuthenticated
    ? isAuthActionLoading
      ? 'Logging out...'
      : 'Logout'
    : 'Admin Login';

  const authButtonVariant = isAuthenticated ? 'ghost' : 'primary';
  const authButtonExtraClasses = isAuthenticated ? '' : 'bg-gray-900 hover:bg-gray-800';

  // Helper to check if link is active
  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');
  const linkClass = (path: string) =>
    `text-gray-700 hover:text-gray-900 transition font-medium ${isActive(path) ? 'text-gray-900 font-semibold border-b-2 border-gray-900' : ''
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">CampusConnect</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/institutions" className={linkClass('/institutions')}>
              Institutions
            </Link>
            <Link href="/scholarships" className={linkClass('/scholarships')}>
              Scholarships
            </Link>

            {isAuthenticated && (
              <>
                <Link href="/admin/dashboard" className={linkClass('/admin/dashboard')}>
                  Dashboard
                </Link>

                {isSuperAdmin && (
                  <>
                    <Link href="/admin/outreach" className={linkClass('/admin/outreach')}>
                      Outreach
                    </Link>
                    <Link href="/admin/invitations" className={linkClass('/admin/invitations')}>
                      Invitations
                    </Link>
                  </>
                )}
              </>
            )}

            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
              {isAuthenticated && (
                <span className="text-sm text-gray-600">{user?.email}</span>
              )}
              <Button
                variant={authButtonVariant}
                size="sm"
                onClick={handleAuthClick}
                disabled={isAuthActionLoading}
                className={authButtonExtraClasses}
              >
                {authButtonLabel}
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
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
              className={`block py-2 transition font-medium ${isActive('/institutions') ? 'text-gray-900 font-semibold' : 'text-gray-700 hover:text-gray-900'
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Institutions
            </Link>
            <Link
              href="/scholarships"
              className={`block py-2 transition font-medium ${isActive('/scholarships') ? 'text-gray-900 font-semibold' : 'text-gray-700 hover:text-gray-900'
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Scholarships
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href="/admin/dashboard"
                  className={`block py-2 transition font-medium ${isActive('/admin/dashboard') ? 'text-gray-900 font-semibold' : 'text-gray-700 hover:text-gray-900'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>

                {isSuperAdmin && (
                  <>
                    <Link
                      href="/admin/outreach"
                      className={`block py-2 transition font-medium ${isActive('/admin/outreach') ? 'text-gray-900 font-semibold' : 'text-gray-700 hover:text-gray-900'
                        }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Outreach
                    </Link>
                    <Link
                      href="/admin/invitations"
                      className={`block py-2 transition font-medium ${isActive('/admin/invitations') ? 'text-gray-900 font-semibold' : 'text-gray-700 hover:text-gray-900'
                        }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Invitations
                    </Link>
                  </>
                )}

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">{user?.email}</p>
                </div>
              </>
            )}

            <Button
              variant={authButtonVariant}
              size="sm"
              onClick={handleAuthClick}
              disabled={isAuthActionLoading}
              className={`w-full ${authButtonExtraClasses}`}
            >
              {authButtonLabel}
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}