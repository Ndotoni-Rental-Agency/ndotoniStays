'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { GraphQLClient } from '@/lib/graphql-client';
import { getPropertyReviews } from '@/graphql/queries';
import { respondToReview } from '@/graphql/mutations';
import { StarIcon } from '@heroicons/react/24/solid';
import { cn, getCdnUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

interface ReviewGuest {
  firstName: string;
  lastName: string;
}

interface Review {
  reviewId: string;
  propertyId: string;
  overallRating: number;
  cleanliness: number;
  accuracy: number;
  communication: number;
  location: number;
  value: number;
  comment: string;
  guest: ReviewGuest | null;
  hostResponse: string | null;
  hostResponseDate: string | null;
  verifiedStay: boolean;
  createdAt: string;
}

interface Props {
  propertyIds: string[];
  propertyNames?: Record<string, string>;
  propertyThumbnails?: Record<string, string>;
}

export function HostReviews({ propertyIds, propertyNames = {}, propertyThumbnails = {} }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    if (propertyIds.length === 0) {
      setReviews([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const allReviews: Review[] = [];

      const results = await Promise.allSettled(
        propertyIds.map((propertyId) =>
          GraphQLClient.executeAuthenticated<{
            getPropertyReviews: { reviews: Review[]; count: number };
          }>(getPropertyReviews, { propertyId, limit: 20 })
        )
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const items = result.value.getPropertyReviews?.reviews || [];
          allReviews.push(...items);
        }
      }

      // Sort newest first
      allReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviews(allReviews);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  }, [propertyIds]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function handleRespond(reviewId: string) {
    if (!responseText.trim()) {
      toast.error('Please write a response');
      return;
    }

    setSubmitting(true);
    try {
      await GraphQLClient.executeAuthenticated(respondToReview, {
        input: { reviewId, response: responseText.trim() },
      });

      // Update locally
      setReviews((prev) =>
        prev.map((r) =>
          r.reviewId === reviewId
            ? { ...r, hostResponse: responseText.trim(), hostResponseDate: new Date().toISOString() }
            : r
        )
      );
      toast.success('Response posted');
      setRespondingTo(null);
      setResponseText('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to post response');
    } finally {
      setSubmitting(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function renderStars(rating: number) {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <StarIcon
            key={star}
            className={cn('h-3.5 w-3.5', star <= rating ? 'text-amber-400' : 'text-ink-200')}
          />
        ))}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse border border-ink-100 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-ink-100" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-ink-100 rounded w-1/4" />
                <div className="h-3 bg-ink-100 rounded w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-ink-400 text-sm">No reviews yet. Reviews will appear here after guests complete their stay.</p>
      </div>
    );
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.overallRating, 0) / reviews.length).toFixed(1)
    : '0';

  const unanswered = reviews.filter((r) => !r.hostResponse).length;

  return (
    <div className="space-y-5 pb-24 sm:pb-0">
      {/* Summary */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <StarIcon className="h-5 w-5 text-amber-400" />
          <span className="text-lg font-bold text-ink-900">{averageRating}</span>
          <span className="text-sm text-ink-500">({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
        </div>
        {unanswered > 0 && (
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
            {unanswered} awaiting your response
          </span>
        )}
      </div>

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.map((review) => {
          const guestName = review.guest
            ? `${review.guest.firstName} ${review.guest.lastName || ''}`.trim()
            : 'Guest';

          return (
            <div
              key={review.reviewId}
              className={cn(
                'border rounded-xl p-4 sm:p-5 transition-colors',
                !review.hostResponse ? 'border-amber-200 bg-amber-50/30' : 'border-ink-100'
              )}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex gap-3">
                  {propertyThumbnails[review.propertyId] && (
                    <div className="relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={getCdnUrl(propertyThumbnails[review.propertyId])}
                        alt={propertyNames[review.propertyId] || 'Property'}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink-900">{guestName}</p>
                      {review.verifiedStay && (
                        <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                          Verified
                        </span>
                      )}
                    </div>
                    {propertyNames[review.propertyId] && (
                      <p className="text-xs text-brand-600 font-medium mt-0.5">
                        {propertyNames[review.propertyId]}
                      </p>
                    )}
                    <p className="text-xs text-ink-400 mt-0.5">{formatDate(review.createdAt)}</p>
                  </div>
                </div>
                <div className="shrink-0">{renderStars(review.overallRating)}</div>
              </div>

              {/* Comment */}
              <p className="text-sm text-ink-700 leading-relaxed">{review.comment}</p>

              {/* Host response */}
              {review.hostResponse && (
                <div className="mt-3 pl-3 border-l-2 border-brand-200">
                  <p className="text-xs font-medium text-brand-700 mb-0.5">Your response</p>
                  <p className="text-sm text-ink-600">{review.hostResponse}</p>
                </div>
              )}

              {/* Respond form */}
              {!review.hostResponse && (
                <div className="mt-3 pt-3 border-t border-ink-100">
                  {respondingTo === review.reviewId ? (
                    <div className="space-y-2">
                      <textarea
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Write a thoughtful response to this guest..."
                        className="input text-sm py-2 min-h-[80px] w-full"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setRespondingTo(null);
                            setResponseText('');
                          }}
                          className="btn-secondary text-xs py-1.5 px-3"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRespond(review.reviewId)}
                          disabled={submitting || !responseText.trim()}
                          className="btn-primary text-xs py-1.5 px-4"
                        >
                          {submitting ? 'Posting...' : 'Post Response'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setRespondingTo(review.reviewId)}
                      className="text-sm text-brand-600 font-medium hover:underline touch-manipulation"
                    >
                      Reply to this review
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
