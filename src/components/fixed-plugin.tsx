"use client";
import Image from "next/image";
import whatsapp from "../../public/image/whatsapp.png";
import { Button } from "@material-tailwind/react";

export function FixedPlugin() {
  return (
    <a href="https://wa.me/+919602368227" target="_blank">
      <Button       
        size="sm"
        className="!fixed bottom-4 bg-transparent bg-none right-4 items-center rounded-full z-50"
        {...({} as React.ComponentProps<typeof Button>)}
      >
        <Image src={whatsapp} className="w-[50px] h-[50px]" alt="whatsapp icon"/>
      </Button>
    </a>
  );
}
