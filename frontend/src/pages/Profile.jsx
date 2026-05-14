import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/AuthContext";

export default function Profile() {
  const { username } = useParams();
  const { user: me, profile: myProfile } = useAuth();

  const [profile, setProfile] = useState(null);
  const [videos, setVideos] = useState([]);
  const [counts, setCounts] = useState({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setErr("");

    let target = null;
    if (username) {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .maybeSingle();
      if (error) {
        setErr(error.message);
        setLoading(false);
        return;
      }
      target = data;
    } else {
      target = myProfile;
    }

    if (!target) {
      setErr("User not found.");
      setLoading(false);
      return;
    }
    setProfile(target);

    const [{ data: vids }, { count: followers }, { count: following }] =
      await Promise.all([
        supabase
          .from("videos")
          .select("id, video_url, caption, likes_count, comments_count, created_at")
          .eq("user_id", target.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("followers")
          .select("*", { count: "exact", head: true })
          .eq("following_id", target.id),
        supabase
          .from("followers")
          .select("*", { count: "exact", head: true })
          .eq("follower_id", target.id),
      ]);

    setVideos(vids ?? []);
    setCounts({ followers: followers ?? 0, following: following ?? 0 });

    if (me && me.id !== target.id) {
      const { data: f } = await supabase
        .from("followers")
        .select("id")
        .eq("follower_id", me.id)
        .eq("following_id", target.id)
        .maybeSingle();
      setIsFollowing(!!f);
    } else {
      setIsFollowing(false);
    }
    setLoading(false);
  }, [username, me, myProfile]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFollow = async () => {
    if (!me || !profile || me.id === profile.id) return;
    if (isFollowing) {
      setIsFollowing(false);
      setCounts((c) => ({ ...c, followers: Math.max(0, c.followers - 1) }));
      await supabase
        .from("followers")
        .delete()
        .eq("follower_id", me.id)
        .eq("following_id", profile.id);
    } else {
      setIsFollowing(true);
      setCounts((c) => ({ ...c, followers: c.followers + 1 }));
      await supabase
        .from("followers")
        .insert({ follower_id: me.id, following_id: profile.id });
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-400">Loading profile…</div>;
  }
  if (err) {
    return <div className="p-6 text-red-400">{err}</div>;
  }
  if (!profile) return null;

  const isMe = me?.id === profile.id;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <header className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-2xl">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            profile.username?.[0]?.toUpperCase() ?? "?"
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold">@{profile.username}</h1>
          <p className="text-sm text-gray-400">
            <span className="text-white">{profile.skill_score}</span> pts ·{" "}
            <span className="text-white">{profile.rank_tier}</span>
          </p>
          <p className="text-sm text-gray-400">
            <span className="text-white">{counts.followers}</span> followers ·{" "}
            <span className="text-white">{counts.following}</span> following
          </p>
          {profile.bio && (
            <p className="text-sm mt-1 text-gray-300">{profile.bio}</p>
          )}
        </div>
        {!isMe && me && (
          <button
            onClick={toggleFollow}
            className={`px-4 py-2 rounded ${
              isFollowing
                ? "border border-gray-700 hover:bg-white/5"
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </header>

      <h2 className="text-sm uppercase tracking-wide text-gray-400 mb-2">
        Clips
      </h2>
      {videos.length === 0 ? (
        <p className="text-gray-400">No clips yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-1">
          {videos.map((v) => (
            <a
              key={v.id}
              href={v.video_url}
              target="_blank"
              rel="noreferrer"
              className="aspect-[9/16] bg-zinc-900 overflow-hidden relative"
            >
              <video
                src={v.video_url}
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1 text-xs bg-black/60 px-1.5 py-0.5 rounded">
                ❤ {v.likes_count}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
