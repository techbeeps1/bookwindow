"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import config from "@/app/config";
function Hero({ onButtonClick, bannerData }: any) {
  const [current, setCurrent] = useState(0);

  const slides = [
    {
      id: 1,
      image: bannerData?.images
        ? `${config.apiUrl}storage/app/public/${bannerData?.images}`
        : "/image/banner-img.jpg",
      title: bannerData?.banner_title || "UP TO 50% OFF + 15% OFF",
      description: bannerData?.banner_description || "Ace your exams with our expertly curated selection of competitive exam books.",
      buttonText: bannerData?.banner_button_title || "DISCOVER",
      logo: bannerData?.logo_img
        ? `${config.apiUrl}storage/app/public/${bannerData?.logo_img}`
        : null
    },
    {
      id: 2,
      image: "/image/banner-img-2.jpg",
      title: "READ MORE, LEARN MORE",
      description: "Explore our diverse range of literature, research journals, and school textbooks.",
      buttonText: "BROWSE NOW",
      logo: null
    },
    {
      id: 3,
      image: "/image/banner-img.jpg",
      title: "COMPETITIVE EXAM SPECIAL",
      description: "Get all RAS class notes, reference materials, and exam guides at unbeatable prices.",
      buttonText: "SHOP BESTSELLERS",
      logo: null
    }
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
      {/* ORIGINAL HERO SECTION */}
      {/* <section className="bg-yellow-50 px-8 pb-8 pt-4">
        {bannerData ? (
          <div className="container mx-auto grid h-full min-h-[65vh] w-full grid-cols-1 place-items-center gap-y-10 lg:grid-cols-2">
            <div className="row-start-2 lg:row-auto lg:-mt-6">
              <a href="/">
                <Image
                  src={`${config.apiUrl}storage/app/public/${bannerData?.logo_img}`}
                  alt={"book window logo"}
                  className="w-[55%]"
                  width={768}
                  height={768}
                />
              </a>
              <Typography
                className="mb-6 font-normal !text-gray-500 md:pr-16 xl:pr-28 ml-2"
                dangerouslySetInnerHTML={{
                  __html: bannerData?.banner_description,
                }}
                variant="lead"
                {...({} as React.ComponentProps<typeof Typography>)}
              />
              <Button
                size="lg"
                color="gray"
                {...({} as React.ComponentProps<typeof Button>)}
                onClick={onButtonClick}
                className="ml-2"
              >
                {bannerData?.banner_button_title}
              </Button>
            </div>
            <div className="mt-20 grid gap-6">
              <Image
                src={`${config.apiUrl}storage/app/public/${bannerData?.images}`}
                alt="hero image"
                width={768}
                height={768}
              />
            </div>
          </div>
        ) : (
          <div
            role="status"
            className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center"
          >
            <div className="w-full">
              <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[440px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[460px] mb-2.5"></div>
              <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
            </div>
            <div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded-sm sm:w-96 dark:bg-gray-700">
              <svg
                className="w-10 h-10 text-gray-200 dark:text-gray-600"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 18"
              >
                <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
              </svg>
            </div>
            <span className="sr-only">Loading...</span>
          </div>
        )}
      </section> */}

      {/* NEW WIDESCREEN IMAGE SLIDER */}
      <section className="relative w-full overflow-hidden bg-gray-900 group">
        <div className="relative w-full h-[90vh] overflow-hidden">
          {/* Slider Content Row */}
          <div 
            className="flex h-full transition-transform duration-700 ease-in-out"
            style={{
              width: `${slides.length * 100}%`,
              transform: `translateX(-${current * (100 / slides.length)}%)`
            }}
          >
            {slides.map((slide, idx) => (
              <div
                key={slide.id}
                onClick={onButtonClick}
                className="relative h-full cursor-pointer"
                style={{ width: `${100 / slides.length}%` }}
              >
                {/* Background Image */}
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={idx === 0}
                  className="object-cover w-full h-full"
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
