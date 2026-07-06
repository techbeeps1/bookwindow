"use client";
import { Typography } from "@material-tailwind/react";
import { Navbar, Footer } from "@/components";
import React from "react";
import config from "../config";
import axios from "axios";
import Image from "next/image";

export default function Blogs() {
  const [blogData, setBlogData] = React.useState([] as any);
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/blog`,
          responseType: "json",
        });
        setBlogData(response.data);
      } catch (error) {
        console.log("error", error);
      } finally {
        // console.log("An error occured");
      }
    };

    fetchBlogData();
  }, []);

  React.useEffect(() => {
    // console.log("blogData", blogData);
  }, [blogData]);

  const truncateContent = (content: any, limit = 100) => {
    if (!content) return "";
    return content.length > limit ? `${content.slice(0, limit)}...` : content;
  };

  return (
    <>
      <Navbar />

      {/* Banner Section */}
      <section className="relative w-full h-[40vh] flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/image/about-us.jpg"
            alt="Blogs Banner Background"
            fill
            priority
            className="object-cover w-full h-full opacity-30 select-none pointer-events-none"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* Banner Content */}
        <div className="relative z-10 text-center max-w-4xl px-6 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 uppercase tracking-wider">
            Blogs
          </h1>
          <p className="text-gray-300 text-sm md:text-base lg:text-lg max-w-2xl leading-relaxed font-light">
            Stay updated with the latest literary trends, book reviews, preparation guides, and expert advice to help you excel.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 mb-16 mt-16 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {!blogData?.length
          ? [1, 2, 3, 4].map((_i) => (
              <div
                key={_i}
                role="status"
                className="bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100/50 animate-pulse flex flex-col justify-between h-[360px]"
              >
                <div>
                  <div className="relative w-full aspect-[4/3] bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-5 bg-gray-200 rounded w-5/6 mb-2.5"></div>
                  <div className="h-5 bg-gray-200 rounded w-2/3 mb-4"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mt-auto"></div>
                <span className="sr-only">Loading...</span>
              </div>
            ))
          : blogData?.map((blog: any) => (
              <div
                key={blog?.id}
                className="group bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_rgba(0,0,0,0.08)] border border-gray-100/50 flex flex-col justify-between h-full transition-all duration-300"
              >
                <div>
                  <a
                    href={`blogs/${blog?.slug}`}
                    className="block relative w-full aspect-[4/3] overflow-hidden rounded-xl mb-4 bg-slate-50"
                  >
                    <Image
                      src={`${config.apiUrl}storage/app/public/${blog?.image}`}
                      alt={blog?.title}
                      fill
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </a>
                  <Typography
                    as="a"
                    href={`blogs/${blog?.slug}`}
                    className="mb-4 text-base font-bold text-slate-800 hover:text-primary transition-colors duration-200 line-clamp-2 leading-snug block"
                    {...({} as React.ComponentProps<typeof Typography>)}
                  >
                    {blog?.title}
                  </Typography>
                </div>
                <a
                  href={`blogs/${blog?.slug}`}
                  className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-primary transition-colors duration-200 mt-auto"
                >
                  Read More
                  <span className="ml-1.5 transform transition-transform group-hover:translate-x-1 duration-200">
                    &rarr;
                  </span>
                </a>
              </div>
            ))}
      </section>

      <Footer />
    </>
  );
}
