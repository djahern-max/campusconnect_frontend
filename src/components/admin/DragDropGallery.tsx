// src/components/admin/DragDropGallery.tsx
'use client';

import { useState, useCallback, useEffect } from 'react';
import { useGallery } from '@/hooks/useGallery';
import { GalleryImage } from '@/api/endpoints/gallery';
import Image from 'next/image';
import styles from './DragDropGallery.module.css';

interface DragDropGalleryProps {
    onImageClick?: (image: GalleryImage) => void;
    className?: string;
}

export default function DragDropGallery({ onImageClick, className = '' }: DragDropGalleryProps) {
    const {
        images,
        loading,
        uploading,
        uploadImage,
        deleteImage,
        setFeatured,
        reorder,
    } = useGallery({ autoLoad: true });

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [localImages, setLocalImages] = useState<GalleryImage[]>([]);

    // ✅ FIXED: Changed from useState to useEffect
    useEffect(() => {
        setLocalImages(images);
    }, [images]);

    const handleDragStart = (e: React.DragEvent, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';

        // Create a drag image
        const img = e.currentTarget as HTMLElement;
        e.dataTransfer.setDragImage(img, 20, 20);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        if (draggedIndex !== null && draggedIndex !== index) {
            setDragOverIndex(index);
        }
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();

        if (draggedIndex === null || draggedIndex === dropIndex) {
            setDraggedIndex(null);
            setDragOverIndex(null);
            return;
        }

        // Reorder the local array
        const newImages = [...images];
        const [draggedItem] = newImages.splice(draggedIndex, 1);
        newImages.splice(dropIndex, 0, draggedItem);

        // Optimistically update UI
        setLocalImages(newImages);

        // Send to backend
        const imageIds = newImages.map(img => img.id);
        await reorder(imageIds);

        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleDragEnd = () => {
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        await uploadImage({
            file,
            image_type: 'campus',
        });

        // Reset input
        e.target.value = '';
    };

    const displayImages = localImages.length > 0 ? localImages : images;

    return (
        <div className={`${styles.container} ${className}`}>
            <div className={styles.header}>
                <h3 className={styles.title}>Gallery Images ({displayImages.length})</h3>
                <label className={styles.uploadButton}>
                    <span>📤</span>
                    Add Images
                    <input
                        type="file"
                        accept="image/*"
                        multiple={false}
                        onChange={handleFileUpload}
                        className={styles.hiddenInput}
                        disabled={uploading}
                    />
                </label>
            </div>

            {loading && displayImages.length === 0 ? (
                <div className={styles.loading}>Loading gallery...</div>
            ) : displayImages.length === 0 ? (
                <div className={styles.empty}>
                    <p>No images yet. Upload your first image to get started!</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {displayImages.map((image, index) => (
                        <div
                            key={image.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`${styles.imageCard} ${draggedIndex === index ? styles.dragging : ''
                                } ${dragOverIndex === index ? styles.dragOver : ''}`}
                        >
                            <div className={styles.dragHandle} title="Drag to reorder">
                                <span style={{ fontSize: '1.25rem' }}>⋮⋮</span>
                            </div>

                            <div
                                className={styles.imageWrapper}
                                onClick={() => onImageClick?.(image)}
                            >
                                <Image
                                    src={image.url}
                                    alt={image.caption || `Image ${index + 1}`}
                                    fill
                                    className={styles.image}
                                />
                                {image.is_featured && (
                                    <div className={styles.featuredBadge}>
                                        <span>⭐</span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.actions}>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFeatured(image.id);
                                    }}
                                    className={styles.actionButton}
                                    title="Set as featured"
                                >
                                    {image.is_featured ? '⭐' : '☆'}
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onImageClick?.(image);
                                    }}
                                    className={styles.actionButton}
                                    title="Edit"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Delete this image?')) {
                                            deleteImage(image.id);
                                        }
                                    }}
                                    className={`${styles.actionButton} ${styles.deleteButton}`}
                                    title="Delete"
                                >
                                    🗑️
                                </button>
                            </div>

                            {image.caption && (
                                <div className={styles.caption}>
                                    <p>{image.caption}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {uploading && (
                <div className={styles.uploadingOverlay}>
                    <div className={styles.uploadingMessage}>
                        <div className={styles.spinner} />
                        <p>Uploading image...</p>
                    </div>
                </div>
            )}
        </div>
    );
}