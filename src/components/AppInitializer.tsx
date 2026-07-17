"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setSessionId } from "@/lib/slices/authSlice";

import { login, logout } from "@/lib/slices/authSlice";

export default function AppInitializer() {
  const dispatch = useDispatch();

  
  useEffect(() => {
    const loadSession = async () => {
      const res = await fetch("/api/session");
      const data1 = await res.json();
      dispatch(
        setSessionId(
         data1.session_id,
        )
      );
    };
     const GetUser = async () => {
      const res = await fetch("/api/my-account/checkauth");
      const data = await res.json();
      if(data?.status){
       dispatch(
        login({
          user: data.data,
        })
      );
    }else{
      dispatch(
        logout()
      );
    }
    };
    loadSession();
     GetUser();
  }, [dispatch]);




  return null;
}