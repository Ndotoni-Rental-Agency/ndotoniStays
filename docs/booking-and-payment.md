# Booking & Payment Flow

This is the product's core differentiator versus the long-term-rental sister app — a
full date/guest-count/pricing/payment transaction, not just a listing inquiry.

## Two-phase: create the booking, then pay

Booking creation and payment are **separate backend calls, not atomic** — a booking
record always exists before any payment attempt.

### Step 0 — date/guest selection

`src/components/property/BookingSidebar.tsx` (rendered on `/property/[id]`):

- Fetches blocked dates (`getBlockedDates`, 6-month window) on mount, builds a blocked-date
  set for the calendar picker, and auto-suggests alternative available ranges if the
  incoming search-param dates conflict.
- Live price recalculation on date/guest change via the **server-authoritative**
  `calculateBookingPrice` query, with a client-side fallback (`nightlyRate * nights +
  cleaningFee`) only if that query fails.
- On submit, does one final `checkAvailability` check, then **navigates** to
  `/booking/[propertyId]?checkIn=...&checkOut=...&guests=...` — no booking is created yet.

### Step 1 — booking creation

`src/app/booking/[propertyId]/page.tsx` (the main booking page, ~470 lines):

- Reads dates/guests from search params (redirects back if missing), fetches the property
  via `getShortTermProperty`.
- Computes a client-side price breakdown for display: `subtotal = nightlyRate * nights`,
  `+ cleaningFee`, `+ serviceFee` (gated by `SERVICE_FEE_ENABLED` in
  `src/constants/pricing.ts`, currently `false` — **must stay in sync with the backend's
  `Config.Pricing.SERVICE_FEE_ENABLED` flag**, see
  [architecture.md § cross-repo coupling](./architecture.md#cross-repo-coupling-worth-knowing)).
- **Auth choice**: sign in (opens `AuthModal`, first saving `ndotoni_booking_redirect` to
  localStorage so the user returns here after auth) or continue as guest (collects
  name/email/phone inline). Guest checkout is fully supported.
- `handleCreateBooking()` calls the **`createBooking`** mutation with
  `{ propertyId, checkInDate, checkOutDate, numberOfGuests, numberOfAdults, guestName,
  guestEmail, guestPhone, paymentMethodId: 'snippe_mpesa', ... }` (auth mode depends on
  whether the user signed in or chose guest checkout).
- The response's `status` determines what happens next:
  - **`CONFIRMED`** (instant-book property) → payment collection (`PaymentFlow`) shows
    immediately.
  - **`PENDING`** (request-to-book property) → shows a "waiting for host" message; the
    guest pays later via a separate `/pay/[id]` link sent once the host approves.

### Step 2 — payment

Shared component `src/components/payment/PaymentFlow.tsx` (used by both the booking page's
confirmation step and the standalone `/pay/[id]` page):

- **Mobile money** — Tanzanian phone validation (`/^255[67]\d{8}$/`, normalizes
  `0.../7.../6...` input to `255...`), calls **`initiatePayment`** mutation
  (`{ bookingId, phoneNumber }`), then polls (see below).
- **Card / Apple Pay / Google Pay** — delegates to `src/components/payment/StripePaymentForm.tsx`,
  which calls **`createStripePaymentIntent`** (`{ bookingId, currency: 'usd' }`) to get a
  Stripe `clientSecret`, renders Stripe Elements (`PaymentElement`, wallets enabled), and
  calls `stripe.confirmPayment({ redirect: 'if_required' })` client-side.

### Payment status: polling, not subscriptions

`pollPaymentStatus()` — `setInterval` every 10 seconds, max 30 attempts (5 minutes), calling
`getPayment` by payment reference. Transitions the UI to "confirmed" on
`CAPTURED`/`AUTHORIZED` status, "failed" on `FAILED`. **This logic is duplicated** between
`booking/[propertyId]/page.tsx`'s inline `handlePay()` and `PaymentFlow.tsx`'s own
mobile-money handler — if you're fixing a payment-status bug, check both call sites, not
just one. There is no GraphQL subscription involved anywhere in the payment flow, unlike
the chat feature (see [architecture.md](./architecture.md)).

## Standalone payment link

`src/app/pay/[id]/page.tsx` — fetches `getBooking` (public), blocks payment unless
`booking.status === 'CONFIRMED'`, reuses `PaymentFlow`. This is the link a guest uses after
a host approves a request-to-book (non-instant) property.

## Host approval

`src/app/bookings/[id]/confirm/page.tsx` — token-gated (see
[auth.md § token-based links](./auth.md#token-based-no-login-links)), calls
`approveBooking`/`declineBooking` mutations. Shows the host their expected payout
(`subtotal + cleaningFee`, **excluding** `serviceFee`, which is Ndotoni's cut).

## Key backend operations touched by this flow

`getShortTermProperty`, `getBlockedDates`, `calculateBookingPrice`, `checkAvailability`,
`createBooking`, `getBooking`, `initiatePayment`, `getPayment`,
`createStripePaymentIntent`, `approveBooking`, `declineBooking`, `listMyBookings`,
`cancelBooking`, `createReview` — all in `src/graphql/{queries,mutations}.ts`. For what
each of these actually does on the backend (availability checking, refund handling,
provider webhooks), see the backend repo's
[`docs/services/payment.md`](https://github.com/Ndotoni-Rental-Agency/ndotoniBackend/blob/main/docs/services/payment.md)
and
[`docs/services/short-term-stays.md`](https://github.com/Ndotoni-Rental-Agency/ndotoniBackend/blob/main/docs/services/short-term-stays.md).

## Design points worth remembering

- **Instant-book vs. request-to-book** (`property.instantBookEnabled`) drives materially
  different UX through the *same* booking page — don't assume one code path covers both.
- **Guest checkout is a first-class path**, not a fallback — test both signed-in and guest
  flows when changing booking logic.
- **Booking is created before payment succeeds** — a `PENDING`/unpaid booking can exist.
  Anything that assumes "a booking record implies payment happened" is wrong; check
  `paymentStatus` explicitly.
