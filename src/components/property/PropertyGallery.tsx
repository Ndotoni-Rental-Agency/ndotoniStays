'use client';

import Image from 'next/image';
import { useState } from 'react';
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

  return (
    <>
      {/* Grid layout */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 rounded-2xl overflow-hidden max-h-[480px]">
        {/* Main image */}
        <div
          className="sm:col-span-2 sm:row-span-2 relative aspect-[4/3] sm:aspect-auto cursor-pointer"
          onClick={() => { setCurrentIndex(0); setLightboxOpen(true); }}
        >
          <Image
            src={getCdnUrl(displayImages[0])}
            alt={title}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Secondary images */}
        {displayImages.slice(1, 5).map((img, i) => (
          <div
            key={i}
            className="relative hidden sm:block aspect-[4/3] cursor-pointer"
            onClick={() => { setCurrentIndex(i + 1); setLightboxOpen(true); }}
          >
            <Image
              src={getCdnUrl(img)}
              alt={`${title} photo ${i + 2}`}
              fill
              className="object-cover"
            />
            {i === 3 && displayImages.length > 5 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  +{displayImages.length - 5} more
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile image count */}
      <p className="sm:hidden text-center text-xs text-ink-400 mt-2">
        {displayImages.length} photos · Tap to view
      </p>

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

          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length)}
            className="absolute left-4 text-white/80 hover:text-white z-10"
            aria-label="Previous image"
          >
            <ChevronLeftIcon className="h-8 w-8" />
          </button>

          <Image
            src={getCdnUrl(displayImages[currentIndex])}
            alt={`${title} photo ${currentIndex + 1}`}
            fill
            className="object-contain p-8"
          />

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % displayImages.length)}
            className="absolute right-4 text-white/80 hover:text-white z-10"
            aria-label="Next image"
          >
            <ChevronRightIcon className="h-8 w-8" />
          </button>

          <span className="absolute bottom-6 text-white/70 text-sm">
            {currentIndex + 1} / {displayImages.length}
          </span>
        </div>
      )}
    </>
  );
}
