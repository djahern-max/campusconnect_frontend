// src/components/ui/Footer.tsx
'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { AboutModal } from '../AboutModal';

export function Footer() {
  const [showAboutModal, setShowAboutModal] = useState(false);

  return (
    <>
      <footer className="bg-gray-950 text-gray-300 mt-auto border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            {/* Brand */}
            <div>
              <div className="flex items-center mb-4 space-x-2 group">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-700 bg-gray-900">
                  <Sparkles className="h-4 w-4 text-gray-300 transition-transform group-hover:rotate-12 group-hover:text-white" />
                </span>

                <h3 className="text-xl font-semibold tracking-tight text-white">
                  <span className="text-2xl align-baseline mr-0.5">A</span>
                  <span className="text-lg text-gray-300">bacadaba</span>
                </h3>
              </div>

              <p className="text-gray-400 text-xs tracking-[0.17em] uppercase">
                Not a guessing game.
              </p>

              <p className="text-gray-500 text-xs mt-4">
                Part of the MagicScholar ecosystem.
              </p>
            </div>

            {/* Students */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm tracking-wide">
                For Students
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/institutions" className="text-gray-400 hover:text-white transition">
                    Browse Institutions
                  </Link>
                </li>
                <li>
                  <Link href="/scholarships" className="text-gray-400 hover:text-white transition">
                    Find Scholarships
                  </Link>
                </li>
              </ul>
            </div>

            {/* Institutions */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm tracking-wide">
                For Institutions
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/admin/login" className="text-gray-400 hover:text-white transition">
                    Admin Login
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition">
                    List Your Institution
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="font-semibold text-white mb-4 text-sm tracking-wide">
                Company
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setShowAboutModal(true)}
                    className="text-gray-400 hover:text-white transition text-left"
                  >
                    About
                  </button>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-400 hover:text-white transition">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
            <p>&copy; {new Date().getFullYear()} Abacadaba. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
    </>
  );
}