// src/app/institutions/[ipeds_id]/page.tsx
'use client';

import { useInstitution } from '@/hooks/useInstitutions';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  Users,
  MapPin,
  DollarSign,
  GraduationCap,
  AlertCircle,
  CheckCircle,
  Info,
  Shield
} from 'lucide-react';
import { use } from 'react';
import { publicGalleryApi, GalleryImage } from '@/api/endpoints/publicGallery';

export default function InstitutionDetailPage({
  params
}: {
  params: Promise<{ ipeds_id: string }>
}) {
  const resolvedParams = use(params);
  const ipeds_id = parseInt(resolvedParams.ipeds_id);
  const { data: institution, isLoading, error } = useInstitution(ipeds_id);

  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [featuredImage, setFeaturedImage] = useState<GalleryImage | null>(null);
  const [loadingGallery, setLoadingGallery] = useState(true);

  // Fetch gallery images when institution is loaded
  useEffect(() => {
    async function fetchGallery() {
      if (!institution?.id) return;

      setLoadingGallery(true);
      try {
        const [images, featured] = await Promise.all([
          publicGalleryApi.getInstitutionGallery(institution.id),
          publicGalleryApi.getInstitutionFeaturedImage(institution.id)
        ]);

        setGalleryImages(images);
        setFeaturedImage(featured);
      } catch (error) {
        console.error('Error fetching gallery:', error);
      } finally {
        setLoadingGallery(false);
      }
    }

    fetchGallery();
  }, [institution?.id]);

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

  // Helper function to format currency
  const formatCurrency = (amount: number | null | undefined) => {
    if (!amount) return null;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Component for displaying missing data with call-to-action
  const MissingDataIndicator = ({ label, compact = false }: { label: string; compact?: boolean }) => {
    if (compact) {
      return (
        <span className="text-gray-400 italic text-sm">Not available</span>
      );
    }
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-900">{label} not available</p>
            <p className="text-xs text-amber-700 mt-1">
              Are you from this institution?
              <Link href="/admin/login" className="underline font-medium ml-1 hover:text-amber-900">
                Claim this profile
              </Link> to update this information.
            </p>
          </div>
        </div>
      </div>
    );
  };


  // Helper function to check if cost data exists
  const hasCostData = () => {
    return Boolean(
      institution.tuition_in_state ||
      institution.tuition_out_of_state ||
      institution.tuition_private ||
      institution.room_and_board ||
      institution.room_cost ||
      institution.board_cost ||
      institution.application_fee_undergrad ||
      institution.application_fee_grad
    );
  };

  // Helper function to check if admissions data exists
  const hasAdmissionsData = () => {
    return Boolean(
      institution.acceptance_rate ||
      institution.sat_reading_25th ||
      institution.sat_math_25th ||
      institution.act_composite_25th
    );
  };

  // Helper function to check if academic data exists
  const hasAcademicData = () => {
    return Boolean(
      institution.student_faculty_ratio ||
      institution.size_category ||
      institution.locale
    );
  };

  // Calculate data completeness
  const calculateCompleteness = () => {
    const fields = [
      institution.website,
      institution.tuition_in_state || institution.tuition_out_of_state || institution.tuition_private,
      institution.room_and_board || institution.room_cost || institution.board_cost,
      institution.acceptance_rate,
      institution.student_faculty_ratio,
      institution.size_category,
      galleryImages.length > 0,
    ];
    const filledFields = fields.filter(Boolean).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const completeness = calculateCompleteness();
  const needsImprovement = completeness < 70;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner - Featured Image */}
      {featuredImage ? (
        <div className="relative h-64 sm:h-96 w-full">
          <Image
            src={featuredImage.image_url}
            alt={featuredImage.caption || institution.name}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Institution Name Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
              {institution.name}
            </h1>
            <p className="text-xl text-white/90 mt-2 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {institution.city}, {institution.state}
            </p>
          </div>
        </div>
      ) : (
        // Fallback gradient banner when no featured image
        <div className="relative h-64 sm:h-96 w-full bg-gradient-to-br from-primary-600 via-primary-500 to-accent-600">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
              {institution.name}
            </h1>
            <p className="text-xl text-white/90 mt-2 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {institution.city}, {institution.state}
            </p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/institutions"
          className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Institutions
        </Link>

        {/* Data Completeness Alert - Show if profile is incomplete */}
        {needsImprovement && (
          <div className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <Info className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">
                  This profile is {completeness}% complete
                </h3>
                <p className="text-sm text-amber-800 mb-3">
                  Some information about this institution is missing or not verified.
                  This could include costs, admissions data, campus images, or other important details.
                </p>
                <Link href="/admin/login">
                  <Button variant="primary" size="sm">
                    Are you from {institution.name}? Claim this profile
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Info Bar */}

        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Institution Type</p>
              <p className="text-lg font-semibold text-gray-900 capitalize flex items-center gap-2">
                {institution.control_type?.replace('_', ' ')}
                {/* Small verification badge */}
                {institution.data_source === 'admin' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    <CheckCircle className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </p>
            </div>
            {institution.website ? (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Website</p>
                <a
                  href={institution.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  Visit Website
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Website</p>
                <MissingDataIndicator label="" compact />
              </div>
            )}
            {institution.student_faculty_ratio ? (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Student-Faculty Ratio</p>
                <p className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {institution.student_faculty_ratio}:1
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Student-Faculty Ratio</p>
                <MissingDataIndicator label="" compact />
              </div>
            )}
          </div>
        </div>






        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Gallery Section */}
            {!loadingGallery && galleryImages.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Campus Gallery</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {galleryImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                    >
                      <div className="relative h-48 w-full">
                        <Image
                          src={image.thumbnail_url || image.image_url}
                          alt={image.caption || `Gallery image ${image.display_order}`}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>

                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <p className="text-white text-sm font-medium">{image.caption}</p>
                          {image.category && (
                            <p className="text-white/80 text-xs mt-1 capitalize">{image.category}</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : !loadingGallery ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Campus Gallery</h2>
                <MissingDataIndicator label="Campus images" />
              </div>
            ) : null}

            {/* Admissions Section */}
            {hasAdmissionsData() ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <GraduationCap className="h-6 w-6" />
                    Admissions
                  </h2>

                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {institution.acceptance_rate ? (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Acceptance Rate</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {institution.acceptance_rate}%
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">Acceptance Rate</p>
                      <MissingDataIndicator label="" compact />
                    </div>
                  )}

                  {(institution.sat_reading_25th && institution.sat_reading_75th) ||
                    (institution.sat_math_25th && institution.sat_math_75th) ? (
                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium text-gray-500 mb-3">SAT Score Range (25th-75th percentile)</p>
                      <div className="grid grid-cols-2 gap-4">
                        {institution.sat_reading_25th && institution.sat_reading_75th ? (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-600 mb-1">Reading</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {institution.sat_reading_25th} - {institution.sat_reading_75th}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-600 mb-1">Reading</p>
                            <MissingDataIndicator label="" compact />
                          </div>
                        )}
                        {institution.sat_math_25th && institution.sat_math_75th ? (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-600 mb-1">Math</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {institution.sat_math_25th} - {institution.sat_math_75th}
                            </p>
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-xs text-gray-600 mb-1">Math</p>
                            <MissingDataIndicator label="" compact />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null}

                  {institution.act_composite_25th && institution.act_composite_75th ? (
                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium text-gray-500 mb-2">ACT Composite (25th-75th percentile)</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-lg font-semibold text-gray-900">
                          {institution.act_composite_25th} - {institution.act_composite_75th}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="h-6 w-6" />
                  Admissions
                </h2>
                <MissingDataIndicator label="Admissions data" />
              </div>
            )}

            {/* Academic Information */}
            {hasAcademicData() ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Academic Information</h2>
                <div className="space-y-4">
                  {institution.size_category ? (
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-600">Size Category</span>
                      <span className="font-semibold text-gray-900 capitalize">
                        {institution.size_category.replace('_', ' ')}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-600">Size Category</span>
                      <MissingDataIndicator label="" compact />
                    </div>
                  )}
                  {institution.locale ? (
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-600">Location Type</span>
                      <span className="font-semibold text-gray-900 capitalize">
                        {institution.locale}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <span className="text-gray-600">Location Type</span>
                      <MissingDataIndicator label="" compact />
                    </div>
                  )}
                  {institution.student_faculty_ratio ? (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600">Student-Faculty Ratio</span>
                      <span className="font-semibold text-gray-900">
                        {institution.student_faculty_ratio}:1
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center py-3">
                      <span className="text-gray-600">Student-Faculty Ratio</span>
                      <MissingDataIndicator label="" compact />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Academic Information</h2>
                <MissingDataIndicator label="Academic data" />
              </div>
            )}
          </div>

          {/* Sidebar - Cost Information */}
          <div className="lg:col-span-1">
            {hasCostData() ? (
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <DollarSign className="h-6 w-6" />
                    Cost Information
                  </h2>
                </div>

                <div className="space-y-4 mt-4">
                  {/* Tuition */}
                  {(institution.tuition_in_state || institution.tuition_out_of_state || institution.tuition_private) ? (
                    <div className="pb-4 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-3">Tuition</p>
                      {institution.tuition_in_state ? (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">In-State</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(institution.tuition_in_state)}
                          </span>
                        </div>
                      ) : null}
                      {institution.tuition_out_of_state ? (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Out-of-State</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(institution.tuition_out_of_state)}
                          </span>
                        </div>
                      ) : null}

                    </div>
                  ) : (
                    <div className="pb-4 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-3">Tuition</p>
                      <MissingDataIndicator label="" compact />
                    </div>
                  )}

                  {/* Room & Board */}
                  {(institution.room_and_board || institution.room_cost || institution.board_cost) ? (
                    <div className="pb-4 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-3">Housing</p>
                      {institution.room_and_board ? (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Room & Board</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(institution.room_and_board)}
                          </span>
                        </div>
                      ) : null}
                      {institution.room_cost ? (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Room Only</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(institution.room_cost)}
                          </span>
                        </div>
                      ) : null}
                      {institution.board_cost ? (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Board Only</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(institution.board_cost)}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div className="pb-4 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-500 mb-3">Housing</p>
                      <MissingDataIndicator label="" compact />
                    </div>
                  )}

                  {/* Application Fees */}
                  {(institution.application_fee_undergrad || institution.application_fee_grad) ? (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-3">Application Fees</p>
                      {institution.application_fee_undergrad ? (
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Undergraduate</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(institution.application_fee_undergrad)}
                          </span>
                        </div>
                      ) : null}
                      {institution.application_fee_grad ? (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Graduate</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(institution.application_fee_grad)}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-3">Application Fees</p>
                      <MissingDataIndicator label="" compact />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-6 w-6" />
                  Cost Information
                </h2>
                <MissingDataIndicator label="Cost information" />
              </div>
            )}
          </div>
        </div>


        {/* Call to Action for Institution Admins */}
        {needsImprovement && (
          <div className="mt-12 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg shadow-lg p-8 text-white">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                Represent {institution.name}?
              </h2>
              <p className="text-lg mb-6 text-white/90">
                Help prospective students by keeping your institution's profile up-to-date with accurate costs,
                admissions data, campus images, and more.
              </p>
              <Link href="/admin/login">
                <Button
                  variant="primary"
                  size="lg"
                  className="bg-white text-primary-600 hover:bg-gray-100"
                >
                  Claim This Profile
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}