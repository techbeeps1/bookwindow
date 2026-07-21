"use client";

import config from "@/app/config";
import React, { FormEvent } from "react";
import toast from "react-hot-toast";

const ForgotPassword: React.FC = () => {
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
if (isLoading) return; // Prevent multiple submissions
    setIsLoading(true);
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString().trim() || "";
    try {
      const response = await fetch(
        `${config.apiUrl}api/customer/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
     

      if (response.ok) {
        setIsLoading(false);
     toast.success("Reset request successful! Please check your email.");
        form.reset();
      } else {
        toast.error(data?.error || "Reset request failed.");
         setIsLoading(false);
      }
    } catch (error) {
      console.error("Error during Submission:", error);
      toast.error("Something went wrong. Please try again later.");
      setIsLoading(false);
    }
  }


  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-black text-neutral-900 tracking-tight uppercase">
          Forgot Password?
        </h2>
        <p className="mt-1.5 text-xs font-semibold text-neutral-500">
          Remember your password?{" "}
          <a
            className="text-black font-extrabold hover:underline"
            href="/sign-in"
          >
            Login here
          </a>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address Input */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-xs font-semibold text-neutral-800 uppercase tracking-wider"
          >
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="name@mail.com"
              className="w-full pl-11 pr-4 py-3.5 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
              required
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          type="submit"
          className="w-full py-4 bg-black hover:bg-neutral-900 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-200 shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center cursor-pointer"
        >
          {isLoading ? (
            <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg> 
            <span className="ms-2">Please wait...</span></>
          ) : (
            "Reset Password"
          )   }
        </button>
      </form>

      {/* Footer Links */}
      <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-center items-center gap-4 text-center">
        <a
          className="text-xs font-bold text-neutral-400 hover:text-black transition-colors"
          href="/"
        >
          View Bookwindow
        </a>
        <span className="text-neutral-300 text-xs">|</span>
        <a
          className="text-xs font-bold text-neutral-400 hover:text-black transition-colors"
          href="/contact-us"
        >
          Contact us
        </a>
      </div>

    </div>
  );
};

export default ForgotPassword;
