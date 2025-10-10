"use client";

import { usePathname } from "next/navigation";
import BottomNavigation from "./BottomNavigation";

export default function ConditionalBottomNav() {
  const pathname = usePathname();

  // Hide bottom navigation on onboarding screens
  const hideOnPaths = ["/onboarding", "/song/", "/payment"];
  const shouldHide = hideOnPaths.some((path) => pathname.startsWith(path));

  if (shouldHide) {
    return null;
  }

  return <BottomNavigation />;
}
