// src/app/scholarships/page.tsx
// src/app/scholarships/page.tsx
// src/app/scholarships/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, X, Loader2 } from 'lucide-react';
import scholarshipsApi from '@/api/endpoints/scholarships';
import ScholarshipCard from '@/components/public/ScholarshipCard';
import { Scholarship } from '@/types';
import { Button } from '@/components/ui/Button';

const ITEMS_PER_PAGE = 24;

interface ScholarshipListResponse {
  scholarships: Scholarship[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export default function ScholarshipsPage() {
  const router = useRouter();

  // Server-side state (from API)
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // UI state
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);

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

  // Fetch scholarships from API
  useEffect(() => {
    fetchScholarships();
  }, [selectedType, currentPage]);

  // Reset display count when search changes
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE);
  }, [searchTerm]);

  const fetchScholarships = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching scholarships:', { page: currentPage, limit: ITEMS_PER_PAGE, scholarship_type: selectedType });

      const data: ScholarshipListResponse = await scholarshipsApi.getAll({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        ...(selectedType && { scholarship_type: selectedType })
      });

      console.log('API Response:', data);

      setScholarships(data.scholarships);
      setTotalCount(data.total);
      setHasMore(data.has_more);
      setDisplayedCount(ITEMS_PER_PAGE);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
      setError('Failed to load scholarships. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering by search term
  const filteredScholarships = scholarships.filter(scholarship => {
    if (!searchTerm.trim()) return true;

    const search = searchTerm.toLowerCase();
    return (
      scholarship.title.toLowerCase().includes(search) ||
      scholarship.organization.toLowerCase().includes(search) ||
      scholarship.description?.toLowerCase().includes(search)
    );
  });

  const displayedScholarships = filteredScholarships.slice(0, displayedCount);
  const canLoadMore = displayedCount < filteredScholarships.length || hasMore;

  const handleLoadMore = () => {
    if (displayedCount < filteredScholarships.length) {
      // Still have items to display from current data
      setIsLoadingMore(true);
      setTimeout(() => {
        const newCount = displayedCount + ITEMS_PER_PAGE;
        setDisplayedCount(newCount);
        setIsLoadingMore(false);
      }, 300);
    } else if (hasMore) {
      // Need to fetch next page from API
      setCurrentPage(prev => prev + 1);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedType('');
    setCurrentPage(1);
  };

  const formatType = (type: string) => {
    return type.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const handleScholarshipClick = (scholarshipId: number) => {
    router.push(`/scholarships/${scholarshipId}`);
  };

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Loader2 className="inline-block animate-spin h-12 w-12 text-primary-600 mb-4" />
            <p className="text-gray-600">Loading scholarships...</p>
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
            Browse {totalCount.toLocaleString()} verified scholarships
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
                    onClick={() => {
                      setSelectedType(selectedType === type ? '' : type);
                      setCurrentPage(1); // Reset to page 1 when filter changes
                    }}
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

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => fetchScholarships()}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {filteredScholarships.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <p className="text-gray-600 text-lg">
                  {searchTerm
                    ? `No scholarships found matching "${searchTerm}".`
                    : 'No scholarships found matching your criteria.'
                  }
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
                  Showing {displayedScholarships.length} of {filteredScholarships.length} scholarship{filteredScholarships.length !== 1 ? 's' : ''}
                  {searchTerm && ` matching "${searchTerm}"`}
                </div>

                {/* Scholarship Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayedScholarships.map(scholarship => (
                    <ScholarshipCard
                      key={scholarship.id}
                      scholarship={scholarship}
                      onClick={() => handleScholarshipClick(scholarship.id)}
                    />
                  ))}
                </div>

                {/* Load More Button */}
                {canLoadMore && (
                  <div className="mt-8 flex justify-center">
                    <Button
                      onClick={handleLoadMore}
                      disabled={isLoadingMore || loading}
                      size="lg"
                      className="min-w-[200px]"
                    >
                      {isLoadingMore || loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Load More
                          <span className="ml-2 text-sm opacity-75">
                            ({displayedCount < filteredScholarships.length
                              ? Math.min(ITEMS_PER_PAGE, filteredScholarships.length - displayedCount)
                              : ITEMS_PER_PAGE} more)
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* End message */}
                {!canLoadMore && displayedCount > ITEMS_PER_PAGE && (
                  <div className="mt-8 text-center text-gray-600">
                    <p>You've reached the end of the results</p>
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="mt-2 text-primary-600 hover:text-primary-700"
                    >
                      Back to Top ↑
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}