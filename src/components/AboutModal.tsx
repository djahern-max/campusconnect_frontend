'use client';

import { X } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">About Abacadaba</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6 text-gray-700">
            <p className="text-xl text-gray-600 leading-relaxed">
              Because choosing a college shouldn't be an A, B, C, D guess.
            </p>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Mission</h3>
              <p className="leading-relaxed">
                Abacadaba empowers colleges and scholarship organizations to showcase their offerings 
                to prospective students through rich, interactive profiles. We believe that finding 
                the right institution should be based on real information, not guesswork.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For Institutions</h3>
              <p className="leading-relaxed">
                Enhance your visibility with unlimited campus photos, virtual tour videos, 
                and detailed program descriptions. Connect with prospective students in a meaningful 
                way and showcase what makes your institution unique.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">For Students</h3>
              <p className="leading-relaxed">
                Explore hundreds of institutions and scholarships with comprehensive data, 
                virtual tours, and real campus imagery. Make informed decisions about your 
                educational future.
              </p>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Part of the MagicScholar ecosystem - making college planning magical.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
