'use client';

import Image from 'next/image';
import { useState, useCallback, useEffect, useRef } from 'react';
import { getCdnUrl } from '@/lib/utils';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { CameraIcon } from '@heroicons/react/24/solid';

interface Props {
  images: string[];
  title: string;
}

export function PropertyGallery({ images, title }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayImages = images?.length > 0 ? images : ['/placeholder.jpg'];
  const imageCount = displayImages.length;

  const goTo = useCallback((index: number) => {
    setIsTransitioning(true);
    setCurrentIndex((index + imageCount) % imageCount);
    setTimeout(() => setIsTransitioning(false), 400);
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

  // Touch swipe handling
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setTouchDelta(0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const delta = e.touches[0].clientX - touchStart;
    // Clamp delta to prevent over-scrolling past first/last image
    const clamped =
      (currentIndex === 0 && delta > 0) ? delta * 0.3 :
      (currentIndex === imageCount - 1 && delta < 0) ? delta * 0.3 :
      delta;
    setTouchDelta(clamped);
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDelta) > 50) {
      if (touchDelta > 0 && currentIndex > 0) goPrev();
      else if (touchDelta < 0 && currentIndex < imageCount - 1) goNext();
    }
    setTouchStart(null);
    setTouchDelta(0);
  };

  return (
    <>
      {/* Airbnb-style mosaic for 5+ images on desktop, carousel on mobile */}
      {imageCount >= 5 ? (
        // Desktop: Mosaic grid (1 large + 4 small)
        <div className="hidden sm:grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[420px] relative group">
          {/* Main large image */}
          <div
            className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden"
            onClick={() => { setCurrentIndex(0); setLightboxOpen(true); }}
          >
            <Image
              src={getCdnUrl(displayImages[0])}
              alt={title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              priority
              sizes="(min-width: 640px) 50vw"
            />
          </div>

          {/* 4 smaller images */}
          {displayImages.slice(1, 5).map((img, i) => (
            <div
              key={i}
              className="relative cursor-pointer overflow-hidden"
              onClick={() => { setCurrentIndex(i + 1); setLightboxOpen(true); }}
            >
              <Image
                src={getCdnUrl(img)}
                alt={`${title} photo ${i + 2}`}
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
                sizes="(min-width: 640px) 25vw"
              />
              {/* Overlay on last image if more photos */}
              {i === 3 && imageCount > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-black/40 transition-colors">
                  <div className="text-center">
                    <CameraIcon className="h-6 w-6 text-white mx-auto mb-1" />
                    <span className="text-white font-semibold text-sm">
                      +{imageCount - 5} more
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* "Show all photos" button */}
          <button
            onClick={() => { setCurrentIndex(0); setLightboxOpen(true); }}
            className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-ink-800 text-xs font-semibold px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5"
          >
            <CameraIcon className="h-4 w-4" />
            Show all {imageCount} photos
          </button>
        </div>
      ) : imageCount >= 3 ? (
        // Desktop: 3-4 images in asymmetric grid
        <div className="hidden sm:grid grid-cols-3 gap-2 rounded-2xl overflow-hidden h-[380px] relative group">
          <div
            className="col-span-2 relative cursor-pointer overflow-hidden"
            onClick={() => { setCurrentIndex(0); setLightboxOpen(true); }}
          >
            <Image
              src={getCdnUrl(displayImages[0])}
              alt={title}
              fill
              className="object-cover hover:scale-105 transition-transform duration-500"
              priority
              sizes="66vw"
            />
          </div>
          <div className="flex flex-col gap-2">
            {displayImages.slice(1, 3).map((img, i) => (
              <div
                key={i}
                className="relative flex-1 cursor-pointer overflow-hidden"
                onClick={() => { setCurrentIndex(i + 1); setLightboxOpen(true); }}
              >
                <Image
                  src={getCdnUrl(img)}
                  alt={`${title} photo ${i + 2}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                  sizes="33vw"
                />
              </div>
            ))}
          </div>

          <button
            onClick={() => { setCurrentIndex(0); setLightboxOpen(true); }}
            className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-ink-800 text-xs font-semibold px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5"
          >
            <CameraIcon className="h-4 w-4" />
            Show all {imageCount} photos
          </button>
        </div>
      ) : (
        // Desktop: 1-2 images — full width
        <div className="hidden sm:grid grid-cols-1 gap-2 rounded-2xl overflow-hidden h-[380px] relative group">
          <div
            className="relative cursor-pointer overflow-hidden"
            onClick={() => setLightboxOpen(true)}
          >
            <Image
              src={getCdnUrl(displayImages[0])}
              alt={title}
              fill
              className="object-cover hover:scale-[1.02] transition-transform duration-500"
              priority
              sizes="100vw"
            />
          </div>
        </div>
      )}

      {/* Mobile: Swipeable full-bleed carousel */}
      <div
        ref={containerRef}
        className="sm:hidden relative rounded-2xl overflow-hidden aspect-[4/3] touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="flex h-full will-change-transform"
            style={{
              transform: `translateX(calc(-${currentIndex * 100}% + ${touchDelta}px))`,
              transition: touchStart !== null ? 'none' : 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {displayImages.map((img, i) => (
              <div key={i} className="relative min-w-full h-full flex-shrink-0">
                <Image
                  src={getCdnUrl(img)}
                  alt={`${title} photo ${i + 1}`}
                  fill
                  className="object-cover pointer-events-none"
                  priority={i === 0}
                  sizes="100vw"
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile dot indicators */}
        {imageCount > 1 && (
          <>
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1">
              {displayImages.slice(0, 7).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === currentIndex
                      ? 'w-5 bg-white'
                      : 'w-1.5 bg-white/50'
                  }`}
                />
              ))}
              {imageCount > 7 && (
                <span className="text-[10px] text-white/70 ml-1">+{imageCount - 7}</span>
              )}
            </div>
          </>
        )}

        {/* Photo count badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
          <CameraIcon className="h-3 w-3" />
          {currentIndex + 1}/{imageCount}
        </div>
      </div>

      {/* Desktop thumbnail filmstrip (for 5+ images) */}
      {imageCount > 5 && (
        <div className="hidden sm:flex gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-thin">
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => { setCurrentIndex(i); setLightboxOpen(true); }}
              className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all duration-200 ${
                i === currentIndex
                  ? 'ring-2 ring-brand-500 ring-offset-1 scale-105'
                  : 'opacity-60 hover:opacity-100 hover:scale-105'
              }`}
            >
              <Image
                src={getCdnUrl(img)}
                alt={`${title} thumb ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Immersive Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 text-white">
            <span className="text-sm font-medium">
              {currentIndex + 1} / {imageCount}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close gallery"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Main image area */}
          <div className="flex-1 relative flex items-center justify-center px-12">
            {imageCount > 1 && (
              <button
                onClick={goPrev}
                className="absolute left-2 sm:left-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeftIcon className="h-6 w-6 text-white" />
              </button>
            )}

            <div className={`relative w-full h-full transition-opacity duration-300 ${isTransitioning ? 'opacity-80' : 'opacity-100'}`}>
              <Image
                src={getCdnUrl(displayImages[currentIndex])}
                alt={`${title} photo ${currentIndex + 1}`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </div>

            {imageCount > 1 && (
              <button
                onClick={goNext}
                className="absolute right-2 sm:right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                aria-label="Next image"
              >
                <ChevronRightIcon className="h-6 w-6 text-white" />
              </button>
            )}
          </div>

          {/* Bottom thumbnail strip in lightbox */}
          {imageCount > 1 && (
            <div className="flex justify-center gap-1.5 px-4 py-3 overflow-x-auto">
              {displayImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`relative flex-shrink-0 w-14 h-10 rounded-md overflow-hidden transition-all duration-200 ${
                    i === currentIndex
                      ? 'ring-2 ring-white scale-110'
                      : 'opacity-40 hover:opacity-80'
                  }`}
                >
                  <Image
                    src={getCdnUrl(img)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
