# HackyRank

TikTok-style short-video app for the footbag/hacky-sack community with a skill-ranking leaderboard.
Stack: React + Vite + Tailwind, Supabase (Postgres + Auth + Storage), Vercel for web, Capacitor for iOS.

## Live infra (already provisioned)

| Service  | Value |
| -------- | ----- |
| Supabase project | `gcecympcihbpnaxnbcmo` (region `us-east-1`) |
| Supabase URL | `https://gcecympcihbpnaxnbcmo.supabase.co` |
| Supabase anon key | `sb_publishable_316iKjYsBo-drOSxYRgwvA_eqVSQhBU` |
| Storage bucket | `videos` (public) |
| Tables | `users`, `videos`, `comments`, `likes`, `followers` (all with RLS) |

These are baked into `frontend/.env.local` (gitignored) so `npm run dev` and `npm run build` work out of the box.

## Repo layout

```
frontend/            React + Vite + Tailwind app (Vercel builds this)
  src/
    lib/             supabase client + auth context
    components/      Layout, VideoCard, Comments, ProtectedRoute
    pages/           Feed, Upload, Leaderboard, Profile, Login, Signup
  capacitor.config.json
  vercel.json
  .env.local         (gitignored — live keys, generated for you)
  .env.example
supabase/
  schema.sql         tables, RLS, score triggers, profile-on-signup
  storage-policies.sql
backend/             DEPRECATED — replaced by Supabase
vercel.json          tells Vercel to build the frontend/ subdir
```

## Run locally

```bash
cd frontend
npm install
npm run dev          # http://localhost:5173
```

## Deploy to Vercel

From this repo root (one-time auth + first deploy):

```bash
npx vercel login     # opens browser — pick your account
npx vercel link      # create or link a project (root dir: keep default ".")
npx vercel env add VITE_SUPABASE_URL          # paste https://gcecympcihbpnaxnbcmo.supabase.co
npx vercel env add VITE_SUPABASE_ANON_KEY     # paste sb_publishable_316iKjYsBo-drOSxYRgwvA_eqVSQhBU
npx vercel --prod
```

`vercel.json` in the repo root already tells Vercel to `cd frontend && npm install && npm run build` and serve `frontend/dist`, with SPA rewrites for React Router.

## Push to GitHub

```bash
git add -A
git commit -m "feat: live Supabase project + footbag tier rebrand"
gh repo create hackyrank --public --source . --remote origin --push
# or without gh:
# git remote add origin git@github.com:<you>/hackyrank.git
# git branch -M main
# git push -u origin main
```

Connect the repo in Vercel's dashboard for automatic deploys on push.

## iOS build (Capacitor)

```bash
cd frontend
npm install
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios     # opens Xcode
```

In Xcode: Signing & Capabilities → pick team. Bundle id defaults to `com.hackyrank.app`.

## Ranking

All score math runs in Postgres triggers (see `supabase/schema.sql`):

| Event           | Δ skill_score |
| --------------- | ------------- |
| Upload          | +5            |
| Like received   | +1            |
| Comment received| +2            |

Tier is recomputed on every `skill_score` update:

| Tier             | Threshold |
| ---------------- | --------- |
| Beginner         | 0         |
| Street Juggler   | 100       |
| Freestyler       | 500       |
| Pro Footbagger   | 1,500     |
| Elite            | 5,000     |
| Legend           | 15,000    |

## Features

- Email/password auth (Supabase Auth) with persistent sessions and protected routes
- TikTok-style vertical feed with auto-play-in-view, tap-to-pause
- Real video uploads (Supabase Storage `videos` bucket) with public URLs
- Likes, comments, follow/unfollow
- Per-user profile with grid of clips
- Global leaderboard with footbag-themed tier badges
- Mobile-first responsive UI, wrapped for iOS via Capacitor

## Roadmap

- "For You" personalized feed
- Push notifications (Capacitor + Supabase Edge Functions)
- Direct messages
- Region/school groups (Tysons, McLean, etc.)
- Badge rewards per tier
