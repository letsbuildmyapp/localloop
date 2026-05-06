# LocalLoop

Hyperlocal home services marketplace — cleaners, handymen, dog walkers, gardeners, movers, and tutors. Built as an LBMA portfolio demo.

## Stack

Per `~/Documents/Claude Code/STACK.md`:

- React 18 + TypeScript + Vite
- Tailwind CSS, shadcn-style primitives (Radix under the hood)
- React Router v6, TanStack Query
- react-hook-form + zod, Framer Motion, lucide-react, sonner
- **Firebase**: Auth, Firestore, Cloud Functions (Node 20 TS), Storage, Hosting (staging + production targets)
- **Stripe** Checkout (test mode) via Cloud Function
- Vitest

## Design choices (locked in)

- **Archetype:** Soft consumer (Cash App / Calm / Airbnb). Big rounded corners, warm coral primary on a peach off-white.
- **Type:** Fraunces (display, soft serif) + Plus Jakarta Sans (UI sans).
- **Palette (OKLCH-derived, expressed as HSL tokens in `src/index.css`):** primary coral `hsl(16 95% 65%)`, accent sage mint `hsl(156 35% 78%)`, warm cream background. Full dark mode included.
- **Radius:** `rounded-lg` = 1.5rem (extra-rounded for friendliness).
- **Hero pattern:** dual-image collage on a soft radial-gradient blob backdrop.
- **Niche:** hyperlocal home services in Austin, Brooklyn, Denver, Portland, Asheville, Oakland.

## Run locally

```bash
# 1. Install deps
npm install
cd functions && npm install && cd ..

# 2. Build cloud functions (TS → JS) so the emulator can load them
npm --prefix functions run build

# 3. Start the Firebase emulator suite (auth, firestore, functions, storage, hosting UI)
npm run emulators

# 4. In a second terminal, seed the emulator with realistic users + listings
npm run seed

# 5. In a third terminal, start the Vite dev server
npm run dev
```

Open http://localhost:5173. The app auto-detects `VITE_USE_EMULATORS=true` (set in `.env.local`) and routes Auth, Firestore, Functions, and Storage at the local emulator ports.

### Seeded accounts

All passwords are `password123`.

| Email | Role |
|---|---|
| buyer@localloop.dev | buyer |
| buyer2@localloop.dev | buyer |
| maria@localloop.dev | seller (cleaning) |
| jordan@localloop.dev | seller (handyman) |
| kenji@localloop.dev | seller (dog walking) |
| rosa@localloop.dev | seller (lawn care) |
| deshawn@localloop.dev | seller (moving) |
| amy@localloop.dev | seller (tutoring) |
| admin@localloop.dev | admin |

## End-to-end demo flow

1. Sign in as `buyer@localloop.dev`.
2. Browse to a Maria Alvarez listing → request a booking → it lands as `requested`.
3. In another window/incognito, sign in as `maria@localloop.dev` → Seller hub → Accept the request.
4. Back as the buyer → open the booking → "Pay now" (test mode marks it `paid`; in production this hands off to Stripe Checkout).
5. As the seller, "Mark complete" → buyer can leave a review (1–5 stars) which updates the listing's average rating in a Firestore transaction.
6. Either party can message the other from the listing page or booking detail.
7. Sign in as `admin@localloop.dev` → suspend a listing or user.

## Handoff to a real Firebase project (Alex's todo)

The project ID in `.firebaserc` is the placeholder `localloop-demo`. To go live:

1. Create a Firebase project (e.g., `localloop-prod`). Enable Auth (email + Google), Firestore, Storage, Functions (Blaze plan), Hosting.
2. Create two hosting sites: `localloop-staging` and `localloop`.
3. Update `.firebaserc` with the real project id (replace `localloop-demo`).
4. Copy the public web config from Project Settings → General into `.env.local`, replacing the placeholder values. Set `VITE_USE_EMULATORS=false` for prod builds.
5. Set Functions secrets (NEVER VITE-prefixed):
   ```bash
   firebase functions:secrets:set STRIPE_SECRET_KEY
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
   firebase functions:secrets:set ADMIN_EMAILS    # comma-separated
   ```
6. Deploy rules + functions + staging hosting:
   ```bash
   npm run build
   firebase deploy --only firestore:rules,storage,functions
   firebase deploy --only hosting:staging
   ```
7. Verify staging end-to-end. Then promote: `firebase deploy --only hosting:production`.
8. Wire the Stripe webhook to the deployed `stripeWebhook` function URL (Stripe dashboard → Developers → Webhooks).
9. Sign in once with the admin email and call the `claimAdmin` callable (or set `users/<uid>.role` to `admin` in Firestore directly).

## Notes & tradeoffs

- **Payments in the emulator** mark bookings paid client-side because Stripe webhooks aren't reachable from a local box without `stripe listen`. In deployed environments the `stripeWebhook` Cloud Function is the source of truth.
- **Search** is a client-side filter on top of Firestore queries (good for demo scale; production should add Algolia/Typesense).
- **Image storage** uses Unsplash URLs for seed listings; new listings reuse a curated stock set per category. Storage rules + upload UI exist for when you wire a real uploader.
- **Sentry / PostHog** are not initialized in this demo — drop their init into `src/main.tsx` once Alex provides DSNs.
