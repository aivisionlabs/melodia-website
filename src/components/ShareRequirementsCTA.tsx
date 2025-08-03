"use client";

import { Button } from "@/components/ui/button";
import { track } from "@vercel/analytics";
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
    lg: "w-full sm:w-54 h-12 sm:h-14 md:h-16 text-sm sm:text-base md:text-lg",
  };

  return (
    <Button
      onClick={() => {
        track("share_requirements_click");
        window.open("https://forms.gle/XUsztM73btPfCr4M9", "_blank");
      }}
      className={`bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${sizeClasses[size]} ${className}`}
    >
      <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
      <span className="ml-1 sm:ml-2">Create Your Song</span>
    </Button>
  );
};

export default ShareRequirementsCTA;
