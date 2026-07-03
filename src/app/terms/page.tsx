"use client";

import { Navbar, Footer } from "@/components";
import React from "react";
import Image from "next/image";
import axios from "axios";
import config from "../config";
import Link from "next/link";

export default function Terms() {
  const [termsData, setTermsData] = React.useState<any>(null);
  const [termsContent, setTermsContent] = React.useState<string>("");

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    const fetchTermsData = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/cms-pages/terms-and-conditions`,
          responseType: "json",
        });
        setTermsData(response.data);
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchTermsData();
  }, []);

  React.useEffect(() => {
    if (termsData?.content) {
      let updatedContent = termsData.content
        .replaceAll("<p><h2>", '<h2 class="text-xl font-bold mb-4 mt-6 text-gray-900">')
        .replaceAll("</h2></p>", "</h2>")
        .replaceAll("<p><h3>", '<h3 class="text-lg font-bold mb-3 mt-4 text-gray-900">')
        .replaceAll("</h3></p>", "</h3>")
        .replaceAll(
          "<ol>",
          '<ol class="list-decimal list-inside space-y-2 mb-4 text-gray-650">'
        )
        .replaceAll("<li>", '<li class="mb-2 pl-2">')
        .replaceAll("<p>", '<p class="mb-4 text-gray-600 leading-relaxed">')
        .replaceAll("<h2>", '<h2 class="text-xl font-bold mb-4 mt-6 text-gray-900">');
      setTermsContent(updatedContent);
    }
  }, [termsData]);

  return (
    <>
      <Navbar />
      
      {/* Banner Section */}
      <section className="relative w-full h-[50vh] flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/image/privacy.jpg"
            alt="Terms & Conditions Background"
            fill
            priority
            className="object-cover w-full h-full opacity-35 select-none pointer-events-none"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Banner Content */}
        <div className="relative z-10 text-center max-w-4xl px-6 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 uppercase">
            Terms & Conditions
          </h1>
          <p className="text-gray-300 text-sm md:text-base lg:text-lg max-w-3xl leading-relaxed mb-8 font-light">
            Please read our terms and conditions carefully before using our platform or services. By accessing Bookwindow, you agree to comply with these terms.
          </p>
          <Link
            href="/contact-us"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-semibold rounded-md transition-all duration-300 hover:shadow-lg focus:outline-none uppercase tracking-wider"
          >
            Contact Us 
          </Link>
        </div>
      </section>

      {/* CMS Content Section */}
      <section className="container mx-auto px-4 max-w-5xl my-16 md:my-24">
        {!termsData?.title ? (
          <div role="status" className="animate-pulse space-y-4 min-h-[300px]">
            <div className="h-6 bg-gray-200 rounded-full w-48 mb-6"></div>
            <div className="h-4 bg-gray-150 rounded-full w-full"></div>
            <div className="h-4 bg-gray-150 rounded-full w-[92%]"></div>
            <div className="h-4 bg-gray-150 rounded-full w-[95%]"></div>
            <div className="h-4 bg-gray-150 rounded-full w-[85%]"></div>
            <span className="sr-only">Loading...</span>
          </div>
        ) : (
          <div className="bg-white p-6 md:p-10 rounded-2xl border border-gray-100 shadow-sm">           
            <div 
              className="text-base text-gray-650 space-y-4 leading-relaxed dynamic-content"
              dangerouslySetInnerHTML={{ __html: termsContent }}
            />
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
