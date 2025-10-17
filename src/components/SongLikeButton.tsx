"use client";

import { useCallback, useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackEngagementEvent } from "@/lib/analytics";

type Props = {
  slug: string;
  initialCount?: number;
  className?: string;
  size?: "sm" | "md";
  songTitle?: string;
  songId?: string;
  pageContext?: string;
};

function getStorageKey(slug: string) {
  return `melodia-liked-${slug}`;
}

export function SongLikeButton({
  slug,
  initialCount = 0,
  className = "",
  size = "md",
  songTitle = "",
  songId = "",
  pageContext = "unknown",
}: Props) {
  const [count, setCount] = useState<number>(initialCount);
  const [pending, setPending] = useState<boolean>(false);
  const [liked, setLiked] = useState<boolean>(
    typeof window !== "undefined"
      ? !!localStorage.getItem(getStorageKey(slug))
      : false
  );

  const handleLike = useCallback(async () => {
    if (pending || liked) return;
    setPending(true);
    setLiked(true);
    const newCount = count + 1;
    setCount(newCount);

    try {
      localStorage.setItem(getStorageKey(slug), "1");
    } catch {}

    try {
      const res = await fetch(`/api/song-likes/${encodeURIComponent(slug)}`, {
        method: "POST",
      });
      const data = await res.json();

      if (!data?.success) {
        // revert on server failure
        setLiked(false);
        setCount(count);
        try {
          localStorage.removeItem(getStorageKey(slug));
        } catch {}
        console.error("Failed to like song:", data.error);
      } else {
        // Track successful like
        trackEngagementEvent.like(
          songTitle || slug,
          songId || slug,
          pageContext,
          newCount
        );
      }
    } catch (e) {
      setLiked(false);
      setCount(count);
      try {
        localStorage.removeItem(getStorageKey(slug));
      } catch {}
      console.error("Error liking song:", e);
    } finally {
      setPending(false);
    }
  }, [liked, pending, slug, count, songTitle, songId, pageContext]);

  const sizeClasses = useMemo(
    () => (size === "sm" ? "py-1 px-2 text-xs" : "py-2 px-3 text-sm"),
    [size]
  );

  return (
    <Button
      type="button"
      onClick={handleLike}
      disabled={pending || liked}
      className={`inline-flex items-center gap-2 bg-white/90 text-[var(--text-teal)] border border-[var(--border)] hover:bg-[var(--secondary-cream)] ${sizeClasses} ${className}`}
      aria-pressed={liked}
      aria-label={liked ? "Liked" : "Like"}
    >
      <Heart
        className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : ""}`}
      />
      <span>{count}</span>
    </Button>
  );
}
