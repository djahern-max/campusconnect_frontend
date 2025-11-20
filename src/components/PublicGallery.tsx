// src/components/PublicGallery.tsx
'use client';

import { useState, useEffect } from 'react';
import { useGallery } from '@/hooks/useGallery';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import styles from './PublicGallery.module.css';

interface PublicGalleryProps {
    institutionId?: number;
    ipedsId?: number;
    scholarshipId?: number;
    showFeaturedFirst?: boolean;
    className?: string;
}

export default function PublicGallery({
    institutionId,
    ipedsId,
    scholarshipId,
    showFeaturedFirst = true,
    className = '',
}: PublicGalleryProps) {
    const {
        images,
        featuredImage,
        loading,
        error,
        isEmpty,
    } = useGallery({
        autoLoad: true,
        institutionId,
        ipedsId,
        scholarshipId,
        isPublic: true,
    });

    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [touchStart, setTouchStart] = useState<number | null>(null);

    // Sort images to show featured first if enabled
    const sortedImages = showFeaturedFirst && featuredImage
        ? [featuredImage, ...images.filter(img => img.id !== featuredImage.id)]
        : images;

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
    };

    const closeLightbox = () => {
        setLightboxIndex(null);
    };

    const nextImage = () => {
        if (lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex + 1) % sortedImages.length);
        }
    };

    const prevImage = () => {
        if (lightboxIndex !== null) {
            setLightboxIndex((lightboxIndex - 1 + sortedImages.length) % sortedImages.length);
        }
    };

    // Keyboard navigation
    useEffect(() => {
        if (lightboxIndex === null) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxIndex]);

    // Touch navigation
    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.touches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return;

        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                nextImage(); // Swipe left
            } else {
                prevImage(); // Swipe right
            }
        }

        setTouchStart(null);
    };

    if (loading) {
        return (
            <div className={`${styles.container} ${className}`}>
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                    <p>Loading gallery...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`${styles.container} ${className}`}>
                <div className={styles.error}>
                    <p>Failed to load gallery</p>
                </div>
            </div>
        );
    }

    if (isEmpty) {
        return null; // Don't show anything if no images
    }

    return (
        <>
            <div className={`${styles.container} ${className}`}>
                {/* Featured Image Hero */}
                {featuredImage && showFeaturedFirst && (
                    <div className={styles.featuredSection}>
                        <div className={styles.featuredImageWrapper} onClick={() => openLightbox(0)}>
                            <Image
                                src={featuredImage.url}
                                alt={featuredImage.caption || 'Featured image'}
                                fill
                                className={styles.featuredImage}
                                priority
                            />
                            <button className={styles.expandButton} aria-label="View full size">
                                <Maximize2 size={20} />
                            </button>
                        </div>
                        {featuredImage.caption && (
                            <p className={styles.featuredCaption}>{featuredImage.caption}</p>
                        )}
                    </div>
                )}

                {/* Gallery Grid */}
                {sortedImages.length > 1 && (
                    <div className={styles.galleryGrid}>
                        {sortedImages.slice(showFeaturedFirst && featuredImage ? 1 : 0).map((image, idx) => {
                            const actualIndex = showFeaturedFirst && featuredImage ? idx + 1 : idx;

                            return (
                                <div
                                    key={image.id}
                                    className={styles.galleryItem}
                                    onClick={() => openLightbox(actualIndex)}
                                >
                                    <div className={styles.imageWrapper}>
                                        <Image
                                            src={image.url}
                                            alt={image.caption || `Gallery image ${actualIndex + 1}`}
                                            fill
                                            className={styles.galleryImage}
                                        />
                                        <div className={styles.imageOverlay}>
                                            <Maximize2 size={20} />
                                        </div>
                                    </div>
                                    {image.caption && (
                                        <p className={styles.imageCaption}>{image.caption}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div
                    className={styles.lightbox}
                    onClick={closeLightbox}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    <button
                        className={styles.closeButton}
                        onClick={closeLightbox}
                        aria-label="Close"
                    >
                        <X size={24} />
                    </button>

                    <button
                        className={`${styles.navButton} ${styles.navButtonPrev}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            prevImage();
                        }}
                        aria-label="Previous image"
                    >
                        <ChevronLeft size={32} />
                    </button>

                    <button
                        className={`${styles.navButton} ${styles.navButtonNext}`}
                        onClick={(e) => {
                            e.stopPropagation();
                            nextImage();
                        }}
                        aria-label="Next image"
                    >
                        <ChevronRight size={32} />
                    </button>

                    <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.lightboxImageWrapper}>
                            <Image
                                src={sortedImages[lightboxIndex].url}
                                alt={sortedImages[lightboxIndex].caption || `Image ${lightboxIndex + 1}`}
                                fill
                                className={styles.lightboxImage}
                                quality={100}
                            />
                        </div>

                        {sortedImages[lightboxIndex].caption && (
                            <div className={styles.lightboxCaption}>
                                <p>{sortedImages[lightboxIndex].caption}</p>
                            </div>
                        )}

                        <div className={styles.lightboxCounter}>
                            {lightboxIndex + 1} / {sortedImages.length}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
