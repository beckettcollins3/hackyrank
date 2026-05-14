-- HackyRank — Supabase schema
-- Paste into Supabase SQL editor and run.
-- Idempotent: safe to re-run.

-- =========================================================
-- EXTENSIONS
-- =========================================================
create extension if not exists "pgcrypto";

-- =========================================================
-- TABLES
-- =========================================================

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  bio text,
  skill_score int not null default 0,
  rank_tier text not null default 'Bronze',
  created_at timestamptz not null default now()
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  video_url text not null,
  caption text,
  likes_count int not null default 0,
  comments_count int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists videos_user_id_idx on public.videos(user_id);
create index if not exists videos_created_at_idx on public.videos(created_at desc);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);
create index if not exists comments_video_id_idx on public.comments(video_id);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, video_id)
);
create index if not exists likes_video_id_idx on public.likes(video_id);

create table if not exists public.followers (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);
create index if not exists followers_follower_idx on public.followers(follower_id);
create index if not exists followers_following_idx on public.followers(following_id);

-- =========================================================
-- RANKING — derive tier from skill_score
-- =========================================================
create or replace function public.compute_rank_tier(score int)
returns text language sql immutable as $$
  select case
    when score >= 5000 then 'Diamond'
    when score >= 2000 then 'Platinum'
    when score >= 750  then 'Gold'
    when score >= 200  then 'Silver'
    else 'Bronze'
  end;
$$;

create or replace function public.refresh_rank_tier()
returns trigger language plpgsql as $$
begin
  new.rank_tier := public.compute_rank_tier(new.skill_score);
  return new;
end $$;

drop trigger if exists trg_refresh_rank_tier on public.users;
create trigger trg_refresh_rank_tier
  before insert or update of skill_score on public.users
  for each row execute function public.refresh_rank_tier();

-- =========================================================
-- AUTO-CREATE profile row on signup
-- =========================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  uname text;
begin
  uname := coalesce(
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
  );
  -- ensure unique username with suffix on collision
  if exists (select 1 from public.users where username = uname) then
    uname := uname || '_' || substr(new.id::text, 1, 6);
  end if;

  insert into public.users (id, username) values (new.id, uname);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- SCORING TRIGGERS
--   upload      => +5
--   like recv   => +1
--   comment recv=> +2
-- =========================================================

-- +5 for new upload
create or replace function public.bump_score_on_video()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  update public.users set skill_score = skill_score + 5 where id = new.user_id;
  return new;
end $$;

drop trigger if exists trg_bump_score_on_video on public.videos;
create trigger trg_bump_score_on_video
  after insert on public.videos
  for each row execute function public.bump_score_on_video();

-- +1 to video owner on like; -1 on unlike
create or replace function public.handle_like_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_owner uuid;
begin
  if (tg_op = 'INSERT') then
    select user_id into v_owner from public.videos where id = new.video_id;
    update public.videos set likes_count = likes_count + 1 where id = new.video_id;
    if v_owner is not null then
      update public.users set skill_score = skill_score + 1 where id = v_owner;
    end if;
    return new;
  elsif (tg_op = 'DELETE') then
    select user_id into v_owner from public.videos where id = old.video_id;
    update public.videos set likes_count = greatest(likes_count - 1, 0) where id = old.video_id;
    if v_owner is not null then
      update public.users set skill_score = greatest(skill_score - 1, 0) where id = v_owner;
    end if;
    return old;
  end if;
  return null;
end $$;

drop trigger if exists trg_like_change on public.likes;
create trigger trg_like_change
  after insert or delete on public.likes
  for each row execute function public.handle_like_change();

-- +2 to video owner on new comment
create or replace function public.handle_comment_change()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_owner uuid;
begin
  if (tg_op = 'INSERT') then
    select user_id into v_owner from public.videos where id = new.video_id;
    update public.videos set comments_count = comments_count + 1 where id = new.video_id;
    if v_owner is not null then
      update public.users set skill_score = skill_score + 2 where id = v_owner;
    end if;
    return new;
  elsif (tg_op = 'DELETE') then
    select user_id into v_owner from public.videos where id = old.video_id;
    update public.videos set comments_count = greatest(comments_count - 1, 0) where id = old.video_id;
    if v_owner is not null then
      update public.users set skill_score = greatest(skill_score - 2, 0) where id = v_owner;
    end if;
    return old;
  end if;
  return null;
end $$;

drop trigger if exists trg_comment_change on public.comments;
create trigger trg_comment_change
  after insert or delete on public.comments
  for each row execute function public.handle_comment_change();

-- =========================================================
-- ROW LEVEL SECURITY
-- =========================================================
alter table public.users     enable row level security;
alter table public.videos    enable row level security;
alter table public.comments  enable row level security;
alter table public.likes     enable row level security;
alter table public.followers enable row level security;

-- USERS: public read, owner write
drop policy if exists "users select all" on public.users;
create policy "users select all" on public.users for select using (true);

drop policy if exists "users update self" on public.users;
create policy "users update self" on public.users for update using (auth.uid() = id);

-- VIDEOS: public read, authenticated insert (own row), owner delete
drop policy if exists "videos select all" on public.videos;
create policy "videos select all" on public.videos for select using (true);

drop policy if exists "videos insert own" on public.videos;
create policy "videos insert own" on public.videos for insert with check (auth.uid() = user_id);

drop policy if exists "videos delete own" on public.videos;
create policy "videos delete own" on public.videos for delete using (auth.uid() = user_id);

-- COMMENTS: public read, authenticated insert own, owner delete
drop policy if exists "comments select all" on public.comments;
create policy "comments select all" on public.comments for select using (true);

drop policy if exists "comments insert own" on public.comments;
create policy "comments insert own" on public.comments for insert with check (auth.uid() = user_id);

drop policy if exists "comments delete own" on public.comments;
create policy "comments delete own" on public.comments for delete using (auth.uid() = user_id);

-- LIKES: public read, authenticated insert/delete own
drop policy if exists "likes select all" on public.likes;
create policy "likes select all" on public.likes for select using (true);

drop policy if exists "likes insert own" on public.likes;
create policy "likes insert own" on public.likes for insert with check (auth.uid() = user_id);

drop policy if exists "likes delete own" on public.likes;
create policy "likes delete own" on public.likes for delete using (auth.uid() = user_id);

-- FOLLOWERS: public read, authenticated follow/unfollow as self
drop policy if exists "followers select all" on public.followers;
create policy "followers select all" on public.followers for select using (true);

drop policy if exists "followers insert own" on public.followers;
create policy "followers insert own" on public.followers for insert with check (auth.uid() = follower_id);

drop policy if exists "followers delete own" on public.followers;
create policy "followers delete own" on public.followers for delete using (auth.uid() = follower_id);

-- =========================================================
-- STORAGE BUCKET (run separately in Storage > Policies if needed)
-- =========================================================
-- 1. Create a public bucket named "videos" in Supabase UI (Storage tab).
-- 2. Add policies:
--    - "videos public read":   bucket_id = 'videos'                              [SELECT, role: anon, authenticated]
--    - "videos auth upload":   bucket_id = 'videos' AND auth.role() = 'authenticated'   [INSERT, role: authenticated]
--    - "videos owner delete":  bucket_id = 'videos' AND owner = auth.uid()              [DELETE, role: authenticated]
