# GraphQL Data Layer & Codegen

## Client setup

`src/lib/amplify.ts` configures Amplify once at module load: `Auth.Cognito` (user pool +
Hosted UI OAuth config) and `API.GraphQL` (AppSync endpoint/region,
`defaultAuthMode: 'apiKey'`).

`src/lib/graphql-client.ts` — the shared data-access layer, a static class
`GraphQLClient` wrapping Amplify's `generateClient()`:

- `execute()` — auto-detects auth (tries `getCurrentUser()`, falls back to `apiKey`).
- `executeAuthenticated()` — forces Cognito JWT auth, **throws if not signed in**.
- `executePublic()` — forces `apiKey` auth.
- `getRawClient()` — the raw Amplify client, used directly for subscriptions.

In practice, most call sites don't use `execute()`'s auto-detection — they pick
`executeAuthenticated` vs. `executePublic` explicitly based on
`useAuth().isAuthenticated`, and this same conditional is duplicated across
`BookingSidebar.tsx`, `PaymentFlow.tsx`, `StripePaymentForm.tsx`,
`booking/[propertyId]/page.tsx`, `pay/[id]/page.tsx`, and others. If you're adding a new
authenticated-or-public call, copy this pattern rather than inventing a new one.

## Operations and types

GraphQL operations live in `src/graphql/{queries,mutations,subscriptions}.ts` — plain
exported string constants, typed against `src/API.ts` (the generated types file). Import
types from `@/API` (e.g. `import { ShortTermProperty } from '@/API'`), not from anywhere
else.

**Exception**: `src/lib/auth-bridge.ts` hand-writes a few auth mutations inline
(`signUp`, `verifyEmail`, `resendVerificationCode`, `forgotPassword`, `resetPassword`)
rather than importing them from `src/graphql/mutations.ts`. This is inconsistent with the
rest of the codebase — if you're touching auth mutations, check both places.

## Two codegen pipelines — only one is used

This repo has **two separate GraphQL codegen configs**, which is confusing if you don't
know only one is live:

1. **Amplify CLI codegen** (`.graphqlconfig.yml`) — the real, active pipeline. Generates
   `src/API.ts` (types) and `src/graphql/{queries,mutations,subscriptions}.ts`
   (operations). This is what the whole app imports from.
2. **`graphql-codegen`** (`codegen.yml` at repo root) — generates `src/generated/graphql.ts`.
   **Nothing in `src/` imports from `@/generated`** — this pipeline's output is dead code.
   Don't extend it thinking it's the "modern"/"real" one; it isn't wired up anywhere.

## Regenerating after a backend schema change

```bash
pnpm schema:update
```

This runs, in order:

1. `schema:download` — `aws appsync get-introspection-schema --api-id <id> --region
   us-west-2 --format SDL schema.graphql` (requires AWS CLI credentials with AppSync
   read access).
2. `schema:clean` — strips AWS-specific directives (`@aws_*`) from the downloaded SDL via
   an inline script in `package.json`.
3. `schema:generate` (= `amplify:codegen` = `amplify:statements && amplify:types`) —
   regenerates `src/API.ts` + `src/graphql/*.ts` from the cleaned schema. **This does not
   touch `src/generated/graphql.ts`** — the dead pipeline has to be run separately
   (`pnpm codegen`) if you actually want it up to date, which normally you don't.

If the app is throwing type errors after a backend change and `pnpm schema:update` doesn't
seem to have taken effect, double check you're not looking at (or importing from)
`src/generated/graphql.ts` by mistake.
