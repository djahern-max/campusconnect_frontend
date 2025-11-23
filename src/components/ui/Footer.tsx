import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center mb-4">
              <Sparkles className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-xl font-bold">Abacadaba</h3>
            </div>
            <p className="text-gray-400 text-sm">
              The college & scholarship directory powered by institutions.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Part of the MagicScholar ecosystem
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Students</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/institutions" className="text-gray-400 hover:text-white transition">Browse Institutions</Link></li>
              <li><Link href="/scholarships" className="text-gray-400 hover:text-white transition">Find Scholarships</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">For Institutions</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/admin/login" className="text-gray-400 hover:text-white transition">Admin Login</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white transition">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-400 hover:text-white transition">About</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 Abacadaba. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}