"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

// Single Responsibility: Component handles profile page routing based on authentication status
export default function ProfilePage() {
  const { user, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Single Responsibility: Handle authentication-based routing
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        // User is authenticated, redirect to logged-in profile
        router.replace("/profile/logged-in");
      } else {
        // User is not authenticated, redirect to login page
        router.replace("/profile/login");
      }
    }
  }, [loading, isAuthenticated, user, router]);

  // Show loading while checking authentication and redirecting
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
      <div className="text-center">
        <div className="text-melodia-teal text-lg mb-2">Loading...</div>
        <div className="text-melodia-teal/60 text-sm">Redirecting to your profile</div>
      </div>
    </div>
  );
}

