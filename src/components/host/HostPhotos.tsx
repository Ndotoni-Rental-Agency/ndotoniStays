'use client';

import { useState } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { updateShortTermProperty } from '@/graphql/mutations';
import { MediaGrid } from '@/components/media/MediaGrid';
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

  function handleMediaChange(newImages: string[], newVideos: string[]) {
    setImages(newImages);
    setVideos(newVideos);
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
          Upload high-quality photos and videos. Drag to reorder — the first image becomes your listing cover.
          Guests trust listings with 5+ clear photos. Videos help showcase the space.
        </p>
      </div>

      {/* Media grid */}
      <MediaGrid
        images={images}
        videos={videos}
        onChange={handleMediaChange}
        maxMedia={20}
      />

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
