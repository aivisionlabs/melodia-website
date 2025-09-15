"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SunoAPIFactory } from "@/lib/suno-api";

export default function ClearMockDataButton() {
  const { addToast } = useToast();
  const [isClearing, setIsClearing] = useState(false);

  const handleClearMockData = async () => {
    setIsClearing(true);
    try {
      SunoAPIFactory.getAPI().clearMockData();
      addToast({
        type: "success",
        title: "Mock data cleared",
        message: "All mock API data has been cleared successfully.",
      });
    } catch {
      addToast({
        type: "error",
        title: "Error clearing mock data",
        message: "Failed to clear mock data. Please try again.",
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <button
      onClick={handleClearMockData}
      disabled={isClearing}
      className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-md text-sm font-medium"
    >
      {isClearing ? "Clearing..." : "Clear Mock Data"}
    </button>
  );
}
