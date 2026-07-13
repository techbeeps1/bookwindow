"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import config from "@/app/config";
function Hero({ onButtonClick, bannerData }: any) {
  const [current, setCurrent] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = React.useRef(0);
  const wasDragged = React.useRef(false);

  const handlePointerDown = (clientX: number) => {
    setIsDragging(true);
    startX.current = clientX;
    wasDragged.current = false;
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDragging) return;
    const offset = clientX - startX.current;
    setDragOffset(offset);
    if (Math.abs(offset) > 10) {
      wasDragged.current = true;
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    // Threshold for slide transition: 100px
    if (dragOffset < -100) {
      nextSlide();
    } else if (dragOffset > 100) {
      prevSlide();
    }
    setDragOffset(0);
  };

  const handleSlideClick = (e: React.MouseEvent) => {
    if (wasDragged.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (onButtonClick) {
      onButtonClick();
    }
  };

  const slides = [
    {
      id: 1,
      image: bannerData?.images
        ? `${config.apiUrl}storage/app/public/${bannerData?.images}`
        : "/image/banner-img.jpg",
      title: bannerData?.banner_title || "",
      description: bannerData?.banner_description || "",
      buttonText: bannerData?.banner_button_title || "",
      logo: bannerData?.logo_img
        ? `${config.apiUrl}storage/app/public/${bannerData?.logo_img}`
        : null
    },

  ];

  const nextSlide = () => {
    setCurrent((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Auto-play slides every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [current]);

  return (
    <>
      <section className="relative w-full overflow-hidden bg-gray-900 group">
        <div className="relative w-full xl:h-[90vh] lg:h-[80vh] md:h-[60vh] sm:h-[40vh] h-[25vh] overflow-hidden">
          {/* Slider Content Row */}
          <div 
            className={`flex h-full ${isDragging ? "" : "transition-transform duration-700 ease-in-out"}`}
            style={{
              width: `${slides.length * 100}%`,
              transform: `translateX(calc(-${current * (100 / slides.length)}% + ${dragOffset}px))`,
              cursor: isDragging ? "grabbing" : "grab"
            }}
            onMouseDown={(e) => handlePointerDown(e.clientX)}
            onMouseMove={(e) => handlePointerMove(e.clientX)}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
            onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
            onTouchEnd={handlePointerUp}
          >
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                onClick={handleSlideClick}
                className="relative h-full cursor-pointer select-none"
                style={{ width: `${100 / slides.length}%` }}
              >
                {/* Background Image */}
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  
                  priority
                  className="object-cover w-full h-full select-none pointer-events-none"
                  draggable={false}
                  sizes="100vw"
                />
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-black/20 hover:bg-black/45 text-white rounded-lg backdrop-blur-sm transition-all focus:outline-none border border-white/10 opacity-0 group-hover:opacity-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="w-4 h-4 md:w-5 md:h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-black/20 hover:bg-black/45 text-white rounded-lg backdrop-blur-sm transition-all focus:outline-none border border-white/10 opacity-0 group-hover:opacity-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              className="w-4 h-4 md:w-5 md:h-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Dots / Indicators */}
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center gap-3">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`transition-all duration-300 rounded-full ${
                  current === idx 
                    ? "w-4 h-4 bg-white shadow-lg" 
                    : "w-2 h-2 bg-white/50 hover:bg-white/85"
                }`}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Hero;
