# Ndotoni Stays

Next.js frontend for **ndotonistays.com** — the Airbnb-style short-term stay booking
product in the Ndotoni platform. Talks to the shared AWS backend
([`ndotoniBackend`](https://github.com/Ndotoni-Rental-Agency/ndotoniBackend)) via AppSync
GraphQL, and shares its Cognito user pool with the sister long-term-rental frontend
([`ndotoniWeb`](https://github.com/Ndotoni-Rental-Agency/ndotoniWeb), ndotoni.com) — the
same account works on both sites.

**→ For architecture, the data layer, auth, and the booking/payment flow, see
[`docs/README.md`](./docs/README.md).** This file only covers local setup.

## Prerequisites

- Node.js (Next.js 14 / React 18 — Node 18+)
- [pnpm](https://pnpm.io/)
- AWS CLI with credentials, **only if** you need to regenerate `schema.graphql`/generated
  types against the live AppSync API (see [docs/graphql-and-codegen.md](./docs/graphql-and-codegen.md))

## Setup

```bash
pnpm install
cp .env.example .env.local   # fill in the values below
pnpm dev                      # runs on http://localhost:3001
```

Runs on port **3001** (not the Next.js default 3000) so it can run alongside the sister
`ndotoniWeb` app locally without a port clash.

### Environment variables

`.env.example` documents the baseline set, but is missing a few real ones the app actually
needs — full list:

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_GRAPHQL_ENDPOINT` | AppSync API URL |
| `NEXT_PUBLIC_GRAPHQL_REGION` | AppSync region |
| `NEXT_PUBLIC_API_KEY` | AppSync API-key auth (used for public/unauthenticated queries) |
| `NEXT_PUBLIC_USER_POOL_ID` / `NEXT_PUBLIC_USER_POOL_CLIENT_ID` | Cognito — same pool as `ndotoniWeb` |
| `NEXT_PUBLIC_COGNITO_DOMAIN` | Cognito Hosted UI domain (Google/Apple/Facebook OAuth redirect) |
| `NEXT_PUBLIC_REDIRECT_SIGN_IN` / `NEXT_PUBLIC_REDIRECT_SIGN_OUT` | OAuth redirect URLs, point at `/auth/callback` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth (Apple/Facebook are configured Cognito-side, no client env var needed) |
| `NEXT_PUBLIC_CDN_URL` | Media CDN base URL |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | WhatsApp contact number shown in the floating action button |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | **Not in `.env.example` — required.** Stripe Elements card/Apple Pay/Google Pay payment. |
| `NEXT_PUBLIC_WHATSAPP_API_URL` | **Not in `.env.example` — required for the token-based `/edit/[token]` flow.** |
| `ANTHROPIC_API_KEY` | **Server-only, not in `.env.example` — required.** Used by the `/api/ai/*` and `/api/generate-title` route handlers (AI listing-copy generation). |

## Local development

No full local backend emulation — this app talks to a real deployed AppSync API (the beta
backend, per the checked-in `.env`). Just `pnpm dev` and go.

```bash
pnpm dev      # next dev --port 3001
pnpm build    # production build
pnpm start    # serve a production build locally
pnpm lint     # next lint
```

## Regenerating GraphQL types

If the backend schema changed:

```bash
pnpm schema:update   # downloads schema.graphql from AppSync, then regenerates src/API.ts + src/graphql/*.ts
```

See [docs/graphql-and-codegen.md](./docs/graphql-and-codegen.md) — there are two codegen
pipelines configured in this repo and only one is actually used; don't run the wrong one.

## Deployment

Deploys via **Vercel** (no `vercel.json`, no CI workflow in this repo — Vercel's
GitHub integration auto-detects and deploys Next.js on push, configured via the Vercel
dashboard). `@vercel/analytics`/`@vercel/speed-insights` are wired into the root layout.

## Where to go next

[`docs/README.md`](./docs/README.md) — architecture, GraphQL data layer, auth, and the
booking/payment flow (this app's core feature).
