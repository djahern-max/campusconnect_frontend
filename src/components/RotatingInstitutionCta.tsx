// src/components/RotatingInstitutionCta.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

const scholarshipImages = [
    {
        url: 'https://magicscholar-images.nyc3.cdn.digitaloceanspaces.com/scholarships/us_presidential_scholars_program.webp',
        alt: 'US Presidential Scholars Program',
    },

];

export function RotatingInstitutionCta() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(
            () => setIndex((prev) => (prev + 1) % scholarshipImages.length),
            5000
        );
        return () => clearInterval(interval);
    }, []);

    const activeIndex = index % scholarshipImages.length;

    return (
        <section className="relative overflow-hidden py-24 text-center h-[320px] sm:h-[380px] md:h-[420px] flex items-center justify-center">
            {/* Crossfading scholarship images */}
            <div className="absolute inset-0">
                {scholarshipImages.map((img, i) => (
                    <div
                        key={img.url}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === activeIndex ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        <Image
                            src={img.url}
                            alt={img.alt}
                            fill
                            className="object-cover"
                            sizes="100vw"
                            // helps Next prioritize the first one, doesn’t affect others
                            priority={i === 0}
                        />
                    </div>
                ))}
            </div>

            {/* Slightly lighter overlay so images don’t look dull/muddy */}
            <div className="absolute inset-0 bg-black/45" />

            {/* Foreground Content */}
            <div className="relative z-10">
                <p className="text-xl sm:text-2xl text-white mb-6 font-semibold">
                    Represent a college or scholarship?
                </p>
                <Link href="/contact">
                    <Button
                        variant="primary"
                        size="lg"
                        className="bg-white !text-black hover:bg-gray-100 shadow-xl hover:scale-105 transition-all"
                    >
                        List Your Institution
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
            </div>
        </section>
    );
}
