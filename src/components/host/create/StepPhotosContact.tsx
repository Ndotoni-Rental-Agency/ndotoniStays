'use client';

import { ImageUpload } from '@/components/media/ImageUpload';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { StepProps } from './types';

interface Props extends StepProps {
  error: string | null;
}

export function StepPhotosContact({ form, setForm, error }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">Add photos and your contact</h2>
        <p className="text-sm sm:text-base text-ink-500">Listings with photos get 5x more bookings</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-ink-700 mb-3">
          Photos <span className="text-red-500">*</span>
        </label>
        <ImageUpload
          images={form.images}
          onChange={(imgs) => setForm(prev => ({ ...prev, images: imgs }))}
          maxImages={10}
        />
        <p className="text-sm text-ink-400 mt-3">
          {form.images.length === 0
            ? 'Add at least 1 photo to publish your listing.'
            : 'First photo becomes the cover. You can add more later.'}
        </p>
        {form.images.length === 0 && (
          <p className="text-sm text-amber-600 mt-1">At least 1 photo is required</p>
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
