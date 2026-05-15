// Deterministic-by-date daily challenges. Progress is persisted in
// localStorage. Real scoring happens server-side via the existing triggers;
// challenges are a client-side motivation layer.

const POOL = [
  {
    id: "ten-touch",
    title: "10-Touch No-Drop",
    sub: "Land 10 clean touches in one run.",
    goal: 10,
    unit: "touches",
    xp: 25,
  },
  {
    id: "around-world",
    title: "Around the World",
    sub: "Hit 1 around-the-world combo today.",
    goal: 1,
    unit: "combo",
    xp: 40,
  },
  {
    id: "stall-hold",
    title: "Stall Hold",
    sub: "Hold any stall for 3 seconds.",
    goal: 1,
    unit: "hold",
    xp: 20,
  },
  {
    id: "axel-five",
    title: "5 Clean Axels",
    sub: "Land 5 axel kicks across the day.",
    goal: 5,
    unit: "axels",
    xp: 30,
  },
  {
    id: "no-drop-30",
    title: "30-Touch No Drop",
    sub: "30 touches without the sack hitting the ground.",
    goal: 30,
    unit: "touches",
    xp: 60,
  },
  {
    id: "post-clip",
    title: "Post a Clip",
    sub: "Upload one clip — anything counts.",
    goal: 1,
    unit: "clip",
    xp: 35,
  },
  {
    id: "two-feet",
    title: "Both Feet",
    sub: "Land touches on both feet in a single run.",
    goal: 1,
    unit: "run",
    xp: 25,
  },
];

const WEEKLY = {
  id: "weekly-battle",
  title: "Weekly Trick Battle",
  sub: "Earn 200 XP across the week to climb the local board.",
  goal: 200,
  unit: "XP",
  xp: 150,
};

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

function isoWeek() {
  const d = new Date();
  const start = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = (start.getUTCDay() + 6) % 7;
  start.setUTCDate(start.getUTCDate() - day + 3);
  const firstThursday = new Date(Date.UTC(start.getUTCFullYear(), 0, 4));
  const week =
    1 +
    Math.round(
      ((start - firstThursday) / 86400000 - 3 + ((firstThursday.getUTCDay() + 6) % 7)) /
        7
    );
  return `${start.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function todaysChallenge() {
  // Pick deterministically based on day of year
  const d = new Date();
  const dayOfYear =
    Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000) | 0;
  return { ...POOL[dayOfYear % POOL.length], date: todayKey() };
}

export function weeklyChallenge() {
  return { ...WEEKLY, week: isoWeek() };
}

function storageKey(c) {
  return `hackyrank.challenge:${c.id}:${c.date ?? c.week}`;
}

export function getProgress(c) {
  try {
    const raw = localStorage.getItem(storageKey(c));
    if (!raw) return { done: 0, completed: false, claimed: false };
    return JSON.parse(raw);
  } catch {
    return { done: 0, completed: false, claimed: false };
  }
}

export function setProgress(c, state) {
  try {
    localStorage.setItem(storageKey(c), JSON.stringify(state));
  } catch {}
}

export function bumpProgress(c, by = 1) {
  const cur = getProgress(c);
  if (cur.completed) return cur;
  const done = Math.min(c.goal, cur.done + by);
  const next = { ...cur, done, completed: done >= c.goal };
  setProgress(c, next);
  return next;
}

export function claim(c) {
  const cur = getProgress(c);
  if (!cur.completed || cur.claimed) return cur;
  const next = { ...cur, claimed: true };
  setProgress(c, next);
  return next;
}
