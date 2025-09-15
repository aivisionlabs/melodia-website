"use client";

import { useToast } from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  // Our toast implementation handles rendering automatically
  // This component is kept for compatibility but doesn't need to render anything
  return null;
}
