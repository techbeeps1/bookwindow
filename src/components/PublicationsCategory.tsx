"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export interface Publication {
  name: string;
  image: string;
  link?: string;
}

interface PublicationsCategoryProps {
  title?: string;
  publications?: Publication[];
}

const DEFAULT_PUBLICATIONS: Publication[] = [
  {
    name: "Arihant Publications",
    image: "/image/book.jpg",
    link: "/category",
  },
  {
    name: "McGraw Hill India",
    image: "/image/book-2.jpg",
    link: "/category",
  },
  {
    name: "Disha Publication",
    image: "/image/book-3.jpg",
    link: "/category",
  },
  {
    name: "MTG Learning Media",
    image: "/image/book-4.jpg",
    link: "/category",
  },
  {
    name: "Ashirwad Publication store",
    image: "/image/book-5.jpg",
    link: "/category",
  },  
];

export function PublicationsCategory({
  title = "Publications",
  publications = DEFAULT_PUBLICATIONS,
}: PublicationsCategoryProps) {
  return (
    <section className="container mx-auto px-8">
      {/* Header */}
      <div className="mb-12 grid place-items-center text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
          className="block antialiased tracking-normal font-sans text-4xl font-semibold leading-[1.3] text-blue-gray-900"
        >
          {title}
        </motion.h2>
      </div>

      {/* Grid Container (5 columns on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {publications.map((pub, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
            viewport={{ once: true }}
            className="aspect-[3/4] relative overflow-hidden rounded-[24px] cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300 w-full"
          >
            {/* Background Image */}
            <img
              src={pub.image}
              alt={pub.name}
              
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
              draggable={false}
              loading="lazy"
            />

            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent transition-opacity duration-300 group-hover:from-black/90 group-hover:via-black/50 pointer-events-none" />

            {/* Text Content at the bottom */}
            <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col items-center justify-end text-center pointer-events-none">
              <h3 className="text-white font-semibold text-base md:text-xl  font-sans">
                {pub.name}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default PublicationsCategory;
