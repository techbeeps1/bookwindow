"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setSessionId } from "@/lib/slices/authSlice";

export default function AppInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    const loadSession = async () => {
      const res = await fetch("/api/session");
      const data = await res.json();
      dispatch(
        setSessionId(
         data.session_id,
        )
      );
    };

    loadSession();
  }, [dispatch]);

  return null;
}