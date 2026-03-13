# EnglishPro Advanced Authentication Architecture

EnglishPro employs an enterprise-grade authentication sub-system governed by strict JWT issuance, rate limiting, and global Zustand state interception.

## Security Mechanisms

### 1. Robust Rate Limiting

The NestJS backend natively uses `@nestjs/throttler` to rate-limit aggressive IPs requesting sensitive `/auth` routes to prevent trivial brute-force bot attacks.

### 2. Token Refresh Chains

Instead of persisting long-lived generic JWTs, EnglishPro now issues:

- `access_token` (Short lived, 15m duration)
- `refresh_token` (Long lived, 7d duration)

When the NextJS `fetchApi` lib intercepts a **401 Unauthorized** payload from the backend API, the frontend _silently_ hits `/auth/refresh` parsing the `js-cookie` refresh token to hot-swap out a perfectly valid, brand-new access token without forcefully interrupting the user's dashboard experience.

### 3. Native CSRF Protection

Typical systems storing `access_token` tokens in `secure` HTTPOnly cookies are prone to CSRF if SameSite restrictions slip.

_EnglishPro_ eliminates this exploit vector by manually reading `js-cookies` via Javascript, then explicitly crafting an `Authorization: Bearer <TOKEN>` header strictly on API requests. Therefore, a CSRF attack executing natively through a generic `<img>` or `<form>` anchor will completely lack the `Bearer` payload, triggering an instant 401 bounce at the backend `JwtAuthGuard`.

### 4. Zero Alert UIs

As requested, there are precisely zero `.alert()` browser intercepts or global full-page blocking errors. Every edge-case handles gracefully mapping deeply into React Hook Form's `form.formState.errors.root.serverError` component for completely bespoke, inline UI rendering.

## Testing the Auth Core

To run the automated Auth `Jest` module strictly testing Login states and Token clearance logic:

```bash
cd backend
npm run test src/auth
```
