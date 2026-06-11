"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BoltIcon } from "@heroicons/react/24/solid";
import { formatPrice, calculateNights, findAvailableRanges } from "@/lib/utils";
import { GraphQLClient } from "@/lib/graphql-client";
import { calculateBookingPrice, getBlockedDates } from "@/graphql/queries";
import { useAuth } from "@/contexts/AuthContext";
import CalendarDatePicker from "@/components/ui/CalendarDatePicker";

interface Props {
  property: {
    propertyId: string;
    title: string;
    nightlyRate: number;
    currency: string;
    cleaningFee: number | null;
    maxGuests: number | null;
    instantBookEnabled: boolean;
    minimumStay: number | null;
    host: { firstName: string; phoneNumber: string } | null;
  };
  initialCheckIn: string;
  initialCheckOut: string;
}

interface PriceBreakdown {
  nightlyRate: number;
  numberOfNights: number;
  subtotal: number;
  cleaningFee: number;
  serviceFee: number;
  taxes: number;
  total: number;
  currency: string;
}

export function BookingSidebar({
  property,
  initialCheckIn,
  initialCheckOut,
}: Props) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const executeGql = isAuthenticated
    ? GraphQLClient.executeAuthenticated.bind(GraphQLClient)
    : GraphQLClient.executePublic.bind(GraphQLClient);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(1);
  const [pricing, setPricing] = useState<PriceBreakdown | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [unavailableMessage, setUnavailableMessage] = useState<string | null>(
    null
  );
  const [alternativeDates, setAlternativeDates] = useState<
    Array<{
      checkIn: string;
      checkOut: string;
    }>
  >([]);

  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0;
  const minStay = property.minimumStay || 1;

  // Get today's date for min date
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  // Fetch blocked dates on mount
  useEffect(() => {
    async function fetchBlockedDates() {
      try {
        const now = new Date();
        const startDate = now.toISOString().split("T")[0];
        const endDate = new Date(now.setMonth(now.getMonth() + 6))
          .toISOString()
          .split("T")[0];
        const data = await executeGql<{
          getBlockedDates: {
            blockedRanges: Array<{ startDate: string; endDate: string }>;
          };
        }>(getBlockedDates, {
          propertyId: property.propertyId,
          startDate,
          endDate,
        });
        const blocked = new Set<string>();
        for (const range of data.getBlockedDates?.blockedRanges || []) {
          // Expand each range into individual dates
          const start = new Date(range.startDate);
          const end = new Date(range.endDate);
          const current = new Date(start);
          while (current <= end) {
            blocked.add(current.toISOString().split("T")[0]);
            current.setDate(current.getDate() + 1);
          }
        }
        setBlockedDates(blocked);

        // Check if the initial dates from search params overlap with blocked dates
        if (initialCheckIn && initialCheckOut) {
          const [sy, sm, sd] = initialCheckIn.split("-").map(Number);
          const [ey, em, ed] = initialCheckOut.split("-").map(Number);
          const start = new Date(sy, sm - 1, sd);
          const end = new Date(ey, em - 1, ed);
          const cursor = new Date(start);
          let hasConflict = false;
          while (cursor <= end && !hasConflict) {
            const y = cursor.getFullYear();
            const m = String(cursor.getMonth() + 1).padStart(2, "0");
            const d = String(cursor.getDate()).padStart(2, "0");
            if (blocked.has(`${y}-${m}-${d}`)) hasConflict = true;
            cursor.setDate(cursor.getDate() + 1);
          }
          if (hasConflict) {
            const requestedNights = calculateNights(
              initialCheckIn,
              initialCheckOut
            );

            // Respect property minimum stay
            const nightsToFind = Math.max(
              requestedNights,
              property.minimumStay || 1
            );

            const alternatives = findAvailableRanges(
              blocked,
              nightsToFind,
              initialCheckIn,
              3
            );

            if (alternatives.length > 0) {
              setCheckIn(alternatives[0].checkIn);
              setCheckOut(alternatives[0].checkOut);

              setAlternativeDates(alternatives);

              setUnavailableMessage(
                `Your selected dates aren't available. We've automatically selected the next available stay.`
              );
            } else {
              setUnavailableMessage(
                `Your selected dates are unavailable. We've automatically selected the closest available ${nightsToFind}-night stay.`
              );
            }
          }
        }
      } catch (e) {
        console.log("error when getting blocked dates", e);
        // Non-critical — don't block the UI
      }
    }
    fetchBlockedDates();
  }, [property.propertyId]);

  // Fetch price when dates/guests change
  useEffect(() => {
    if (checkIn && checkOut && nights >= minStay) {
      fetchPrice();
    } else {
      setPricing(null);
    }
  }, [checkIn, checkOut, guests]);

  async function fetchPrice() {
    setLoadingPrice(true);
    try {
      const data = await executeGql<{ calculateBookingPrice: PriceBreakdown }>(
        calculateBookingPrice,
        {
          propertyId: property.propertyId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfGuests: guests,
        }
      );
      setPricing(data.calculateBookingPrice);
    } catch (err) {
      console.error("Price calculation error:", err);
      // Fallback to simple calculation
      const fallback: PriceBreakdown = {
        nightlyRate: property.nightlyRate,
        numberOfNights: nights,
        subtotal: property.nightlyRate * nights,
        cleaningFee: property.cleaningFee || 0,
        serviceFee: 0,
        taxes: 0,
        total: property.nightlyRate * nights + (property.cleaningFee || 0),
        currency: property.currency,
      };
      setPricing(fallback);
    } finally {
      setLoadingPrice(false);
    }
  }

  function handleBook() {
    if (!checkIn || !checkOut) return;

    // Navigate to booking page with dates and guests (auth handled there)
    const params = new URLSearchParams({
      checkIn,
      checkOut,
      guests: guests.toString(),
    });
    router.push(`/booking/${property.propertyId}?${params.toString()}`);
  }

  return (
    <div className="sticky top-24">
      <div className="rounded-2xl border border-ink-200 shadow-lg p-6">
        {/* Price header */}
        <div className="flex items-baseline gap-1 mb-6">
          <span className="text-2xl font-bold text-ink-900">
            {formatPrice(property.nightlyRate, property.currency)}
          </span>
          <span className="text-ink-500 text-sm">/ night</span>
        </div>

        {/* Date & guest inputs */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <CalendarDatePicker
              value={checkIn}
              onChange={setCheckIn}
              min={minDate}
              label="Check-in"
              placeholder="Add date"
              blockedDates={blockedDates}
              rangeStart={checkIn}
              rangeEnd={checkOut}
            />
            <CalendarDatePicker
              value={checkOut}
              onChange={setCheckOut}
              min={checkIn || minDate}
              label="Check-out"
              placeholder="Add date"
              blockedDates={blockedDates}
              rangeStart={checkIn}
              rangeEnd={checkOut}
            />
          </div>

          {unavailableMessage && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-xs text-amber-700 flex-1">{unavailableMessage}</p>
              <button
                onClick={() => setUnavailableMessage(null)}
                className="text-amber-400 hover:text-amber-600 text-sm leading-none"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-ink-500 block mb-1">
              Guests
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="input text-sm py-2.5"
            >
              {Array.from(
                { length: property.maxGuests || 10 },
                (_, i) => i + 1
              ).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "guest" : "guests"}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Minimum stay warning */}
        {nights > 0 && nights < minStay && (
          <p className="mt-3 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            Minimum stay: {minStay} {minStay === 1 ? "night" : "nights"}
          </p>
        )}

        {/* Price breakdown */}
        {pricing && (
          <div className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between text-ink-600">
              <span>
                {formatPrice(pricing.nightlyRate, pricing.currency)} ×{" "}
                {pricing.numberOfNights} nights
              </span>
              <span>{formatPrice(pricing.subtotal, pricing.currency)}</span>
            </div>
            {pricing.cleaningFee > 0 && (
              <div className="flex justify-between text-ink-600">
                <span>Cleaning fee</span>
                <span>
                  {formatPrice(pricing.cleaningFee, pricing.currency)}
                </span>
              </div>
            )}
            {pricing.serviceFee > 0 && (
              <div className="flex justify-between text-ink-600">
                <span>Service fee</span>
                <span>{formatPrice(pricing.serviceFee, pricing.currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-ink-900 pt-2 border-t border-ink-100">
              <span>Total</span>
              <span>{formatPrice(pricing.total, pricing.currency)}</span>
            </div>
          </div>
        )}

        {/* Book button */}
        <button
          onClick={handleBook}
          disabled={
            !checkIn || !checkOut || nights < minStay || bookingInProgress
          }
          className="btn-primary w-full mt-6 gap-2"
        >
          {property.instantBookEnabled && <BoltIcon className="h-4 w-4" />}
          {property.instantBookEnabled ? "Continue to Book" : "Continue to Request"}
        </button>

        {/* Reassurance */}
        <p className="mt-3 text-center text-xs text-ink-400">
          You won&apos;t be charged yet
        </p>
      </div>
    </div>
  );
}
