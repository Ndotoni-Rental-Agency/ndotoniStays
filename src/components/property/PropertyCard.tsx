'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ArrowUpRight, MapPin, Users, BedDouble } from 'lucide-react';
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
  title: string;
  nightlyRate: number;
  currency: string;
  propertyType: string;
  region: string;
  district: string;
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
  property: ShortTermProperty;
  checkIn?: string;
  checkOut?: string;
}

export function PropertyCard({ property, checkIn, checkOut }: Props) {
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
    <Link href={href} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200/80 bg-white transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-[0_16px_40px_-16px_rgba(17,24,39,0.22)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-700 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      {/* Image */}
      <div className="relative aspect-[4/3] shrink-0 overflow-hidden bg-ink-100">
        {firstImage && failedImage !== imageUrl ? <Image
          src={imageUrl}
          onError={() => setFailedImage(imageUrl)}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-[1.03] transition-transform duration-300 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          sizes="(max-width: 640px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 25vw"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          loading="lazy"
        /> : <div className="flex h-full flex-col items-center justify-center gap-3 bg-ink-50 text-ink-400">
          <HomeIcon className="h-10 w-10" strokeWidth={1} aria-hidden="true" />
          <span className="text-xs">{language === 'sw' ? 'Picha zinakuja hivi karibuni' : 'Photos coming soon'}</span>
        </div>}
        {property.instantBookEnabled && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-white text-brand-900 text-xs font-semibold px-3 py-2 rounded-full">
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

      {/* Price leads, with the same framed structure as the rental cards. */}
      <div className="flex flex-1 flex-col p-5">
        <p className="mb-3 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
          <span className="text-xl font-bold tracking-tight tabular-nums text-ink-900">{formatPrice(property.nightlyRate, property.currency)}</span>
          <span className="text-xs text-ink-500">/ {sw ? 'usiku' : 'night'}</span>
        </p>
        <h3 className="line-clamp-2 min-h-[3rem] text-sm font-semibold leading-6 text-ink-900 group-hover:text-brand-700 transition-colors">{property.title}</h3>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-500">
          <MapPin size={13} className="shrink-0" aria-hidden="true" />
          <span className="truncate">{locationLine({ ward: property.address?.ward, district: property.district, region: property.region })}</span>
        </p>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-ink-100 pt-3">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-500">
            <span className="inline-flex items-center gap-1"><Users size={13} aria-hidden="true" />{property.maxGuests} {sw ? 'wageni' : property.maxGuests === 1 ? 'guest' : 'guests'}</span>
            {property.bedrooms != null && property.bedrooms > 0 && <span className="inline-flex items-center gap-1"><BedDouble size={13} aria-hidden="true" />{property.bedrooms} {sw ? 'vyumba' : property.bedrooms === 1 ? 'bedroom' : 'bedrooms'}</span>}
          </div>
          <ArrowUpRight size={18} aria-hidden="true" className="shrink-0 text-brand-700 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:transform-none" />
        </div>
      </div>
    </Link>
  );
}
