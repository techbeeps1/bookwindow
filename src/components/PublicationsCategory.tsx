"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import config from "@/app/config";
import { useRouter } from "next/navigation";



export function PublicationsCategory({
  data
}: any) {

  const router = useRouter();
  return (
    <section className="container mx-auto px-8">
      {/* Header */}
      <div className="mb-6 grid place-items-center text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
          className="block antialiased tracking-normal font-sans text-2xl md:text-4xl font-semibold leading-[1.3] text-blue-gray-900"
        >
          {data?.publications_subtitle}
        </motion.h2>
        <div className="w-20 h-[2px] bg-black my-4 rounded-full" />
      </div>

      {/* Grid Container (5 columns on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {data?.publication.map((pub:any, index:number) => (
          <div  >
          <motion.div
            onClick={() => router.push(`/publication/${pub.slug}`)}
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
            viewport={{ once: true }}
            className="aspect-[3/4] relative overflow-hidden rounded-[24px] cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300 w-full"
          >
            {/* Background Image */}
            <Image
              fill
              alt={pub.name}
              src={`${config.apiUrl}storage/app/public/${pub.publication_img}`}
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
              draggable={false}
              loading="lazy"
            />

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent transition-opacity duration-300 group-hover:from-black/90 group-hover:via-black/50 pointer-events-none" />

            {/* Text Content at the bottom */}
            <div className="absolute bottom-0 inset-x-0 p-4 flex flex-col items-center justify-end text-center pointer-events-none">
              <h3 className="text-white font-semibold text-base md:text-lg  font-sans">
                {pub.name}
              </h3>
            </div>
          </motion.div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PublicationsCategory;
