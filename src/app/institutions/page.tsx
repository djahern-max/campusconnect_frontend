//src/app/institutions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Users, Search, Loader2 } from 'lucide-react';
import { institutionsApi } from '@/api/endpoints/institutions';
import type { Institution } from '@/types/api';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

const ITEMS_PER_PAGE = 24; // Show 24 institutions per page (8 rows of 3)

interface InstitutionListResponse {
  institutions: Institution[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export default function InstitutionsPage() {
  const [selectedState, setSelectedState] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch institutions
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching:', `http://localhost:8000/api/v1/institutions/?page=${currentPage}&limit=${ITEMS_PER_PAGE}`);

        const data: InstitutionListResponse = await institutionsApi.getAll({
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          ...(selectedState && { state: selectedState })
        });

        console.log('API Response:', data);

        // data is { institutions: [...], total, page, limit, has_more }
        setInstitutions(data.institutions);
        setTotalCount(data.total);
        setHasMore(data.has_more);
        setDisplayedCount(ITEMS_PER_PAGE);
      } catch (err) {
        console.error('Error fetching institutions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch institutions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInstitutions();
  }, [selectedState, currentPage]);

  // Separate effect for client-side search filtering
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE);
  }, [searchTerm]);

  const handleLoadMore = () => {
    if (displayedCount < filteredInstitutions.length) {
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

  // Filter institutions by search term (client-side)
  const filteredInstitutions = institutions.filter(institution => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      institution.name.toLowerCase().includes(search) ||
      institution.city.toLowerCase().includes(search)
    );
  });

  const displayedInstitutions = filteredInstitutions.slice(0, displayedCount);
  const canLoadMore = displayedCount < filteredInstitutions.length || hasMore;

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
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search by name or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* State Filter */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
              {selectedState && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedState('')}
                  className="text-xs"
                >
                  State: {selectedState} ×
                </Button>
              )}
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm('')}
                  className="text-xs"
                >
                  Search: "{searchTerm}" ×
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading && (
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

        {!isLoading && !error && filteredInstitutions.length > 0 && (
          <>
            <div className="mb-4 text-gray-600">
              Showing {displayedInstitutions.length.toLocaleString()} of {filteredInstitutions.length.toLocaleString()} institution{filteredInstitutions.length !== 1 ? 's' : ''}
              {searchTerm && ` matching "${searchTerm}"`}
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

                        <div className="mt-3 flex items-center justify-between">
                          {institution.control_type && (
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${institution.control_type === 'PUBLIC'
                              ? 'bg-blue-100 text-blue-800'
                              : institution.control_type === 'PRIVATE_NONPROFIT'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-gray-100 text-gray-800'
                              }`}>
                              {institution.control_type.replace(/_/g, ' ')}
                            </span>
                          )}

                          {/* Show completeness score as a badge */}
                          {institution.data_completeness_score !== undefined && (
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${institution.data_completeness_score >= 80
                              ? 'bg-green-100 text-green-800'
                              : institution.data_completeness_score >= 60
                                ? 'bg-blue-100 text-blue-800'
                                : institution.data_completeness_score >= 40
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                              {institution.data_completeness_score}% Complete
                            </span>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Load More Button */}
            {canLoadMore && !isLoading && (
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
                        ({displayedCount < filteredInstitutions.length
                          ? Math.min(ITEMS_PER_PAGE, filteredInstitutions.length - displayedCount)
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

        {!isLoading && !error && filteredInstitutions.length === 0 && institutions.length > 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No institutions found matching "{searchTerm}".</p>
            <Button
              variant="ghost"
              onClick={() => setSearchTerm('')}
              className="mt-4"
            >
              Clear search
            </Button>
          </div>
        )}

        {!isLoading && !error && institutions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No institutions found matching your criteria.</p>
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedState('');
                setSearchTerm('');
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