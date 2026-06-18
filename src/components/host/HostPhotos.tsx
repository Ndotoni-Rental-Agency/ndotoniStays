'use client';

import { useState, useRef } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { updateShortTermProperty } from '@/graphql/mutations';
import MediaUpload from '@/components/media/MediaUpload';
import { XMarkIcon, Bars2Icon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface Props {
  propertyId: string;
  initialImages: string[];
  initialVideos?: string[];
}

export function HostPhotos({ propertyId, initialImages, initialVideos = [] }: Props) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [videos, setVideos] = useState<string[]>(initialVideos);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragItemRef = useRef<number | null>(null);

  const maxMedia = 20;

  // Build unified media list
  const mediaItems: MediaItem[] = [
    ...images.map(url => ({ type: 'image' as const, url })),
    ...videos.map(url => ({ type: 'video' as const, url })),
  ];
  const totalMedia = mediaItems.length;

  function updateFromMedia(items: MediaItem[]) {
    setImages(items.filter(m => m.type === 'image').map(m => m.url));
    setVideos(items.filter(m => m.type === 'video').map(m => m.url));
    setHasChanges(true);
  }

  function handleMediaUploaded(fileUrl: string, _fileName: string, contentType: string) {
    if (totalMedia >= maxMedia) {
      toast.error(`Maximum ${maxMedia} files allowed`);
      return;
    }
    if (contentType.startsWith('video/')) {
      setVideos(prev => [...prev, fileUrl]);
    } else {
      setImages(prev => [...prev, fileUrl]);
    }
    setHasChanges(true);
  }

  function removeItem(index: number) {
    const newItems = mediaItems.filter((_, i) => i !== index);
    updateFromMedia(newItems);
  }

  // Drag handlers
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
    if (fromIndex === null || fromIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newItems = [...mediaItems];
    const [moved] = newItems.splice(fromIndex, 1);
    newItems.splice(dropIndex, 0, moved);
    updateFromMedia(newItems);

    setDragIndex(null);
    setDragOverIndex(null);
    dragItemRef.current = null;
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
    dragItemRef.current = null;
  };

  async function handleSave() {
    setSaving(true);
    try {
      await GraphQLClient.executeAuthenticated(updateShortTermProperty, {
        propertyId,
        input: {
          images,
          videos,
          thumbnail: images[0] || '',
        },
      });
      toast.success('Media updated');
      setHasChanges(false);
    } catch (err: any) {
      console.error('Failed to save media:', err);
      toast.error(err?.message || 'Failed to save media');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5 sm:space-y-6 pb-24 sm:pb-0">
      {/* Instructions */}
      <div className="bg-ink-50 rounded-xl p-3 sm:p-4">
        <h3 className="text-sm font-semibold text-ink-800 mb-1">Property media</h3>
        <p className="text-xs text-ink-500 leading-relaxed">
          Upload high-quality photos and videos. Drag to reorder — the first image becomes your listing cover.
          Guests trust listings with 5+ clear photos. Videos help showcase the space.
        </p>
      </div>

      {/* Media grid with drag-to-reorder */}
      {totalMedia > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {mediaItems.map((item, i) => (
            <div
              key={`${item.type}-${item.url}-${i}`}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={(e) => handleDrop(e, i)}
              onDragEnd={handleDragEnd}
              className={`relative aspect-square rounded-xl overflow-hidden group cursor-grab active:cursor-grabbing transition-all ${
                dragIndex === i ? 'opacity-40 scale-95' : ''
              } ${dragOverIndex === i && dragIndex !== i ? 'ring-2 ring-brand-500 ring-offset-2' : ''}`}
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
              <div className="absolute top-1.5 left-1.5 h-6 w-6 rounded-full bg-black/50 flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                <Bars2Icon className="h-3.5 w-3.5 text-white" />
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
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

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-ink-500 px-1">
        <span>
          {images.length} photo{images.length !== 1 ? 's' : ''}
          {videos.length > 0 && ` · ${videos.length} video${videos.length !== 1 ? 's' : ''}`}
        </span>
        {images.length < 5 && (
          <span className="text-amber-600 font-medium text-xs sm:text-sm">
            +{5 - images.length} more photos recommended
          </span>
        )}
      </div>

      {/* Save button — fixed bottom bar on mobile */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 sm:sticky sm:bottom-4 bg-white border-t sm:border border-ink-200 shadow-xl sm:rounded-2xl p-4 z-50">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-between">
            <p className="text-sm text-ink-600 text-center sm:text-left">Unsaved media changes</p>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-base sm:text-sm py-3 sm:py-2 px-6 w-full sm:w-auto"
            >
              {saving ? 'Saving...' : 'Save Media'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
