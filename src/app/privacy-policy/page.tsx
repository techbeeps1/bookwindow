"use client";

import { Navbar, Footer } from "@/components";
import React from "react";
import Image from "next/image";
import axios from "axios";
import config from "../config";
import Link from "next/link";

export default function PrivacyPolicy() {
  const [privacyPolicyData, setPrivacyPolicyData] = React.useState<any>(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/cms-pages/privacy-policy`,
          responseType: "json",
        });
        setPrivacyPolicyData(response.data);
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchPrivacyPolicy();
  }, []);

  return (
    <>
      <Navbar />
      
      {/* Banner Section */}
      <section className="relative w-full h-[50vh] flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/image/privacy.jpg"
            alt="Privacy Policy Background"
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
            Privacy Policy
          </h1>
          <p className="text-gray-300 text-sm md:text-base lg:text-lg max-w-3xl leading-relaxed mb-8 font-light">
            Your privacy is highly important to us. Understand how we collect, use, manage, and secure your personal information on Bookwindow.
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
        {!privacyPolicyData?.title ? (
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
              className="text-base text-gray-600 space-y-4 leading-relaxed dynamic-content"
              dangerouslySetInnerHTML={{ __html: privacyPolicyData?.content }}
            />
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}
