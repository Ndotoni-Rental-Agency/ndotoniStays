'use client';

import { useState } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { updateShortTermProperty } from '@/graphql/mutations';
import { ImageUpload } from '@/components/media/ImageUpload';
import toast from 'react-hot-toast';

interface Props {
  propertyId: string;
  initialImages: string[];
}

export function HostPhotos({ propertyId, initialImages }: Props) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  function handleChange(newImages: string[]) {
    setImages(newImages);
    setHasChanges(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await GraphQLClient.executeAuthenticated(updateShortTermProperty, {
        propertyId,
        input: {
          images,
          thumbnail: images[0] || '',
        },
      });
      toast.success('Photos updated');
      setHasChanges(false);
    } catch (err: any) {
      console.error('Failed to save photos:', err);
      toast.error(err?.message || 'Failed to save photos');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-ink-50 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-ink-800 mb-1">Property photos</h3>
        <p className="text-xs text-ink-500">
          Upload high-quality photos. The first image becomes your listing cover.
          Drag to reorder (first = cover). Guests trust listings with 5+ clear photos.
        </p>
      </div>

      {/* Image upload */}
      <ImageUpload
        images={images}
        onChange={handleChange}
        maxImages={20}
      />

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-ink-500">
        <span>{images.length} photo{images.length !== 1 ? 's' : ''} uploaded</span>
        {images.length < 5 && (
          <span className="text-amber-600 font-medium">
            Add {5 - images.length} more for better visibility
          </span>
        )}
      </div>

      {/* Save button */}
      {hasChanges && (
        <div className="sticky bottom-4 bg-white border border-ink-200 shadow-xl rounded-2xl p-4 flex items-center justify-between">
          <p className="text-sm text-ink-600">You have unsaved photo changes</p>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="btn-primary text-sm py-2 px-6"
          >
            {saving ? 'Saving...' : 'Save Photos'}
          </button>
        </div>
      )}
    </div>
  );
}
