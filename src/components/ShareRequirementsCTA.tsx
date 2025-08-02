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
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "w-54 h-14 md:h-16 text-base md:text-lg",
  };

  return (
    <Button
      onClick={() => {
        track("share_requirements_click");
        window.open("https://forms.gle/XUsztM73btPfCr4M9", "_blank");
      }}
      className={`bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg shadow-md hover:shadow-lg transition-all duration-200 ${sizeClasses[size]} ${className}`}
    >
      <Edit className="h-4 w-4" />
      Create Your Song
    </Button>
  );
};

export default ShareRequirementsCTA;
