"use client";

import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export interface BrandOffer {
  name: string;
  image: string;
  link?: string;
}

interface MoreBrandsOfferProps {
  title?: string;
  brands?: BrandOffer[];
}

const DEFAULT_BRANDS: BrandOffer[] = [
  {
    name: "SWAROVSKI",
    image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=600&h=800&q=80",
    link: "/category",
  },
  {
    name: "DA MILANO",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&h=800&q=80",
    link: "/category",
  },
  {
    name: "RAYBAN",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&h=800&q=80",
    link: "/category",
  },
  {
    name: "MONTBLANC",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&h=800&q=80",
    link: "/category",
  },
  {
    name: "WELLNESS AT HOME",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=600&h=800&q=80",
    link: "/category",
  },
  {
    name: "GANT",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&h=800&q=80",
    link: "/category",
  },
];

export function MoreBrandsOffer({
  title = "More Brands On Offer",
  brands = DEFAULT_BRANDS,
}: MoreBrandsOfferProps) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Mouse drag-to-scroll refs
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeftVal = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    isDown.current = true;
    startX.current = e.pageX - sliderRef.current.offsetLeft;
    scrollLeftVal.current = sliderRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDown.current = false;
  };

  const handleMouseUp = () => {
    isDown.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Drag sensitivity
    sliderRef.current.scrollLeft = scrollLeftVal.current - walk;
  };

  const checkScrollPosition = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener("scroll", checkScrollPosition);
      checkScrollPosition();
    }
    return () => {
      if (slider) {
        slider.removeEventListener("scroll", checkScrollPosition);
      }
    };
  }, [brands]);

  useEffect(() => {
    const handleResize = () => {
      checkScrollPosition();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const firstCard = sliderRef.current.firstElementChild as HTMLElement;
      if (firstCard) {
        const cardWidth = firstCard.offsetWidth;
        const gap = 24; // gap-6 is 24px
        const scrollAmount = cardWidth + gap;
        
        sliderRef.current.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      } else {
        const { clientWidth } = sliderRef.current;
        const scrollAmount = clientWidth * 0.5;
        sliderRef.current.scrollBy({
          left: direction === "left" ? -scrollAmount : scrollAmount,
          behavior: "smooth",
        });
      }
    }
  };

  return (
    <section className="w-full pb-20 pt-10 overflow-hidden">
      {/* Header */}
      <div className="container mx-auto px-8 mb-12 grid place-items-center text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
          className="block antialiased tracking-normal font-sans text-4xl font-semibold leading-[1.3] text-blue-gray-900"
        >
          {title}
        </motion.h2>
        <div className="w-20 h-[2px] bg-black my-4 rounded-full" />
      </div>

      {/* Slider Container */}
      <div className="relative w-full">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-gray-800 hover:bg-white transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none border border-gray-100"
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="h-6 w-6 stroke-[2.5]" />
          </button>
        )}

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            onClick={() => handleScroll("right")}
            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-gray-800 hover:bg-white transition-all duration-200 hover:scale-110 active:scale-95 focus:outline-none border border-gray-100"
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="h-6 w-6 stroke-[2.5]" />
          </button>
        )}

        {/* Scrollable Row */}
        <div
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex gap-6 overflow-x-auto no-scrollbar pb-6 px-8 md:px-16 lg:px-24 cursor-grab active:cursor-grabbing select-none"
        >
          {brands.map((brand, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
              viewport={{ once: true }}
              className="w-[calc((100vw-112px)/2.35)] md:w-[calc((100vw-200px)/3.35)] lg:w-[calc((100vw-312px)/5.35)] aspect-[3/4] flex-shrink-0 relative overflow-hidden rounded-[24px] cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Background Image */}
              <img
                src={brand.image}
                alt={brand.name}
                
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 30vw, 20vw"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
                draggable={false}
                loading="lazy"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent transition-opacity duration-300 group-hover:from-black/90 group-hover:via-black/50 pointer-events-none" />

              {/* Text Content at the bottom */}
              <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col items-center justify-end text-center pointer-events-none">
                <h3 className="text-white font-semibold text-base md:text-xl tracking-wider font-sans uppercase">
                  {brand.name}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MoreBrandsOffer;
