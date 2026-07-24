"use client";

import React, { FormEvent, useState, useEffect } from "react";
import config from "../config";
import { FaUser, FaChevronDown } from "react-icons/fa6";
import { IoIosMail } from "react-icons/io";
import { IoCall, IoLocationSharp } from "react-icons/io5";
import { BsBriefcaseFill } from "react-icons/bs";
import { PiCity } from "react-icons/pi";



export default function Tutor() {
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success" | "">("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim() || "";
    const role = formData.get("role")?.toString().trim() || "";
    const locality = formData.get("locality")?.toString() || "";
    const city = formData.get("city")?.toString() || "";

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

    if (!role) {
      setAlertType("error");
      setAlertMessage("Please select a role.");
      return;
    }

    if (email.length > 255) {
      setAlertType("error");
      setAlertMessage("Email cannot be more than 255 characters.");
      return;
    }

    try {
      const response = await fetch(`${config.apiUrl}api/tutor-form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name,
          phone: phone,
          role: role,
          email: email,
          locality: locality,
          city: city,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlertType("success");
        setAlertMessage(
          "Thank you 😊!, We'll connect you in 2 to 3 working days."
        );
        form.reset();
      } else {
        setAlertType("error");
        setAlertMessage(data?.error || "Submission failed.");
      }
    } catch (error) {
      console.error("Error during Submission:", error);
      setAlertType("error");
      setAlertMessage("Something went wrong. Please try again later.");
    }
  }

  useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage("");
        setAlertType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200/50 flex items-center justify-center px-4 py-16 md:py-24 relative overflow-hidden">

      {/* Decorative Background Orbs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-neutral-300/20 rounded-full filter blur-[80px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-neutral-400/10 rounded-full filter blur-[100px] pointer-events-none"></div>

      {/* Card Container */}
      <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-neutral-200/60 p-8 md:p-12 relative z-10">

        {/* Header */}
        <div className="mb-10 text-center">
          <span className="text-xs font-bold uppercase  text-neutral-500">Join Bookwindow</span>
          <h2 className="text-3xl font-bold text-black mt-2 ">
            Tutor Registration
          </h2>
          <p className="text-sm text-neutral-500 mt-2">
            Submit your details and we will connect you with potential matches.
          </p>
          <div className="w-16 h-[2px] bg-black mt-4 mx-auto rounded-full" />
        </div>

        {/* Alerts */}
        {alertMessage && (
          <div
            className={`w-full p-4 mb-8 text-sm rounded-2xl border flex items-center justify-between transition-all duration-300 ${alertType === "error"
              ? "bg-red-50 text-red-800 border-red-200"
              : "bg-green-50 text-green-800 border-green-200"
              }`}
          >
            <span>{alertMessage}</span>
            <button
              onClick={() => setAlertMessage("")}
              className="text-lg font-bold leading-none ml-2 hover:opacity-75 focus:outline-none"
            >
              &times;
            </button>
          </div>
        )}

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

          {/* Row 1: Name and Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                Your Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <FaUser className="w-4 h-4 pointer-events-none" />
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

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                Your Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <IoIosMail className="w-5 h-5 pointer-events-none" />
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
          </div>

          {/* Row 2: Phone and Are You */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                Your Phone No.
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <IoCall className="w-5 h-5 pointer-events-none" />
                </div>
                <input
                  type="text"
                  name="phone"
                  required
                  placeholder="9000000033"
                  className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                Are You
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <BsBriefcaseFill className="w-4 h-4 pointer-events-none" />
                </div>
                <select
                  name="role"
                  required
                  className="w-full pl-11 pr-10 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="">Select a role</option>
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher</option>
                  <option value="Parent/Guardian">Parent/Guardian</option>
                </select>
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-neutral-400">
                  <FaChevronDown className="w-3.5 h-3.5 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Locality and City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                Locality
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <IoLocationSharp className="w-4 h-4 pointer-events-none" />
                </div>
                <input
                  type="text"
                  name="locality"
                  required
                  placeholder="Your Locality"
                  className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                City
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <PiCity className="w-4 h-4 pointer-events-none" />
                </div>
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="Your City"
                  className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 mt-4 bg-black text-white text-sm font-semibold rounded-full hover:bg-neutral-800 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none flex items-center justify-center gap-2"
          >
            Request
          </button>
        </form>
      </div>
    </div>
  );
}
