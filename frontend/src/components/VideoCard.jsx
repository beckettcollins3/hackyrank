import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Comments from "./Comments";

export default function VideoCard({ video, liked, onLike }) {
  const ref = useRef(null);
  const [showComments, setShowComments] = useState(false);

  // Pause off-screen videos, play visible ones.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.6 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const u = video.users;

  return (
    <div className="h-[calc(100vh-56px)] snap-start relative flex items-center justify-center bg-black">
      <video
        ref={ref}
        src={video.video_url}
        loop
        muted
        playsInline
        controls={false}
        className="h-full w-full object-contain"
        onClick={(e) => {
          const v = e.currentTarget;
          v.paused ? v.play() : v.pause();
        }}
      />

      <div className="absolute left-3 bottom-4 right-20 text-white drop-shadow">
        {u && (
          <Link
            to={`/u/${u.username}`}
            className="font-semibold hover:underline"
          >
            @{u.username}
          </Link>
        )}
        {u?.rank_tier && (
          <span className="ml-2 text-xs px-2 py-0.5 rounded bg-white/10 border border-white/20">
            {u.rank_tier}
          </span>
        )}
        {video.caption && <p className="mt-1 text-sm">{video.caption}</p>}
      </div>

      <div className="absolute right-3 bottom-6 flex flex-col items-center gap-4 text-white">
        <button
          onClick={onLike}
          className="flex flex-col items-center"
          aria-label="like"
        >
          <span
            className={`text-3xl ${liked ? "" : "opacity-80"}`}
            style={{ filter: liked ? "none" : "grayscale(60%)" }}
          >
            {liked ? "❤️" : "🤍"}
          </span>
          <span className="text-xs">{video.likes_count}</span>
        </button>

        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex flex-col items-center"
          aria-label="comments"
        >
          <span className="text-3xl">💬</span>
          <span className="text-xs">{video.comments_count}</span>
        </button>
      </div>

      {showComments && (
        <Comments videoId={video.id} onClose={() => setShowComments(false)} />
      )}
    </div>
  );
}
