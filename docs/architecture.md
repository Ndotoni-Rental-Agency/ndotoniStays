# Architecture

## Tech stack

- **Next.js 14, App Router** (`src/app/`), React 18, TypeScript, Tailwind CSS.
- **Auth**: AWS Amplify v6 + Cognito (shared user pool with `ndotoniWeb`) — see [auth.md](./auth.md).
- **Data**: AppSync GraphQL via Amplify's `generateClient()`, wrapped in a thin custom
  `GraphQLClient` (`src/lib/graphql-client.ts`) — see [graphql-and-codegen.md](./graphql-and-codegen.md).
- **Payments**: Stripe Elements (`@stripe/stripe-js`/`@stripe/react-stripe-js`) for
  cards/Apple Pay/Google Pay, plus a custom Tanzanian mobile-money flow
  (M-Pesa/Airtel/Tigo/Halotel) that goes through the backend's `initiatePayment` mutation
  — see [booking-and-payment.md](./booking-and-payment.md).
- **Maps**: `leaflet`/`react-leaflet` for property location display.
- **No state-management or data-fetching library** — no Redux/Zustand/React
  Query/SWR/Apollo. Data fetching is ad-hoc per-component (`useEffect` + `GraphQLClient`
  calls); shared state lives in three lightweight React Contexts: `AuthContext`,
  `ChatContext`, `LanguageContext`.
- **Deployed on Vercel** (inferred from `@vercel/analytics`/`@vercel/speed-insights` usage
  — no `vercel.json` or CI workflow in-repo; deploy config lives in the Vercel dashboard).

## Route map (`src/app/`)

| Route | What it is |
|---|---|
| `/` | Homepage — hero, category grid, cross-promo to the long-term-rental site, trust/how-it-works sections |
| `/about` | Static marketing page |
| `/invest` | Investor pitch/fundraising landing page |
| `/app` | Smart app-store redirect (UA-sniffs iOS/Android, falls back to web) |
| `/search` | Property search/listing results, filterable |
| `/property/[id]` | Property detail — server component does SEO metadata + JSON-LD, client component renders gallery/booking sidebar/reviews/map |
| `/booking/[propertyId]` | **Booking creation + payment** — the core flow, see [booking-and-payment.md](./booking-and-payment.md) |
| `/bookings` | Guest's own bookings (past/upcoming), leave a review, cancel |
| `/bookings/[id]/confirm` | **Token-authenticated, no login** — host approves/declines a pending booking request via a link sent out-of-band |
| `/pay/[id]` | Standalone/shareable payment link — pay an already-created, host-confirmed booking |
| `/become-host` | Multi-step listing creation wizard — works signed-in or signed-out |
| `/host` | Host dashboard shell + property list/earnings summary (auth-gated layout) |
| `/host/create` | Redirects to `/become-host` |
| `/host/property/[id]/edit` | Edit an existing listing |
| `/host/calendar` | Host-wide booking calendar across all their properties |
| `/host/bookings` | Host's bookings across all properties |
| `/host/payouts` | Host payout method setup (mobile money or bank) |
| `/host/reviews` | Reviews received across host's properties |
| `/host/whatsapp` | Associate a WhatsApp number with the host account |
| `/edit/[token]` | **Token-authenticated, no login** — magic-link listing self-edit, likely sent via WhatsApp/SMS for hosts who signed up through the chat bot |
| `/chat` | In-app guest↔host messaging, real-time via GraphQL subscriptions (the *only* subscription usage in this app) |
| `/profile` | User profile edit |
| `/auth/callback` | OAuth redirect handler (Cognito Hosted UI → Google/Apple/Facebook) |
| `/verify-email`, `/reset-password` | Post-signup email verification, forgot/reset password |
| `/api/generate-title`, `/api/ai/generate-description`, `/api/ai/predict-price`, `/api/ai/generate-checkin-instructions` | Route Handlers calling the Anthropic API **server-side** (`ANTHROPIC_API_KEY`) to AI-assist listing creation |
| `robots.ts` / `sitemap.ts` | Dynamic; `sitemap.ts` queries `searchShortTermProperties` directly against AppSync at request/build time across a hardcoded region list |

No `middleware.ts` exists — see [auth.md](./auth.md) for how route protection actually
works (entirely client-side).

## Data flow

Almost every page follows the same shape: a client component calls
`GraphQLClient.execute()` / `.executeAuthenticated()` / `.executePublic()`
(`src/lib/graphql-client.ts`) with a query/mutation constant imported from
`src/graphql/{queries,mutations,subscriptions}.ts`, typed against `src/API.ts`. There is
no shared domain-hook layer (no `useBooking`/`useSearch`/`useProperty`) — components call
the client directly inside `useEffect`/handlers, choosing auth mode based on
`useAuth().isAuthenticated`. See [graphql-and-codegen.md](./graphql-and-codegen.md) for
the full mechanics and a known inconsistency (`auth-bridge.ts` hand-writes some auth
mutations instead of importing from the generated `mutations.ts`).

## Cross-repo coupling worth knowing

`src/constants/pricing.ts`'s `SERVICE_FEE_ENABLED` flag (currently `false`) must be kept
in sync with the backend's `Config.Pricing.SERVICE_FEE_ENABLED` flag
(`ndotoniBackend/packages/lambda/src/config/index.ts`) — the frontend computes a client-side
price breakdown for display, but the backend is authoritative
(`calculateBookingPrice` query) and pricing must agree. If a price shown on the booking
page doesn't match what's actually charged, check both flags are in sync before assuming
either side has a bug.
