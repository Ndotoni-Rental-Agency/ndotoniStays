'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import MediaUpload from '@/components/media/MediaUpload';
import { XMarkIcon, Bars2Icon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface MediaGridProps {
  images: string[];
  videos: string[];
  onChange: (images: string[], videos: string[]) => void;
  maxMedia?: number;
}

/**
 * Reusable drag-to-reorder media grid with upload support.
 * Supports both desktop (HTML5 DnD) and mobile (touch events with passive: false).
 */
export function MediaGrid({ images, videos, onChange, maxMedia = 10 }: MediaGridProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragItemRef = useRef<number | null>(null);

  // Touch state refs (use refs for imperative event handlers)
  const touchActiveRef = useRef(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Keep mediaItems in a ref so imperative handlers access latest value
  const mediaItemsRef = useRef<MediaItem[]>([]);

  // Keep images/videos in refs so upload callbacks always see latest values
  const imagesRef = useRef(images);
  const videosRef = useRef(videos);
  imagesRef.current = images;
  videosRef.current = videos;

  const mediaItems: MediaItem[] = [
    ...images.map(url => ({ type: 'image' as const, url })),
    ...videos.map(url => ({ type: 'video' as const, url })),
  ];
  mediaItemsRef.current = mediaItems;
  const totalMedia = mediaItems.length;

  function emitChange(items: MediaItem[]) {
    onChange(
      items.filter(m => m.type === 'image').map(m => m.url),
      items.filter(m => m.type === 'video').map(m => m.url),
    );
  }

  function handleMediaUploaded(fileUrl: string, _fileName: string, contentType: string) {
    if (totalMedia >= maxMedia) {
      setUploadError(`Maximum ${maxMedia} files allowed`);
      return;
    }
    setUploadError(null);

    if (contentType.startsWith('video/')) {
      onChange(imagesRef.current, [...videosRef.current, fileUrl]);
    } else {
      onChange([...imagesRef.current, fileUrl], videosRef.current);
    }
  }

  function removeItem(index: number) {
    emitChange(mediaItems.filter((_, i) => i !== index));
  }

  function reorder(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return;
    const newItems = [...mediaItemsRef.current];
    const [moved] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, moved);
    emitChange(newItems);
  }

  // === Desktop drag handlers (HTML5 DnD) ===
  const handleDragStart = (index: number) => {
    dragItemRef.current = index;
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const fromIndex = dragItemRef.current;
    if (fromIndex !== null && fromIndex !== dropIndex) {
      reorder(fromIndex, dropIndex);
    }
    resetDrag();
  };

  function resetDrag() {
    setDragIndex(null);
    setDragOverIndex(null);
    dragItemRef.current = null;
    touchActiveRef.current = false;
  }

  // === Mobile: imperative touch handlers registered with passive: false ===
  const getItemIndexFromPoint = useCallback((x: number, y: number): number | null => {
    if (!gridRef.current) return null;
    const children = Array.from(gridRef.current.children) as HTMLElement[];
    for (let i = 0; i < children.length; i++) {
      const rect = children[i].getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return i;
      }
    }
    return null;
  }, []);

  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;

    function onTouchStart(e: TouchEvent) {
      const touch = e.touches[0];
      const target = e.target as HTMLElement;

      // Only activate drag from the grid items, not the remove button
      if (target.closest('button')) return;

      const index = getItemIndexFromPoint(touch.clientX, touch.clientY);
      if (index === null) return;

      touchStartPos.current = { x: touch.clientX, y: touch.clientY };
      touchActiveRef.current = false;

      // Long press to start drag
      longPressTimer.current = setTimeout(() => {
        touchActiveRef.current = true;
        dragItemRef.current = index;
        setDragIndex(index);
        if (navigator.vibrate) navigator.vibrate(30);
      }, 250);
    }

    function onTouchMove(e: TouchEvent) {
      const touch = e.touches[0];

      // If not yet in drag mode, check if we should cancel the long press
      if (!touchActiveRef.current) {
        if (touchStartPos.current) {
          const dx = Math.abs(touch.clientX - touchStartPos.current.x);
          const dy = Math.abs(touch.clientY - touchStartPos.current.y);
          if (dx > 8 || dy > 8) {
            // User is scrolling, cancel long press
            if (longPressTimer.current) {
              clearTimeout(longPressTimer.current);
              longPressTimer.current = null;
            }
          }
        }
        return;
      }

      // We're actively dragging — prevent scroll
      e.preventDefault();

      const overIndex = getItemIndexFromPoint(touch.clientX, touch.clientY);
      setDragOverIndex(overIndex);
    }

    function onTouchEnd() {
      // Clear long press timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }

      // If we were dragging, perform the reorder
      if (touchActiveRef.current && dragItemRef.current !== null) {
        // Read dragOverIndex from the DOM state — we use a ref trick
        const grid = gridRef.current;
        if (grid) {
          // Find the element with the ring highlight
          const children = Array.from(grid.children) as HTMLElement[];
          let dropIdx: number | null = null;
          for (let i = 0; i < children.length; i++) {
            if (children[i].dataset.dragover === 'true') {
              dropIdx = i;
              break;
            }
          }
          if (dropIdx !== null && dropIdx !== dragItemRef.current) {
            reorder(dragItemRef.current, dropIdx);
          }
        }
      }

      touchActiveRef.current = false;
      touchStartPos.current = null;
      dragItemRef.current = null;
      setDragIndex(null);
      setDragOverIndex(null);
    }

    // Register with passive: false so we can preventDefault on touchmove
    grid.addEventListener('touchstart', onTouchStart, { passive: true });
    grid.addEventListener('touchmove', onTouchMove, { passive: false });
    grid.addEventListener('touchend', onTouchEnd, { passive: true });
    grid.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      grid.removeEventListener('touchstart', onTouchStart);
      grid.removeEventListener('touchmove', onTouchMove);
      grid.removeEventListener('touchend', onTouchEnd);
      grid.removeEventListener('touchcancel', onTouchEnd);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, [getItemIndexFromPoint]);

  return (
    <div className="space-y-3">
      {/* Hint */}
      {totalMedia > 0 && (
        <p className="text-xs text-ink-400">
          <span className="hidden sm:inline">Drag to reorder</span>
          <span className="sm:hidden">Long-press & drag to reorder</span>
          {' '}· First item becomes the cover
        </p>
      )}

      {/* Grid */}
      {totalMedia > 0 && (
        <div ref={gridRef} className="grid grid-cols-3 sm:grid-cols-4 gap-2 touch-none sm:touch-auto">
          {mediaItems.map((item, i) => (
            <div
              key={`${item.type}-${item.url}-${i}`}
              data-dragover={dragOverIndex === i && dragIndex !== i ? 'true' : 'false'}
              // Desktop DnD
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={resetDrag}
              className={`relative aspect-square rounded-xl overflow-hidden group select-none transition-all duration-150 ${
                dragIndex === i ? 'opacity-40 scale-90 ring-2 ring-brand-400' : ''
              } ${dragOverIndex === i && dragIndex !== i ? 'ring-2 ring-brand-500 ring-offset-2 scale-105' : ''} ${
                dragIndex === null ? 'cursor-grab active:cursor-grabbing' : ''
              }`}
            >
              {item.type === 'image' ? (
                <img src={item.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover pointer-events-none" />
              ) : (
                <>
                  <video
                    src={item.url}
                    className="w-full h-full object-cover pointer-events-none"
                    preload="metadata"
                    onLoadedMetadata={(e) => { e.currentTarget.currentTime = 1; }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                    <PlayIcon className="h-8 w-8 text-white/90" />
                  </div>
                </>
              )}

              {/* Drag handle */}
              <div className="absolute top-1.5 left-1.5 h-6 w-6 rounded-full bg-black/50 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <Bars2Icon className="h-3.5 w-3.5 text-white" />
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity z-10"
              >
                <XMarkIcon className="h-4 w-4 text-white" />
              </button>

              {/* Badges */}
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full font-medium">
                  Cover
                </span>
              )}
              {item.type === 'video' && i !== 0 && (
                <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full font-medium">
                  Video
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {totalMedia < maxMedia && (
        <MediaUpload
          onMediaUploaded={handleMediaUploaded}
          accept="image/*,video/*"
          multiple
          maxFiles={maxMedia - totalMedia}
        />
      )}

      {/* Error */}
      {uploadError && (
        <p className="text-xs text-red-500">{uploadError}</p>
      )}
    </div>
  );
}
