"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function OnboardingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only check onboarding on client side and not on onboarding page itself
    if (typeof window !== "undefined" && pathname !== "/onboarding") {
      const onboardingComplete = localStorage.getItem("onboarding_complete");
      if (onboardingComplete !== "true") {
        router.replace("/onboarding");
      }
    }
  }, [router, pathname]);

  return <>{children}</>;
}
