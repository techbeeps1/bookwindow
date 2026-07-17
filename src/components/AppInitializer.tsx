"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setSessionId } from "@/lib/slices/authSlice";
import { useGetMeQuery } from "@/lib/api/authcheck";
import { login, logout } from "@/lib/slices/authSlice";

export default function AppInitializer() {
  const dispatch = useDispatch();
   const { data, isSuccess, isError } = useGetMeQuery();
  
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


  useEffect(() => {
    if (isSuccess && data) {
      dispatch(
        login({
          user: data,
        })
      );
    }

    if (isError) {
      dispatch(logout());
    }
  }, [data, isSuccess, isError]);


  return null;
}