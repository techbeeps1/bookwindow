"use client";
import Image from "next/image";
import whatsapp from "../../public/image/whatsapp.png";
import { Button } from "@material-tailwind/react";
import Link from "next/link";
import { useAppSelector } from "@/hooks/useStore";
import { useEffect } from "react";

export function FixedPlugin() {
   const { user, isAuthenticated  } = useAppSelector((state) => state.auth);

   useEffect(()=>{
console.log(user)
console.log(isAuthenticated)
   },[user])
  return (
    <Link href="https://wa.me/+919602368227" target="_blank" className="!fixed md:bottom-4 bottom-[70px] bg-transparent bg-none right-4 items-center rounded-full z-50">       
        <Image src={whatsapp} className="w-[50px] h-[50px]" alt="whatsapp icon"/>
    </Link>
  );
}
