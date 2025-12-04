// src/components/ui/Foot.tsx
// src/components/ui/Footer.tsx - Centered layout
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AboutModal } from '../AboutModal';

export function Footer() {
    const [showAboutModal, setShowAboutModal] = useState(false);

    return (
        <>
            <footer className="bg-gray-950 text-gray-300 mt-auto border-t border-gray-800">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    {/* Centered grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center sm:text-left max-w-3xl mx-auto">

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
                                        className="text-gray-400 hover:text-white transition"
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
                        <p>&copy; {new Date().getFullYear()} The College Directory. All rights reserved.</p>
                    </div>
                </div>
            </footer>

            <AboutModal isOpen={showAboutModal} onClose={() => setShowAboutModal(false)} />
        </>
    );
}