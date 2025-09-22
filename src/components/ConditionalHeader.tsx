"use client";

import { usePathname } from "next/navigation";
import AppHeader from "./AppHeader";

export default function ConditionalHeader() {
  const pathname = usePathname();

  // Hide header on onboarding screens
  const hideOnPaths = ["/onboarding"];
  const shouldHide = hideOnPaths.some((path) => pathname.startsWith(path));

  if (shouldHide) {
    return null;
  }

  return <AppHeader />;
}
