"use client";

import logo from "../../public/logos/logo.svg";
import Image from "next/image";
import React from "react";
import axios from "axios";
import config from "@/app/config";
import Link from "next/link";
import toast from "react-hot-toast";


export function Footer({menuData}:any) {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  function chunkArray(array: any[], size: number) {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  async function SubmitNewsLetter() {
 


  if (!email) {
    toast.error("Please enter a valid email address.");
    return;
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    toast.error("Please enter a valid email address.");
    return;
  }
  if (loading) return; 

    setLoading(true);
   const res = await fetch(`${config.apiUrl}api/newsletter`, {
     method: "POST",
     headers: {
       "Content-Type": "application/json"
     },
     body: JSON.stringify({ email })
   });
   const data = await res.json();
   console.log(data);
   setLoading(false);
   if (data.success) {
    toast.success("Thank you for subscribe!");
    setEmail("");
   } if (data.mailchimp.title ==="Member Exists") {
    toast.success("You are already subscribed to our newsletter.");
   }
   else {
    toast.error("Failed to subscribe. Please try again.");
   }
  }

  const chunkedMenu = chunkArray(
    menuData || [],
    Math.ceil((menuData?.length || 0) / 3)
  );
  const columnTitles = ["Quick Links", "Services", "Policies"];
  return (
    <footer className="w-full bg-[#0a0908] text-white">
      {/* 1. Newsletter Section */}
      <div className="w-full bg-[#141211] border-b border-gray-900">
        <div className="mx-auto max-w-7xl px-8 py-12 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="text-left max-w-xl">
            <h3 className="text-xl md:text-2xl font-sans text-white font-normal leading-relaxed">
              Get exclusive updates on the collection's launch, latest trends, stories and more
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3">
            <input
              type="email"
              placeholder="Enter your email address"
              className="bg-[#242120] text-white border-none rounded-md px-4 py-3 w-full sm:w-[280px] md:w-[320px] text-sm focus:outline-none focus:ring-1 focus:ring-gray-700 placeholder-gray-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={SubmitNewsLetter} className="bg-white text-black font-semibold text-xs md:text-sm px-6 py-3 rounded-md uppercase tracking-wider hover:bg-gray-200 transition-all duration-200 shrink-0">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Link Columns */}
      <div className="mx-auto max-w-7xl px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
          {/* Logo & About Info Column */}
          <div className="flex flex-col gap-4 flex-shrink-0">
            <Link href="/">
              <Image
                src={logo}
                alt="book window logo"
                className="h-auto w-[55px] object-contain brightness-0 invert"
              />
            </Link>
            <p className="text-gray-400 text-sm font-sans leading-relaxed mt-2 max-w-xs">
              Your one-stop destination for school, college, competitive exam books, and educational resources.
            </p>
          </div>

          {/* Dynamic Link Columns */}
          {chunkedMenu.map((column, colIndex) => (
            <div key={colIndex} className="flex flex-col">
              <h4 className="text-white font-bold font-sans text-lg mb-6">
                {columnTitles[colIndex] || "Information"}
              </h4>
              <ul className="space-y-3">
                {column.map((menu: any) => (
                  <li key={menu.id}>
                    <Link
                      href={menu.url}
                      className="text-gray-400 text-sm hover:text-white transition-colors duration-200 font-sans"
                    >
                      {menu.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Bottom Row (Socials & Trust Badges) */}
      <div className="border-t border-gray-900 bg-black py-10">
        <div className="mx-auto max-w-7xl px-8 flex flex-col lg:flex-row justify-between items-center gap-8">
          {/* Left: Follow Us and Social Icons */}
          <div className="flex items-center gap-6">
            <span className="text-white font-sans text-base font-semibold">Follow Us</span>
            <div className="flex gap-4">
              <Link
                href="https://m.facebook.com/100064054598576/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Facebook"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H7v3h2v9h4v-9h3.6l.4-3H13V6c0-.5.5-1 1-1h3V1H13c-3 0-5 2-5 5v2z" />
                </svg>
              </Link>
              <Link
                href="https://www.instagram.com/bookwindow_2.0?igsh=MXV5ZTVmcTIxcGRyNA=="
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Instagram"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
                </svg>
              </Link>
              <Link
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors duration-200"
                aria-label="Youtube"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right: Trust Badges */}
          <div className="flex flex-wrap justify-center lg:justify-end gap-6 md:gap-8 text-gray-400 text-xs md:text-sm font-sans font-semibold">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Authentic and Genuine Brands</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Bookwindow Promise</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white stroke-current fill-none" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Easy Returns And Exchanges</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
