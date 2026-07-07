"use client";

import { useViewCartQuery } from "@/lib/api/cartApi";
import { useSession } from "@/hooks/useSession";

export function useCart() {
  const sessionId = useSession();
  const cartQuery = useViewCartQuery(sessionId, {
    skip: !sessionId,
  });

  return cartQuery;
}