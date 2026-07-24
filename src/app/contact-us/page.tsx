"use client";

import React, { FormEvent } from "react";
import { Alert } from "@material-tailwind/react";

import config from "../config";
import axios from "axios";
import Image from "next/image";
import { ImLocation2 } from "react-icons/im";
import { IoCallSharp } from "react-icons/io5";
import { FaImage } from "react-icons/fa6";


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
        setAlertMessage("Thank you! Your message has been sent successfully");
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
            <h2 className="text-[28px] md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
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

                  <ImLocation2 className="w-5 h-5 text-black" />
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
                  <IoCallSharp className="w-5 h-5 text-black" />
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
            <FaImage className="w-12 h-12" />
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
