// src/components/ui/Navbar.tsx
'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { Button } from './Button';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const isTokenValid = useAuthStore((state) => state.isTokenValid);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthActionLoading, setIsAuthActionLoading] = useState(false);

  const isSuperAdmin = user?.role === 'super_admin';

  // ✨ NEW: Check token validity on component mount
  useEffect(() => {
    if (isAuthenticated && !isTokenValid()) {
      // Token expired - clear auth silently
      clearAuth();
    }
  }, [isAuthenticated, isTokenValid, clearAuth]);

  const handleAuthClick = () => {
    if (isAuthenticated) {
      setIsAuthActionLoading(true);
      clearAuth();
      router.push('/');
      setIsAuthActionLoading(false);
    } else {
      router.push('/admin/login');
    }
    setMobileMenuOpen(false);
  };

  const authButtonLabel = isAuthenticated
    ? isAuthActionLoading
      ? 'Logging out...'
      : 'Logout'
    : 'Login';

  const authButtonVariant = isAuthenticated ? 'ghost' : 'primary';

  // 🔥 FORCE HOVER EFFECTS (Button component sometimes overrides Tailwind)
  const authButtonExtraClasses = isAuthenticated
    ? `
        border border-gray-300 text-gray-700
        transition-all 
        hover:!bg-gray-100 hover:!border-gray-400
        hover:!shadow-sm hover:!scale-[1.02]
      `
    : `
        bg-gray-900 text-white shadow-sm 
        transition-all 
        hover:!bg-gray-800 hover:!shadow-lg hover:!scale-[1.03]
      `;

  // Active route detection
  const isActive = (path: string) =>
    pathname === path || pathname?.startsWith(path + '/');

  // Animated underline + improved hover styling
  const linkClass = (path: string) =>
    `
      text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors relative pb-1
      ${isActive(path)
      ? 'text-gray-900 font-semibold after:content-[""] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-full after:bg-gray-900'
      : 'after:content-[""] after:absolute after:left-0 after:-bottom-0.5 after:h-[2px] after:w-0 after:bg-gray-900 hover:after:w-full after:transition-all after:duration-150'
    }
    `;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-gray-900">
              CampusConnect
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/institutions" className={linkClass('/institutions')}>
              Institutions
            </Link>
            <Link href="/scholarships" className={linkClass('/scholarships')}>
              Scholarships
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href="/admin/dashboard"
                  className={linkClass('/admin/dashboard')}
                >
                  Dashboard
                </Link>

                {isSuperAdmin && (
                  <>
                    <Link
                      href="/admin/outreach"
                      className={linkClass('/admin/outreach')}
                    >
                      Outreach
                    </Link>
                    <Link
                      href="/admin/invitations"
                      className={linkClass('/admin/invitations')}
                    >
                      Invitations
                    </Link>
                  </>
                )}
              </>
            )}

            {/* Right side: email + auth */}
            <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-gray-200">
              {isAuthenticated && (
                <span className="text-sm text-gray-600 truncate max-w-[180px]">
                  {user?.email}
                </span>
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

          {/* Mobile Toggle */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            onClick={() => setMobileMenuOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-4 space-y-3">

            <Link
              href="/institutions"
              className={`block py-2 text-sm ${isActive('/institutions')
                ? 'text-gray-900 font-semibold'
                : 'text-gray-700 hover:text-gray-900'
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Institutions
            </Link>

            <Link
              href="/scholarships"
              className={`block py-2 text-sm ${isActive('/scholarships')
                ? 'text-gray-900 font-semibold'
                : 'text-gray-700 hover:text-gray-900'
                }`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Scholarships
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  href="/admin/dashboard"
                  className={`block py-2 text-sm ${isActive('/admin/dashboard')
                    ? 'text-gray-900 font-semibold'
                    : 'text-gray-700 hover:text-gray-900'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>

                {isSuperAdmin && (
                  <>
                    <Link
                      href="/admin/outreach"
                      className={`block py-2 text-sm ${isActive('/admin/outreach')
                        ? 'text-gray-900 font-semibold'
                        : 'text-gray-700 hover:text-gray-900'
                        }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Outreach
                    </Link>

                    <Link
                      href="/admin/invitations"
                      className={`block py-2 text-sm ${isActive('/admin/invitations')
                        ? 'text-gray-900 font-semibold'
                        : 'text-gray-700 hover:text-gray-900'
                        }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Invitations
                    </Link>
                  </>
                )}

                <div className="pt-2 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2 break-all">
                    {user?.email}
                  </p>
                </div>
              </>
            )}

            {/* Auth / Admin Login Button */}
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