'use client';

interface GalleryImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function GalleryImage({ src, alt, className = '' }: GalleryImageProps) {
  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      crossOrigin="anonymous"
      loading="lazy"
    />
  );
}
