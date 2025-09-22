"use client";

import { Button } from "@/components/ui/button";
import { trackCTAEvent } from "@/lib/analytics";
import { Edit } from "lucide-react";
import Link from "next/link";

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
    lg: "w-full sm:w-54 h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg",
  };

  return (
    <Link href="/create-song-v2">
      <Button
        onClick={() => {
          trackCTAEvent.ctaClick("create_song_cta", "main_page", "button");
        }}
        className={`bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-white rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 ${sizeClasses[size]} ${className}`}
      >
        <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
        <span className="ml-1 sm:ml-2">Create Your Song</span>
      </Button>
    </Link>
  );
};

export default ShareRequirementsCTA;
