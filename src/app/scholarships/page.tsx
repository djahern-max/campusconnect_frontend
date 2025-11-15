// src/app/scholarships/page.tsx
// src/app/scholarships/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, X } from 'lucide-react';
import scholarshipsApi from '@/api/endpoints/scholarships';
import ScholarshipCard from '@/components/public/ScholarshipCard';
import { Scholarship } from '@/types/api';

export default function ScholarshipsPage() {
  const router = useRouter();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  const scholarshipTypes = [
    'ACADEMIC_MERIT',
    'NEED_BASED',
    'STEM',
    'ARTS',
    'DIVERSITY',
    'ATHLETIC',
    'LEADERSHIP',
    'MILITARY',
    'CAREER_SPECIFIC'
  ];

  useEffect(() => {
    fetchScholarships();
  }, []);

  useEffect(() => {
    filterScholarships();
  }, [searchTerm, selectedType, scholarships]);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      const data = await scholarshipsApi.getAll({ limit: 500 });
      setScholarships(data);
      setFilteredScholarships(data);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterScholarships = () => {
    let filtered = scholarships;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.title.toLowerCase().includes(search) ||
        s.organization.toLowerCase().includes(search) ||
        s.description?.toLowerCase().includes(search)
      );
    }

    // Type filter
    if (selectedType) {
      filtered = filtered.filter(s => s.scholarship_type === selectedType);
    }

    setFilteredScholarships(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
  };

  const formatType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const handleScholarshipClick = (scholarshipId: number) => {
    router.push(`/scholarships/${scholarshipId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading scholarships...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Find Scholarships
          </h1>
          <p className="text-lg text-gray-600">
            Browse {scholarships.length} verified scholarships
            {filteredScholarships.length !== scholarships.length && (
              <span className="text-primary-600 ml-1">
                ({filteredScholarships.length} matching)
              </span>
            )}
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search scholarships..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center text-gray-700 hover:text-gray-900"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
              {(searchTerm || selectedType) && (
                <span className="ml-2 bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full">
                  Active
                </span>
              )}
            </button>

            {(searchTerm || selectedType) && (
              <button
                onClick={clearFilters}
                className="flex items-center text-sm text-gray-600 hover:text-gray-900"
              >
                <X className="h-4 w-4 mr-1" />
                Clear all
              </button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Scholarship Type</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {scholarshipTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(selectedType === type ? '' : type)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${selectedType === type
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {formatType(type)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {filteredScholarships.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-600 text-lg">
              No scholarships found matching your criteria.
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredScholarships.length} scholarship{filteredScholarships.length !== 1 ? 's' : ''}
            </div>

            {/* Scholarship Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredScholarships.map(scholarship => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                  onClick={() => handleScholarshipClick(scholarship.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}