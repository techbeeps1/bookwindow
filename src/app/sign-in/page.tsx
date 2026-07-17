"use client";

import config from "../config";
import { useState, useRef, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Modal from "@/components/modal";
import ForgotPassword from "@/components/forgot-password";

const generateCaptchaText = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let captcha = "";
  for (let i = 0; i < 6; i++) {
    captcha += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return captcha;
};

export default function SignIn() {
  const router = useRouter();
  
  const [customerData, setCustomerData] = useState({} as any);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"error" | "success" | "">("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [isloading, setIsloading] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "register") {
        setActiveTab("register");
      }
    }
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password")?.toString() || "";
    if (!email) {
      setAlertType("error");
      setAlertMessage("Email is required.");
      return;
    }

    if (!password) {
      setAlertType("error");
      setAlertMessage("Password is required.");
      return;
    }

    if (password.length < 8) {
      setAlertType("error");
      setAlertMessage("Password must be at least 8 characters long.");
      return;
    }

    setIsloading(true);

    const response = await fetch(`${config.apiUrl}api/v1/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
      setIsloading(false);
    if (response.ok) {
      const data = await response.json();
      setCustomerData(data);
      router.push("/my-account");
    } else {
      const data = await response.json();
      if (data?.error === "The provided credentials are incorrect.") {
        setAlertType("error");
        setAlertMessage("The provided credentials are incorrect.");
        return;
      } else {
        setAlertType("error");
        setAlertMessage(data?.error);
      }
      console.error("Login failed", response.status);
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

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      customerData?.customer
    ) {
      localStorage.setItem("customer", JSON.stringify(customerData.customer));
    }
  }, [customerData]);

  // Register CAPTCHA setup
  const canvasRef = useRef(null);
  const [captcha, setCaptcha] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");

  const drawCaptcha = (text: string) => {
    const canvas: any = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");

      const letterSpacing = 20;
      const padding = 20;
      canvas.width = text.length * letterSpacing + padding;
      canvas.height = 40;

      ctx.fillStyle = "#f0f0f0";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "24px Arial";
      ctx.fillStyle = "#333";
      ctx.textBaseline = "middle";

      for (let i = 0; i < text.length; i++) {
        const angle = Math.random() * 0.4 - 0.2;
        ctx.save();
        ctx.translate(letterSpacing * i + 15, 20);
        ctx.rotate(angle);
        ctx.fillText(text[i], 0, 0);
        ctx.restore();
      }

      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${
          Math.random() * 255
        },0.5)`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
      }
    }
  };

  const refreshCaptcha = () => {
    const newCaptcha = generateCaptchaText();
    setCaptcha(newCaptcha);
    drawCaptcha(newCaptcha);
  };

  useEffect(() => {
    if (activeTab === "register" && canvasRef.current) {
      const newCaptcha = generateCaptchaText();
      setCaptcha(newCaptcha);
      drawCaptcha(newCaptcha);
    }
  }, [activeTab]);

  async function handleSubmit1(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const first_name = formData.get("first_name")?.toString().trim() || "";
    const last_name = formData.get("last_name")?.toString().trim() || "";
    const email = formData.get("email")?.toString().trim() || "";
    const phone = formData.get("phone")?.toString().trim() || "";
    const password = formData.get("password")?.toString() || "";

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

    if (password.length < 8) {
      setAlertType("error");
      setAlertMessage("Password must be at least 8 characters long.");
      return;
    }

    if (!email) {
      setAlertType("error");
      setAlertMessage("Email is required.");
      return;
    }

    if (captchaInput !== captcha) {
      setAlertType("error");
      setAlertMessage("Invalid CAPTCHA. Please try again.");
      refreshCaptcha();
      return;
    }
        setIsloading(true);

    try {
      const response = await fetch(`${config.apiUrl}api/v1/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name, last_name, phone, email, password }),
      });

      const data = await response.json();
  setIsloading(false);
      if (response.ok) {
        setAlertType("success");
        setAlertMessage("Registration successful!");
        form.reset();
        setCaptchaInput("");
      } else {
        if (data?.error?.includes("email has already been taken")) {
          setAlertType("error");
          setAlertMessage(
            "Email is already registered. Please use another one."
          );
        } else {
          setAlertType("error");
          setAlertMessage(data?.error || "Registration failed.");
        }
      }
    } catch (error) {
      console.error("Error during registration:", error);
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
      
     
      <div className="absolute top-10 left-10 w-96 h-96 bg-neutral-300/20 rounded-full filter blur-[80px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-neutral-400/10 rounded-full filter blur-[100px] pointer-events-none"></div>

    
      <div className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl border border-neutral-200/60 overflow-hidden grid grid-cols-1 md:grid-cols-12 relative z-10">
        
     
        <div className="md:col-span-5 bg-black text-white p-12 flex flex-col justify-between relative overflow-hidden hidden md:flex">
        
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(50,50,50,0.4),transparent)] pointer-events-none"></div>
          
          <div className="relative z-10">
            <h1 className="text-2xl font-bold tracking-tight">Bookwindow</h1>
          </div>

          <div className="relative z-10 my-auto py-10">
            <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">Welcome to the club</span>
            <h2 className="text-4xl font-extrabold mt-3 leading-tight tracking-tight">
              Discover your next great read.
            </h2>
            <p className="text-neutral-400 text-sm mt-4 leading-relaxed">
              Access thousands of curated books, academic resources, and literary masterpieces at your fingertips.
            </p>
            
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-neutral-300">
                <svg className="w-5 h-5 text-neutral-400 shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Curated academic & literary collections</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-300">
                <svg className="w-5 h-5 text-neutral-400 shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Fast, trackable home delivery</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-300">
                <svg className="w-5 h-5 text-neutral-400 shrink-0 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>Safe & encrypted direct checkouts</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} Bookwindow. All rights reserved.
          </div>
        </div>

        <div className="md:col-span-7 p-8 md:p-12 lg:p-16 flex flex-col justify-center bg-white">
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-black tracking-tight">
              {activeTab === "login" ? "Sign in to Bookwindow" : "Create your account"}
            </h2>
            <p className="text-sm text-neutral-500 mt-1.5">
              {activeTab === "login" ? "Welcome back! Please enter your details." : "Join our reader community today."}
            </p>
          </div>

          {/* Alerts */}
          {alertMessage && (
            <div
              className={`w-full p-4 mb-6 text-sm rounded-2xl border flex items-center justify-between transition-all duration-300 ${
                alertType === "error"
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

          <div className="flex p-1.5 bg-neutral-100 rounded-full mb-8 border border-neutral-200/50 shadow-inner">
            <button
              type="button"
              onClick={() => setActiveTab("login")}
              className={`py-3 flex-1 text-center text-sm font-bold rounded-full transition-all duration-300 active:scale-[0.97] focus:outline-none ${
                activeTab === "login"
                  ? "bg-black text-white shadow-lg shadow-black/10 scale-[1.01]"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/40"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("register")}
              className={`py-3 flex-1 text-center text-sm font-bold rounded-full transition-all duration-300 active:scale-[0.97] focus:outline-none ${
                activeTab === "register"
                  ? "bg-black text-white shadow-lg shadow-black/10 scale-[1.01]"
                  : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-200/40"
              }`}
            >
              Register
            </button>
          </div>

          {activeTab === "login" ? (
            /* Login Form */
            <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
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

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                    className="text-xs text-neutral-500 hover:text-black transition-colors hover:underline focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="********"
                    className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 mt-4 bg-black text-white text-sm font-semibold rounded-full hover:bg-neutral-800 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none flex items-center justify-center gap-2"
              >      {isloading && (
    <>
      <svg
        className="w-5 h-5 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-80"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    </>
  ) }
                Login
              </button>
            </form>
          ) : (
            /* Register Form */
            <form className="flex flex-col gap-5 w-full animate-fadeIn" onSubmit={handleSubmit1}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="first_name"
                      required
                      placeholder="First Name"
                      className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="last_name"
                      required
                      placeholder="Last Name"
                      className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                  Email
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

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                  Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="number"
                    name="phone"
                    required
                    placeholder="9836348346"
                    className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="********"
                    className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                  />
                </div>
              </div>

              {/* CAPTCHA Section */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                  CAPTCHA
                </label>
                <div className="flex items-center gap-3">
                  <canvas
                    ref={canvasRef}
                    className="border border-neutral-200 rounded-xl bg-neutral-50 h-10 w-40"
                  />
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="px-4 py-2 text-xs font-semibold bg-neutral-100 border border-neutral-200 rounded-full hover:bg-neutral-200 active:scale-95 transition-all focus:outline-none"
                  >
                    Refresh
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Enter the above CAPTCHA"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  className="w-full px-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                />
              </div>

              {/* Terms and Privacy Checkbox */}
              <label className="flex items-start gap-3 mt-2 cursor-pointer text-xs text-neutral-500 font-normal leading-relaxed select-none">
                <input
                  type="checkbox"
                  required
                  className="w-4 h-4 mt-0.5 rounded border-neutral-300 text-black focus:ring-black accent-black shrink-0"
                />
                <span>
                  By clicking SIGN UP, I agree to Bookwindow's
                  <a
                    href="terms"
                    className="font-semibold text-black underline hover:text-neutral-800 transition-colors"
                  >
                    &nbsp;Terms of Use
                  </a>
                  &nbsp;and
                  <a
                    href="privacy-policy"
                    className="font-semibold text-black underline hover:text-neutral-800 transition-colors"
                  >
                    &nbsp;Privacy Policy
                  </a>
                  .
                </span>
              </label>

              <button
                type="submit"
                className="w-full py-3 mt-4 bg-black text-white text-sm font-semibold rounded-full hover:bg-neutral-800 active:scale-95 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none flex items-center justify-center gap-2"
              >
      {isloading && (
    <>
      <svg
        className="w-5 h-5 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-20"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-80"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
    </>
  ) }
                Sign Up
              </button>
            </form>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <ForgotPassword />
      </Modal>
    </div>
  );
}
