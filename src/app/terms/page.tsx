"use client";
import { Typography } from "@material-tailwind/react";
import { Navbar, Footer } from "@/components";
import MainNavbar from "@/components/main-navbar";
import React from "react";
import axios from "axios";
import config from "../config";

export default function Terms() {
  const [termsData, setTermsData] = React.useState([] as any);
  const [termsContent, setTermsContent] = React.useState([] as any);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    const fetchAboutUsData = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/cms-pages/terms-and-conditions`,
          responseType: "json",
        });
        setTermsData(response.data);
      } catch (error) {
        console.log("error", error);
      } finally {
        // console.log("An error occured");
      }
    };

    fetchAboutUsData();
  }, []);

  React.useEffect(() => {
    if (termsData?.content) {
      let updatedContent = termsData.content
        .replaceAll("<p><h2>", '<h2 class="mb-4">')
        .replaceAll("</h2></p>", "</h2>")
        .replaceAll("<p><h3>", '<h3 class="mb-4">')
        .replaceAll("</h3></p>", "</h3>")
        .replaceAll(
          "<ol>",
          '<ol class="list-decimal list-inside space-y-2 mb-4">'
        )
        .replaceAll("<li>", '<li class="mb-4">')
        .replaceAll("<p>", '<p class="mb-4">')
        .replaceAll("<h2>", '<h2 class="mb-4">');
      setTermsContent(updatedContent);
    }
  }, [termsData]);

  return (
    <>
      <Navbar />
      <MainNavbar />
      <section className="container mx-auto px-4 mb-4 mt-10">
        {!termsData?.title ? (
          <div role="status" className="animate-pulse min-h-screen">
            <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[330px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[300px] mb-2.5"></div>
            <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
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
              {termsData?.title}
            </Typography>
            <Typography
              className="w-full text-gray-600 leading-relaxed"
              variant="lead"
              dangerouslySetInnerHTML={{ __html: termsContent }}
              {...({} as React.ComponentProps<typeof Typography>)}
            />
          </>
        )}
      </section>
      <Footer />
    </>
  );
}
