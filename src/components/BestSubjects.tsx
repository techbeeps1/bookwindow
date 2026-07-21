"use client";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import config from "@/app/config";

export interface Brand {
  name: string;
  discount?: string;
  image: string;
  link?: string;
}

interface BrandsCategoryProps {
  title?: string;
  subtitle?: string;
  brands?: Brand[];
}



export function BestSubjects({data}: any) {
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
    const walk = (x - startX.current) * 1.5; // Drag sensitivity multiplier
    sliderRef.current.scrollLeft = scrollLeftVal.current - walk;
  };

  const checkScrollPosition = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current;
      setShowLeftArrow(scrollLeft > 10);
      // Account for subpixel rendering precision in browsers
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
  }, [data]);

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
        const gap = 24; // gap-6 in tailwind is 24px
        // Scroll exactly 1 card at a time for maximum smoothness and control
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
    <section className="w-full py-[50px] my-[50px] bg-[#F8F8F8] overflow-hidden">
      {/* Header (Aligned with container) */}
      <div className="container mx-auto px-8 mb-6 grid place-items-center text-center">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true }}
          className="block antialiased tracking-normal font-sans text-2xl md:text-4xl font-semibold leading-[1.3] text-blue-gray-900"
        >
          {data?.mock_subtitle}
        </motion.h2> 
        <div className="w-20 h-[2px] bg-black my-4 rounded-full" />
      </div>

      {/* Full-width Slider Container */}
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

        {/* Scrollable Row (Overflowing screen edges) */}
        {/* Note: we omitted scroll-smooth utility class from container to prevent browser double-smooth conflicts with scrollBy */}
        <div
          ref={sliderRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className="flex gap-6 overflow-x-auto no-scrollbar px-8 md:px-16 lg:px-24 active:cursor-grabbing select-none"
        >
          {data?.mock_test_category.map((brand:any, index:any) => (
                    <Link href="#">   <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: "easeOut" }}
              viewport={{ once: true }}
              className="w-[calc((100vw-88px)/1.3)] md:w-[calc((100vw-176px)/2.3)] lg:w-[calc((100vw-264px)/3.35)] aspect-[3/4] flex-shrink-0 relative overflow-hidden rounded-[24px] cursor-pointer group shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Background Image */}
   
              <img
                src={`${config.apiUrl}storage/app/public/${brand.cat_image}`}
                alt={brand.name}
                
                sizes="(max-width: 768px) 75vw, (max-width: 1024px) 45vw, 30vw"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
                draggable={false}
                loading="lazy"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent transition-opacity duration-300 group-hover:from-black/90 group-hover:via-black/50 pointer-events-none" />

              {/* Text Content at the bottom */}
              <div className="absolute bottom-0 inset-x-0 p-6 flex flex-col items-center justify-end text-center pointer-events-none">
                <h3 className="text-white font-semibold text-lg md:text-2xl mb-1 font-sans">
                  {brand.name}
                </h3>                
              </div>
              
            </motion.div></Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default BestSubjects;
