'use client';

import { VerifiedStayBadge } from './VerifiedStayBadge';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { HomeIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';
import { StarIcon, BoltIcon } from '@heroicons/react/24/solid';
import { formatPrice, getCdnUrl, isImageUrl } from '@/lib/utils';
import { locationLine } from '@/lib/location/format';

// Tiny 1x1 SVG shimmer placeholder encoded as base64
const BLUR_PLACEHOLDER =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlN2ViIi8+PC9zdmc+';

interface ShortTermProperty {
  propertyId: string;
  verified?: boolean | null;
  title: string;
  nightlyRate: number;
  currency: string;
  propertyType: string;
  region: string;
  district: string;
  ward?: string;
  street?: string;
  address?: { ward?: string | null; street?: string | null } | null;
  thumbnail: string;
  images: string[];
  averageRating: number | null;
  ratingSummary: { averageRating: number; totalReviews: number } | null;
  maxGuests: number;
  bedrooms?: number | null;
  bathrooms?: number | null;
  instantBookEnabled: boolean;
}

interface Props {
  priority?: boolean;
  property: ShortTermProperty;
  checkIn?: string;
  checkOut?: string;
}

export function PropertyCard({ property, checkIn, checkOut, priority = false }: Props) {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const [failedImage, setFailedImage] = useState<string | null>(null);
  // thumbnail/images[0] can be a non-image file a host uploaded by mistake (e.g. a PDF) —
  // fall through to the first URL that actually looks like an image, or the placeholder.
  const firstImage = [property.thumbnail, ...(property.images || [])].find((url) => url && isImageUrl(url));
  const imageUrl = getCdnUrl(firstImage || '');
  const rating = property.ratingSummary?.averageRating || property.averageRating;
  const reviewCount = property.ratingSummary?.totalReviews || 0;

  const href = `/property/${property.propertyId}${
    checkIn && checkOut ? `?checkIn=${checkIn}&checkOut=${checkOut}` : ''
  }`;

  return (
    <Link href={href} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200/80 bg-white transition-[box-shadow,border-color] duration-200 hover:border-brand-300 hover:shadow-[0_16px_40px_-16px_rgba(17,24,39,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      {/* Image */}
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-ink-100">
        {firstImage && failedImage !== imageUrl ? <Image
          src={imageUrl}
          onError={() => setFailedImage(imageUrl)}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-[1.02] transition-transform duration-200 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          sizes="(max-width: 640px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          priority={priority}
          loading={priority ? undefined : 'lazy'}
        /> : <div className="flex h-full flex-col items-center justify-center gap-3 bg-ink-50 text-ink-400">
          <HomeIcon className="h-10 w-10" strokeWidth={1} aria-hidden="true" />
          <span className="text-xs">{language === 'sw' ? 'Picha zinakuja hivi karibuni' : 'Photos coming soon'}</span>
        </div>}
        {property.verified === true && <div className="absolute top-3 left-3"><VerifiedStayBadge /></div>}
        {property.instantBookEnabled && (
          <span style={{top: property.verified ? 52 : 12}} className="absolute left-3 inline-flex items-center gap-1 bg-white text-brand-900 text-xs font-semibold px-3 py-2 rounded-full">
            <BoltIcon className="h-3 w-3" />
            {sw ? 'Weka nafasi papo hapo' : 'Instant Book'}
          </span>
        )}
        {rating != null && rating > 0 && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-ink-800 shadow-sm" aria-label={`${rating.toFixed(1)} ${sw ? 'kati ya 5' : 'out of 5'}${reviewCount > 0 ? `, ${reviewCount} ${sw ? 'maoni' : 'reviews'}` : ''}`}>
            <StarIcon className="h-3.5 w-3.5 text-brand-700" aria-hidden="true" />{rating.toFixed(1)}{reviewCount > 0 && <span className="font-normal text-ink-500">({reviewCount})</span>}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3 className="line-clamp-2 min-h-[3rem] text-base font-semibold leading-6 text-ink-900 transition-colors group-hover:text-brand-700">{property.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm leading-5 text-ink-500">{locationLine({ ward: property.ward || property.address?.ward, street: property.street || property.address?.street, district: property.district, region: property.region })}</p>
        <p className="mb-5 mt-3 text-sm text-ink-500">
          {property.maxGuests} {sw ? 'wageni' : property.maxGuests === 1 ? 'guest' : 'guests'}
          {property.bedrooms != null && property.bedrooms > 0 && <> · {property.bedrooms} {sw ? 'vyumba' : property.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</>}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-ink-100 pt-4">
          <p className="flex flex-wrap items-baseline gap-x-1.5"><span className="text-xl font-bold tracking-tight tabular-nums text-ink-900">{formatPrice(property.nightlyRate, property.currency)}</span><span className="text-sm text-ink-500">/ {sw ? 'usiku' : 'night'}</span></p>
          <ArrowUpRight size={18} aria-hidden="true" className="shrink-0 text-brand-700 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none" />
        </div>
      </div>
    </Link>
  );
}
