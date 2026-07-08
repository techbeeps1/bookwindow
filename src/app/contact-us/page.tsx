"use client";

import React, { FormEvent } from "react";
import { Alert } from "@material-tailwind/react";

import config from "../config";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

export default function ContactSection() {
  const [alertMessage, setAlertMessage] = React.useState("");
  const [alertType, setAlertType] = React.useState<"error" | "success" | "">(
    ""
  );
  const [contactPageData, setContactPageData] = React.useState<any>(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    const fetchContactData = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/contact-page`,
          responseType: "json",
        });
        setContactPageData(response.data?.contact_detials);
      } catch (error) {
        console.log("error", error);
      }
    };

    fetchContactData();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const first_name = formData.get("first_name")?.toString().trim() || "";
    const last_name = formData.get("last_name")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim() || "";
    const subject = formData.get("subject")?.toString().trim() || "";
    const emailMessage = formData.get("emailMessage")?.toString() || "";

    // --- Validation ---
    if (first_name.length > 255) {
      setAlertType("error");
      setAlertMessage("First name cannot be more than 255 characters.");
      return;
    }

    if (last_name.length > 255) {
      setAlertType("error");
      setAlertMessage("Last name cannot be more than 255 characters.");
      return;
    }

    if (subject.length > 255) {
      setAlertType("error");
      setAlertMessage("Subject cannot be more than 255 characters.");
      return;
    }

    if (email.length > 255) {
      setAlertType("error");
      setAlertMessage("Email cannot be more than 255 characters.");
      return;
    }

    try {
      const response = await fetch(`${config.apiUrl}api/contact-form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name,
          last_name,
          subject,
          email,
          emailMessage,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlertType("success");
        setAlertMessage("Send mail successful!");
        form.reset();
      } else {
        setAlertType("error");
        setAlertMessage(data?.error || "Submission failed.");
      }
    } catch (error) {
      console.error("Error during Submission:", error);
    }
  }

  React.useEffect(() => {
    if (alertMessage) {
      const timer = setTimeout(() => {
        setAlertMessage("");
        setAlertType("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alertMessage]);

  return (
    <>


      {/* Banner Section */}
      <section className="relative w-full h-[50vh] flex items-center justify-center bg-gray-900 overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/image/contact.jpg"
            alt="Contact Us Background"
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
            Contact Us
          </h1>
          <p className="text-gray-300 text-sm md:text-base lg:text-lg max-w-3xl leading-relaxed mb-8 font-light">
            We are always here to help. Reach out to us for any queries, book orders, support, or general inquiries. Our team will get back to you shortly.
          </p>          
        </div>
      </section>

      {/* Main Info and Contact Form Section */}
      <section className="container mx-auto px-4 max-w-6xl my-16 md:my-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Ask questions and Contact Cards */}
          <div className="flex flex-col">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              You can ask us questions !
            </h2>
            <div className="w-20 h-[2px] bg-black mb-6 rounded-full" />
            <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-8">
              We're always happy to hear from you! Whether you have a question or need support, just drop us a message and our friendly team will get back to you soon.
            </p>

            <div className="flex flex-col gap-6">
              {/* Address Card */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-start gap-5 shadow-sm">
                <div className="flex-shrink-0 border-2 border-black text-black rounded-full p-2.5 bg-white w-12 h-12 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-5 h-5 text-black"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                    />
                  </svg>
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-base font-bold text-gray-950 mb-2">
                    Our Location & Store Address
                  </h4>
                  {!contactPageData?.con_address ? (
                    <div className="animate-pulse space-y-2 mt-1">
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ) : (
                    <div
                      className="text-sm text-gray-600 leading-relaxed break-words"
                      dangerouslySetInnerHTML={{ __html: contactPageData.con_address }}
                    />
                  )}
                </div>
              </div>

              {/* Direct Info Card */}
              <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex items-start gap-5 shadow-sm">
                <div className="flex-shrink-0 border-2 border-black text-black rounded-full p-2.5 bg-white w-12 h-12 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    className="w-5 h-5 text-black"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.824-1.802-5.14-4.117-6.942-6.942l1.293-.97c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                    />
                  </svg>
                </div>
                <div className="flex-grow min-w-0">
                  <h4 className="text-base font-bold text-gray-950 mb-2">
                    Direct Contact Information
                  </h4>
                  <div className="text-sm text-gray-600 space-y-2 mt-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-800">Phone: </span>
                      {!contactPageData?.con_phone ? (
                        <span className="h-3 bg-gray-200 rounded w-24 inline-block animate-pulse"></span>
                      ) : (
                        <span dangerouslySetInnerHTML={{ __html: contactPageData.con_phone }} />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-gray-800">Email: </span>
                      {!contactPageData?.con_email ? (
                        <span className="h-3 bg-gray-200 rounded w-32 inline-block animate-pulse"></span>
                      ) : (
                        <span dangerouslySetInnerHTML={{ __html: contactPageData.con_email }} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="w-full bg-[#f8f9fa] border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6 border-b pb-3 border-gray-200/60">
              Send Us a Message
            </h3>
            {alertMessage && (
              <Alert
                color={alertType === "error" ? "red" : "green"}
                className="mb-6 rounded-xl"
                onClose={() => setAlertMessage("")}
              >
                {alertMessage}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
              {/* Row 1: First and Last Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name*"
                  name="first_name"
                  className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-gray-400 transition-colors shadow-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name*"
                  name="last_name"
                  className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-gray-400 transition-colors shadow-sm"
                  required
                />
              </div>

              {/* Row 2: Email and Subject */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="email"
                  placeholder="Email*"
                  name="email"
                  className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-gray-400 transition-colors shadow-sm"
                  required
                />
                <input
                  type="text"
                  placeholder="Subject*"
                  name="subject"
                  className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-gray-400 transition-colors shadow-sm"
                  required
                />
              </div>

              {/* Row 3: Message Textarea */}
              <textarea
                rows={6}
                placeholder="Write Message Here*"
                name="emailMessage"
                className="w-full bg-white text-gray-900 placeholder-gray-400 border border-gray-200 rounded-xl px-4 py-3.5 text-sm focus:outline-none focus:border-gray-400 transition-colors resize-none shadow-sm"
                required
              />

              {/* Submit Button */}
              <button
                type="submit"
                className="bg-black hover:bg-gray-800 text-white font-semibold py-3.5 px-8 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 uppercase tracking-wider text-xs md:text-sm self-start mt-2"
              >
                Send Message
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* Full-width Map Section touching the Footer directly */}
      <div className="w-full h-[450px] relative z-10 mt-16 [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-none">
        {!contactPageData?.con_map ? (
          <div role="status" className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center text-gray-400">
            <svg
              className="w-12 h-12"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 18"
            >
              <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
            </svg>
          </div>
        ) : (
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: contactPageData.con_map }}
          />
        )}
      </div>


    </>
  );
}
