'use client';

import { useState } from 'react';
import Image from 'next/image';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline, XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { cn, getCdnUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (review: ReviewFormData) => Promise<void>;
  property: {
    title: string;
    thumbnail?: string;
    images?: string[];
    district?: string;
    region?: string;
  } | null;
  checkInDate: string;
  checkOutDate: string;
}

export interface ReviewFormData {
  overallRating: number;
  cleanliness: number;
  accuracy: number;
  communication: number;
  location: number;
  value: number;
  comment: string;
}

const CATEGORIES = [
  { key: 'cleanliness', label: 'Cleanliness', emoji: '🧹' },
  { key: 'accuracy', label: 'Accuracy', emoji: '📸' },
  { key: 'communication', label: 'Communication', emoji: '💬' },
  { key: 'location', label: 'Location', emoji: '📍' },
  { key: 'value', label: 'Value', emoji: '💰' },
] as const;

const RATING_LABELS = ['', 'Terrible', 'Poor', 'Okay', 'Great', 'Amazing'];

export function ReviewModal({ isOpen, onClose, onSubmit, property, checkInDate, checkOutDate }: ReviewModalProps) {
  const [form, setForm] = useState<ReviewFormData>({
    overallRating: 0,
    cleanliness: 0,
    accuracy: 0,
    communication: 0,
    location: 0,
    value: 0,
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState<'rating' | 'details'>('rating');

  if (!isOpen) return null;

  const propertyImage = property?.thumbnail || property?.images?.[0] || '';

  function formatDateShort(dateStr: string) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  async function handleSubmit() {
    if (form.overallRating === 0) {
      toast.error('Please select an overall rating');
      return;
    }
    if (step === 'rating') {
      setStep('details');
      return;
    }
    if (!form.comment.trim()) {
      toast.error('Please share a few words about your stay');
      return;
    }

    setSubmitting(true);
    try {
      // Fill unrated categories with overall rating
      const finalForm = { ...form };
      for (const cat of CATEGORIES) {
        if (finalForm[cat.key] === 0) {
          finalForm[cat.key] = form.overallRating;
        }
      }
      await onSubmit(finalForm);
      handleClose();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setForm({ overallRating: 0, cleanliness: 0, accuracy: 0, communication: 0, location: 0, value: 0, comment: '' });
    setStep('rating');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[92vh] overflow-y-auto animate-in slide-in-from-bottom sm:fade-in sm:zoom-in-95 duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white z-10 border-b border-ink-100 px-5 py-4 flex items-center justify-between rounded-t-3xl sm:rounded-t-2xl">
          <h2 className="text-lg font-bold text-ink-900">
            {step === 'rating' ? 'Rate your stay' : 'Tell us more'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 -mr-2 rounded-full hover:bg-ink-100 transition-colors touch-manipulation"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5 text-ink-500" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-6">
          {/* Property card */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-ink-50">
            {propertyImage ? (
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={getCdnUrl(propertyImage)}
                  alt={property?.title || 'Property'}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ) : (
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl bg-ink-200 flex-shrink-0" />
            )}
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-ink-900 line-clamp-1">{property?.title || 'Property'}</h3>
              {property?.district && (
                <p className="flex items-center gap-1 text-xs text-ink-500 mt-0.5">
                  <MapPinIcon className="h-3 w-3" />
                  {property.district}, {property.region}
                </p>
              )}
              <p className="text-xs text-ink-400 mt-1">
                {formatDateShort(checkInDate)} – {formatDateShort(checkOutDate)}
              </p>
            </div>
          </div>

          {step === 'rating' ? (
            <>
              {/* Overall rating */}
              <div className="text-center space-y-3">
                <p className="text-sm font-medium text-ink-600">How was your overall experience?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, overallRating: star }))}
                      className="touch-manipulation transition-transform hover:scale-110 active:scale-95"
                    >
                      {star <= form.overallRating ? (
                        <StarSolid className="h-10 w-10 sm:h-12 sm:w-12 text-amber-400 drop-shadow-sm" />
                      ) : (
                        <StarOutline className="h-10 w-10 sm:h-12 sm:w-12 text-ink-300 hover:text-amber-300 transition-colors" />
                      )}
                    </button>
                  ))}
                </div>
                {form.overallRating > 0 && (
                  <p className="text-sm font-medium text-amber-600 animate-in fade-in duration-200">
                    {RATING_LABELS[form.overallRating]}
                  </p>
                )}
              </div>

              {/* Category ratings */}
              {form.overallRating > 0 && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <p className="text-sm font-medium text-ink-600">Rate each category</p>
                  <div className="space-y-2.5">
                    {CATEGORIES.map(({ key, label, emoji }) => (
                      <div key={key} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-ink-50 transition-colors">
                        <span className="text-sm text-ink-700 font-medium">
                          {emoji} {label}
                        </span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setForm((f) => ({ ...f, [key]: star }))}
                              className="touch-manipulation"
                            >
                              {star <= (form[key as keyof ReviewFormData] as number || 0) ? (
                                <StarSolid className="h-6 w-6 text-amber-400" />
                              ) : (
                                <StarOutline className="h-6 w-6 text-ink-200 hover:text-amber-300 transition-colors" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Step 2: Written review */
            <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
              {/* Rating summary */}
              <div className="flex items-center gap-2 text-sm text-ink-600">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarSolid
                      key={star}
                      className={cn('h-4 w-4', star <= form.overallRating ? 'text-amber-400' : 'text-ink-200')}
                    />
                  ))}
                </div>
                <span className="font-medium">{RATING_LABELS[form.overallRating]}</span>
              </div>

              {/* Comment */}
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Share your experience
                </label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                  placeholder="What made your stay special? Any tips for future guests?"
                  className="w-full rounded-xl border border-ink-200 px-4 py-3 text-sm text-ink-900 placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:outline-none resize-none transition-shadow"
                  rows={5}
                  autoFocus
                />
                <p className="text-xs text-ink-400 mt-1.5">
                  {form.comment.length}/500 characters
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 bg-white border-t border-ink-100 px-5 py-4 flex gap-3">
          {step === 'details' && (
            <button
              type="button"
              onClick={() => setStep('rating')}
              className="py-3 px-5 text-sm font-medium text-ink-700 bg-ink-100 hover:bg-ink-200 rounded-xl transition-colors touch-manipulation"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || form.overallRating === 0}
            className={cn(
              'flex-1 py-3 px-5 text-sm font-semibold rounded-xl transition-all touch-manipulation',
              'bg-ink-900 text-white hover:bg-ink-800 disabled:opacity-40 disabled:cursor-not-allowed'
            )}
          >
            {submitting ? (
              <span className="inline-flex items-center justify-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </span>
            ) : step === 'rating' ? (
              'Continue'
            ) : (
              'Submit Review'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
