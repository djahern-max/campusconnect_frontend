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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
        const shuffled = [...response.data].sort(() => Math.random() - 0.5);

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
        <section className="relative h-[700px] bg-gray-900 overflow-hidden">
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
        <section className="relative h-[700px] bg-gray-900 overflow-hidden">
          <div className="relative h-full flex flex-col justify-center">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
              <div className="text-white">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
                  Abacadaba
                </h1>
                <p className="text-2xl sm:text-3xl text-gray-300 mb-4 font-semibold">
                  The College & Scholarship Directory
                </p>
                <p className="text-xl text-gray-400 mb-4">
                  Explore 609 institutions and 126 scholarships
                </p>
                <p className="text-lg text-gray-500 mb-8">
                  Comprehensive information, virtual tours, and funding opportunities
                </p>

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
      <section className="relative h-[700px] bg-gray-900 overflow-hidden">
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
                className="object-cover"
                priority={index === 0}
                quality={85}
                sizes="100vw"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            </div>
          ))}
        </div>

        {/* Content Overlay */}
        <div className="relative h-full flex flex-col justify-end pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-white">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-lg">
                Find Your Perfect College
              </h1>

              {activeSlide && (
                <div className="mb-8">
                  <Link
                    href={
                      activeSlide.entity_type === 'institution'
                        ? `/institutions/${activeSlide.entity_ipeds_id}`
                        : `/scholarships/${activeSlide.entity_id}`
                    }
                    className="group inline-block"
                  >
                    <p className="text-xl sm:text-2xl text-gray-200 mb-2 group-hover:text-white transition-colors">
                      {activeSlide.entity_name}
                      <ArrowRight className="inline-block ml-2 h-6 w-6 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </p>
                  </Link>

                  {activeSlide.entity_city && activeSlide.entity_state && (
                    <p className="text-lg text-gray-300 mb-2">
                      {activeSlide.entity_city}, {activeSlide.entity_state}
                    </p>
                  )}

                  {activeSlide.caption && (
                    <p className="text-md text-gray-400 italic max-w-2xl">
                      "{activeSlide.caption}"
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/institutions">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto bg-white !text-black hover:bg-gray-100 shadow-lg"
                  >
                    <Search className="mr-2 h-5 w-5 text-black" />
                    Explore Institutions
                  </Button>
                </Link>
                <Link href="/scholarships">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto bg-white/90 !text-black border-2 border-white hover:bg-white shadow-lg"
                  >
                    <DollarSign className="mr-2 h-5 w-5 text-black" />
                    Find Scholarships
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Controls - Only show if multiple slides */}
        {featuredSlides.length > 1 && (
          <>
            {/* Previous/Next Buttons */}
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all hover:scale-110"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-sm transition-all hover:scale-110"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
              {featuredSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSlide(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`h-2 rounded-full transition-all ${index === currentSlide
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75 w-2'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === currentSlide ? 'true' : undefined}
                />
              ))}
            </div>

            {/* Image Counter */}
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium">
              {currentSlide + 1} / {featuredSlides.length}
            </div>
          </>
        )}
      </section>

      <RestOfPageContent />
    </div>
  );
}

// Extracted common page content
function RestOfPageContent() {
  return (
    <>
      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatCard number="609" label="Institutions" />
            <StatCard number="126" label="Scholarships" />
            <StatCard number="50" label="States Covered" />
            <StatCard number="100%" label="Free for Students" />
          </div>
        </div>
      </section>
      {/* For Institutions CTA */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            For Institutions &amp; Scholarships
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Create a rich, customizable page for your institution or scholarship.
            Showcase your campus with galleries, videos, and detailed information that
            helps students make informed decisions.
          </p>
          <div className="space-y-4">
            <p className="text-lg text-gray-600">
              Interested in listing your institution or scholarship?
            </p>
            <Link href="/contact">
              <Button
                variant="primary"
                size="lg"
                className="bg-gray-900 hover:bg-gray-800 !text-white shadow-lg"
              >
                Contact Us
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-600">
            Page customization available • 30-day free trial
          </p>
        </div>
      </section>

    </>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-8 rounded-lg border border-gray-200 hover:border-gray-400 transition-all hover:shadow-lg">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-5xl font-bold text-gray-900 mb-2">
        {number}
      </div>
      <div className="text-gray-600 text-lg">{label}</div>
    </div>
  );
}