'use client';

import Image from 'next/image';
import { useState, useCallback, useEffect, useRef } from 'react';
import { getCdnUrl } from '@/lib/utils';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { CameraIcon, PlayIcon } from '@heroicons/react/24/solid';

type MediaItem = {
  type: 'image' | 'video';
  url: string;
};

interface Props {
  images: string[];
  videos?: string[];
  title: string;
}

export function PropertyGallery({ images, videos = [], title }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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
    setTimeout(() => setIsTransitioning(false), 400);
  }, [mediaCount]);

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  // Reset video state when media changes
  useEffect(() => {
    setIsPlaying(false);
    setIsMuted(true);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    if (lightboxVideoRef.current) {
      lightboxVideoRef.current.pause();
      lightboxVideoRef.current.currentTime = 0;
    }
  }, [currentIndex]);

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

  /** Renders a media item (image or video) for the gallery grid */
  function renderMediaThumb(media: MediaItem, index: number, sizes: string, priority = false) {
    if (media.type === 'video') {
      return (
        <div className="relative w-full h-full">
          <video
            src={getCdnUrl(media.url)}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>
      );
    }
    return (
      <Image
        src={getCdnUrl(media.url)}
        alt={`${title} ${index + 1}`}
        fill
        className="object-cover hover:scale-105 transition-transform duration-500"
        priority={priority}
        sizes={sizes}
      />
    );
  }

  return (
    <>
      {/* Desktop: Mosaic for 5+ media */}
      {mediaCount >= 5 ? (
        <div className="hidden sm:grid grid-cols-4 grid-rows-2 gap-2 rounded-2xl overflow-hidden h-[420px] relative group">
          <div
            className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden"
            onClick={() => { setCurrentIndex(0); setLightboxOpen(true); }}
          >
            {renderMediaThumb(displayMedia[0], 0, '(min-width: 640px) 50vw', true)}
          </div>

          {displayMedia.slice(1, 5).map((media, i) => (
            <div
              key={i}
              className="relative cursor-pointer overflow-hidden"
              onClick={() => { setCurrentIndex(i + 1); setLightboxOpen(true); }}
            >
              {renderMediaThumb(media, i + 1, '(min-width: 640px) 25vw')}
              {i === 3 && mediaCount > 5 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-black/40 transition-colors">
                  <div className="text-center">
                    <CameraIcon className="h-6 w-6 text-white mx-auto mb-1" />
                    <span className="text-white font-semibold text-sm">
                      +{mediaCount - 5} more
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            onClick={() => { setCurrentIndex(0); setLightboxOpen(true); }}
            className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-ink-800 text-xs font-semibold px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5"
          >
            <CameraIcon className="h-4 w-4" />
            Show all {mediaCount} media
          </button>
        </div>
      ) : mediaCount >= 3 ? (
        <div className="hidden sm:grid grid-cols-3 gap-2 rounded-2xl overflow-hidden h-[380px] relative group">
          <div
            className="col-span-2 relative cursor-pointer overflow-hidden"
            onClick={() => { setCurrentIndex(0); setLightboxOpen(true); }}
          >
            {renderMediaThumb(displayMedia[0], 0, '66vw', true)}
          </div>
          <div className="flex flex-col gap-2">
            {displayMedia.slice(1, 3).map((media, i) => (
              <div
                key={i}
                className="relative flex-1 cursor-pointer overflow-hidden"
                onClick={() => { setCurrentIndex(i + 1); setLightboxOpen(true); }}
              >
                {renderMediaThumb(media, i + 1, '33vw')}
              </div>
            ))}
          </div>

          <button
            onClick={() => { setCurrentIndex(0); setLightboxOpen(true); }}
            className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm text-ink-800 text-xs font-semibold px-4 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5"
          >
            <CameraIcon className="h-4 w-4" />
            Show all {mediaCount} media
          </button>
        </div>
      ) : (
        <div className="hidden sm:grid grid-cols-1 gap-2 rounded-2xl overflow-hidden h-[380px] relative group">
          <div
            className="relative cursor-pointer overflow-hidden"
            onClick={() => setLightboxOpen(true)}
          >
            {renderMediaThumb(displayMedia[0], 0, '100vw', true)}
          </div>
        </div>
      )}

      {/* Mobile: Full-bleed swipeable carousel */}
      <div
        ref={containerRef}
        className="sm:hidden relative overflow-hidden aspect-[3/4] select-none"
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
            {displayMedia.map((media, i) => (
              <div
                key={i}
                className="relative min-w-full h-full flex-shrink-0"
                onClick={() => { setCurrentIndex(i); setLightboxOpen(true); }}
              >
                {media.type === 'video' ? (
                  <div className="relative w-full h-full">
                    <video
                      src={getCdnUrl(media.url)}
                      className="w-full h-full object-cover pointer-events-none"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="auto"
                    />
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
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {mediaCount > 1 && (
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/30 to-transparent pointer-events-none" />
        )}

        {mediaCount > 1 && (
          <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1">
            {displayMedia.slice(0, Math.min(mediaCount, 7)).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-5 bg-white'
                    : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
            {mediaCount > 7 && (
              <span className="text-[10px] text-white/70 ml-1 self-center">+{mediaCount - 7}</span>
            )}
          </div>
        )}

        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1">
          <CameraIcon className="h-3 w-3" />
          {currentIndex + 1}/{mediaCount}
        </div>
      </div>

      {/* Desktop thumbnail filmstrip */}
      {mediaCount > 5 && (
        <div className="hidden sm:flex gap-1.5 mt-3 overflow-x-auto pb-1 scrollbar-thin">
          {displayMedia.map((media, i) => (
            <button
              key={i}
              onClick={() => { setCurrentIndex(i); setLightboxOpen(true); }}
              className={`relative flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all duration-200 ${
                i === currentIndex
                  ? 'ring-2 ring-brand-500 ring-offset-1 scale-105'
                  : 'opacity-60 hover:opacity-100 hover:scale-105'
              }`}
            >
              {media.type === 'video' ? (
                <div className="relative w-full h-full">
                  <video
                    src={getCdnUrl(media.url)}
                    className="w-full h-full object-cover"
                    preload="metadata"
                    onLoadedMetadata={(e) => { e.currentTarget.currentTime = 1; }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <PlayIcon className="h-4 w-4 text-white" />
                  </div>
                </div>
              ) : (
                <Image
                  src={getCdnUrl(media.url)}
                  alt={`${title} thumb ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              )}
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
              {currentIndex + 1} / {mediaCount}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close gallery"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Main media area */}
          <div className="flex-1 relative flex items-center justify-center px-12">
            {mediaCount > 1 && (
              <button
                onClick={goPrev}
                className="absolute left-2 sm:left-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                aria-label="Previous"
              >
                <ChevronLeftIcon className="h-6 w-6 text-white" />
              </button>
            )}

            <div className={`relative w-full h-full transition-opacity duration-300 ${isTransitioning ? 'opacity-80' : 'opacity-100'}`}>
              {displayMedia[currentIndex].type === 'video' ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <video
                    ref={lightboxVideoRef}
                    src={getCdnUrl(displayMedia[currentIndex].url)}
                    className="max-w-full max-h-full rounded-lg cursor-pointer"
                    autoPlay
                    loop
                    playsInline
                    muted={isMuted}
                    preload="auto"
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
                      <div className="bg-white/90 rounded-full p-4 shadow-lg">
                        <PlayIcon className="w-12 h-12 text-brand-600" />
                      </div>
                    </div>
                  )}
                  {/* Video controls bar */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-4">
                    <button
                      onClick={() => togglePlayPause(lightboxVideoRef)}
                      className="text-white hover:text-gray-300 transition-colors"
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
                      className="text-white hover:text-gray-300 transition-colors"
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
                  sizes="100vw"
                />
              )}
            </div>

            {mediaCount > 1 && (
              <button
                onClick={goNext}
                className="absolute right-2 sm:right-6 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-colors"
                aria-label="Next"
              >
                <ChevronRightIcon className="h-6 w-6 text-white" />
              </button>
            )}
          </div>

          {/* Bottom thumbnail strip */}
          {mediaCount > 1 && (
            <div className="flex justify-center gap-1.5 px-4 py-3 overflow-x-auto">
              {displayMedia.map((media, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className={`relative flex-shrink-0 w-14 h-10 rounded-md overflow-hidden transition-all duration-200 ${
                    i === currentIndex
                      ? 'ring-2 ring-white scale-110'
                      : 'opacity-40 hover:opacity-80'
                  }`}
                >
                  {media.type === 'video' ? (
                    <div className="relative w-full h-full">
                      <video
                        src={getCdnUrl(media.url)}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        onLoadedMetadata={(e) => { e.currentTarget.currentTime = 1; }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <PlayIcon className="h-3 w-3 text-white" />
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={getCdnUrl(media.url)}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="56px"
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
