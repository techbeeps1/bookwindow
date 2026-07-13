"use client";

import { FormEvent, useState, useEffect } from "react";
import Image from "next/image";
import React from "react";
import config from "../config";

export default function RequestProduct() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      setPreview(null);
    }
  };

  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success" | "">("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim() || "";
    const request = formData.get("request")?.toString().trim() || "";
    const remark = formData.get("remark")?.toString() || "";

    // --- Validation ---
    if (name.length > 255) {
      setAlertType("error");
      setAlertMessage("Name cannot be more than 255 characters.");
      return;
    }

    if (phone.length > 10) {
      setAlertType("error");
      setAlertMessage("Phone number cannot be more than 10 characters.");
      return;
    }

    if (!request) {
      setAlertType("error");
      setAlertMessage("Please write a request.");
      return;
    }

    if (email.length > 255) {
      setAlertType("error");
      setAlertMessage("Email cannot be more than 255 characters.");
      return;
    }
    const newFormData = new FormData();
    newFormData.append("name", name);
    newFormData.append("phone", phone);
    newFormData.append("email", email);
    newFormData.append("request", request);
    newFormData.append("remark", remark);

    if (image instanceof File) {
      newFormData.append("image", image);
    }
    try {
      const response = await fetch(`${config.apiUrl}api/product-request`, {
        method: "POST",
        body: newFormData,
      });

      const data = await response.json();

      if (response.ok) {
        setAlertType("success");
        setAlertMessage(
          "Thank you 😊!, We'll connect you in 2 to 3 working days."
        );
        form.reset();
        setImage(null);
        setPreview(null);
      } else {
        if (data?.error) {
          setAlertType("error");
          setAlertMessage(data?.error);
        } else {
          setAlertType("error");
          setAlertMessage(data?.error || "Submission failed.");
        }
      }
    } catch (error) {
      console.error("Error during Submission:", error);
      setAlertType("error");
      setAlertMessage("Something went wrong. Please try again later.");
    }
  }

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage("");
        setAlertType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  const placeholderImage = "https://bookwindow.in/assets/images/im-def.png";

  return (
    <>
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center px-4 py-16 md:py-24">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight uppercase">
            Request Product
          </h1>
          <p className="text-neutral-500 text-xs font-semibold mt-1">
            Fill in the details below to request a product not listed on our site.
          </p>
        </div>

        {/* Card Container */}
        <div className="w-full max-w-2xl bg-white rounded-3xl border border-neutral-200/80 shadow-sm p-6 sm:p-10">
          
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            
            {/* Your Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                Your Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Your Name"
                  className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                />
              </div>
            </div>

            {/* Your Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                Your Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@mail.com"
                  className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                />
              </div>
            </div>

            {/* Your Phone No */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                Your Phone No.
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="Phone Number"
                  className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                />
              </div>
            </div>

            {/* Request text */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                Request
              </label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-3.5 flex pointer-events-none text-neutral-400">
                  <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <textarea
                  name="request"
                  required
                  placeholder="Write details of the product you are requesting..."
                  rows={4}
                  className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200 resize-y min-h-[80px]"
                />
              </div>
            </div>

            {/* Remark text */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                Remark
              </label>
              <div className="relative">
                <div className="absolute top-3 left-0 pl-3.5 flex pointer-events-none text-neutral-400">
                  <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <textarea
                  name="remark"
                  placeholder="Any additional remarks..."
                  rows={3}
                  className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200 resize-y min-h-[60px]"
                />
              </div>
            </div>

            {/* Image Upload section */}
            <div className="flex flex-col items-center justify-center p-6 bg-[#fbfbfb] rounded-2xl border border-neutral-200/60 shadow-inner">
              <label className="cursor-pointer bg-black hover:bg-neutral-900 text-white font-extrabold text-xs uppercase tracking-widest px-5 py-3 rounded-xl transition-all duration-200 active:scale-97 shadow-md flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span>Upload Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>

              <div className="mt-6 flex justify-center">
                <Image
                  src={preview || placeholderImage}
                  alt={preview ? "Preview" : "placeholder-image"}
                  className="w-48 h-48 object-contain rounded-xl border border-neutral-200 bg-white p-2 shadow-sm"
                  width={180}
                  height={180}
                  unoptimized
                />
              </div>
            </div>

            {/* Action buttons */}
            <button
              type="submit"
              className="w-full py-4 mt-2 bg-black hover:bg-neutral-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center cursor-pointer"
            >
              Request Product
            </button>
          </form>

          {/* Alert Message */}
          {alertMessage && (
            <div
              className={`w-full p-4 mt-6 text-sm rounded-2xl border flex items-center justify-between transition-all duration-300 ${
                alertType === "error"
                  ? "bg-red-50 text-red-800 border-red-200"
                  : "bg-green-50 text-green-800 border-green-200"
              }`}
            >
              <span>{alertMessage}</span>
              <button
                type="button"
                onClick={() => setAlertMessage("")}
                className="text-lg font-bold leading-none ml-2 hover:opacity-75 focus:outline-none"
              >
                &times;
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
