'use client';

import { useInstitution } from '@/hooks/useInstitutions';
import { Button } from '@/components/ui/Button';
import { Card, CardBody, CardHeader } from '@/components/ui/Card';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Users, ExternalLink, ArrowLeft } from 'lucide-react';
import { use } from 'react';

export default function InstitutionDetailPage({ 
  params 
}: { 
  params: Promise<{ ipeds_id: string }> 
}) {
  const resolvedParams = use(params);
  const ipeds_id = parseInt(resolvedParams.ipeds_id);
  const { data: institution, isLoading, error } = useInstitution(ipeds_id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">Loading institution...</p>
        </div>
      </div>
    );
  }

  if (error || !institution) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Institution Not Found</h1>
          <p className="text-gray-600 mb-4">The institution you're looking for doesn't exist.</p>
          <Link href="/institutions">
            <Button variant="primary">Back to Institutions</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      {institution.primary_image_url && (
        <div className="relative h-64 sm:h-96 w-full">
          <Image
            src={institution.primary_image_url}
            alt={institution.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/institutions" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Institutions
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            {institution.name}
          </h1>
          
          <div className="flex flex-wrap gap-4 text-gray-600">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              {institution.city}, {institution.state}
            </div>
            
            {institution.student_faculty_ratio && (
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                {institution.student_faculty_ratio}:1 ratio
              </div>
            )}
          </div>

          <div className="mt-4">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              institution.control_type === 'PUBLIC' 
                ? 'bg-blue-100 text-blue-800'
                : 'bg-purple-100 text-purple-800'
            }`}>
              {institution.control_type.replace('_', ' ')}
            </span>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-2xl font-bold">About</h2>
              </CardHeader>
              <CardBody>
                <div className="space-y-4 text-gray-700">
                  <p>
                    Welcome to {institution.name}, located in {institution.city}, {institution.state}.
                  </p>
                  {institution.locale && (
                    <p>
                      <span className="font-semibold">Location Type:</span> {institution.locale}
                    </p>
                  )}
                </div>
              </CardBody>
            </Card>

            {/* Quick Stats */}
            {institution.student_faculty_ratio && (
              <Card>
                <CardHeader>
                  <h2 className="text-2xl font-bold">Quick Stats</h2>
                </CardHeader>
                <CardBody>
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-600">Student-Faculty Ratio</dt>
                      <dd className="text-2xl font-bold text-primary-600">
                        {institution.student_faculty_ratio}:1
                      </dd>
                    </div>
                    {institution.size_category && (
                      <div>
                        <dt className="text-sm text-gray-600">Size</dt>
                        <dd className="text-2xl font-bold text-primary-600">
                          {institution.size_category}
                        </dd>
                      </div>
                    )}
                  </dl>
                </CardBody>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-xl font-bold">Contact Information</h3>
              </CardHeader>
              <CardBody>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-600">Location</p>
                    <p className="font-medium">{institution.city}, {institution.state}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Type</p>
                    <p className="font-medium">{institution.control_type.replace('_', ' ')}</p>
                  </div>
                </div>
                
                <Button variant="accent" className="w-full mt-6">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Visit Website
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
