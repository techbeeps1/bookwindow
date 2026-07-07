"use client";

import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

export const useSession = () => {
  const sessionId = useSelector(
    (state: RootState) => state.auth.session_id
  );

  return sessionId;
};