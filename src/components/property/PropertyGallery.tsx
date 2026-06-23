'use client';

import Image from 'next/image';
import { useState, useCallback, useEffect, useRef } from 'react';
import { getCdnUrl } from '@/lib/utils';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';

type MediaItem = {
  type: 'image' | 'video';
  url: string;
};

interface Props {
  images: string[];
  videos?: string[];
  title: string;
}

const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+';

export function PropertyGallery({ images, videos = [], title }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const lightboxVideoRef = useRef<HTMLVideoElement>(null);

  // Combine images and videos into a unified media array
  const mediaItems: MediaItem[] = [
    ...(images || []).map(url => ({ type: 'image' as const, url })),
    ...(videos || []).map(url => ({ type: 'video' as const, url })),
  ];

  const displayMedia = mediaItems.length > 0 ? mediaItems : [{ type: 'image' as const, url: '/placeholder.jpg' }];
  const mediaCount = displayMedia.length;

  const goTo = useCallback((index: number) => {
    setIsTransitioning(true);
    setIsPlaying(false);
    setCurrentIndex((index + mediaCount) % mediaCount);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [mediaCount]);

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  // Reset video state when index changes
  useEffect(() => {
    setIsPlaying(false);
    setIsMuted(true);
    if (lightboxVideoRef.current) {
      lightboxVideoRef.current.pause();
      lightboxVideoRef.current.currentTime = 0;
    }
  }, [currentIndex]);

  // Keyboard navigation in lightbox
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

  // Mobile touch swipe
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchDeltaRef = useRef(0);
  const isHorizontalRef = useRef(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    function onTouchStart(e: TouchEvent) {
      touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchDeltaRef.current = 0;
      isHorizontalRef.current = false;
      setTouchDelta(0);
      setTouchStart(e.touches[0].clientX);
    }

    function onTouchMove(e: TouchEvent) {
      if (!touchStartRef.current) return;
      const deltaX = e.touches[0].clientX - touchStartRef.current.x;
      const deltaY = e.touches[0].clientY - touchStartRef.current.y;

      if (!isHorizontalRef.current && Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) return;

      if (!isHorizontalRef.current) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          isHorizontalRef.current = true;
        } else {
          touchStartRef.current = null;
          return;
        }
      }

      e.preventDefault();
      const clamped =
        (currentIndex === 0 && deltaX > 0) ? deltaX * 0.3 :
        (currentIndex === mediaCount - 1 && deltaX < 0) ? deltaX * 0.3 :
        deltaX;
      touchDeltaRef.current = clamped;
      setTouchDelta(clamped);
    }

    function onTouchEnd() {
      const delta = touchDeltaRef.current;
      if (Math.abs(delta) > 50) {
        if (delta > 0 && currentIndex > 0) goPrev();
        else if (delta < 0 && currentIndex < mediaCount - 1) goNext();
      }
      touchStartRef.current = null;
      touchDeltaRef.current = 0;
      isHorizontalRef.current = false;
      setTouchStart(null);
      setTouchDelta(0);
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [currentIndex, mediaCount, goPrev, goNext]);

  const togglePlayPause = (ref: React.RefObject<HTMLVideoElement | null>) => {
    if (ref.current) {
      if (ref.current.paused) {
        ref.current.play();
        setIsPlaying(true);
      } else {
        ref.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = (ref: React.RefObject<HTMLVideoElement | null>) => {
    if (ref.current) {
      ref.current.muted = !ref.current.muted;
      setIsMuted(ref.current.muted);
    }
  };

  /** Renders a single media cell */
  function renderMedia(media: MediaItem, index: number, sizes: string, priority = false) {
    if (media.type === 'video') {
      return (
        <div className="absolute inset-0 bg-ink-900">
          <video
            src={getCdnUrl(media.url)}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            playsInline
            preload="metadata"
            onLoadedMetadata={(e) => { e.currentTarget.currentTime = 1; }}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
            <div className="bg-black/60 backdrop-blur-sm rounded-full p-3">
              <PlayIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      );
    }
    return (
      <Image
        src={getCdnUrl(media.url)}
        alt={`${title} ${index + 1}`}
        fill
        className="object-cover"
        priority={priority}
        sizes={sizes}
        quality={85}
        placeholder="blur"
        blurDataURL={BLUR_PLACEHOLDER}
      />
    );
  }

  return (
    <>
      {/* ═══════════════ DESKTOP: Airbnb-style bento grid ═══════════════ */}
      <div className="hidden sm:block">
        {mediaCount >= 5 ? (
          // 5-image grid: large hero left, 2×2 right
          <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden h-[400px] relative group cursor-pointer"
            onClick={() => { setCurrentIndex(0); setLightboxOpen(true); }}
          >
            {/* Hero (left half) */}
            <div className="relative overflow-hidden hover:brightness-90 transition-all duration-200">
              {renderMedia(displayMedia[0], 0, '(min-width: 1280px) 640px, 50vw', true)}
            </div>

            {/* Right side: 2×2 grid */}
            <div className="grid grid-cols-2 grid-rows-2 gap-2">
              {displayMedia.slice(1, 5).map((media, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden hover:brightness-90 transition-all duration-200"
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(i + 1); setLightboxOpen(true); }}
                >
                  {renderMedia(media, i + 1, '(min-width: 1280px) 320px, 25vw')}
                </div>
              ))}
            </div>

            {/* Show all photos button */}
            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(0); setLightboxOpen(true); }}
              className="absolute bottom-4 right-4 bg-white text-ink-900 text-sm font-medium px-4 py-2 rounded-lg border border-ink-900 hover:bg-ink-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Show all photos
            </button>
          </div>
        ) : mediaCount >= 3 ? (
          // 3-4 images: hero left (2/3), stacked right (1/3)
          <div className="grid grid-cols-3 gap-2 rounded-xl overflow-hidden h-[400px] relative group cursor-pointer"
            onClick={() => { setCurrentIndex(0); setLightboxOpen(true); }}
          >
            <div className="col-span-2 relative overflow-hidden hover:brightness-90 transition-all duration-200">
              {renderMedia(displayMedia[0], 0, '(min-width: 1280px) 850px, 66vw', true)}
            </div>
            <div className="flex flex-col gap-2">
              {displayMedia.slice(1, 3).map((media, i) => (
                <div
                  key={i}
                  className="relative flex-1 overflow-hidden hover:brightness-90 transition-all duration-200"
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(i + 1); setLightboxOpen(true); }}
                >
                  {renderMedia(media, i + 1, '(min-width: 1280px) 420px, 33vw')}
                </div>
              ))}
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); setCurrentIndex(0); setLightboxOpen(true); }}
              className="absolute bottom-4 right-4 bg-white text-ink-900 text-sm font-medium px-4 py-2 rounded-lg border border-ink-900 hover:bg-ink-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
              </svg>
              Show all photos
            </button>
          </div>
        ) : mediaCount === 2 ? (
          // 2 images: side by side
          <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden h-[400px] relative group cursor-pointer"
            onClick={() => { setCurrentIndex(0); setLightboxOpen(true); }}
          >
            {displayMedia.slice(0, 2).map((media, i) => (
              <div
                key={i}
                className="relative overflow-hidden hover:brightness-90 transition-all duration-200"
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); setLightboxOpen(true); }}
              >
                {renderMedia(media, i, '50vw', i === 0)}
              </div>
            ))}
          </div>
        ) : (
          // Single image
          <div className="rounded-xl overflow-hidden h-[400px] relative group cursor-pointer"
            onClick={() => setLightboxOpen(true)}
          >
            <div className="relative w-full h-full hover:brightness-90 transition-all duration-200">
              {renderMedia(displayMedia[0], 0, '100vw', true)}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════ MOBILE: Edge-to-edge swipeable carousel ═══════════════ */}
      <div
        ref={containerRef}
        className="sm:hidden relative overflow-hidden aspect-[4/3] select-none bg-ink-100"
        style={{ overscrollBehavior: 'none' }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="flex h-full will-change-transform"
            style={{
              transform: `translateX(calc(-${currentIndex * 100}% + ${touchDelta}px))`,
              transition: touchStart !== null ? 'none' : 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
            }}
          >
            {displayMedia.map((media, i) => {
              const isNearby = Math.abs(i - currentIndex) <= 1;
              return (
                <div
                  key={i}
                  className="relative min-w-full h-full flex-shrink-0"
                  onClick={() => { setCurrentIndex(i); setLightboxOpen(true); }}
                >
                  {!isNearby ? (
                    <div className="w-full h-full bg-ink-100" />
                  ) : media.type === 'video' ? (
                    <div className="absolute inset-0 bg-ink-900">
                      <video
                        src={getCdnUrl(media.url)}
                        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        autoPlay={i === currentIndex}
                        onLoadedMetadata={(e) => {
                          if (i !== currentIndex) e.currentTarget.currentTime = 1;
                        }}
                        onLoadedData={(e) => {
                          if (i === currentIndex) e.currentTarget.play().catch(() => {});
                        }}
                      />
                      {i !== currentIndex && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="bg-black/60 backdrop-blur-sm rounded-full p-3">
                            <PlayIcon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Image
                      src={getCdnUrl(media.url)}
                      alt={`${title} ${i + 1}`}
                      fill
                      className="object-cover pointer-events-none"
                      priority={i === 0}
                      sizes="100vw"
                      draggable={false}
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Gradient fade at bottom for dots */}
        {mediaCount > 1 && (
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        )}

        {/* Pagination dots */}
        {mediaCount > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
            {displayMedia.slice(0, Math.min(mediaCount, 5)).map((_, i) => (
              <span
                key={i}
                className={`h-[6px] rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-6 bg-white'
                    : 'w-[6px] bg-white/50'
                }`}
              />
            ))}
            {mediaCount > 5 && (
              <span className="text-[10px] text-white/80 ml-1 self-center font-medium">
                +{mediaCount - 5}
              </span>
            )}
          </div>
        )}

        {/* Counter badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
          {currentIndex + 1} / {mediaCount}
        </div>
      </div>

      {/* ═══════════════ LIGHTBOX: Full-screen gallery ═══════════════ */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 bg-white sm:bg-black flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-ink-100 sm:border-none bg-white sm:bg-transparent">
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 -ml-2 rounded-full hover:bg-ink-100 sm:hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5 text-ink-900 sm:text-white" />
            </button>
            <span className="text-sm font-medium text-ink-700 sm:text-white">
              {currentIndex + 1} / {mediaCount}
            </span>
            <div className="w-9" /> {/* Spacer for centering */}
          </div>

          {/* Main content area */}
          <div className="flex-1 relative flex items-center justify-center overflow-hidden">
            {/* Nav arrows */}
            {mediaCount > 1 && (
              <button
                onClick={goPrev}
                className="absolute left-3 sm:left-6 z-10 p-2 rounded-full bg-white sm:bg-white/10 shadow-lg sm:shadow-none hover:bg-ink-50 sm:hover:bg-white/20 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeftIcon className="h-5 w-5 text-ink-700 sm:text-white" />
              </button>
            )}

            {/* Media */}
            <div className={`relative w-full h-full max-w-5xl mx-auto px-4 sm:px-16 transition-opacity duration-200 ${isTransitioning ? 'opacity-60' : 'opacity-100'}`}>
              {displayMedia[currentIndex].type === 'video' ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={lightboxVideoRef}
                    src={getCdnUrl(displayMedia[currentIndex].url)}
                    className="max-w-full max-h-full rounded-lg sm:rounded-xl cursor-pointer"
                    loop
                    playsInline
                    muted={isMuted}
                    preload="metadata"
                    onClick={() => togglePlayPause(lightboxVideoRef)}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  {/* Play overlay */}
                  {!isPlaying && (
                    <div
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      onClick={() => togglePlayPause(lightboxVideoRef)}
                    >
                      <div className="bg-black/60 backdrop-blur-sm rounded-full p-5">
                        <PlayIcon className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  )}
                  {/* Controls */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-md rounded-full px-5 py-2.5 flex items-center gap-5">
                    <button
                      onClick={() => togglePlayPause(lightboxVideoRef)}
                      className="text-white hover:text-white/70 transition-colors"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/></svg>
                      ) : (
                        <PlayIcon className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => toggleMute(lightboxVideoRef)}
                      className="text-white hover:text-white/70 transition-colors"
                      aria-label={isMuted ? 'Unmute' : 'Mute'}
                    >
                      {isMuted ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <Image
                  src={getCdnUrl(displayMedia[currentIndex].url)}
                  alt={`${title} ${currentIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="(min-width: 1280px) 1024px, 100vw"
                  priority
                />
              )}
            </div>

            {mediaCount > 1 && (
              <button
                onClick={goNext}
                className="absolute right-3 sm:right-6 z-10 p-2 rounded-full bg-white sm:bg-white/10 shadow-lg sm:shadow-none hover:bg-ink-50 sm:hover:bg-white/20 transition-colors"
                aria-label="Next"
              >
                <ChevronRightIcon className="h-5 w-5 text-ink-700 sm:text-white" />
              </button>
            )}
          </div>

          {/* Bottom thumbnail strip */}
          {mediaCount > 1 && (
            <div className="hidden sm:flex justify-center gap-2 px-4 py-4 bg-black/80">
              {displayMedia.map((media, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`relative flex-shrink-0 w-16 h-11 rounded-md overflow-hidden transition-all duration-200 ${
                    i === currentIndex
                      ? 'ring-2 ring-white ring-offset-2 ring-offset-black opacity-100'
                      : 'opacity-40 hover:opacity-80'
                  }`}
                >
                  {media.type === 'video' ? (
                    <div className="relative w-full h-full">
                      <video
                        src={getCdnUrl(media.url)}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                        preload="metadata"
                        onLoadedMetadata={(e) => { e.currentTarget.currentTime = 1; }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <PlayIcon className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={getCdnUrl(media.url)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="64px"
                      loading="lazy"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
