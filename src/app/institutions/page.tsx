//src/app/institutions/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Users, Search, Loader2, X } from 'lucide-react';
import { institutionsApi } from '@/api/endpoints/institutions';
import type { Institution } from '@/types';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const ITEMS_PER_PAGE = 24;

export default function InstitutionsPage() {
  const [selectedState, setSelectedState] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [searchResults, setSearchResults] = useState<Institution[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Determine if we're in search mode
  const isSearchMode = searchTerm.length >= 2;

  // Fetch institutions (paginated by state)
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const data = await institutionsApi.getInstitutions({
          state: selectedState || undefined,
          limit: ITEMS_PER_PAGE,
          page: currentPage  // ✅ CHANGED: Use 'page' instead of 'offset'
        });

        // ✅ CHANGED: Access the paginated response structure
        setInstitutions(data.institutions);
        setTotalCount(data.total);
        setHasMore(data.has_more);
      } catch (err) {
        console.error('Error fetching institutions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch institutions');
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch paginated data if NOT in search mode
    if (!isSearchMode) {
      fetchInstitutions();
    }
  }, [selectedState, currentPage, isSearchMode]);

  // Debounced search
  useEffect(() => {
    const searchInstitutions = async () => {
      if (searchTerm.length < 2) {
        setSearchResults([]);
        setShowSearchDropdown(false);
        return;
      }

      try {
        setIsSearching(true);
        const results = await institutionsApi.searchInstitutions({ q: searchTerm });
        setSearchResults(results);
        setShowSearchDropdown(results.length > 0);
      } catch (err) {
        console.error('Error searching institutions:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(() => {
      searchInstitutions();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleLoadMore = () => {
    if (hasMore && !isSearchMode) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchDropdown(false);
    setCurrentPage(1);
  };

  // Display logic
  const displayedInstitutions = isSearchMode ? searchResults : institutions;
  const displayTotal = isSearchMode ? searchResults.length : totalCount;
  const canLoadMore = !isSearchMode && hasMore;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Explore Institutions
          </h1>
          <p className="text-lg text-gray-600">
            Browse {totalCount.toLocaleString()} colleges and universities
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search with Dropdown */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
              <Input
                type="text"
                placeholder="Search by name or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowSearchDropdown(true);
                  }
                }}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 animate-spin text-gray-400" />
              )}

              {/* Search Dropdown */}
              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                  {searchResults.map((inst) => (
                    <Link
                      key={inst.ipeds_id}
                      href={`/institutions/${inst.ipeds_id}`}
                      onClick={() => setShowSearchDropdown(false)}
                      className="block px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{inst.name}</div>
                      <div className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin className="h-3 w-3 mr-1" />
                        {inst.city}, {inst.state}
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* No results message */}
              {searchTerm.length >= 2 && !isSearching && searchResults.length === 0 && (
                <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-sm text-gray-600">
                  No institutions found matching "{searchTerm}"
                </div>
              )}
            </div>

            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setCurrentPage(1);
              }}
              disabled={isSearchMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">All States</option>
              {US_STATES.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>
          </div>

          {(selectedState || searchTerm) && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedState && !isSearchMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedState('');
                    setCurrentPage(1);
                  }}
                  className="text-xs"
                >
                  State: {selectedState} ×
                </Button>
              )}
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="text-xs"
                >
                  Search: "{searchTerm}" ×
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading && !isSearchMode && (
          <div className="text-center py-12">
            <Loader2 className="inline-block animate-spin h-12 w-12 text-primary-600 mb-4" />
            <p className="text-gray-600">Loading institutions...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              variant="ghost"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !error && displayedInstitutions.length > 0 && (
          <>
            <div className="mb-4 text-gray-600">
              {isSearchMode ? (
                <>Found {searchResults.length.toLocaleString()} institution{searchResults.length !== 1 ? 's' : ''} matching "{searchTerm}"</>
              ) : (
                <>Showing {institutions.length.toLocaleString()} of {totalCount.toLocaleString()} institution{totalCount !== 1 ? 's' : ''}</>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedInstitutions.map((institution) => (
                <Link
                  key={institution.ipeds_id}
                  href={`/institutions/${institution.ipeds_id}`}
                >
                  <Card hover className="h-full">
                    {/* Image */}
                    {institution.primary_image_url && (
                      <div className="relative h-48 w-full">
                        <Image
                          src={institution.primary_image_url}
                          alt={institution.name}
                          fill
                          className="object-cover rounded-t-lg"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          unoptimized
                        />
                      </div>
                    )}

                    <CardBody>
                      <h3 className="font-semibold text-lg text-gray-900 mb-2 line-clamp-2">
                        {institution.name}
                      </h3>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          {institution.city}, {institution.state}
                        </div>

                        {institution.student_faculty_ratio && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-2 text-gray-400" />
                            {institution.student_faculty_ratio}:1 student-faculty ratio
                          </div>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Load More Button - Only show when NOT in search mode */}
            {canLoadMore && !isSearchMode && (
              <div className="mt-8 flex justify-center">
                <Button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  size="lg"
                  className="min-w-[200px]"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Load More
                      <span className="ml-2 text-sm opacity-75">
                        ({ITEMS_PER_PAGE} more)
                      </span>
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* End message */}
            {!hasMore && !isSearchMode && institutions.length > ITEMS_PER_PAGE && (
              <div className="mt-8 text-center text-gray-600">
                <p>You've reached the end of the results</p>
                <Button
                  variant="ghost"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="mt-2"
                >
                  Back to Top ↑
                </Button>
              </div>
            )}
          </>
        )}

        {!isLoading && !error && displayedInstitutions.length === 0 && !isSearchMode && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No institutions found{selectedState && ` in ${selectedState}`}.</p>
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedState('');
                setCurrentPage(1);
              }}
              className="mt-4"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}