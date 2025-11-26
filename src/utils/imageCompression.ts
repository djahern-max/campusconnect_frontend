// src/utils/imageCompression.ts
// Image compression and validation utilities for CampusConnect

import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
    maxSizeMB?: number;
    maxWidthOrHeight?: number;
    useWebWorker?: boolean;
    quality?: number;
}

export interface ValidationResult {
    valid: boolean;
    error?: string;
    dimensions?: { width: number; height: number };
    sizeInMB?: number;
}

/**
 * Compress and optimize image before upload
 * Reduces file size while maintaining good quality
 */
export async function compressImage(
    file: File,
    options: CompressionOptions = {}
): Promise<File> {
    const defaultOptions = {
        maxSizeMB: 2,           // Maximum 2MB after compression
        maxWidthOrHeight: 2400, // Maximum dimension (maintains aspect ratio)
        useWebWorker: true,     // Use web worker for better performance
        quality: 0.85,          // 85% quality (sweet spot for web)
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
        const originalSizeMB = file.size / 1024 / 1024;
        console.log(`📸 Original file: ${originalSizeMB.toFixed(2)}MB`);

        const compressedFile = await imageCompression(file, finalOptions);

        const compressedSizeMB = compressedFile.size / 1024 / 1024;
        const savings = ((1 - compressedFile.size / file.size) * 100).toFixed(1);

        console.log(`✅ Compressed: ${compressedSizeMB.toFixed(2)}MB (saved ${savings}%)`);

        return compressedFile;
    } catch (error) {
        console.error('❌ Error compressing image:', error);
        throw new Error('Failed to compress image. Please try a different file.');
    }
}

/**
 * Get image dimensions from File object
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve({
                width: img.naturalWidth,
                height: img.naturalHeight,
            });
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}

/**
 * Validate image file before upload
 * Checks file type, size, and dimensions
 */
export async function validateImage(file: File): Promise<ValidationResult> {
    // Check if it's actually an image
    if (!file.type.startsWith('image/')) {
        return {
            valid: false,
            error: 'File must be an image (JPEG, PNG, WebP, etc.)',
        };
    }

    // Check file size BEFORE compression (max 10MB raw)
    const maxSizeBeforeCompression = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSizeBeforeCompression) {
        const sizeMB = (file.size / 1024 / 1024).toFixed(1);
        return {
            valid: false,
            error: `Image is too large (${sizeMB}MB). Maximum size is 10MB.`,
        };
    }

    try {
        // Get image dimensions
        const dimensions = await getImageDimensions(file);

        // Check minimum dimensions (prevent tiny images)
        // Allow landscape photos - reduced height requirement for wide banners
        const MIN_WIDTH = 800;
        const MIN_HEIGHT = 400; // Reduced from 600 to allow wide landscape photos

        if (dimensions.width < MIN_WIDTH || dimensions.height < MIN_HEIGHT) {
            return {
                valid: false,
                error: `Image is too small (${dimensions.width}×${dimensions.height}). Minimum size is ${MIN_WIDTH}×${MIN_HEIGHT}.`,
                dimensions,
            };
        }

        // Check maximum dimensions (prevent massive images)
        const MAX_DIMENSION = 10000;
        if (dimensions.width > MAX_DIMENSION || dimensions.height > MAX_DIMENSION) {
            return {
                valid: false,
                error: `Image is too large (${dimensions.width}×${dimensions.height}). Maximum dimension is ${MAX_DIMENSION}px.`,
                dimensions,
            };
        }

        return {
            valid: true,
            dimensions,
            sizeInMB: file.size / 1024 / 1024,
        };
    } catch (error) {
        console.error('Error validating image:', error);
        return {
            valid: false,
            error: 'Unable to read image file. Please try a different file.',
        };
    }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Check if browser supports WebP format
 */
export function supportsWebP(): Promise<boolean> {
    return new Promise((resolve) => {
        const webpData = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
        const img = new Image();

        img.onload = () => resolve(img.width === 1);
        img.onerror = () => resolve(false);
        img.src = webpData;
    });
}

/**
 * Compress image with progress callback
 */
export async function compressImageWithProgress(
    file: File,
    onProgress: (progress: number) => void,
    options: CompressionOptions = {}
): Promise<File> {
    const defaultOptions = {
        maxSizeMB: 2,
        maxWidthOrHeight: 2400,
        useWebWorker: true,
        quality: 0.85,
        onProgress: (p: number) => {
            onProgress(Math.round(p));
        },
    };

    const finalOptions = { ...defaultOptions, ...options };

    try {
        const compressedFile = await imageCompression(file, finalOptions);
        return compressedFile;
    } catch (error) {
        console.error('Error compressing image:', error);
        throw error;
    }
}