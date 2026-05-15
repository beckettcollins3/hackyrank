// Local-only demo dataset. Pages mix this in when real data is thin so the app
// never feels empty. Demo IDs are prefixed `demo:` so write paths can detect
// them and skip Supabase calls (no fake rows ever land in the production DB).

const SAMPLES = [
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
];

export const DEMO_REGIONS = [
  "Tysons, VA",
  "McLean, VA",
  "Vienna, VA",
  "Reston, VA",
  "Arlington, VA",
  "Northern Virginia",
  "Virginia Tech",
  "Fairfax, VA",
];

export const COMMUNITIES = [
  { id: "tysons", name: "Tysons", region: "Tysons, VA", emoji: "🏙️" },
  { id: "mclean", name: "McLean", region: "McLean, VA", emoji: "🌳" },
  { id: "vt", name: "Virginia Tech", region: "Virginia Tech", emoji: "🦃" },
  { id: "nova", name: "Northern VA", region: "Northern Virginia", emoji: "🗺️" },
  { id: "reston", name: "Reston", region: "Reston, VA", emoji: "🛹" },
  { id: "arlington", name: "Arlington", region: "Arlington, VA", emoji: "🌉" },
];

export const DEMO_USERS = [
  { id: "demo:u:kicker",        username: "kicker",        rank_tier: "Legend",          skill_score: 18420, region: "Tysons, VA",         bio: "Stalls are my love language. 6yr in the bag." },
  { id: "demo:u:stallqueen",    username: "stallqueen",    rank_tier: "Elite",           skill_score: 8930,  region: "McLean, VA",         bio: "Toe-stall princess. McLean reppin'." },
  { id: "demo:u:toesnatcher",   username: "toesnatcher",   rank_tier: "Elite",           skill_score: 7240,  region: "Virginia Tech",      bio: "VT hacky team captain. Catch me on the drillfield." },
  { id: "demo:u:flowman",       username: "flowman",       rank_tier: "Pro Footbagger",  skill_score: 3120,  region: "Reston, VA",         bio: "Flow > tricks. Sunset sessions only." },
  { id: "demo:u:axelboi",       username: "axelboi",       rank_tier: "Pro Footbagger",  skill_score: 2780,  region: "Arlington, VA",      bio: "Axel kicks all day every day." },
  { id: "demo:u:vt_sack",       username: "vt_sack",       rank_tier: "Pro Footbagger",  skill_score: 2310,  region: "Virginia Tech",      bio: "Founding member of the VT footbag club." },
  { id: "demo:u:hackjack",      username: "hackjack",      rank_tier: "Freestyler",      skill_score: 1320,  region: "Tysons, VA",         bio: "Just here for the vibes." },
  { id: "demo:u:sackmasterj",   username: "sackmasterj",   rank_tier: "Freestyler",      skill_score: 1085,  region: "Vienna, VA",         bio: "Sack mast since '17." },
  { id: "demo:u:sunsetbag",     username: "sunsetbag",     rank_tier: "Freestyler",      skill_score: 940,   region: "Fairfax, VA",        bio: "Golden hour grinder." },
  { id: "demo:u:dropproof",     username: "dropproof",     rank_tier: "Freestyler",      skill_score: 720,   region: "Northern Virginia",  bio: "Streak: 42 days. No drops." },
  { id: "demo:u:noobnick",      username: "noobnick",      rank_tier: "Street Juggler",  skill_score: 380,   region: "Tysons, VA",         bio: "Day 14 of learning. Hyped." },
  { id: "demo:u:firsttouch",    username: "firsttouch",    rank_tier: "Street Juggler",  skill_score: 290,   region: "McLean, VA",         bio: "First touches > everything." },
  { id: "demo:u:teamfreestyle", username: "teamfreestyle", rank_tier: "Street Juggler",  skill_score: 210,   region: "Arlington, VA",      bio: "Squad account. Tysons crew." },
  { id: "demo:u:newbiebrad",    username: "newbiebrad",    rank_tier: "Beginner",        skill_score: 70,    region: "Reston, VA",         bio: "Got my first sack yesterday." },
  { id: "demo:u:rollingstone",  username: "rollingstone",  rank_tier: "Beginner",        skill_score: 35,    region: "Vienna, VA",         bio: "Rolling around the world, literally." },
];

const userById = Object.fromEntries(DEMO_USERS.map((u) => [u.id, u]));

const CAPTIONS = [
  "first toe-stall hold of the week 🦶 #stalls",
  "around the world combo into a stall 😤 #combo #freestyle",
  "no drop session — 47 touches before the wind got me #flow",
  "we ran the Tysons park session all night #tysons #squad",
  "drilling axels with the @vt_sack crew #vt #drillfield",
  "guard kick → ducker → stall, locked in 🔥 #trick",
  "100 touches challenge — DAY 12 #challenge",
  "rookie sunset session w/ @firsttouch 🌅 #newbie",
  "behind-the-back catch attempt #1247 #grind",
  "my cleanest delay yet ✨ #freestyle",
  "trying the windmill drill they showed at McLean #windmill",
  "first day learning paradox — humbled #paradox",
  "Vienna meet-up was insane today #vienna #squad",
  "stall battle in slow-mo 🐢 #stallbattle",
  "smooth same kicker → smooth same kicker → smooth same kicker #smooth",
  "rookie attempts the ‘around the world’ #attempt #fail #worthit",
  "10-touch challenge, no drops, 6 different feet 👀 #challenge",
  "Reston session was wild today, sun went down on us mid-combo #reston",
  "Northern VA bagger meetup happening Saturday — drop a comment if you’re in #meetup",
  "got my first proper stall in 3 weeks of practice 🫡 #milestone",
  "axel kick variations — which is your favorite? #axel",
  "guard kick fail compilation incoming 😂 #fail",
  "warm-up routine before every session #warmup #tips",
  "drilling the windmill kick at Vienna courts #drill #windmill",
  "trick of the day: blur 🌀 #blur #trickoftheday",
  "stall ladder: toe → arm → ear (the holy trinity) #stalls",
  "footbag golden hour hits different 💛 #goldenhour",
  "battle wrap-up: Tysons vs McLean was CLOSE #battle",
  "5-trick combo, no breaks, no drops 🎯 #combo",
  "rookie's first jam circle — felt like a movie #firstjam",
  "freestyle saturday at the Arlington courts #freestyle #saturday",
  "first time landing a paradox to a stall, screamed #milestone",
];

