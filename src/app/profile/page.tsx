/**
 * Profile Hub Page
 * Redirects to appropriate profile page based on auth status
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push("/profile/logged-in");
      } else {
        router.push("/profile/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-cream">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent-coral" />
        <p className="mt-4 text-text-teal font-body">Loading...</p>
      </div>
    </div>
  );
}

