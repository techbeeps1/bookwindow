"use client";
import Image from "next/image";
import whatsapp from "../../public/image/whatsapp.png";

import Link from "next/link";

export function FixedPlugin() {

  
  return (
    <Link href="https://wa.me/+919602368227" target="_blank" className="!fixed md:bottom-4 bottom-[70px] bg-transparent bg-none right-4 items-center rounded-full z-50">       
        <Image src={whatsapp} className="w-[50px] h-[50px]" alt="whatsapp icon"/>
    </Link>
  );
}
