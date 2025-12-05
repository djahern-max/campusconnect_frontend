//src/app/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Search,
  GraduationCap,
  DollarSign,
  ArrowRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Image from 'next/image';
import axios from 'axios';
import { API_URL } from '@/config/api';

// Featured image with entity info
interface FeaturedSlide {
  id: number;
  image_url: string;
  cdn_url: string;
  caption: string | null;
  entity_type: 'institution' | 'scholarship';
  entity_id: number;
  entity_name: string;
  entity_city: string | null;
  entity_state: string | null;
  entity_ipeds_id?: number; // For institutions only
}

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [featuredSlides, setFeaturedSlides] = useState<FeaturedSlide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all featured images in one API call
  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedImages = async () => {
      try {
        const response = await axios.get<FeaturedSlide[]>(
          `${API_URL}/api/v1/public/gallery/featured-images`
        );

        if (!isMounted) return;

        // Shuffle for variety on each page load
        const data = Array.isArray(response.data) ? response.data : [];
        const shuffled = [...data].sort(() => Math.random() - 0.5);

        setFeaturedSlides(shuffled);
      } catch (error) {
        console.error('Failed to fetch featured images:', error);
        // Empty array on error - will show empty state
        setFeaturedSlides([]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFeaturedImages();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (!isAutoPlaying || featuredSlides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredSlides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, featuredSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredSlides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide(
      (prev) => (prev - 1 + featuredSlides.length) % featuredSlides.length
    );
    setIsAutoPlaying(false);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div>
        <section className="relative min-h-[650px] sm:min-h-[600px] md:min-h-[650px] lg:min-h-[700px] bg-gray-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black animate-pulse" />
          <div className="relative h-full flex flex-col justify-end pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="text-white space-y-4">
                <div className="h-12 w-2/3 bg-white/10 rounded animate-pulse" />
                <div className="h-6 w-1/2 bg-white/10 rounded animate-pulse" />
                <div className="h-6 w-1/3 bg-white/10 rounded animate-pulse" />
                <div className="flex gap-4 mt-8">
                  <div className="h-12 w-48 bg-white/10 rounded animate-pulse" />
                  <div className="h-12 w-52 bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Empty state - no featured images yet
  if (featuredSlides.length === 0) {
    return (
      <div>
        <section className="relative min-h-[650px] sm:min-h-[600px] md:min-h-[650px] lg:min-h-[700px] bg-gray-900 overflow-hidden">
          <div className="relative h-full flex flex-col justify-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
              <div className="text-white">




                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/institutions">
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-full sm:w-auto bg-white !text-gray-900 hover:bg-gray-100 shadow-lg"
                    >
                      <Search className="mr-2 h-5 w-5" />
                      Explore Institutions
                    </Button>
                  </Link>
                  <Link href="/scholarships">
                    <Button
                      variant="secondary"
                      size="lg"
                      className="w-full sm:w-auto bg-white/90 !text-gray-900 border-2 border-white hover:bg-white shadow-lg"
                    >
                      <DollarSign className="mr-2 h-5 w-5" />
                      Find Scholarships
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <RestOfPageContent />
      </div>
    );
  }

  const activeSlide = featuredSlides[currentSlide];

  return (
    <div>


      {/* Hero Section with Featured Image Carousel */}
      <section className="relative min-h-[650px] sm:min-h-[600px] md:min-h-[650px] lg:min-h-[700px] bg-gray-900 overflow-hidden flex items-center justify-center">
        {/* Carousel Images */}
        <div className="absolute inset-0">
          {featuredSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
            >
              <Image
                src={slide.cdn_url || slide.image_url}
                alt={slide.caption || slide.entity_name}
                fill
                className="object-cover object-center"
                priority={index < 3}
                quality={95}
                sizes="100vw"
              />
              {/* Stronger gradient for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
            </div>
          ))}
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full">
          <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto text-center">
            {activeSlide ? (
              <div className="text-white space-y-4 sm:space-y-5 md:space-y-6">
                {/* College/Scholarship Name - THE HERO */}
                <Link
                  href={
                    activeSlide.entity_type === 'institution'
                      ? `/institutions/${activeSlide.entity_ipeds_id}`
                      : `/scholarships/${activeSlide.entity_id}`
                  }
                  className="group inline-block"
                >
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-3 sm:mb-4 drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] group-hover:text-gray-200 transition-colors leading-tight">
                    {activeSlide.entity_name}
                    <ArrowRight className="inline-block ml-3 sm:ml-4 h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                  </h1>
                </Link>
                {/* Location */}
                {activeSlide.entity_city && activeSlide.entity_state && (
                  <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-gray-100 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] font-light">
                    {activeSlide.entity_city}, {activeSlide.entity_state}
                  </p>
                )}
                {/* Caption */}
                {activeSlide.caption && (
                  <p className="text-lg sm:text-xl md:text-2xl text-gray-200 italic max-w-4xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)] leading-relaxed mx-auto">
                    "{activeSlide.caption}"
                  </p>
                )}
                {/* CTAs with enhanced backdrop */}
                <div className="pt-3 sm:pt-4">
                  <div className="inline-block bg-black/40 backdrop-blur-md p-4 sm:p-5 md:p-6 rounded-2xl border border-white/10">
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <Link href="/institutions">
                        <Button
                          variant="primary"
                          size="lg"
                          className="w-full sm:w-auto bg-white !text-black hover:bg-gray-100 shadow-xl hover:shadow-2xl transition-all hover:scale-105"
                        >
                          <Search className="mr-2 h-5 w-5 text-black" />
                          Explore Institutions
                        </Button>
                      </Link>
                      <Link href="/scholarships">
                        <Button
                          variant="secondary"
                          size="lg"
                          className="w-full sm:w-auto bg-white/10 !text-white border-2 border-white hover:bg-white/20 shadow-xl hover:shadow-2xl transition-all hover:scale-105 backdrop-blur-sm"
                        >
                          <DollarSign className="mr-2 h-5 w-5" />
                          Find Scholarships
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Fallback if no slide - shouldn't happen but good to have */}
                <div className="text-white">
                  <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6">
                    Discover Your Future
                  </h1>
                  <p className="text-2xl sm:text-3xl text-gray-200 mb-8">
                    Explore thousands of colleges and scholarships
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Carousel Controls - Only show if multiple slides */}
        {
          featuredSlides.length > 1 && (
            <>
              {/* Previous/Next Buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-4 rounded-full backdrop-blur-sm transition-all hover:scale-110 shadow-2xl"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6 md:h-8 md:w-8" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-4 rounded-full backdrop-blur-sm transition-all hover:scale-110 shadow-2xl"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6 md:h-8 md:w-8" />
              </button>

              {/* Dot Indicators */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-3">
                {featuredSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentSlide(index);
                      setIsAutoPlaying(false);
                    }}
                    className={`h-3 rounded-full transition-all ${index === currentSlide
                      ? 'bg-white w-12'
                      : 'bg-white/50 hover:bg-white/75 w-3'
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                    aria-current={index === currentSlide ? 'true' : undefined}
                  />
                ))}
              </div>

              {/* Image Counter */}
              <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-md text-white px-5 py-2.5 rounded-xl text-lg font-semibold shadow-2xl border border-white/10">
                {currentSlide + 1} / {featuredSlides.length}
              </div>
            </>
          )
        }
      </section >

      <RestOfPageContent />
    </div >
  );
}

function RestOfPageContent() {
  return (
    <>
      {/* Institutional CTA Section - Clean White */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          {/* Updated heading */}
          <p className="text-2xl font-medium text-gray-500 mb-6">
            Represent a college or scholarship?
          </p>

          <Link href="/contact">
            <Button
              variant="primary"
              size="lg"
              className="bg-gray-900 hover:bg-gray-800 !text-white shadow-lg hover:shadow-xl transition-all"
            >
              List Your Institution
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

        </div>
      </section>
    </>
  );
}