//src/app/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Search,
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

  // Fetch featured images
  useEffect(() => {
    let isMounted = true;

    const fetchFeaturedImages = async () => {
      try {
        const response = await axios.get<FeaturedSlide[]>(
          `${API_URL}/api/v1/public/gallery/featured-images`
        );

        if (!isMounted) return;

        const data = Array.isArray(response.data) ? response.data : [];
        const shuffled = [...data].sort(() => Math.random() - 0.5);

        setFeaturedSlides(shuffled);
      } catch (error) {
        console.error('Failed to fetch featured images:', error);
        setFeaturedSlides([]);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchFeaturedImages();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-advance carousel
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
    setCurrentSlide((prev) => (prev - 1 + featuredSlides.length) % featuredSlides.length);
    setIsAutoPlaying(false);
  };

  // Loading state
  if (isLoading) {
    return (
      <section className="relative min-h-[650px] bg-gray-900" />
    );
  }

  // Empty state
  if (featuredSlides.length === 0) {
    return (
      <>
        <section className="relative min-h-[650px] bg-gray-900" />
        <RestOfPageContent />
      </>
    );
  }

  const activeSlide = featuredSlides[currentSlide];

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[650px] bg-gray-900 overflow-hidden flex items-center">

        {/* Carousel Images */}
        <div className="absolute inset-0">
          {featuredSlides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}

            >
              <Image
                src={slide.cdn_url || slide.image_url}
                alt={slide.caption || slide.entity_name}
                fill
                className="object-cover"
                priority={index < 3}
                quality={95}
                sizes="100vw"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/20" />
            </div>
          ))}
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 w-full">
          <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 mx-auto text-left">

            {activeSlide && (
              <div className="space-y-4 sm:space-y-5 md:space-y-6">

                {/* HERO TITLE */}
                <Link
                  href={
                    activeSlide.entity_type === 'institution'
                      ? `/institutions/${activeSlide.entity_ipeds_id}`
                      : `/scholarships/${activeSlide.entity_id}`
                  }
                  className="group inline-block"
                >
                  <h1
                    className="
    text-white/70
    italic
    text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl
    font-bold
    leading-tight
    drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]
    transition-colors
    group-hover:text-white
  "
                  >
                    {activeSlide.entity_name}
                    <ArrowRight
                      className="
      inline-block ml-3
      h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 lg:h-12 lg:w-12
      opacity-0 group-hover:opacity-100 group-hover:translate-x-2
      transition-all
    "
                    />
                  </h1>

                </Link>

                {/* LOCATION */}
                {activeSlide.entity_city && activeSlide.entity_state && (
                  <p className="text-white/60 text-xl sm:text-2xl md:text-3xl lg:text-4xl">
                    {activeSlide.entity_city}, {activeSlide.entity_state}
                  </p>
                )}

                {/* CAPTION */}
                {activeSlide.caption && (
                  <p className="text-white/55 text-lg sm:text-xl md:text-2xl italic max-w-4xl">
                    "{activeSlide.caption}"
                  </p>
                )}

                {/* CTA BUTTONS */}
                <div className="pt-3 sm:pt-4">
                  <div className="flex flex-col sm:flex-row gap-3">

                    <Link href="/institutions">
                      <Button
                        variant="primary"
                        size="lg"
                        className="w-full sm:w-auto bg-white !text-black hover:bg-gray-100 shadow-xl hover:scale-105 transition-all"
                      >
                        <Search className="mr-2 h-5 w-5 text-black" />
                        Explore Institutions
                      </Button>
                    </Link>

                    <Link href="/scholarships">
                      <Button
                        variant="secondary"
                        size="lg"
                        className="w-full sm:w-auto bg-white/20 !text-white border-2 border-white hover:bg-white/30 shadow-xl hover:scale-105 transition-all"
                      >
                        <DollarSign className="mr-2 h-5 w-5" />
                        Find Scholarships
                      </Button>
                    </Link>

                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Carousel Controls */}
        {featuredSlides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-4 rounded-full transition-all"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-4 rounded-full transition-all"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </section>

      <RestOfPageContent />
    </div>
  );
  function RestOfPageContent() {
    return (
      <section className="py-24 text-center relative overflow-hidden">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=2000&q=80)', // swap URL here
          }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />

        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <p className="text-2xl text-white mb-6 font-semibold">
            Represent a college or scholarship?
          </p>

          <Link href="/contact">
            <Button
              variant="primary"
              size="lg"
              className="w-full sm:w-auto bg-white !text-black hover:bg-gray-100 shadow-xl hover:scale-105 transition-all"
            >
              List Your Institution
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    );
  }
}
