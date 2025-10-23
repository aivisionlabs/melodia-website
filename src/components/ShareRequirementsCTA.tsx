"use client";

import { Button } from "@/components/ui/button";
import { trackCTAEvent } from "@/lib/analytics";
import { Edit } from "lucide-react";

interface ShareRequirementsCTAProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const ShareRequirementsCTA = ({
  className = "",
  size = "md",
}: ShareRequirementsCTAProps) => {
  const sizeClasses = {
    sm: "px-2 py-1.5 text-xs sm:text-sm",
    md: "px-3 py-2 text-sm sm:text-base",
    lg: "w-full sm:w-auto sm:px-8 h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg",
  };

  return (
    <Button
      onClick={() => {
        trackCTAEvent.ctaClick("create_song_cta", "main_page", "button");
        window.open("https://melodia-app.vercel.app", "_blank");
      }}
      className={`bg-primary-yellow hover:bg-yellow-600 text-teal font-semibold rounded-lg shadow-elegant hover:shadow-glow transition-all duration-200 ${sizeClasses[size]} ${className}`}
    >
      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
      <span className="ml-1 sm:ml-2">Start Your Joyful Journey! 🎵</span>
    </Button>
  );
};

export default ShareRequirementsCTA;
