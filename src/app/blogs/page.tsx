"use client";
import { Typography } from "@material-tailwind/react";
import { Navbar, Footer } from "@/components";
import MainNavbar from "@/components/main-navbar";
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
      <MainNavbar />
      <Typography
        color="black"
        variant="h2"
        className="mb-4 text-2xl font-bold text-center mt-4"
        {...({} as React.ComponentProps<typeof Typography>)}
      >
        Blogs
      </Typography>
      <section className="container mx-auto px-4 mb-4 mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        {!blogData?.length
          ? [1, 2, 3].map((_i) => (
              <div
                key={_i}
                role="status"
                className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex flex-col md:items-center min-h-screen"
              >
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
                <div className="w-full">
                  <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[440px] mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[460px] mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                </div>
                <span className="sr-only">Loading...</span>
              </div>
            ))
          : blogData?.map((blog: any) => (
              <div key={blog?.id} className="bg-white p-4 rounded shadow">
                <Typography
                  as="a"
                  href={`blogs/${blog?.slug}`}
                  color="black"
                  variant="h2"
                  className="mb-4 text-xl font-bold"
                  {...({} as React.ComponentProps<typeof Typography>)}
                >
                  {blog?.title}
                </Typography>
                <Image
                  src={`${config.apiUrl}storage/${blog?.image}`}
                  alt={blog?.title}
                  className="object-contain mb-4 ml-8"
                  width={150}
                  height={200}
                />
                <Typography
                  className="w-full text-gray-600"
                  variant="lead"
                  dangerouslySetInnerHTML={{
                    __html: truncateContent(blog?.content),
                  }}
                  {...({} as React.ComponentProps<typeof Typography>)}
                ></Typography>
                <a href={`blogs/${blog?.slug}`} className="text-gray-800">
                  Read more
                </a>
              </div>
            ))}
      </section>

      <Footer />
    </>
  );
}
