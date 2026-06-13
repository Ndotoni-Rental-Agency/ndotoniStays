'use client';

import { useState, useEffect } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { getPropertyReviews } from '@/graphql/queries';
import { StarIcon } from '@heroicons/react/24/solid';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

interface Review {
  reviewId: string;
  bookingId: string;
  propertyId: string;
  guestId: string;
  guest: { firstName: string; lastName: string } | null;
  overallRating: number;
  cleanliness: number;
  accuracy: number;
  communication: number;
  location: number;
  value: number;
  comment: string;
  photos?: string[];
  hostResponse?: string;
  hostResponseDate?: string;
  verifiedStay: boolean;
  createdAt: string;
}

interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  cleanliness: number;
  accuracy: number;
  communication: number;
  location: number;
  value: number;
}

interface Props {
  propertyId: string;
  ratingSummary: RatingSummary | null;
}

const CATEGORY_LABELS = [
  { key: 'cleanliness', label: 'Cleanliness', emoji: '🧹' },
  { key: 'accuracy', label: 'Accuracy', emoji: '📸' },
  { key: 'communication', label: 'Communication', emoji: '💬' },
  { key: 'location', label: 'Location', emoji: '📍' },
  { key: 'value', label: 'Value', emoji: '💰' },
] as const;

export function PropertyReviews({ propertyId, ratingSummary }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [propertyId]);

  async function fetchReviews() {
    try {
      const data = await GraphQLClient.executePublic<{
        getPropertyReviews: { reviews: Review[]; count: number; nextToken?: string };
      }>(getPropertyReviews, { propertyId, limit: 20 });

      const result = data.getPropertyReviews;
      console.log('[PropertyReviews] Fetched reviews:', JSON.stringify(result, null, 2));
      setReviews(result?.reviews || []);
    } catch (err) {
      console.error('[PropertyReviews] Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 py-8">
        <div className="h-6 w-40 bg-ink-100 rounded" />
        <div className="h-4 w-full bg-ink-100 rounded" />
        <div className="h-4 w-3/4 bg-ink-100 rounded" />
      </div>
    );
  }

  if (reviews.length === 0 && (!ratingSummary || ratingSummary.totalReviews === 0)) {
    return null; // Don't show section if no reviews
  }

  const displayedReviews = showAll ? reviews : reviews.slice(0, 4);

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  function renderStars(rating: number) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={cn('h-4 w-4', star <= rating ? 'text-amber-400' : 'text-ink-200')}
          />
        ))}
      </div>
    );
  }

  return (
    <section className="border-t border-ink-100 pt-8 mt-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <StarIcon className="h-6 w-6 text-amber-500" />
        <h2 className="text-xl font-bold text-ink-900">
          {ratingSummary
            ? `${ratingSummary.averageRating.toFixed(1)} · ${ratingSummary.totalReviews} review${ratingSummary.totalReviews !== 1 ? 's' : ''}`
            : `${reviews.length} review${reviews.length !== 1 ? 's' : ''}`}
        </h2>
      </div>

      {/* Category breakdown */}
      {ratingSummary && ratingSummary.totalReviews > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {CATEGORY_LABELS.map(({ key, label, emoji }) => {
            const score = ratingSummary[key as keyof RatingSummary] as number;
            return (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-ink-700">{emoji} {label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-ink-800 rounded-full"
                      style={{ width: `${(score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-ink-900 w-7 text-right">
                    {score.toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Individual reviews */}
      {displayedReviews.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {displayedReviews.map((review) => (
            <div key={review.reviewId} className="space-y-3">
              {/* Guest info */}
              <div className="flex items-center gap-3">
                <UserCircleIcon className="h-10 w-10 text-ink-300" />
                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    {review.guest
                      ? `${review.guest.firstName} ${review.guest.lastName?.charAt(0) || ''}.`
                      : 'Guest'}
                  </p>
                  <p className="text-xs text-ink-500">{formatDate(review.createdAt)}</p>
                </div>
              </div>

              {/* Stars */}
              {renderStars(review.overallRating)}

              {/* Comment */}
              <p className="text-sm text-ink-700 leading-relaxed line-clamp-4">
                {review.comment}
              </p>

              {/* Host response */}
              {review.hostResponse && (
                <div className="ml-4 pl-4 border-l-2 border-ink-200 mt-2">
                  <p className="text-xs font-semibold text-ink-600 mb-1">Host response</p>
                  <p className="text-sm text-ink-600 line-clamp-3">{review.hostResponse}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Show all button */}
      {reviews.length > 4 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-6 px-6 py-3 border border-ink-800 rounded-xl text-sm font-semibold text-ink-800 hover:bg-ink-50 transition-colors"
        >
          Show all {reviews.length} reviews
        </button>
      )}
    </section>
  );
}
