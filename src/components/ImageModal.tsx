// src/components/ImageModal.tsx
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useCallback } from 'react';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    images: Array<{
        id: number;
        cdn_url: string;
        caption: string | null;
        image_type: string | null;
    }>;
    currentIndex: number;
    onNavigate: (direction: 'prev' | 'next') => void;
}

export function ImageModal({
    isOpen,
    onClose,
    images,
    currentIndex,
    onNavigate
}: ImageModalProps) {
    const currentImage = images[currentIndex];

    // Keyboard navigation
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;

        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') onNavigate('prev');
        if (e.key === 'ArrowRight') onNavigate('next');
    }, [isOpen, onClose, onNavigate]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !currentImage) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90"
                onClick={onClose}
            />

            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 p-2 text-white hover:bg-white/10 rounded-full transition"
                aria-label="Close"
            >
                <X className="h-6 w-6" />
            </button>

            {/* Navigation buttons */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={() => onNavigate('prev')}
                        disabled={currentIndex === 0}
                        className="absolute left-4 z-10 p-2 text-white hover:bg-white/10 rounded-full transition disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Previous image"
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </button>

                    <button
                        onClick={() => onNavigate('next')}
                        disabled={currentIndex === images.length - 1}
                        className="absolute right-4 z-10 p-2 text-white hover:bg-white/10 rounded-full transition disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Next image"
                    >
                        <ChevronRight className="h-8 w-8" />
                    </button>
                </>
            )}

            {/* Image container */}
            <div className="relative z-10 max-w-7xl max-h-[90vh] mx-4">
                <img
                    src={currentImage.cdn_url}
                    alt={currentImage.caption || 'Gallery image'}
                    className="max-w-full max-h-[80vh] object-contain"
                />

                {/* Image info */}
                {(currentImage.caption || currentImage.image_type) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                        {currentImage.caption && (
                            <p className="text-white text-lg font-medium mb-1">
                                {currentImage.caption}
                            </p>
                        )}
                        <div className="flex items-center justify-between text-sm">
                            {currentImage.image_type && (
                                <span className="inline-block px-2 py-1 bg-primary-600 text-white rounded">
                                    {currentImage.image_type}
                                </span>
                            )}
                            {images.length > 1 && (
                                <span className="text-white/80">
                                    {currentIndex + 1} / {images.length}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}