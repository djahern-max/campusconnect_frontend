// src/components/GalleryThumbnail.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getInstitutionFeaturedImage, getScholarshipFeaturedImage } from '@/api/endpoints/gallery';
import { Image as ImageIcon } from 'lucide-react';
import styles from './GalleryThumbnail.module.css';

interface GalleryThumbnailProps {
    institutionId?: number;
    scholarshipId?: number;
    alt?: string;
    className?: string;
    priority?: boolean;
    fallbackSrc?: string;
}

/**
 * Component to display a featured image thumbnail
 * Automatically fetches and displays the featured image for an institution or scholarship
 */
export default function GalleryThumbnail({
    institutionId,
    scholarshipId,
    alt = 'Featured image',
    className = '',
    priority = false,
    fallbackSrc,
}: GalleryThumbnailProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(fallbackSrc || null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadFeaturedImage = async () => {
            try {
                setLoading(true);
                setError(false);

                let featured = null;

                if (institutionId) {
                    featured = await getInstitutionFeaturedImage(institutionId);
                } else if (scholarshipId) {
                    featured = await getScholarshipFeaturedImage(scholarshipId);
                }

                if (featured?.url) {
                    setImageUrl(featured.url);
                } else if (!fallbackSrc) {
                    setError(true);
                }
            } catch (err) {
                console.error('Error loading featured image:', err);
                if (!fallbackSrc) {
                    setError(true);
                }
            } finally {
                setLoading(false);
            }
        };

        if (institutionId || scholarshipId) {
            loadFeaturedImage();
        } else {
            setLoading(false);
        }
    }, [institutionId, scholarshipId, fallbackSrc]);

    if (loading) {
        return (
            <div className={`${styles.container} ${className}`}>
                <div className={styles.loading}>
                    <div className={styles.spinner} />
                </div>
            </div>
        );
    }

    if (error || !imageUrl) {
        return (
            <div className={`${styles.container} ${styles.placeholder} ${className}`}>
                <ImageIcon size={48} className={styles.placeholderIcon} />
            </div>
        );
    }

    return (
        <div className={`${styles.container} ${className}`}>
            <Image
                src={imageUrl}
                alt={alt}
                fill
                className={styles.image}
                priority={priority}
            />
        </div>
    );
}
