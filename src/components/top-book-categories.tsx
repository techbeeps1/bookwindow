"use client";

import React from "react";
import CategoryCard from "@/components/category-card";
import { motion } from "framer-motion";
import {  Typography } from "@material-tailwind/react";



export function TopBookCategories({
  highlightDiv,
  divRef,
  category_section,
}: any) {

  return (
    <section
      ref={divRef}
      className={`relative w-full overflow-hidden ${
        highlightDiv ? "bg-gray-300 shadow-2xl py-4" : ""
      }`}
    >     

      <div className="container mx-auto px-8 relative z-10">
        {category_section ? (
          <>
            {" "}
            <div className="mb-6 grid place-items-center text-center pt-[50px]">
              <Typography
                variant="h2"
                color="blue-gray"
                className=""
                {...({} as React.ComponentProps<typeof Typography>)}
              >               
                {category_section?.cat_sec_title}
              </Typography>
              <div className="w-20 h-[2px] bg-black my-4 rounded-full" />
              <Typography
                variant="lead"
                as="div"
                className="!text-gray-500 lg:w-6/12"
                {...({} as React.ComponentProps<typeof Typography>)}
              >
    
                <div
                  className="mt-3"
                  dangerouslySetInnerHTML={{
                    __html: category_section?.cat_sec_description || "",
                  }}
                />
              </Typography>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
              {category_section?.category_sections?.map((data: any, index: number) => (
                <motion.div
                  key={data?.id || index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  <CategoryCard
                    cat_image={data.cat_image}
                    cat_title={data.cat_title}
                    cat_content={data.cat_content}
                    cat_icon={data.cat_icon}
                  />
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div
              role="status"
              className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex mt-20 items-center justify-center text-center mb-10"
            >
              <div className="">
                <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
              </div>
              <span className="sr-only">Loading...</span>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {[1, 2, 3].map((_i) => (
                <div
                  className="flex animate-pulse flex-wrap items-center text-center pl-8"
                  key={_i}
                >
                  <div className="grid h-36 w-36 place-items-center rounded-lg bg-gray-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="h-12 w-12 text-gray-500"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}

export default TopBookCategories;
