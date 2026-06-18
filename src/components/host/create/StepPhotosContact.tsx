'use client';

import { MediaGrid } from '@/components/media/MediaGrid';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { StepProps } from './types';

interface Props extends StepProps {
  error: string | null;
}

export function StepPhotosContact({ form, setForm, error }: Props) {
  const totalMedia = form.images.length + form.videos.length;

  function handleMediaChange(images: string[], videos: string[]) {
    setForm(prev => ({ ...prev, images, videos }));
  }

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

        <MediaGrid
          images={form.images}
          videos={form.videos}
          onChange={handleMediaChange}
          maxMedia={10}
        />

        <p className="text-sm text-ink-400 mt-3">
          {totalMedia === 0
            ? 'Add at least 1 photo or video to publish your listing.'
            : `${totalMedia}/10 files · First item becomes the cover. You can add more later.`}
        </p>
        {totalMedia === 0 && (
          <p className="text-sm text-amber-600 mt-1">At least 1 photo or video is required</p>
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
