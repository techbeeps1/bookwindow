"use client";
import { Typography } from "@material-tailwind/react";
import { Navbar, Footer } from "@/components";
import MainNavbar from "@/components/main-navbar";
import React from "react";
import config from "../config";
import axios from "axios";

export default function AboutUs() {
  const [aboutUsData, setAboutUsData] = React.useState([] as any);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    const fetchAboutUsData = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/cms-pages/about-us`,
          responseType: "json",
        });
        setAboutUsData(response.data);
      } catch (error) {
        console.log("error", error);
      } finally {
        // console.log("An error occured");
      }
    };

    fetchAboutUsData();
  }, []);

  React.useEffect(() => {
    // console.log("aboutUsData", aboutUsData);
  }, [aboutUsData]);

  return (
    <>
      <Navbar />
      <MainNavbar />
      <section className="container mx-auto px-4 mb-4 mt-10">
        {!aboutUsData?.title ? (
          <div role="status" className="animate-pulse min-h-screen">
            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
            <span className="sr-only">Loading...</span>
          </div>
        ) : (
          <>
            <Typography
              color="black"
              variant="h2"
              className="mb-4"
              {...({} as React.ComponentProps<typeof Typography>)}
            >
              {aboutUsData?.title}
            </Typography>
            <Typography
              className="w-full text-gray-600"
              variant="lead"
              dangerouslySetInnerHTML={{ __html: aboutUsData?.content }}
              {...({} as React.ComponentProps<typeof Typography>)}
            ></Typography>
          </>
        )}
      </section>
      <Footer />
    </>
  );
}
