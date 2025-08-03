"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Share2 } from "lucide-react";

interface ShareButtonProps {
  songId: string;
}

export const ShareButton = ({ songId }: ShareButtonProps) => {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = `${window.location.origin}/song-library/${songId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Listen to this song with synchronized lyrics",
          text: "Check out this amazing song with synchronized lyrics on Melodia, https://melodia-songs.com/",
          url: url,
        });

        // Show success toast for native sharing
        toast({
          title: "Shared successfully!",
          description: "The song link has been shared.",
          duration: 3000,
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
        // Show success toast for clipboard copy
        toast({
          title: "Link copied!",
          description: "Song link has been copied to your clipboard.",
          duration: 3000,
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

        // Show success toast for fallback copy
        toast({
          title: "Link copied!",
          description: "Song link has been copied to your clipboard.",
          duration: 3000,
        });
      });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
    >
      <Share2 className="h-4 w-4 mr-2" />
      Share
    </Button>
  );
};
