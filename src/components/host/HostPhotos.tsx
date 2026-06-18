'use client';

import { useState } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { updateShortTermProperty } from '@/graphql/mutations';
import MediaUpload from '@/components/media/MediaUpload';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

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

  const maxMedia = 20;
  const totalMedia = images.length + videos.length;

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

  function removeImage(index: number) {
    setImages(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  }

  function removeVideo(index: number) {
    setVideos(prev => prev.filter((_, i) => i !== index));
    setHasChanges(true);
  }

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
          Upload high-quality photos and videos. The first image becomes your listing cover.
          Guests trust listings with 5+ clear photos. Videos help showcase the space.
        </p>
      </div>

      {/* Media previews */}
      {totalMedia > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {/* Images */}
          {images.map((url, i) => (
            <div key={`img-${i}`} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4 text-white" />
              </button>
              {i === 0 && (
                <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full font-medium">
                  Cover
                </span>
              )}
            </div>
          ))}
          {/* Videos */}
          {videos.map((url, i) => (
            <div key={`vid-${i}`} className="relative aspect-square rounded-xl overflow-hidden group">
              <video
                src={url}
                className="w-full h-full object-cover"
                preload="metadata"
                onLoadedMetadata={(e) => { e.currentTarget.currentTime = 1; }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
                <PlayIcon className="h-8 w-8 text-white/90" />
              </div>
              <button
                type="button"
                onClick={() => removeVideo(i)}
                className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
              >
                <XMarkIcon className="h-4 w-4 text-white" />
              </button>
              <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full font-medium">
                Video
              </span>
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
