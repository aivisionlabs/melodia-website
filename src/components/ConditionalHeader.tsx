"use client";

import { usePathname } from "next/navigation";
import AppHeader from "./AppHeader";

export default function ConditionalHeader() {
  const pathname = usePathname();

  // Hide header on onboarding screens and song lyrics pages (not song-options)
  const hideOnPaths = [
    "/onboarding",
    "/error",
    "/profile/forgot-password",
    "/profile/register",
    "/profile/login",
    "/profile/signup/verify",
    "/profile/signup",
  ];
  const shouldHide =
    hideOnPaths.some((path) => pathname.startsWith(path)) ||
    (pathname.startsWith("/song/") && !pathname.startsWith("/song-options"));

  if (shouldHide) {
    return null;
  }

  return <AppHeader />;
}
