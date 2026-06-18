'use client';

import { useState, useRef } from 'react';
import MediaUpload from '@/components/media/MediaUpload';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { XMarkIcon, Bars2Icon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import { StepProps } from './types';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

interface Props extends StepProps {
  error: string | null;
}

export function StepPhotosContact({ form, setForm, error }: Props) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const dragItemRef = useRef<number | null>(null);

  // Build unified media list from form state
  const mediaItems: MediaItem[] = [
    ...form.images.map(url => ({ type: 'image' as const, url })),
    ...form.videos.map(url => ({ type: 'video' as const, url })),
  ];

  const maxMedia = 10;
  const totalMedia = mediaItems.length;

  function updateFormFromMedia(items: MediaItem[]) {
    const images = items.filter(m => m.type === 'image').map(m => m.url);
    const videos = items.filter(m => m.type === 'video').map(m => m.url);
    setForm(prev => ({ ...prev, images, videos }));
  }

  const handleMediaUploaded = (fileUrl: string, _fileName: string, contentType: string) => {
    if (totalMedia >= maxMedia) {
      setUploadError(`Maximum ${maxMedia} files allowed`);
      return;
    }
    setUploadError(null);

    if (contentType.startsWith('video/')) {
      setForm(prev => ({ ...prev, videos: [...prev.videos, fileUrl] }));
    } else {
      setForm(prev => ({ ...prev, images: [...prev.images, fileUrl] }));
    }
  };

  const removeItem = (index: number) => {
    const newItems = mediaItems.filter((_, i) => i !== index);
    updateFormFromMedia(newItems);
  };

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
    updateFormFromMedia(newItems);

    setDragIndex(null);
    setDragOverIndex(null);
    dragItemRef.current = null;
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
    dragItemRef.current = null;
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">Add photos, videos & your contact</h2>
        <p className="text-sm sm:text-base text-ink-500">Listings with media get 5x more bookings</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-1">
          Photos & Videos <span className="text-red-500">*</span>
        </label>
        {totalMedia > 0 && (
          <p className="text-xs text-ink-400 mb-3">Drag to reorder · First item becomes the cover</p>
        )}

        {/* Media grid with drag-to-reorder */}
        {totalMedia > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
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

        <p className="text-sm text-ink-400 mt-3">
          {totalMedia === 0
            ? 'Add at least 1 photo or video to publish your listing.'
            : `${totalMedia}/${maxMedia} files · First item becomes the cover. You can add more later.`}
        </p>
        {totalMedia === 0 && (
          <p className="text-sm text-amber-600 mt-1">At least 1 photo or video is required</p>
        )}
        {uploadError && (
          <p className="text-xs text-red-500 mt-2">{uploadError}</p>
        )}
      </div>

      <div className="border-t border-ink-100 pt-8 max-w-md">
        <label className="block text-sm font-medium text-ink-700 mb-2">Your WhatsApp / phone number</label>
        <PhoneInput
          value={form.phoneNumber}
          onChange={(val) => setForm(prev => ({ ...prev, phoneNumber: val }))}
          placeholder="Phone number"
          required
        />
        <p className="text-sm text-ink-400 mt-2">So guests and our team can reach you about bookings</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
