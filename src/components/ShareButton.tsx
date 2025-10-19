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
  const { toast } = useToast();

  const handleShare = async () => {
    // Use slug-based URL if available, otherwise fall back to songId
    const url = slug
      ? `${window.location.origin}/library/${slug}`
      : `${window.location.origin}/library/${songId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${
            title && title + ","
          } Check out this amazing song by Melodia!`,
          text: `${
            title && title + ","
          } Check out this amazing song by Melodia!`,
          url: url,
        });

        // Call tracking callback
        onShare?.();
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
      });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className={`bg-white/90 backdrop-blur-sm border-white/30 text-gray-800 hover:bg-white hover:text-gray-900 shadow-md ${
        className || ""
      }`}
    >
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  );
};
