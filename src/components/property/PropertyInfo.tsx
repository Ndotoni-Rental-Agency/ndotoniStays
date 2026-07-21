'use client';

import { StarIcon, MapPinIcon, UserGroupIcon, ClockIcon } from '@heroicons/react/24/solid';
import { ShieldCheckIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline';
import { ShortTermProperty } from '@/API';
import { useChatNavigation } from '@/hooks/useChatNavigation';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  property: ShortTermProperty;
}

function capitalize(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function PropertyInfo({ property }: Props) {
  const { navigateToChat } = useChatNavigation();
  const { user } = useAuth();
  const hostName = property.host
    ? capitalize(`${property.host.firstName} ${property.host.lastName}`)
    : 'Host';

  const isOwnProperty = user?.userId === property.hostId;

  return (
    <div className="space-y-8">
      {/* Title & meta */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ink-900">
          {property.title}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-500">
          <span className="flex items-center gap-1">
            <MapPinIcon className="h-4 w-4" />
            {property.district}, {property.region}
          </span>
          {property.maxGuests && (
            <span className="flex items-center gap-1">
              <UserGroupIcon className="h-4 w-4" />
              Up to {property.maxGuests} guests
            </span>
          )}
          {property.bedrooms && (
            <span className="text-ink-400">·</span>
          )}
          {property.bedrooms && (
            <span>{property.bedrooms} bed{property.bedrooms > 1 ? 's' : ''}</span>
          )}
          {property.bathrooms && (
            <span>{property.bathrooms} bath{property.bathrooms > 1 ? 's' : ''}</span>
          )}
          {property.ratingSummary && property.ratingSummary.totalReviews > 0 && (
            <span className="flex items-center gap-1">
              <StarIcon className="h-4 w-4 text-amber-500" />
              {property.ratingSummary.averageRating.toFixed(1)} ({property.ratingSummary.totalReviews} reviews)
            </span>
          )}
        </div>
      </div>

      {/* Hosted by */}
      <div className="flex items-center gap-3 p-4 bg-ink-50 rounded-xl">
        {property.host?.profileImage ? (
          <img
            src={property.host.profileImage}
            alt={hostName}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold">
            {hostName.charAt(0)}
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-medium text-ink-900">Hosted by {hostName}</p>
          {property.instantBookEnabled && (
            <p className="text-xs text-brand-600 flex items-center gap-1">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              Instant booking available
            </p>
          )}
        </div>
        {!isOwnProperty && (
          <button
            onClick={() => navigateToChat({
              propertyId: property.propertyId,
              propertyTitle: property.title,
              landlordName: hostName,
            })}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 rounded-lg transition-colors"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            Message
          </button>
        )}
      </div>

      {/* Description */}
      {property.description && (
        <div>
          <h2 className="text-lg font-semibold text-ink-900 mb-2">About this place</h2>
          <p className="text-ink-600 text-sm leading-relaxed whitespace-pre-line">
            {property.description}
          </p>
        </div>
      )}

      {/* Amenities */}
      {property.amenities && property.amenities.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-ink-900 mb-3">What&apos;s included</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {property.amenities.map((amenity) => (
              <span
                key={amenity}
                className="flex items-center gap-2 text-sm text-ink-600 py-2 px-3 bg-ink-50 rounded-lg"
              >
                <span className="h-1.5 w-1.5 bg-brand-500 rounded-full" />
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Check-in/out & policies */}
      <div>
        <h2 className="text-lg font-semibold text-ink-900 mb-3">Things to know</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {property.checkInTime && (
            <div className="flex items-start gap-3">
              <ClockIcon className="h-5 w-5 text-ink-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-ink-900">Check-in: {property.checkInTime}</p>
                {property.checkOutTime && (
                  <p className="text-sm text-ink-500">Check-out: {property.checkOutTime}</p>
                )}
              </div>
            </div>
          )}
          {property.cancellationPolicy && (
            <div className="flex items-start gap-3">
              <ShieldCheckIcon className="h-5 w-5 text-ink-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-ink-900">Cancellation</p>
                <p className="text-sm text-ink-500 capitalize">{property.cancellationPolicy.toLowerCase()}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* House Rules */}
      {property.houseRules && property.houseRules.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-ink-900 mb-3">House rules</h2>
          <ul className="space-y-1.5">
            {property.houseRules.map((rule, i) => (
              <li key={i} className="text-sm text-ink-600 flex items-start gap-2">
                <span className="text-ink-400">•</span>
                {rule}
              </li>
            ))}
            {property.allowsPets === false && (
              <li className="text-sm text-ink-600 flex items-start gap-2">
                <span className="text-ink-400">•</span>
                No pets allowed
              </li>
            )}
            {property.allowsSmoking === false && (
              <li className="text-sm text-ink-600 flex items-start gap-2">
                <span className="text-ink-400">•</span>
                No smoking
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
