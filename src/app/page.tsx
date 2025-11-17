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

interface Institution {
  id: number;
  ipeds_id: number;
  name: string;
  city: string;
  state: string;
  primary_image_url: string | null;
}

const FALLBACK_INSTITUTION: Institution = {
  id: 0,
  ipeds_id: 0,
  name: 'Discover Your Perfect College',
  city: 'Nationwide',
  state: 'US',
  primary_image_url: null
};

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [featuredInstitutions, setFeaturedInstitutions] = useState<Institution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all institutions with images
  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedInstitutions = async () => {
      try {
        const response = await axios.get<Institution[]>(`${API_URL}/api/v1/institutions`, {
          params: { limit: 100 }
        });

        if (!isMounted) return;

        const withImages = response.data.filter((inst) => inst.primary_image_url);

        if (withImages.length > 0) {
          // Shuffle for variety each time page loads (clone first to avoid mutating original)
          const shuffled = [...withImages].sort(() => Math.random() - 0.5);
          // Take up to 10 institutions
          setFeaturedInstitutions(shuffled.slice(0, 10));
        } else {
          // If no images, use fallback placeholder
          setFeaturedInstitutions([FALLBACK_INSTITUTION]);
        }
      } catch (error) {
        console.error('Failed to fetch institutions:', error);
        if (!isMounted) return;

        // Fallback to placeholder
        setFeaturedInstitutions([FALLBACK_INSTITUTION]);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFeaturedInstitutions();

    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (!isAutoPlaying || featuredInstitutions.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredInstitutions.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoPlaying, featuredInstitutions.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredInstitutions.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredInstitutions.length) % featuredInstitutions.length);
    setIsAutoPlaying(false);
  };

  if (isLoading) {
    // Skeleton hero while loading
    return (
      <div>
        <section className="relative h-[700px] bg-gray-900 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
          <div className="relative h-full flex flex-col justify-end pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="text-white">
                <div className="h-10 w-2/3 bg-white/10 rounded mb-4 animate-pulse" />
                <div className="h-6 w-1/2 bg-white/10 rounded mb-2 animate-pulse" />
                <div className="h-6 w-1/3 bg-white/10 rounded mb-8 animate-pulse" />
                <div className="flex flex-col sm:flex-row gap-4">
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

  const activeInstitution = featuredInstitutions[currentSlide];

  return (
    <div>
      {/* Hero Section with Carousel */}
      <section className="relative h-[700px] bg-gray-900 overflow-hidden">
        {/* Carousel Images */}
        <div className="absolute inset-0">
          {featuredInstitutions.map((institution, index) => (
            <div
              key={institution.id || index}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
            >
              {institution.primary_image_url ? (
                <>
                  <Image
                    src={institution.primary_image_url}
                    alt={institution.name}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    quality={75}
                    sizes="100vw"
                  />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                </>
              ) : (
                // Fallback gradient when no image
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
              )}
            </div>
          ))}
        </div>

        {/* Content Overlay */}
        <div className="relative h-full flex flex-col justify-end pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="text-white">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-4">
                Find Your Perfect College with CampusConnect
              </h1>
              {activeInstitution && (
                <>
                  <p className="text-xl sm:text-2xl text-gray-200 mb-2">
                    {activeInstitution.name}
                  </p>
                  <p className="text-lg text-gray-300 mb-8">
                    {activeInstitution.city}, {activeInstitution.state}
                  </p>
                </>
              )}

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/institutions">
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full sm:w-auto bg-white !text-black hover:bg-gray-100"
                  >
                    <Search className="mr-2 h-5 w-5 text-black" />
                    Explore Institutions
                  </Button>
                </Link>
                <Link href="/scholarships">
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto bg-white/90 !text-black border-2 border-white hover:bg-white"
                  >
                    <DollarSign className="mr-2 h-5 w-5 text-black" />
                    Find Scholarships
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Controls - Only show if more than 1 institution */}
        {featuredInstitutions.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-sm transition"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full backdrop-blur-sm transition"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {featuredInstitutions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSlide(index);
                    setIsAutoPlaying(false);
                  }}
                  className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
                    ? 'bg-white w-8'
                    : 'bg-white/50 hover:bg-white/75'
                    }`}
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={index === currentSlide ? 'true' : undefined}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Free Platform Message */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Free for Students, Forever
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            CampusConnect is completely free for students and families. We help you discover and explore
            institutions and scholarships across the United States—no hidden fees, no subscriptions.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore comprehensive information about colleges and funding opportunities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<GraduationCap className="h-12 w-12 text-gray-900" />}
              title="609 Institutions"
              description="Browse detailed profiles of colleges and universities across all 50 states, with photos, videos, and comprehensive information."
            />
            <FeatureCard
              icon={<DollarSign className="h-12 w-12 text-gray-900" />}
              title="126 Scholarships"
              description="Discover verified scholarships with detailed requirements, deadlines, and application information."
            />
            <FeatureCard
              icon={<ArrowRight className="h-12 w-12 text-gray-900" />}
              title="Rich Content"
              description="Virtual campus tours, image galleries, videos, and authentic insights from institutions themselves."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
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
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            For Institutions &amp; Scholarships
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Create a rich, customizable page for your institution or scholarship. Showcase your campus
            with galleries, videos, and detailed information that helps students make informed decisions.
          </p>
          <div className="space-y-4">
            <p className="text-lg text-gray-400">
              Interested in listing your institution or scholarship?
            </p>
            <Link href="/contact">
              <Button
                variant="primary"
                size="lg"
                className="bg-white hover:bg-gray-100"
                style={{ color: '#000000' }}
              >
                Contact Us
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-400">
            Page customization available • 30-day free trial
          </p>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-8 rounded-lg border border-gray-200 hover:border-gray-400 transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ number, label }: { number: string; label: string }) {
  return (
    <div>
      <div className="text-5xl font-bold text-gray-900 mb-2">{number}</div>
      <div className="text-gray-600 text-lg">{label}</div>
    </div>
  );
}
