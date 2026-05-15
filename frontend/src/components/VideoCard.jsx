import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Send, Music2, Volume2, VolumeX } from "lucide-react";
import Avatar from "./Avatar";
import TierBadge from "./TierBadge";
import Comments from "./Comments";

function formatCount(n) {
  if (n == null) return "0";
  if (n < 1000) return String(n);
  if (n < 1_000_000) return (n / 1000).toFixed(n < 10000 ? 1 : 0).replace(/\.0$/, "") + "K";
  return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
}

export default function VideoCard({ video, liked, onLike, active = true, muted, setMuted }) {
  const ref = useRef(null);
  const [showComments, setShowComments] = useState(false);
  const [pop, setPop] = useState(false);
  const [bursts, setBursts] = useState([]); // {id, x, y}
  const lastTapRef = useRef(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && active) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.65 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [active]);

  useEffect(() => {
    if (ref.current) ref.current.muted = muted;
  }, [muted]);

  const triggerLikeAnim = () => {
    setPop(true);
    setTimeout(() => setPop(false), 480);
  };

  const handleLike = () => {
    if (!liked) triggerLikeAnim();
    onLike?.();
  };

  const onMediaTap = (e) => {
    const now = Date.now();
    if (now - lastTapRef.current < 280) {
      // Double tap → like + burst at point
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (e.clientX ?? rect.left + rect.width / 2) - rect.left;
      const y = (e.clientY ?? rect.top + rect.height / 2) - rect.top;
      const id = Math.random().toString(36).slice(2);
      setBursts((b) => [...b, { id, x, y }]);
      setTimeout(() => {
        setBursts((b) => b.filter((p) => p.id !== id));
      }, 700);
      if (!liked) onLike?.();
      triggerLikeAnim();
    } else {
      const v = ref.current;
      if (v) (v.paused ? v.play() : v.pause()).catch?.(() => {});
    }
    lastTapRef.current = now;
  };

  const u = video.users;

  return (
    <section className="snap-start relative h-[100dvh] w-full overflow-hidden bg-black">
      {/* Media */}
      <video
        ref={ref}
        src={video.video_url}
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 size-full object-cover"
        onClick={onMediaTap}
      />

      {/* Top safe-area scrim */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

      {/* Top right mute toggle */}
      <button
        onClick={() => setMuted?.((m) => !m)}
        className="absolute top-[calc(env(safe-area-inset-top)+12px)] right-3 z-10 size-9 grid place-items-center rounded-full glass-pill active:scale-95"
        aria-label={muted ? "Unmute" : "Mute"}
      >
        {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
      </button>

      {/* Bottom scrim */}
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

      {/* Overlay UI: user info + caption */}
      <div className="absolute left-3 right-20 bottom-[calc(96px+env(safe-area-inset-bottom))] z-10 text-white animate-fade-up">
        {u && (
          <div className="flex items-center gap-2 mb-2">
            <Link to={`/u/${u.username}`} className="flex items-center gap-2 group">
              <Avatar src={u.avatar_url} username={u.username} tier={u.rank_tier} size={40} ring />
              <div className="leading-tight">
                <div className="font-semibold text-[15px] group-active:text-electric-400">
                  @{u.username}
                </div>
                <TierBadge tier={u.rank_tier} size="sm" />
              </div>
            </Link>
            <button className="ml-2 px-3 py-1 rounded-full bg-gradient-electric text-graphite-900 text-xs font-bold shadow-glow active:scale-95">
              Follow
            </button>
          </div>
        )}
        {video.caption && (
          <p className="text-[14.5px] leading-snug text-pretty drop-shadow max-w-[24rem]">
            {linkifyHashtags(video.caption)}
          </p>
        )}
        <div className="mt-2 flex items-center gap-1.5 text-[11.5px] text-ink-50/80">
          <Music2 className="size-3.5" />
          <span className="truncate">original sound · @{u?.username ?? "unknown"}</span>
        </div>
      </div>

      {/* Side action rail */}
      <div className="absolute right-3 bottom-[calc(112px+env(safe-area-inset-bottom))] z-10 flex flex-col items-center gap-5 text-white">
        <ActionButton
          onClick={handleLike}
          icon={
            <Heart
              className={`size-7 ${liked ? "fill-hot text-hot" : "fill-transparent"} ${pop ? "animate-pop-heart" : ""}`}
              strokeWidth={2}
            />
          }
          label={formatCount(video.likes_count)}
        />
        <ActionButton
          onClick={() => setShowComments(true)}
          icon={<MessageCircle className="size-7" strokeWidth={2} />}
          label={formatCount(video.comments_count)}
        />
        <ActionButton
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: "HackyRank", url: window.location.href }).catch(() => {});
            } else {
              navigator.clipboard?.writeText(window.location.href);
            }
          }}
          icon={<Send className="size-7" strokeWidth={2} />}
          label="Share"
        />
        <div className="mt-1 size-9 rounded-lg bg-gradient-electric grid place-items-center animate-spin-slow shadow-glow">
          <Music2 className="size-4 text-graphite-900" />
        </div>
      </div>

      {/* Double-tap heart bursts */}
      {bursts.map((b) => (
        <Heart
          key={b.id}
          className="absolute z-20 size-24 text-hot fill-hot drop-shadow-[0_0_20px_rgba(255,61,113,0.6)] pointer-events-none animate-burst-heart"
          style={{ left: b.x, top: b.y, transform: "translate(-50%,-50%)" }}
          strokeWidth={1.5}
        />
      ))}

      {/* Comments sheet */}
      {showComments && (
        <Comments videoId={video.id} onClose={() => setShowComments(false)} />
      )}
    </section>
  );
}

function ActionButton({ onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 active:scale-95 transition"
    >
      <span className="size-12 rounded-full glass-pill grid place-items-center">
        {icon}
      </span>
      <span className="text-[11px] font-semibold drop-shadow">{label}</span>
    </button>
  );
}

function linkifyHashtags(text) {
  return text.split(/(\s+)/).map((part, i) => {
    if (/^#[\w-]+/.test(part)) {
      return (
        <span key={i} className="text-electric-400 font-medium">
          {part}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
