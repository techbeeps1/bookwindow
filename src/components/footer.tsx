"use client";

import logo from "../../public/logos/logo.svg";
import Image from "next/image";
import React from "react";
import axios from "axios";
import config from "@/app/config";
import Link from "next/link";
import toast from "react-hot-toast";
import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa6";
import { FaYoutube } from "react-icons/fa";



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
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <span className="text-white font-sans text-sm sm:text-base font-semibold tracking-wide uppercase text-gray-300">
              Follow Us
            </span>
            <div className="flex items-center gap-3">
              {/* Facebook */}
              <Link
                href="https://m.facebook.com/100064054598576/"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-[#1877F2] hover:border-[#1877F2] transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-[0_0_18px_rgba(24,119,242,0.5)]"
                aria-label="Facebook"
              >               
                <FaFacebookF className="h-4 w-4 transition-transform duration-300 group-hover:scale-110"/>
              </Link>

              {/* Instagram */}
              <Link
                href="https://www.instagram.com/bookwindow_2.0?igsh=MXV5ZTVmcTIxcGRyNA=="
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:border-transparent transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-[0_0_18px_rgba(220,39,67,0.5)]"
                aria-label="Instagram"
              >
                <FaInstagram className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110" />
              </Link>

              {/* YouTube */}
              <Link
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:bg-[#FF0000] hover:border-[#FF0000] transition-all duration-300 hover:scale-110 active:scale-95 shadow-md hover:shadow-[0_0_18px_rgba(255,0,0,0.5)]"
                aria-label="Youtube"
              >               
                <FaYoutube className="h-4.5 w-4.5 transition-transform duration-300 group-hover:scale-110" />
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
