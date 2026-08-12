"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import config from "@/app/config";
import { useRouter } from "next/navigation";



function Hero({ bannerData }: any) {
  const router = useRouter();
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



  const defaultSlides = [
    { id: 1, title: "Bookwindow Bestsellers", slider_image: "/image/banner-img.jpg", mobile_slider_image: "/image/mobile_banner_1.png", slider_url: "#" },
    { id: 2, title: "Bookwindow Collections", slider_image: "/image/banner-img-2.jpg", mobile_slider_image: "/image/mobile_banner_2.png", slider_url: "#" },
  ];

  const slides = (bannerData && Array.isArray(bannerData) && bannerData.length > 0) ? bannerData : defaultSlides;

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
  }, [current, slides.length]);

  return (
    <>
      <section className="relative w-full overflow-hidden bg-gray-900 group lg:mt-0 mt-[75px]">
        <div className="relative w-full 2xl:h-[95vh] lg:h-[70vh] sm:h-[50vh] h-[520px] overflow-hidden">
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
            {slides.map((slide: any, idx: number) => {
              const desktopSrc = slide?.slider_image
                ? (slide.slider_image.startsWith("/") || slide.slider_image.startsWith("http")
                    ? slide.slider_image
                    : `${config.apiUrl}storage/app/public/${slide.slider_image}`)
                : "/image/banner-img.jpg";

              const mobileSrc = slide?.mobile_slider_image
                ? (slide.mobile_slider_image.startsWith("/") || slide.mobile_slider_image.startsWith("http")
                    ? slide.mobile_slider_image
                    : `${config.apiUrl}storage/app/public/${slide.mobile_slider_image}`)
                : `/image/mobile_banner_${(idx % 2) + 1}.png`;

              return (
                <div
                  key={slide.id || idx}
                  onClick={() => {
                    if (!wasDragged.current) {
                      router.push(slide?.slider_url || '#');
                    }
                  }}
                  className="relative h-full cursor-pointer select-none"
                  style={{ width: `${100 / slides.length}%` }}
                >
                  {/* Desktop Background Image */}
                  <div className="hidden md:block relative w-full h-full">
                    <Image
                      src={desktopSrc}
                      alt={slide.title || "Banner"}
                      fill
                      priority={idx === 0}
                      className="object-cover w-full h-full select-none pointer-events-none"
                      draggable={false}
                      sizes="100vw"
                    />
                  </div>

                  {/* Mobile Background Image (Vertical Portrait) */}
                  <div className="block md:hidden relative w-full h-full">
                    <Image
                      src={mobileSrc}
                      alt={slide.title || "Mobile Banner"}
                      fill
                      priority={idx === 0}
                      className="object-contain sm:object-cover w-full h-full select-none pointer-events-none p-2"
                      draggable={false}
                      sizes="100vw"
                    />
                  </div>
                </div>
              );
            })}
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
            {slides.map((_: any, idx: any) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className={`transition-all duration-300 rounded-full ${current === idx
                  ? "md:w-4 md:h-4 w-3 h-3 bg-white shadow-lg"
                  : " w-2 h-2 bg-white/50 hover:bg-white/85"
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
