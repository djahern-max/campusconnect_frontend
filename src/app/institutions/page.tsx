'use client';

import { useState } from 'react';
import { useInstitutions } from '@/hooks/useInstitutions';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Users, Search } from 'lucide-react';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

export default function InstitutionsPage() {
  const [selectedState, setSelectedState] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const { data: institutions, isLoading, error } = useInstitutions(selectedState || undefined);

  const filteredInstitutions = institutions?.filter(inst =>
    inst.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inst.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Explore Institutions
          </h1>
          <p className="text-lg text-gray-600">
            Browse {institutions?.length || 609} colleges and universities
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
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">Loading institutions...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading institutions. Please try again.</p>
          </div>
        )}

        {filteredInstitutions && (
          <>
            <div className="mb-4 text-gray-600">
              Showing {filteredInstitutions.length} institution{filteredInstitutions.length !== 1 ? 's' : ''}
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInstitutions.map((institution) => (
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
                        
                        <div className="mt-3">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            institution.control_type === 'PUBLIC' 
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {institution.control_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}

        {filteredInstitutions && filteredInstitutions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No institutions found matching your criteria.</p>
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
