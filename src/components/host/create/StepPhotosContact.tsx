'use client';

import { useState } from 'react';
import MediaUpload from '@/components/media/MediaUpload';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PlayIcon } from '@heroicons/react/24/solid';
import { StepProps } from './types';

interface Props extends StepProps {
  error: string | null;
}

export function StepPhotosContact({ form, setForm, error }: Props) {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const maxMedia = 10;
  const totalMedia = form.images.length + form.videos.length;

  const handleMediaUploaded = (fileUrl: string, fileName: string, contentType: string) => {
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

  const removeImage = (index: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const removeVideo = (index: number) => {
    setForm(prev => ({ ...prev, videos: prev.videos.filter((_, i) => i !== index) }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">Add photos, videos & your contact</h2>
        <p className="text-sm sm:text-base text-ink-500">Listings with media get 5x more bookings</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-3">
          Photos & Videos <span className="text-red-500">*</span>
        </label>

        {/* Media previews */}
        {totalMedia > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
            {/* Images */}
            {form.images.map((url, i) => (
              <div key={`img-${i}`} className="relative aspect-square rounded-xl overflow-hidden group">
                <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-black/60 flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                >
                  <XMarkIcon className="h-4 w-4 text-white" />
                </button>
                {i === 0 && form.videos.length === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-full font-medium">
                    Cover
                  </span>
                )}
              </div>
            ))}
            {/* Videos */}
            {form.videos.map((url, i) => (
              <div key={`vid-${i}`} className="relative aspect-square rounded-xl overflow-hidden group">
                <video
                  src={url}
                  className="w-full h-full object-cover"
                  preload="metadata"
                  onLoadedMetadata={(e) => {
                    e.currentTarget.currentTime = 1;
                  }}
                />
                {/* Play icon overlay */}
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

        <p className="text-sm text-ink-400 mt-3">
          {totalMedia === 0
            ? 'Add at least 1 photo or video to publish your listing.'
            : `${totalMedia}/${maxMedia} files · First photo becomes the cover. You can add more later.`}
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
