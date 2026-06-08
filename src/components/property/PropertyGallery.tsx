'use client';

import Image from 'next/image';
import { useState, useCallback, useEffect } from 'react';
import { getCdnUrl } from '@/lib/utils';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface Props {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const displayImages = images?.length > 0 ? images : ['/placeholder.jpg'];
  const imageCount = displayImages.length;

  const goTo = useCallback((index: number) => {
    setCurrentIndex((index + imageCount) % imageCount);
  }, [imageCount]);

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') setLightboxOpen(false);
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxOpen, goNext, goPrev]);

  return (
    <>
      {/* Carousel */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Main image */}
        <div
          className="relative aspect-[16/9] sm:aspect-[2.2/1] cursor-pointer"
          onClick={() => setLightboxOpen(true)}
        >
          <Image
            src={getCdnUrl(displayImages[currentIndex])}
            alt={`${title} - photo ${currentIndex + 1}`}
            fill
            className="object-cover"
            priority={currentIndex === 0}
          />

          {/* Gradient overlay at bottom for dots visibility */}
          {imageCount > 1 && (
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Navigation arrows */}
        {imageCount > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-5 w-5 text-ink-700" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-colors"
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-5 w-5 text-ink-700" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {imageCount > 1 && (
          <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5">
            {displayImages.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); goTo(i); }}
                className={`h-2 rounded-full transition-all ${
                  i === currentIndex
                    ? 'w-6 bg-white'
                    : 'w-2 bg-white/60 hover:bg-white/80'
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Image counter badge */}
        {imageCount > 1 && (
          <span className="absolute top-4 right-4 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {currentIndex + 1} / {imageCount}
          </span>
        )}
      </div>

      {/* Thumbnail strip (desktop only, when more than 3 images) */}
      {imageCount > 3 && (
        <div className="hidden sm:flex gap-2 mt-2 overflow-x-auto pb-1">
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden transition-all ${
                i === currentIndex
                  ? 'ring-2 ring-brand-600 ring-offset-1'
                  : 'opacity-70 hover:opacity-100'
              }`}
              aria-label={`View photo ${i + 1}`}
            >
              <Image
                src={getCdnUrl(img)}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
            aria-label="Close gallery"
          >
            <XMarkIcon className="h-8 w-8" />
          </button>

          {imageCount > 1 && (
            <button
              onClick={goPrev}
              className="absolute left-4 text-white/80 hover:text-white z-10"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-8 w-8" />
            </button>
          )}

          <Image
            src={getCdnUrl(displayImages[currentIndex])}
            alt={`${title} photo ${currentIndex + 1}`}
            fill
            className="object-contain p-8"
          />

          {imageCount > 1 && (
            <button
              onClick={goNext}
              className="absolute right-4 text-white/80 hover:text-white z-10"
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-8 w-8" />
            </button>
          )}

          <span className="absolute bottom-6 text-white/70 text-sm">
            {currentIndex + 1} / {imageCount}
          </span>
        </div>
      )}
    </>
  );
}
