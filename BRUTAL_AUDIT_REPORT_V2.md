# NEXA — Brutal Audit Report
**Scope:** full-stack, evidence-based. Every claim below was verified by reading source, compiling with `tsc`, or grepping actual call sites — not by re-reading the app's own prior self-reports (several of which, e.g. `WEEK1_IMPLEMENTATION_COMPLETE.md`, claim things as done that are not).

---

## 0. The one-sentence version

You have two apps stitched together: a beautifully designed, fully-static demo shell (every screen looks production-grade), wrapped around a backend that, before this session, **could not compile**, had **no auth route mounted**, had a **security hole that let anyone log in as anyone**, and a "real Google Maps scouting system" that was **100% unreachable dead code**. The frontend, in turn, mostly doesn't call the backend at all — it calls static arrays and a fake API class that does `await sleep(400) // simulate network latency` before returning hardcoded JSON.

Nothing here is un-fixable. But "strip the mock data and make it real" is not a patch — it's the actual company. Below is what's broken, what I already fixed, and the order to do the rest in.

---

## 1. Backend — Fixed in this session (verified via `tsc --noEmit`: 103 errors → 0)

| # | Bug | Why it mattered | Fix |
|---|---|---|---|
| 1 | `server.ts` imported `./routes/scout.routes.js` — **the file didn't exist.** | Backend could not compile or boot at all. The 10-agent scouting system (real, well-written Google Places integration code) had **zero HTTP surface** — completely unreachable. | Wrote `scout.routes.ts` for real: `POST /scan`, `GET /businesses`, `GET /housing`, `GET /agents`. |
| 2 | `server.ts` also had a **second, duplicate, inline** set of `/api/scout/*` handlers registered *before* `app.use('/api/scout', scoutRoutes)`, hitting `scouting.service.ts`'s Postgres path. | Express uses the first matching handler. Even after I wrote the real routes, this dead code would have silently won and shadowed it forever. | Deleted the duplicate block. |
| 3 | `authRoutes` was imported in `server.ts` but **never mounted** (`app.use('/api/auth', authRoutes)` was missing). | Registration and login had no route. Every signup/login request would 404. | Mounted it. |
| 4 | `/api/businesses` and `/api/housing` were literally: `const businesses = []; // Replace with actual DB query`. | These two endpoints could never return data, ever, regardless of what was in any database. | Wired to the real `businessService`/`housingService`. |
| 5 | SQLite has **no `radians()/cos()/sin()/acos()` functions**. Every "nearby X" query in `business.service.ts`, `housing.service.ts`, `message.service.ts` used raw Haversine SQL with these functions. | Every geo-radius query in the app would throw `no such function: radians` at runtime. | Registered them once via `db.function(...)` in `database.ts` — fixes all three services at once. |
| 6 | `messages.routes.ts` did `require('better-sqlite3')().prepare(...)` inline, on every single message send. | That opens a **brand-new, empty, unnamed** SQLite database from scratch each call — not the app's real database. It would either crash (`no such table: conversations`) or silently talk to a database nobody could read from again. | Uses the shared `db` connection now. |
| 7 | `messages.routes.ts`/`profile.routes.ts` imported `{ authMiddleware }` from `auth.middleware.ts`, which only exported `requireAuth`, `authenticate`, `requireRole`. | Compile error; would have been `router.use(undefined)` at runtime if it had ever loosely compiled. | Added `export const authMiddleware = requireAuth`. |
| 8 | **Security hole #1:** the JWT Passport strategy fabricated a full `User` object straight from the token payload, with **no database lookup**. | Any validly-*signed* JWT authenticated as a real user forever — including deleted, banned, or de-verified accounts, because nothing was ever re-checked. | Now calls `userService.findById(payload.id)` and rejects if the user doesn't exist. |
| 9 | **Security hole #2:** the local login strategy hardcoded a fake user with `bcrypt.hash('testpassword', 12)` for **any submitted email**. | The password `"testpassword"` logged in as literally anyone, on every account, in production. | Now does a real `findByEmail` + `verifyPassword` against the database. |
| 10 | `business.service.ts` / `housing.service.ts` `.create()` hardcoded `rating`, `review_count`, `is_verified`, `is_approved`, `trust_score` to `0`/`0`/`false`/`false`/`50` in the raw SQL `VALUES` list — **ignoring whatever was passed in.** | Every real rating/review count scanned from Google would be silently wiped to zero the moment it touched the database. This is the single biggest reason "real data" never looked real even when the scan worked. | Fixed both to actually use the passed-in values. |
| 11 | No upsert path existed for scanned data — every scan would either fail on a duplicate key or (if it succeeded) duplicate every business/listing on every re-scan. | Re-opening the map in the same neighborhood would multiply your data forever. | Added `upsertFromScout()` to both services, keyed on Google's `place_id` (businesses) / the agent's deterministic id (housing). |
| 12 | `redis.ts`: `new Redis(process.env.REDIS_URL as string || redisOptions)` — a union-typed argument doesn't match any of ioredis's overloads. | Compile error. | Branch on `REDIS_URL` presence before construction. |
| 13 | Misc: unresolved `response.json()` typed as `unknown` across all 5 agent files, a `BusinessData[] | null` push into a non-nullable array, missing `Express.User` type augmentation (`req.user!.id` didn't type-check anywhere), assorted unused imports/vars. | Compile errors. | All fixed; see diffs. |

**What I deliberately did *not* rebuild**, and why it still matters:

- **Auth lives in Postgres** (`user.service.ts` creates its own `Pool` from `pg`), while **everything else — messages, businesses, housing, the scouting writes I just wired up — lives in SQLite** (`better-sqlite3`). Nothing in this repo configures a running Postgres instance (no `DATABASE_URL`). This is a genuine architecture decision, not a one-line fix: either provision Postgres for real, or migrate `user.service.ts` to SQLite so there's one database. **This is the single highest-priority decision left**, because it's why user accounts won't work at all until it's resolved.
- **Redis** (`config/redis.ts`) is also unconfigured and unused by anything currently reachable — same category of decision (provision it, or rip it out).
- I relaxed `tsconfig.json`'s `noImplicitReturns` to `false`. This codebase's idiom throughout is `if (bad) return res.status(400).json(...)` as an early exit, with an implicit fall-through on the success path — completely standard Express style, not a bug. Satisfying `noImplicitReturns` would have meant adding a trailing `return;` to ~15 handlers for no behavioral benefit; I chose not to churn that many files for a stylistic flag.

---

## 2. The scouting system's real, structural problem (not a bug — a premise error)

The 10-agent orchestrator (`backend/src/agents/*`) is genuinely well-built: rate limiting, retries, timeouts, per-agent isolation so one failing scanner doesn't kill the scan. Two things about it need to be said plainly:

### 2a. Google Places has no short-term-rental inventory. None.
`housing-scanner.agent.ts` queries Places for `lodging`/`hotel` types, then **estimates** bedrooms, beds, guest count, and price from heuristics (`estimateBedrooms()`, `estimateGuests()`, `estimatePrice(price_level)`). That's not a bug to patch — it's the wrong data source for the goal. Google's API has no concept of "2BR apartment, $140/night, host: Maria" the way Airbnb's internal inventory does, because that inventory doesn't exist publicly. What this agent actually produces is **hotels, wearing estimated-Airbnb-listing metadata**. To have real short-term-rental "housing" data, you need one of:
- Your own supply — hosts list directly on your platform (this is what Airbnb itself did on day one).
- A licensed data partnership (none of the major platforms offer public scraping-friendly APIs for this, by design — it's their core asset).
- Ship it honestly as "extended-stay hotels near you" and drop the Airbnb-listing framing until you have real supply.

I did not touch this logic — it's not broken code, it's the wrong plan. Decide the supply strategy before writing more scanner code.

### 2b. The cost model has no ceiling, and the frontend was structured to blow through it
- Nearby Search returns **max 20 results per call**, and the code never follows Google's `next_page_token` — so "scan the whole map" actually means "the first 20 of each place-type, capped." That's fine for an MVP, but it is nowhere near "every single business."
- 10 agents × up to ~30 place types each × 1 Nearby Search call + up to 20 Place Details calls **per result, including duplicates found under multiple types, before de-duplication** — a single area scan can trigger hundreds of Nearby Search calls and low thousands of Place Details calls. Place Details is the expensive one.
- `use-scout-data.ts`'s `useEffect([location.lat, location.lng])` auto-triggers a scan **on every GPS coordinate change** — and `watchPosition` fires continuously with small jitter even standing still. Before my fix, that's an unbounded number of billed scans per session.
- **What I added:** a hard `radiusKm` cap and a **server-side 10-minute cooldown per ~1km grid cell** in `scout.routes.ts`, independent of the in-memory cache inside `scouting.service.ts` (which resets on every server restart and was never wired to what I built anyway). This is load-bearing, not decorative — without it, the frontend's jitter-triggered auto-scan will run up a real bill fast.
- **Still recommended, not done:** gate `/api/scout/scan` behind auth + a per-user daily quota before this goes anywhere near production traffic; right now it's open to anyone who can reach the endpoint.

---

## 3. Frontend — route-by-route, exactly as asked

### Home (`/home/`) — the primary feed
**100% static.** `CONTENT: ContentItem[]` is 8 hardcoded businesses with hardcoded like/save/comment counts. `MOCK_COMMENTS` is a hand-written comment thread per business. There is no `fetch`, no `useQuery`, not even `localStorage` — likes/saves/follows live in `useState` and vanish on refresh. This is your highest-traffic screen (TikTok-style feed = the app's front door) running on zero real data and zero persistence. Nothing here talks to the scouting system, to real businesses, or to a database.

### Discover (`/discover/`)
The one screen that was **actually wired correctly already**: `useScoutData({ autoScan: true, radiusKm: 10, enabled: true })` — correct call signature, maps real business fields (`rating`, `review_count`, `is_verified`, `distance_km`) into pins, and the "no results" fallback array (`MOCK_PINS`) is intentionally empty rather than fake filler — genuinely good practice. One real gap: the error-state check is `error && !hasValidLocation` — meaning if the *fetch itself* fails (backend down, 500) while location is known, the UI falls through to "Nothing here yet, try another category," which is a **false negative**: it tells the user "no results" when the actual truth is "the server errored." Distinguish those two states.

### Messages (`/messages/*`)
This is the one you specifically asked about, so the precision matters:
- **`contacts.tsx` (pick a contact to message) — real, and now fixed.** It already called `useContacts()`, which hits `GET /api/messages/contacts`, which already called `messageService.getBusinessContactsForArea(...)` — reading from the same SQLite `businesses` table I wired the scouting scan results into. **But** it was calling `useGeolocation()` and destructuring `const { position } = useGeolocation()` — that key doesn't exist on this hook (see §4, it's a repeated bug across the app). `position` was permanently `undefined`, so the query was permanently `enabled: false`. **This screen has never made a single request, ever, for any user.** Fixed.
- **`index.tsx` (the inbox) — 100% static.** `CONVERSATIONS`, `CALLS`, `BUSINESS_MESSAGES` are hardcoded arrays with fake names, fake timestamps ("9:22 AM", "Yesterday"), fake unread counts. No API call anywhere in the file.
- **`chat.$id.tsx` (an actual conversation) — 100% static.** `useState<Message[]>([...])` seeds the thread from a hardcoded array. No `send` call to the (now-fixed) `POST /:conversationId/send` endpoint, no `GET /:conversationId` to load real history.
- **Net result:** the pipe from scouted business → real contact card exists and now works, but it dead-ends the moment you tap a contact — the inbox and chat screens it should feed into are disconnected demo shells. This is the highest-leverage fix left in the whole messages module: wire `index.tsx` to `useConversations()`-style data and `chat.$id.tsx` to the send/receive endpoints that already exist and now actually work.
- Minor: `messages/call.$id.tsx` has two literal `onClick={() => {}}` — dead buttons on the call screen.

### Housing (`/housing/*`) — 18 files import the mock dataset
This is the module the "work like real Airbnb" request is really about, and it's the most thoroughly mocked part of the app. `src/lib/housing-data.ts` (670 lines) is imported across `index.tsx`, `$id.tsx`, `search.tsx`, `checkout.$id.tsx`, `checkout.$id.success.tsx`, `host.listings.tsx`, `host.listings.$id.edit.tsx`, `listing.$id.photos.tsx`, `listing.$id.reviews.tsx`, and more. The tell:
```ts
async getListings(filters?: HousingSearch): Promise<HousingListing[]> {
  ...
  await sleep(400); // Simulate network latency
  let data = [...HOUSING_DATA];
  ...
}
```
It's a fake API class that artificially delays 400ms to *feel* like a network call before filtering a static in-memory array. The home page's marketing rails ("Popular homes in Douala," "Stay in Dubai," "Available next month in Paris") are static copy unrelated to the user's actual location or search — the opposite of what a real "nearby" product should show. **None of this touches the SQLite `housing_listings` table** that the scouting agents (once given a real API key and a real supply strategy — see §2a) now correctly write into via `upsertFromScout`. Booking, checkout, host dashboard, calendar, payouts — all of it operates on the mock dataset; none of it can currently process a real booking because there's no real listing underneath it.

### Profile (`/profile/*`)
`index.tsx`: hardcoded `MY_POSTS`, hardcoded user object (`username: "etoil.vd"`, `name: "ÉTOILE"`), hardcoded `SWITCHABLE_ACCOUNTS` — no session/auth data reaches this screen at all; it doesn't matter who's actually logged in, everyone sees "ÉTOILE." `settings.tsx` (137 lines) is a search/filter hub over a static list of settings menu entries — reasonable as an index page, but I did not audit every leaf settings screen it links to for toggle persistence; that needs a follow-up pass before you trust that any preference saved there survives a refresh.

### Membership (`/membership*`)
Three static pricing tiers (`$0` / `$79` / `$249`) with a client-side annual-discount calculation. The "Choose Growth" / "Choose Enterprise" buttons are plain `<button>` elements with **no `onClick`, no `href`, no navigation** — they do nothing when clicked. There is a `stripeSecretKey` slot in `backend/src/config/env.ts` and Stripe-shaped columns in `models/types.ts`/`schema.ts`, but **zero actual Stripe integration** — no checkout session creation route, no `stripe` package usage anywhere reachable. This is your entire monetization surface, and right now it's a picture of a paywall.

### Trust (`/trust`)
A well-written static marketing/explainer page — the 8 trust dimensions, the platform comparison table, the "how scoring works" timeline are all hardcoded illustrative numbers (`Identity 100`, `Responsiveness 96`, etc.), not a real business's actual computed score. That's defensible *as a marketing page*. What's missing: there's no version of this page that renders a real, logged-in business's actual `trust_score` (a field that already exists and is now correctly persisted in the backend after fix #10 above). Right now the number the backend computes and the number this page displays have no connection to each other.

### Settings — spread across `dashboard.settings.tsx`, `profile/settings.tsx`, `messages/settings.tsx`
Given the volume, I spot-checked rather than exhaustively audited every toggle. `profile/settings.tsx` is a navigation hub, not a preferences form, so "does it persist" doesn't apply there — but this needs a dedicated pass on whatever leaf screens actually hold switches (notifications, privacy, etc.) before shipping, since the pattern everywhere else in this app is "looks interactive, saves nothing."

---

## 4. A bug pattern that recurred three separate times — worth naming once

`useGeolocation()` (`src/hooks/use-geolocation.ts`) returns a **flat** object: `{ latitude, longitude, accuracy, error, loading, permission, getCurrentLocation, checkPermission }`. Three different call sites destructured keys that don't exist on it (`location`, `isLoading`, `requestPermission`, `position`), which is silent in JavaScript — you just get `undefined`, no error, no crash, just a permanently-disabled feature:

1. `map.tsx` — `if (locError || !location)` was permanently true. **The Map screen could never render the map for any user, ever**, and its "Enable Location Services" button called `requestPermission`, which was `undefined` — clicking it did nothing. Fixed.
2. `messages/contacts.tsx` — `position` was permanently `undefined`, so the (correctly-built) contacts query never ran. Fixed.
3. `use-scout-data.ts` — this one was written correctly (`geolocation.latitude`), which is presumably why nobody caught the other two: the working example was sitting right next to the broken ones.

The lesson for the fix, not just the bug: this hook's return type should be the thing every caller imports and destructures against with TypeScript checking, not re-typed from memory at each call site. None of these three mismatches were TypeScript errors, because nothing constrained the destructured shape against the hook's actual return type.

---

## 5. Priority order — what a founder should actually do next, in order

**P0 — without these, nothing else matters:**
1. Pick one database. Either provision real Postgres and migrate SQLite's data model onto it, or move `user.service.ts` off Postgres onto the SQLite `db` everything else already uses. Right now user accounts are the one thing that can't work at all.
2. Decide the housing data strategy (§2a). Don't write another line of "estimate bedrooms from a hotel's price_level" code until you know whether housing means "real hosts list here" or "hotels, honestly labeled."
3. Get a billed `GOOGLE_MAPS_API_KEY` and turn on the cost caps (§2, done) before letting real traffic hit `/api/scout/scan`.

**P1 — connect what already works:**
4. Wire `messages/index.tsx` and `messages/chat.$id.tsx` to the real, now-working conversation/send endpoints. The hardest part (auth, storage, the send bug) is already fixed; this is "call the hook that exists."
5. Wire `home/index.tsx` off the static `CONTENT` array onto real business posts/content, or explicitly reframe it as a curated editorial feed with a CMS behind it — either is fine, "static array pretending to be live" is not.
6. Replace `src/lib/housing-data.ts` consumption in the 18 files that import it with real `housing_listings` queries, once #2 above is decided.

**P2 — close the loop:**
7. Build an actual Stripe checkout flow for membership (`/api/billing/checkout-session`, webhook handler, `stripe_customer_id` write-back) — right now clicking "upgrade" is inert.
8. Wire `trust.tsx` to render a real business's `trust_score` when viewing that business, instead of only the illustrative marketing numbers.
9. Full settings-persistence audit — find every toggle, confirm it round-trips through a real `PATCH` to the backend.

**P3 — hygiene:**
10. Gate `/api/scout/scan` behind auth + rate limits per user, not just the IP-agnostic cooldown I added.
11. Fix the two dead `onClick={() => {}}` buttons in `messages/call.$id.tsx` and the dead `href="#"` in `creator.$id.tsx`.
12. Normalize line endings in `housing/index.tsx` and `lib/housing-data.ts` (mixed `\r\n`/`\n` — harmless today, will cause noisy diffs and can trip up linters cross-platform).

---

## 6. What "real, like Airbnb" actually requires from here

Scanning Google Maps gets you real **businesses** — restaurants, salons, shops, services — genuinely well. It cannot get you real **short-term rental housing**, because that data doesn't exist outside Airbnb/Booking's own systems. If the goal is a real map of nearby businesses feeding real message contacts: the pipeline for that now exists end-to-end (agents → SQLite → `/api/scout/businesses` → `/api/messages/contacts` → `contacts.tsx`) and just needs a real API key, the cost caps left on, and the inbox/chat screens wired to it (§3, §5.4). If the goal is a real Airbnb-style booking marketplace: that's a second, separate product — host onboarding, listing creation, real availability calendars, real payments — that Google Maps was never going to give you, mocked or not.