function pseudoRand(seed) {
  // Tiny deterministic PRNG (mulberry32)
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = pseudoRand(20260514);

function pick(arr) {
  return arr[Math.floor(rand() * arr.length)];
}

const NOW = Date.now();
function ago(minutes) {
  return new Date(NOW - minutes * 60 * 1000).toISOString();
}

export const DEMO_VIDEOS = CAPTIONS.map((caption, i) => {
  const u = DEMO_USERS[i % DEMO_USERS.length];
  const likes = Math.floor(15 + rand() * (u.skill_score / 6 + 380));
  const comments = Math.floor(rand() * 38);
  return {
    id: `demo:v:${i + 1}`,
    user_id: u.id,
    video_url: SAMPLES[i % SAMPLES.length],
    caption,
    likes_count: likes,
    comments_count: comments,
    created_at: ago(i * 47 + Math.floor(rand() * 90)),
    users: u,
  };
});

const COMMENT_LINES = [
  "this is filthy 🔥",
  "no way you held that",
  "WHAT was that combo",
  "stall game on another level",
  "tell me your routine",
  "first time seeing this trick clean",
  "okay but the form 👀",
  "I'm coming to Tysons next saturday",
  "the cleanest one I've seen all week",
  "teach me sensei",
  "this is going viral fr",
  "Reston crew represent 🙌",
  "ranked up just from watching this",
  "patience pays off, look at this",
  "the way you styled out of that drop is illegal",
  "saving this to study",
  "VT pride 🦃",
  "no notes",
  "okay LEGEND status confirmed",
  "this is exactly what the leaderboard needs",
];

export const DEMO_COMMENTS = {};
for (const v of DEMO_VIDEOS) {
  const n = Math.max(2, Math.floor(rand() * 8));
  const list = [];
  for (let i = 0; i < n; i++) {
    const u = pick(DEMO_USERS);
    list.push({
      id: `demo:c:${v.id}:${i}`,
      text: pick(COMMENT_LINES),
      created_at: ago(Math.floor(rand() * 720)),
      users: u,
    });
  }
  DEMO_COMMENTS[v.id] = list;
}

// Notifications targeting the *current viewer*. Mixed in if real notifications
// are sparse, just to keep the page from feeling dead at zero engagement.
export const DEMO_NOTIFICATIONS = [
  { type: "follow",   when: ago(2),    actor: userById["demo:u:stallqueen"] },
  { type: "like",     when: ago(11),   actor: userById["demo:u:flowman"],     video: DEMO_VIDEOS[0] },
  { type: "comment",  when: ago(28),   actor: userById["demo:u:kicker"],      video: DEMO_VIDEOS[2], text: "okay LEGEND status confirmed" },
  { type: "like",     when: ago(54),   actor: userById["demo:u:vt_sack"],     video: DEMO_VIDEOS[3] },
  { type: "follow",   when: ago(122),  actor: userById["demo:u:hackjack"] },
  { type: "like",     when: ago(220),  actor: userById["demo:u:sackmasterj"], video: DEMO_VIDEOS[1] },
  { type: "comment",  when: ago(340),  actor: userById["demo:u:axelboi"],     video: DEMO_VIDEOS[4], text: "this is going viral fr" },
  { type: "like",     when: ago(610),  actor: userById["demo:u:dropproof"],   video: DEMO_VIDEOS[5] },
].map((n, i) => ({ ...n, id: `demo:n:${i}` }));

export function isDemo(id) {
  return typeof id === "string" && id.startsWith("demo:");
}

export function userByUsername(username) {
  return DEMO_USERS.find((u) => u.username === username) || null;
}

export function videosForUser(userId) {
  return DEMO_VIDEOS.filter((v) => v.user_id === userId);
}

export function commentsFor(videoId) {
  return DEMO_COMMENTS[videoId] || [];
}

/**
 * Mix demo into a real list. Real items go first, then demo fills the rest
 * up to `target`. Uniqueness on `id`.
 */
export function mixDemo(real, demo, target = 12) {
  const seen = new Set();
  const out = [];
  for (const it of [...(real || []), ...(demo || [])]) {
    if (!it) continue;
    const id = it.id;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(it);
    if (out.length >= target) break;
  }
  return out;
}

/** Hash a string to a 0-360 hue. Deterministic. */
export function stringHue(s) {
  if (!s) return 220;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) & 0xffff;
  }
  return h % 360;
}
