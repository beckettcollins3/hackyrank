// HackyRank no longer needs a custom backend — the React app talks to Supabase
// directly (Postgres + Auth + Storage, all with RLS). This file is preserved
// only because vercel.json's experimentalServices references this directory.
//
// It exports a minimal Vercel-compatible handler so the route stays healthy
// rather than 500-ing if anything calls /_/backend/*.
module.exports = (req, res) => {
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.end(
    JSON.stringify({
      status: "ok",
      info: "HackyRank backend is a no-op. All data flows through Supabase.",
    })
  );
};
