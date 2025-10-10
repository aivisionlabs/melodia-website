"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Share2 } from "lucide-react";

interface ShareButtonProps {
  songId?: string;
  slug?: string;
  title?: string;
  className?: string;
  onShare?: () => void;
  onCopyLink?: () => void;
}

export const ShareButton = ({
  songId,
  slug,
  title,
  className,
  onShare,
  onCopyLink,
}: ShareButtonProps) => {
  const { addToast } = useToast();

  const handleShare = async () => {
    // Use slug-based URL if available, otherwise fall back to songId
    const url = slug
      ? `${window.location.origin}/song/${slug}`
      : `${window.location.origin}/song/${songId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: title || "Listen to this song with synchronized lyrics",
          text: "Check out this amazing song with synchronized lyrics on Melodia!",
          url: url,
        });

        // Call tracking callback
        onShare?.();

        // Show success toast for native sharing
        addToast({
          type: "success",
          title: "Shared successfully!",
          message: "The song link has been shared.",
        });
      } catch (error) {
        console.log("Error sharing:", error);
        fallbackShare(url);
      }
    } else {
      fallbackShare(url);
    }
  };

  const fallbackShare = (url: string) => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        // Call tracking callback
        onCopyLink?.();

        // Show success toast for clipboard copy
        addToast({
          type: "success",
          title: "Link copied!",
          message: "Song link has been copied to your clipboard.",
        });
      })
      .catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement("textarea");
        textArea.value = url;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        // Call tracking callback
        onCopyLink?.();

        // Show success toast for fallback copy
        addToast({
          type: "success",
          title: "Link copied!",
          message: "Song link has been copied to your clipboard.",
        });
      });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={`bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 ${
        className || ""
      }`}
    >
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  );
};
