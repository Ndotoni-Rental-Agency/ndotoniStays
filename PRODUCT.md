# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two primary audiences, both served by this app, plus a secondary one:

- **Guests (primary):** people in Tanzania (centered on Dar es Salaam) booking nightly
  stays, party venues, photoshoot locations, and event spaces. They browse listings,
  book instantly, and pay by mobile money or card.
- **Hosts:** property owners/managers who list places, manage bookings and calendar
  availability, communicate with guests over WhatsApp, and receive payouts.
- **Investors (secondary):** visitors to the `/invest` page evaluating the seed-stage
  opportunity. Real, ongoing surface — not a one-off page to deprioritize.

## Product Purpose

ndotoni Stays is the short-term/Airbnb-style booking product in the Ndotoni platform
for Tanzania. It exists because global platforms (Airbnb) weren't built for this
market: they miss local supply, don't support mobile money, and leave guests guessing
about property quality. Success is guests instantly booking verified local stays and
venues, and hosts reliably filling calendars and getting paid.

## Positioning

Local-first trust and payments: mobile money support, WhatsApp-based host/guest
contact, verified local listings, and bilingual English/Swahili — built for how
Tanzanians actually transact and communicate, not a global platform's defaults
transplanted onto a new market.

## Operating Context

- Sister product: `ndotoniWeb` (ndotoni.com) serves long-term rentals; the two apps
  share a Cognito user pool, so one account works on both sites. This app
  (`ndotoniStays`, ndotonistays.com) is the short-term/nightly/venue side.
- Thin client over a shared AWS backend (AppSync GraphQL + Lambdas/DynamoDB): pricing,
  availability, and booking/payment logic live server-side; this app orchestrates and
  renders.
- Booking is two-phase and not atomic: create the booking record, then collect payment
  (mobile money via `initiatePayment`, or Stripe Elements for cards/Apple Pay/Google
  Pay). Payment status is polled, not pushed.
- No server-side route protection; "protected" pages (`/host/*`, `/profile`,
  `/bookings`) gate client-side via `useAuth()`.
- WhatsApp is a first-class contact channel: a floating action button app-wide, plus a
  token-based no-login `/edit/[token]` flow for host approval/editing reached via
  WhatsApp links.
- A companion iOS app exists (App Store listing wired into metadata/`appLinks`); this
  repo is the web frontend, not the native app's source.
- AI-assisted listing copy generation exists server-side (`/api/ai/*`,
  `/api/generate-title`).
- Deploys via Vercel, auto-detected from the GitHub integration.

## Capabilities and Constraints

- Next.js 14 (App Router), React 18, Tailwind CSS.
- Auth/data: AWS Amplify + Cognito (shared pool with `ndotoniWeb`), AppSync GraphQL
  (API-key for public reads, Cognito JWT for authenticated calls).
- Payments: Stripe Elements (cards, Apple Pay, Google Pay) and mobile money via the
  backend's `initiatePayment`.
- Listing categories go beyond lodging: nightly stays, party venues, photoshoot
  locations, event spaces — the browse/search/property surfaces must read as more than
  a hotel-booking flow.
- Bilingual product: English and Swahili (`src/lib/i18n`), a durable constraint on any
  new copy or UI surface, not an afterthought localization pass.
- Host workflows: multi-step listing creation, calendar, payouts, reviews, WhatsApp
  tools — a distinct "operate" surface from the guest "persuade"/browse experience.

## Brand Commitments

- Name is styled lowercase in product copy and metadata: "ndotoni Stays" /
  "ndotoni Stays". Preserve this casing in new copy.
- Font: DM Sans (variable weight 300–800), loaded via `next/font/google`.

## Evidence on Hand

Early/seed stage — no real testimonials, usage stats, city-coverage numbers, or case
studies exist yet (the live `/invest` page itself frames this as a $10K seed raise).
Future design and copy work must not fabricate proof (review counts, "trusted by"
claims, metrics) that isn't actually true yet.

## Product Principles

- Design for how Tanzanians actually pay and communicate (mobile money, WhatsApp)
  rather than porting global-platform defaults.
- Treat guest, host, and investor as three real, differently-shaped audiences — not
  one generic "user."
- Never imply proof, scale, or trust signals ("thousands of stays," "top-rated") that
  aren't real yet; the seed-stage honesty is itself part of the brand voice.
- Listings span more than lodging (venues, photoshoots, events) — avoid designs or
  copy that quietly narrow the product to "hotel booking."
- Bilingual by default: EN/SW, not EN-with-a-translation-bolted-on.
