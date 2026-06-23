import Link from 'next/link';
import Image from 'next/image';
import { StarIcon, BoltIcon } from '@heroicons/react/24/solid';
import { formatPrice, getCdnUrl } from '@/lib/utils';

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
  const imageUrl = getCdnUrl(property.thumbnail || property.images?.[0]);
  const rating = property.ratingSummary?.averageRating || property.averageRating;
  const reviewCount = property.ratingSummary?.totalReviews || 0;

  const href = `/property/${property.propertyId}${
    checkIn && checkOut ? `?checkIn=${checkIn}&checkOut=${checkOut}` : ''
  }`;

  return (
    <Link href={href} className="card group block">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100">
        <Image
          src={imageUrl}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          loading="lazy"
        />
        {property.instantBookEnabled && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-brand-600 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            <BoltIcon className="h-3 w-3" />
            Instant Book
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-ink-900 text-sm line-clamp-1 group-hover:text-brand-700 transition-colors">
            {property.title}
          </h3>
          {rating && rating > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-ink-600 whitespace-nowrap">
              <StarIcon className="h-3.5 w-3.5 text-amber-500" />
              {rating.toFixed(1)}
              {reviewCount > 0 && (
                <span className="text-ink-400">({reviewCount})</span>
              )}
            </span>
          )}
        </div>

        <p className="text-xs text-ink-500 mt-1">
          {property.district}, {property.region}
          {property.bedrooms && ` · ${property.bedrooms} bed${property.bedrooms > 1 ? 's' : ''}`}
          {property.bathrooms && ` · ${property.bathrooms} bath`}
          {' · '}{property.maxGuests} guest{property.maxGuests > 1 ? 's' : ''}
        </p>

        <p className="mt-3 text-sm">
          <span className="font-bold text-ink-900">
            {formatPrice(property.nightlyRate, property.currency)}
          </span>
          <span className="text-ink-400"> / night</span>
        </p>
      </div>
    </Link>
  );
}
