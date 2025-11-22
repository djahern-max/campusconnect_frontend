//src/app/institutions/[ipeds_id]/page.tsx
'use client';

import { useInstitution } from '@/hooks/useInstitutions';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
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
        // Fetch both gallery and featured image
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner - Featured Image */}
      {featuredImage && (
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
            <p className="text-xl text-white/90 mt-2">
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

        {/* If no featured image, show name here */}
        {!featuredImage && (
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              {institution.name}
            </h1>
            <p className="text-xl text-gray-600">
              {institution.city}, {institution.state}
            </p>
          </div>
        )}

        {/* Gallery Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Campus Gallery</h2>

          {loadingGallery ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading gallery...</p>
            </div>
          ) : galleryImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryImages.map((image) => (
                <div
                  key={image.id}
                  className="relative group overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 bg-white"
                >
                  <div className="relative h-64 w-full">
                    <Image
                      src={image.thumbnail_url || image.image_url}
                      alt={image.caption || `Gallery image ${image.display_order}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>

                  {/* Caption Overlay */}
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <p className="text-white text-sm font-medium">{image.caption}</p>
                      {image.category && (
                        <p className="text-white/80 text-xs mt-1 capitalize">{image.category}</p>
                      )}
                    </div>
                  )}

                  {/* Featured Badge */}
                  {image.is_featured && (
                    <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded text-xs font-bold shadow-lg">
                      ⭐ Featured
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 text-lg">No gallery images available yet.</p>
              <p className="text-gray-400 text-sm mt-2">Images uploaded by the institution will appear here.</p>
            </div>
          )}
        </div>

        {/* Debug Info (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <details className="mt-8">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-900">
              Debug Information
            </summary>
            <div className="mt-2 p-4 bg-gray-100 rounded text-xs font-mono space-y-1">
              <p><strong>Institution ID:</strong> {institution.id}</p>
              <p><strong>IPEDS ID:</strong> {ipeds_id}</p>
              <p><strong>Gallery Images Count:</strong> {galleryImages.length}</p>
              <p><strong>Featured Image Set:</strong> {featuredImage ? 'Yes' : 'No'}</p>
              {featuredImage && (
                <p><strong>Featured Image Caption:</strong> {featuredImage.caption || 'None'}</p>
              )}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}