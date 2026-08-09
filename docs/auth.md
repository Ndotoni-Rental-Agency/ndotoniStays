# Auth

AWS Cognito via AWS Amplify v6 — **the same user pool as the sister `ndotoniWeb`
(ndotoni.com) app**. A user account works on both sites without re-registering.

## Key files

- `src/contexts/AuthContext.tsx` — the central auth state provider (`AuthProvider`/
  `useAuth()`). On mount: checks `AuthBridge.hasSession()`, hydrates instantly from
  `localStorage.getItem('user')` for fast paint, then always refreshes via the backend's
  `getMe` GraphQL query. Exposes `user`, `isAuthenticated`, `isLoading`, and all auth
  actions (`signIn`, `signUp`, `signInWithGoogle/Apple/Facebook`, `verifyEmail`,
  `resendVerificationCode`, `forgotPassword`, `resetPassword`, `signOut`, `refreshUser`).
  Used outside a provider (e.g. during SSR) returns safe no-op defaults rather than
  throwing.
- `src/lib/auth-bridge.ts` (`AuthBridge`) — wraps Amplify's `signIn`/`signOut`/
  `getCurrentUser`/`signInWithRedirect` (OAuth), plus custom backend GraphQL mutations for
  `signUp`/`verifyEmail`/`resendVerificationCode`/`forgotPassword`/`resetPassword` — these
  are backend-custom mutations, not raw Cognito calls, because the backend owns
  account-creation/verification business logic. **Quirk**: `getMe`'s profile types
  (Tenant/Landlord/Agent/Admin) have no `id` field in the GraphQL schema, so
  `AuthBridge.getUserId()` reads the real Cognito `sub` directly from `getCurrentUser()`
  instead — used e.g. for chat message-ownership checks. Keep this in mind if you're ever
  tempted to add an `id` field to a profile type; there may be code relying on its
  absence.

## No middleware — route protection is entirely client-side

There is **no `middleware.ts`** in this repo (unlike some setups where auth is enforced at
the edge). Every "protected" page checks auth itself:

- `src/app/host/layout.tsx` — the gating pattern: check `isAuthenticated`/`isLoading` from
  `useAuth()`, show a loading skeleton while resolving, then either render an `AuthModal`
  (sign-in prompt) or let the page through. Note `/host` (root) and `/host/create` are
  intentionally left open to unauthenticated users — the become-host flow prompts sign-in
  only *after* the user submits, not before.
- `src/components/auth/AuthModal.tsx` — a modal (not a page), reused for inline sign-in/up
  throughout the app (booking, host dashboard, profile).

## Token-based (no-login) links

Two flows bypass Cognito entirely, authorizing via a one-time token instead:

- **`/bookings/[id]/confirm?token=...`** — host approves/declines a pending booking
  request via a link sent out-of-band (WhatsApp/email/SMS), no login required.
- **`/edit/[token]`** — magic-link listing self-edit, similarly no login.

Both call `GraphQLClient.executePublic()` with the token passed as a mutation argument;
authorization is enforced backend-side against the token, not by Cognito. If you're
debugging "why can this host edit/approve without being signed in" — that's by design for
these two routes specifically, not a security bug.

## Guest checkout

Booking does **not** require an account — see
[booking-and-payment.md](./booking-and-payment.md). Auth is optional for the core
transaction and only required/encouraged for account-tied features (saved bookings, host
dashboard).
