# HackyRank

TikTok-style short-video app with a skill-ranking leaderboard.
Stack: React + Vite + Tailwind, Supabase (Postgres + Auth + Storage), Vercel for web, Capacitor for iOS.

## Repo layout

```
frontend/            React + Vite + Tailwind app (this is what Vercel builds)
  src/
    lib/             supabase client + auth context
    components/      Layout, VideoCard, Comments, ProtectedRoute
    pages/           Feed, Upload, Leaderboard, Profile, Login, Signup
  capacitor.config.json
  vercel.json
  .env.example
supabase/
  schema.sql         tables, RLS, score triggers, profile-on-signup
  storage-policies.sql
backend/             DEPRECATED — replaced by Supabase
```

## 1. Supabase setup

1. Create a new project at https://supabase.com.
2. SQL editor → paste **`supabase/schema.sql`** → Run.
3. Storage → **New bucket** → name `videos`, **Public**.
4. SQL editor → paste **`supabase/storage-policies.sql`** → Run.
5. Project Settings → API → copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
6. Authentication → Providers → enable **Email** (disable "Confirm email" while testing if you want instant logins).

## 2. Run locally

```bash
cd frontend
cp .env.example .env.local
# paste your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm install
npm run dev
```

Open http://localhost:5173.

## 3. Push to GitHub

```bash
# from repo root
git init
git add .
git commit -m "feat: initial HackyRank (Supabase + Vercel + Capacitor)"
gh repo create hackyrank --public --source . --remote origin --push
# or, manually:
# git remote add origin git@github.com:<you>/hackyrank.git
# git branch -M main
# git push -u origin main
```

## 4. Deploy to Vercel

1. https://vercel.com/new → import your `hackyrank` repo.
2. **Root Directory:** `frontend`.
3. Framework preset: **Vite** (auto-detected).
4. Environment Variables (Production + Preview):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy.

`frontend/vercel.json` rewrites all paths to `index.html` so React Router deep links work.

## 5. iOS build (Capacitor)

```bash
cd frontend
npm install
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios     # opens Xcode
```

Requires macOS + Xcode. In Xcode:
- Signing & Capabilities → pick your Apple Developer team.
- Bundle Identifier defaults to `com.hackyrank.app` — change if needed.
- Replace `App/App/Assets.xcassets/AppIcon.appiconset/` with real icons.
- Run on a simulator or device.

Submit to App Store Connect via Xcode → Product → Archive → Distribute.

## Ranking

Scores are computed entirely in Postgres triggers (see `schema.sql`):

| Event           | Δ skill_score |
| --------------- | ------------- |
| Upload          | +5            |
| Like received   | +1            |
| Comment received| +2            |

Tier is recomputed from `skill_score` on every update:
Bronze → Silver (200) → Gold (750) → Platinum (2000) → Diamond (5000).

## Features

- Email/password auth with persistent sessions, protected routes
- TikTok-style vertical feed with auto-play on viewport, tap-to-pause
- Real video uploads to Supabase Storage with public URLs
- Likes, comments, follow/unfollow
- Per-user profile with grid of clips
- Global leaderboard with tier badges
- Mobile-first responsive UI, safe to wrap in Capacitor

## Roadmap

- “For You” personalized feed
- Push notifications (Capacitor + Supabase functions)
- Direct messages
- Region/school groups (Tysons, McLean, etc.)
- Badge rewards per tier
