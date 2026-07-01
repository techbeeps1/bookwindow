"use client";

import Image from "next/image";
import { Button, Typography } from "@material-tailwind/react";
import logo from "../../public/logos/logo.png";
import config from "@/app/config";

function Hero({ onButtonClick, bannerData }: any) {
  return (
    <header className="bg-yellow-50 px-8 pb-8">
      {bannerData ? (
        <div className="container mx-auto grid h-full min-h-[65vh] w-full grid-cols-1 place-items-center gap-y-10 lg:grid-cols-2">
          <div className="row-start-2 lg:row-auto lg:-mt-6">
            <a href="/">
              <Image
                src={`${config.apiUrl}storage/${bannerData?.logo_img}`}
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
            {/* <Typography
            variant="h1"
            color="red"
            className="text-3xl !leading-snug"
            {...({} as React.ComponentProps<typeof Typography>)}
          >
            40% OFF
          </Typography>
          <a href="/">
            <Image src={logo} alt={"book window logo"} className="w-[55%]" />
          </a>
          <Typography
            variant="lead"
            className="mb-6 font-normal !text-gray-500 md:pr-16 xl:pr-28"
            {...({} as React.ComponentProps<typeof Typography>)}
          >
            Ace your exam with our expertly curated selection of competitve exam
            books.
            <br /> 
            To get all RAS class and books -
          </Typography> */}
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
              src={`${config.apiUrl}storage/${bannerData?.images}`}
              alt="hero image"
              width={768}
              height={768}
            />
            {/* <div className="grid grid-cols-4 gap-6">
            <Image
              width={768}
              height={768}
              src="/image/books/Rectangle8.svg"
              className="rounded-lg shadow-md"
              alt="flowers"
            />
            <Image
              width={768}
              height={768}
              src="/image/books/Rectangle9.svg"
              className="-mt-28 rounded-lg shadow-md"
              alt="flowers"
            />
            <Image
              width={768}
              height={768}
              src="/image/books/Rectangle10.svg"
              className="-mt-14 rounded-lg shadow-md"
              alt="flowers"
            />
            <Image
              width={768}
              height={768}
              src="/image/books/Rectangle11.svg"
              className="-mt-20 rounded-lg shadow-md"
              alt="flowers"
            />
          </div>
          <div className="grid grid-cols-4 gap-6">
            <div></div>
            <Image
              width={768}
              height={768}
              src="/image/books/Rectangle12.svg"
              className="-mt-28 rounded-lg shadow-md"
              alt="flowers"
            />
            <Image
              width={768}
              height={768}
              src="/image/books/Rectangle13.svg"
              className="-mt-14 rounded-lg shadow-md"
              alt="flowers"
            />
            <Image
              width={768}
              height={768}
              src="/image/books/Rectangle14.svg"
              className="-mt-20 rounded-lg shadow-md"
              alt="flowers"
            />
          </div> */}
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
    </header>
  );
}
export default Hero;
