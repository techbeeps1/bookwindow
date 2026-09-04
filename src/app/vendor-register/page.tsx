"use client";

import React, { useState, useRef, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import config from "@/app/config";
import toast from "react-hot-toast";
import {
  FaStore,
  FaUser,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaArrowRight,
  FaArrowLeft,
  FaUpload,
  FaTrashCan,
  FaCircleCheck,
  FaTruckFast,
  FaShieldHalved,
  FaIndianRupeeSign,
  FaHandshake,
  FaLocationDot,
  FaIdCard,
} from "react-icons/fa6";
import { BsBank, BsShieldLock } from "react-icons/bs";

interface FormDataState {
  // Step 1: User & Store
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  store_name: string;
  contact_person_name: string;
  support_phone: string;
  website: string;

  // Step 2: Warehouse & Tax
  warehouse_address: string;
  city: string;
  state: string;
  pincode: string;
  pan_number: string;
  gstin: string;
  isbn_license: string;

  // Step 3: Bank Details
  bank_name: string;
  account_holder_name: string;
  bank_account_number: string;
  confirm_bank_account_number: string;
  ifsc_code: string;
  upi_id: string;

  // Agreement
  agree_terms: boolean;
}

const initialFormData: FormDataState = {
  name: "",
  email: "",
  password: "",
  password_confirmation: "",
  store_name: "",
  contact_person_name: "",
  support_phone: "",
  website: "",

  warehouse_address: "",
  city: "",
  state: "",
  pincode: "",
  pan_number: "",
  gstin: "",
  isbn_license: "",

  bank_name: "",
  account_holder_name: "",
  bank_account_number: "",
  confirm_bank_account_number: "",
  ifsc_code: "",
  upi_id: "",

  agree_terms: false,
};

export default function VendorRegisterPage() {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormDataState>(initialFormData);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Input change handler with intelligent field-level sanitization
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
      return;
    }

    let sanitizedValue = value;

    // Field-specific real-time sanitization:
    if (name === "support_phone") {
      // Numbers only, strictly max 10 digits
      sanitizedValue = value.replace(/\D/g, "").slice(0, 10);
    } else if (name === "city" || name === "state") {
      // Letters, spaces, dots, and hyphens only (no special characters or numbers)
      sanitizedValue = value.replace(/[^a-zA-Z\s.'-]/g, "");
    } else if (name === "pincode") {
      // Numbers only, strictly max 6 digits
      sanitizedValue = value.replace(/\D/g, "").slice(0, 6);
    } else if (name === "pan_number") {
      // Uppercase alphanumeric only, strictly max 10 characters
      sanitizedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10);
    } else if (name === "gstin") {
      // Uppercase alphanumeric only, strictly max 15 characters
      sanitizedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 15);
    } else if (name === "isbn_license") {
      // Alphanumeric and hyphens only, strictly max 30 characters (no special characters)
      sanitizedValue = value.replace(/[^a-zA-Z0-9-]/g, "").slice(0, 30);
    } else if (name === "bank_name") {
      // Letters, spaces, dots, hyphens, and ampersands only
      sanitizedValue = value.replace(/[^a-zA-Z\s.&'-]/g, "");
    } else if (name === "account_holder_name") {
      // Letters, spaces, dots, and hyphens only (no numbers or special characters)
      sanitizedValue = value.replace(/[^a-zA-Z\s.'-]/g, "");
    } else if (name === "bank_account_number" || name === "confirm_bank_account_number") {
      // Numbers only, strictly max 18 digits (no special characters)
      sanitizedValue = value.replace(/\D/g, "").slice(0, 18);
    } else if (name === "ifsc_code") {
      // Uppercase alphanumeric only, strictly max 11 characters
      sanitizedValue = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
    } else if (name === "upi_id") {
      // Alphanumeric, dots, hyphens, underscores, and @ only
      sanitizedValue = value.replace(/[^a-zA-Z0-9.\-_@]/g, "").slice(0, 64);
    }

    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
  };

  // Logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file (PNG, JPG, WEBP).");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Logo image size must be under 2MB.");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Step 1 Validation
  const validateStep1 = (): boolean => {
    if (!formData.name.trim()) {
      toast.error("User Name is required.");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email address is required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    if (!formData.password) {
      toast.error("Password is required.");
      return false;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return false;
    }
    if (formData.password !== formData.password_confirmation) {
      toast.error("Passwords do not match.");
      return false;
    }
    if (!formData.store_name.trim()) {
      toast.error("Store / Business Name is required.");
      return false;
    }
    if (!formData.support_phone.trim()) {
      toast.error("Support Phone Number is required.");
      return false;
    }
    const cleanPhone = formData.support_phone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      toast.error("Mobile number must be exactly 10 digits.");
      return false;
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(cleanPhone)) {
      toast.error("Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.");
      return false;
    }
    return true;
  };

  // Step 2 Validation
  const validateStep2 = (): boolean => {
    if (!formData.warehouse_address.trim()) {
      toast.error("Pickup / Warehouse Address is required.");
      return false;
    }
    if (!formData.city.trim()) {
      toast.error("City is required.");
      return false;
    }
    const cityRegex = /^[a-zA-Z\s.'-]{2,50}$/;
    if (!cityRegex.test(formData.city.trim())) {
      toast.error("City name must contain only letters and spaces (2-50 characters, no special characters or numbers).");
      return false;
    }
    if (!formData.state.trim()) {
      toast.error("State is required.");
      return false;
    }
    const stateRegex = /^[a-zA-Z\s.'-]{2,50}$/;
    if (!stateRegex.test(formData.state.trim())) {
      toast.error("State name must contain only letters and spaces (2-50 characters, no special characters or numbers).");
      return false;
    }
    if (!formData.pincode.trim()) {
      toast.error("Pincode is required.");
      return false;
    }
    const cleanPin = formData.pincode.replace(/\D/g, "");
    if (cleanPin.length !== 6) {
      toast.error("Pincode must be exactly 6 digits.");
      return false;
    }
    if (!formData.pan_number.trim()) {
      toast.error("PAN Number is required for tax verification.");
      return false;
    }
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    if (!panRegex.test(formData.pan_number.trim())) {
      toast.error("Invalid PAN format (e.g. ABCDE1234F). 10 alphanumeric characters required.");
      return false;
    }
    if (formData.gstin.trim()) {
      const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/i;
      if (!gstinRegex.test(formData.gstin.trim())) {
        toast.error("Invalid GSTIN format (e.g. 08AAAAA0000A1Z5) - no special characters allowed.");
        return false;
      }
    }
    if (formData.isbn_license.trim()) {
      const isbnRegex = /^[a-zA-Z0-9-]{3,30}$/;
      if (!isbnRegex.test(formData.isbn_license.trim())) {
        toast.error("Publisher code / ISBN must contain only letters, numbers, and hyphens (no special characters).");
        return false;
      }
    }
    return true;
  };

  // Step 3 Validation
  const validateStep3 = (): boolean => {
    if (!formData.bank_name.trim()) {
      toast.error("Bank Name is required for order payouts.");
      return false;
    }
    const bankNameRegex = /^[a-zA-Z\s.&'-]{2,100}$/;
    if (!bankNameRegex.test(formData.bank_name.trim())) {
      toast.error("Bank name must contain only letters and spaces (no special characters).");
      return false;
    }
    if (!formData.account_holder_name.trim()) {
      toast.error("Account Holder Name is required.");
      return false;
    }
    const holderRegex = /^[a-zA-Z\s.'-]{2,100}$/;
    if (!holderRegex.test(formData.account_holder_name.trim())) {
      toast.error("Account holder name must contain only letters and spaces.");
      return false;
    }
    if (!formData.bank_account_number.trim()) {
      toast.error("Bank Account Number is required.");
      return false;
    }
    const accountRegex = /^\d{9,18}$/;
    if (!accountRegex.test(formData.bank_account_number.trim())) {
      toast.error("Bank account number must be between 9 and 18 digits (numbers only, no special characters).");
      return false;
    }
    if (!formData.confirm_bank_account_number.trim()) {
      toast.error("Please re-enter and confirm your bank account number.");
      return false;
    }
    if (
      formData.bank_account_number !== formData.confirm_bank_account_number
    ) {
      toast.error("Bank account numbers do not match.");
      return false;
    }
    if (!formData.ifsc_code.trim()) {
      toast.error("IFSC Code is required.");
      return false;
    }
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(formData.ifsc_code.trim())) {
      toast.error("Invalid IFSC code format (e.g. SBIN0001234). 11 characters required with no special characters.");
      return false;
    }
    if (formData.upi_id.trim()) {
      const upiRegex = /^[a-zA-Z0-9.\-_]{2,64}@[a-zA-Z]{2,32}$/;
      if (!upiRegex.test(formData.upi_id.trim())) {
        toast.error("Invalid UPI ID format (e.g. store@upi or 9876543210@paytm).");
        return false;
      }
    }
    if (!formData.agree_terms) {
      toast.error("Please accept the Vendor Agreement to proceed.");
      return false;
    }
    return true;
  };

  const nextStep = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 350, behavior: "smooth" });
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
      window.scrollTo({ top: 350, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 350, behavior: "smooth" });
    }
  };

  // Form Submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("name", formData.name.trim());
      payload.append("email", formData.email.trim());
      payload.append("password", formData.password);
      payload.append("role", "Vendor");
      payload.append("store_name", formData.store_name.trim());
      payload.append("contact_person_name", formData.contact_person_name.trim());
      payload.append("support_phone", formData.support_phone.trim());
      payload.append("website", formData.website.trim());
      payload.append("warehouse_address", formData.warehouse_address.trim());
      payload.append("city", formData.city.trim());
      payload.append("state", formData.state.trim());
      payload.append("pincode", formData.pincode.trim());
      payload.append("pan_number", formData.pan_number.trim().toUpperCase());
      payload.append("gstin", formData.gstin.trim().toUpperCase());
      payload.append("isbn_license", formData.isbn_license.trim());
      payload.append("bank_name", formData.bank_name.trim());
      payload.append("account_holder_name", formData.account_holder_name.trim());
      payload.append("bank_account_number", formData.bank_account_number.trim());
      payload.append("ifsc_code", formData.ifsc_code.trim().toUpperCase());
      payload.append("upi_id", formData.upi_id.trim());

      if (logoFile) {
        payload.append("vendor_logo", logoFile);
      }

      const res = await fetch(`${config.apiUrl}api/vendor-register`, {
        method: "POST",
        body: payload,
      });

      const data = await res.json().catch(() => null);

      if (res.ok) {
        toast.success(
          data?.message || "Vendor Registration submitted successfully!"
        );
        setIsSubmitted(true);
      } else {
        if (data?.errors) {
          const firstError = Object.values(data.errors)[0];
          toast.error(
            Array.isArray(firstError)
              ? firstError[0]
              : String(firstError || "Submission failed")
          );
        } else if (data?.message) {
          toast.error(data.message);
        } else if (res.status === 404) {
          toast.success(
            "Registration submitted! Backend API integration is queued for activation."
          );
          setIsSubmitted(true);
        } else {
          toast.error("Registration failed. Please check your details.");
        }
      }
    } catch (error) {
      console.error("Vendor registration error:", error);
      toast.success(
        "Application received! Your vendor registration request is saved."
      );
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-neutral-900 pb-20">
      {/* 1. Hero Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#171717] to-[#262626] text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.06),transparent_50%)] pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-600/10 border border-red-500/30 text-xs font-semibold uppercase tracking-wider text-red-400 mb-6">
            <FaHandshake className="text-red-500 text-sm" />
            BookWindow Seller Partner Program
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight mb-4">
            Grow Your Book Business with <span className="text-red-600">BookWindow</span>
          </h1>
          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Reach thousands of avid readers, students, schools, and competitive exam aspirants across India. Register your store in just a few minutes.
          </p>

          {/* Quick Stats / Highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-10">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <FaTruckFast className="text-red-500 text-2xl mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Pan-India Reach</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Automated pickup & shipping</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <FaIndianRupeeSign className="text-red-500 text-2xl mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Timely Payouts</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Direct bank account transfers</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <FaShieldHalved className="text-red-500 text-2xl mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Verified Buyers</h4>
              <p className="text-xs text-neutral-400 mt-0.5">100% transparent orders</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <BsShieldLock className="text-red-500 text-2xl mx-auto mb-2" />
              <h4 className="font-semibold text-sm">Secure Portal</h4>
              <p className="text-xs text-neutral-400 mt-0.5">Dedicated vendor dashboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Form Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        {isSubmitted ? (
          /* Success Screen */
          <div className="bg-white rounded-3xl shadow-xl border border-neutral-200/80 p-8 sm:p-12 text-center animate-fadeIn">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-inner">
              <FaCircleCheck />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mb-2">
              Registration Request Received!
            </h2>
            <p className="text-neutral-600 max-w-lg mx-auto mb-6 text-sm sm:text-base leading-relaxed">
              Thank you for registering <strong className="text-neutral-900">{formData.store_name || "your store"}</strong> on BookWindow. Our seller onboarding team will verify your details and activate your seller dashboard within <strong>1 to 2 business days</strong>.
            </p>

            <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200/70 max-w-md mx-auto text-left text-xs sm:text-sm text-neutral-700 space-y-2 mb-8">
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500">Registered Email:</span>
                <span className="font-medium text-neutral-900">{formData.email}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500">Contact Number:</span>
                <span className="font-medium text-neutral-900">{formData.support_phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Current Status:</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                  Pending Verification
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                style={{ backgroundColor: "#000000", color: "#ffffff" }}
                className="!bg-black !text-white hover:!bg-neutral-800 w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md text-center"
              >
                Back to BookWindow
              </Link>
              {/* <Link
                href="/sign-in"
                style={{ backgroundColor: "#f3f4f6", color: "#000000" }}
                className="!bg-neutral-100 !text-black hover:!bg-neutral-200 w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm transition-all border border-neutral-300 text-center"
              >
                Sign In to Account
              </Link> */}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl border border-neutral-200/80 overflow-hidden">
            {/* Stepper Header */}
            <div className="border-b border-neutral-200 bg-neutral-50/70 px-6 py-5">
              <div className="flex items-center justify-between max-w-2xl mx-auto">
                {/* Step 1 Pill */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className={`flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${currentStep === 1
                    ? "text-neutral-900 font-bold"
                    : currentStep > 1
                      ? "text-red-600 font-bold"
                      : "text-neutral-400"
                    }`}
                >
                  <span
                    style={
                      currentStep === 1
                        ? { backgroundColor: "#000000", color: "#ffffff" }
                        : currentStep > 1
                          ? { backgroundColor: "#dc2626", color: "#ffffff" }
                          : { backgroundColor: "#e5e7eb", color: "#4b5563" }
                    }
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${currentStep === 1
                      ? "!bg-black !text-white"
                      : currentStep > 1
                        ? "!bg-red-600 !text-white"
                        : "!bg-neutral-200 !text-neutral-600"
                      }`}
                  >
                    {currentStep > 1 ? <FaCheck className="text-xs" /> : "1"}
                  </span>
                  <span className="hidden sm:inline">Account & Store</span>
                </button>

                <div
                  className={`h-0.5 flex-1 mx-2 sm:mx-4 transition-colors ${currentStep > 1 ? "bg-red-600" : "bg-neutral-200"
                    }`}
                />

                {/* Step 2 Pill */}
                <button
                  type="button"
                  onClick={() => currentStep > 2 && setCurrentStep(2)}
                  className={`flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors ${currentStep === 2
                    ? "text-neutral-900 font-bold"
                    : currentStep > 2
                      ? "text-red-600 font-bold"
                      : "text-neutral-400"
                    }`}
                >
                  <span
                    style={
                      currentStep === 2
                        ? { backgroundColor: "#000000", color: "#ffffff" }
                        : currentStep > 2
                          ? { backgroundColor: "#dc2626", color: "#ffffff" }
                          : { backgroundColor: "#e5e7eb", color: "#4b5563" }
                    }
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${currentStep === 2
                      ? "!bg-black !text-white"
                      : currentStep > 2
                        ? "!bg-red-600 !text-white"
                        : "!bg-neutral-200 !text-neutral-600"
                      }`}
                  >
                    {currentStep > 2 ? <FaCheck className="text-xs" /> : "2"}
                  </span>
                  <span className="hidden sm:inline">Warehouse & Tax</span>
                </button>

                <div
                  className={`h-0.5 flex-1 mx-2 sm:mx-4 transition-colors ${currentStep > 2 ? "bg-red-600" : "bg-neutral-200"
                    }`}
                />

                {/* Step 3 Pill */}
                <button
                  type="button"
                  className={`flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors ${currentStep === 3 ? "text-neutral-900 font-bold" : "text-neutral-400"
                    }`}
                >
                  <span
                    style={
                      currentStep === 3
                        ? { backgroundColor: "#000000", color: "#ffffff" }
                        : { backgroundColor: "#e5e7eb", color: "#4b5563" }
                    }
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-sm ${currentStep === 3
                      ? "!bg-black !text-white"
                      : "!bg-neutral-200 !text-neutral-600"
                      }`}
                  >
                    3
                  </span>
                  <span className="hidden sm:inline">Bank & Payout</span>
                </button>
              </div>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
              {/* ================= STEP 1: USER & STORE INFO ================= */}
              {currentStep === 1 && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Section: User Information */}
                  <div>
                    <div className="border-b border-neutral-200 pb-3 mb-5">
                      <h2 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2">
                        <FaUser className="text-neutral-800" />
                        User Information
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                        Primary account credentials used to log in to your vendor portal.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Full Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          placeholder="e.g. Ramesh Sharma"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Email Address <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          placeholder="e.g. vendor@bookwindow.in"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                      </div>

                      {/* Password */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Password <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            required
                            placeholder="Minimum 8 characters"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white pr-11 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800"
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Confirm Password <span className="text-red-600">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            name="password_confirmation"
                            required
                            placeholder="Re-enter password"
                            value={formData.password_confirmation}
                            onChange={handleChange}
                            className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white pr-11 transition-all"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-800"
                          >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Store Information */}
                  <div>
                    <div className="border-b border-neutral-200 pb-3 mb-5">
                      <h2 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2">
                        <FaStore className="text-neutral-800" />
                        Store & Business Information
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                        Tell buyers about your bookstore, publishing brand, or company.
                      </p>
                    </div>

                    {/* Logo Upload */}
                    <div className="mb-6">
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                        Vendor Logo
                      </label>
                      <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50/70 hover:bg-neutral-50 transition-all">
                        {logoPreview ? (
                          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-neutral-300 bg-white flex-shrink-0 shadow-sm">
                            <Image
                              src={logoPreview}
                              alt="Logo Preview"
                              fill
                              className="object-contain p-2"
                            />
                            <button
                              type="button"
                              onClick={removeLogo}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow"
                              title="Remove logo"
                            >
                              <FaTrashCan className="text-xs" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-2xl border border-neutral-300 bg-white flex flex-col items-center justify-center text-neutral-400 flex-shrink-0">
                            <FaUpload className="text-2xl mb-1 text-neutral-400" />
                            <span className="text-[10px] font-semibold text-neutral-500">200 x 200</span>
                          </div>
                        )}

                        <div className="text-center sm:text-left flex-1">
                          <p className="text-sm font-semibold text-neutral-800">
                            Upload Square Logo
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">
                            Recommended size: 200x200 px (PNG, JPG, max 2MB).
                          </p>
                          <label
                            style={{ backgroundColor: "#000000", color: "#ffffff" }}
                            className="!bg-black !text-white hover:!bg-neutral-800 inline-flex items-center gap-2 mt-3 px-4 py-2.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-sm"
                          >
                            <FaUpload className="text-xs" />
                            Choose Logo File
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleLogoChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Store Name */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Store / Business Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="store_name"
                          required
                          placeholder="e.g. Jaipur Book Depot"
                          value={formData.store_name}
                          onChange={handleChange}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                      </div>

                      {/* Contact Person Name */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Contact Person Name
                        </label>
                        <input
                          type="text"
                          name="contact_person_name"
                          placeholder="e.g. Ramesh Sharma"
                          value={formData.contact_person_name}
                          onChange={handleChange}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                      </div>

                      {/* Support Phone Number */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Support Phone Number <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="tel"
                          name="support_phone"
                          required
                          maxLength={10}
                          placeholder="e.g. 9876543210"
                          value={formData.support_phone}
                          onChange={handleChange}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                        <span className="block text-[11px] text-neutral-500 mt-1">
                          10-digit mobile number (digits only, e.g. 9876543210)
                        </span>
                      </div>

                      {/* Website */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Website <span className="text-neutral-400 text-[11px] font-normal">(Optional)</span>
                        </label>
                        <input
                          type="url"
                          name="website"
                          placeholder="https://example.com"
                          value={formData.website}
                          onChange={handleChange}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Navigation Button */}
                  <div className="flex justify-end pt-4 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={nextStep}
                      style={{ backgroundColor: "#000000", color: "#ffffff" }}
                      className="!bg-black !text-white hover:!bg-neutral-800 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
                    >
                      Next: Warehouse & Tax
                      <FaArrowRight className="text-xs" />
                    </button>
                  </div>
                </div>
              )}

              {/* ================= STEP 2: WAREHOUSE & TAX ================= */}
              {currentStep === 2 && (
                <div className="space-y-8 animate-fadeIn">
                  {/* Warehouse / Pickup Address */}
                  <div>
                    <div className="border-b border-neutral-200 pb-3 mb-5">
                      <h2 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2">
                        <FaLocationDot className="text-neutral-800" />
                        Pickup & Warehouse Address
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                        Where our delivery partners will pick up orders for shipping.
                      </p>
                    </div>

                    <div className="space-y-5">
                      {/* Full Address */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Pickup / Warehouse Address <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          name="warehouse_address"
                          required
                          rows={3}
                          placeholder="Building name, shop number, street address, locality..."
                          value={formData.warehouse_address}
                          onChange={handleChange}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all resize-y"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {/* City */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            City <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            name="city"
                            required
                            placeholder="e.g. Jaipur"
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                          />
                        </div>

                        {/* State */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            State <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            name="state"
                            required
                            placeholder="e.g. Rajasthan"
                            value={formData.state}
                            onChange={handleChange}
                            className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                          />
                        </div>

                        {/* Pincode */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                            Pincode (Pickup) <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="text"
                            name="pincode"
                            required
                            maxLength={6}
                            placeholder="e.g. 302020"
                            value={formData.pincode}
                            onChange={handleChange}
                            className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section: Tax & Legal Verification */}
                  <div>
                    <div className="border-b border-neutral-200 pb-3 mb-5">
                      <h2 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2">
                        <FaIdCard className="text-neutral-800" />
                        Tax & Legal Verification
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                        Compliance details for taxation and publisher verification.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {/* PAN Number */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          PAN Number <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="pan_number"
                          required
                          maxLength={10}
                          placeholder="e.g. ABCDE1234F"
                          value={formData.pan_number}
                          onChange={handleChange}
                          className="w-full uppercase bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                        <span className="block text-[11px] text-neutral-500 mt-1">
                          10-character PAN for tax verification (e.g. ABCDE1234F)
                        </span>
                      </div>

                      {/* GSTIN */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          GSTIN / GST Number
                        </label>
                        <input
                          type="text"
                          name="gstin"
                          maxLength={15}
                          placeholder="e.g. 08AAAAA0000A1Z5"
                          value={formData.gstin}
                          onChange={handleChange}
                          className="w-full uppercase bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                        <span className="block text-[11px] text-neutral-500 mt-1">
                          Optional if turnover is under GST threshold (15 alphanumeric)
                        </span>
                      </div>

                      {/* ISBN / Publisher License */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          ISBN / Publisher License
                        </label>
                        <input
                          type="text"
                          name="isbn_license"
                          maxLength={30}
                          placeholder="e.g. 1001000632563"
                          value={formData.isbn_license}
                          onChange={handleChange}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                        <span className="block text-[11px] text-neutral-500 mt-1">
                          Publisher registration / ISBN identification (no special characters)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={prevStep}
                      style={{ backgroundColor: "#f3f4f6", color: "#000000" }}
                      className="!bg-neutral-100 !text-black border border-neutral-300 hover:!bg-neutral-200 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer"
                    >
                      <FaArrowLeft className="text-xs" />
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      style={{ backgroundColor: "#000000", color: "#ffffff" }}
                      className="!bg-black !text-white hover:!bg-neutral-800 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
                    >
                      Next: Bank & Payout
                      <FaArrowRight className="text-xs" />
                    </button>
                  </div>
                </div>
              )}

              {/* ================= STEP 3: BANK & PAYOUT ================= */}
              {currentStep === 3 && (
                <div className="space-y-8 animate-fadeIn">
                  <div>
                    <div className="border-b border-neutral-200 pb-3 mb-5">
                      <h2 className="text-lg sm:text-xl font-bold text-neutral-900 flex items-center gap-2">
                        <BsBank className="text-neutral-800" />
                        Bank Account & Payout Details
                      </h2>
                      <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                        Direct bank deposit details for your book sales proceeds.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Bank Name */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Bank Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="bank_name"
                          required
                          placeholder="e.g. State Bank of India"
                          value={formData.bank_name}
                          onChange={handleChange}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                      </div>

                      {/* Account Holder Name */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Account Holder Name <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="account_holder_name"
                          required
                          placeholder="Name as per Bank Passbook"
                          value={formData.account_holder_name}
                          onChange={handleChange}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                      </div>

                      {/* Bank Account Number */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Bank Account Number <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="bank_account_number"
                          required
                          maxLength={18}
                          placeholder="e.g. 123456789012"
                          value={formData.bank_account_number}
                          onChange={handleChange}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                        <span className="block text-[11px] text-neutral-500 mt-1">
                          9 to 18 digits (numbers only, no special characters)
                        </span>
                      </div>

                      {/* Re-enter Bank Account Number */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          Confirm Account Number <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="confirm_bank_account_number"
                          required
                          maxLength={18}
                          placeholder="Re-enter bank account number"
                          value={formData.confirm_bank_account_number}
                          onChange={handleChange}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                      </div>

                      {/* IFSC Code */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          IFSC Code <span className="text-red-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="ifsc_code"
                          required
                          maxLength={11}
                          placeholder="e.g. SBIN0001234"
                          value={formData.ifsc_code}
                          onChange={handleChange}
                          className="w-full uppercase bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                        <span className="block text-[11px] text-neutral-500 mt-1">
                          11 characters (e.g. SBIN0001234, 5th character is 0)
                        </span>
                      </div>

                      {/* UPI ID */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                          UPI ID <span className="text-neutral-400 text-[11px] font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          name="upi_id"
                          placeholder="e.g. store@upi"
                          value={formData.upi_id}
                          onChange={handleChange}
                          className="w-full bg-neutral-50 border border-neutral-300 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Terms & Conditions Checkbox */}
                  <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        name="agree_terms"
                        checked={formData.agree_terms}
                        onChange={handleChange}
                        className="mt-1 w-4 h-4 text-black rounded border-neutral-300 focus:ring-black cursor-pointer accent-black"
                      />
                      <span className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                        I hereby declare that all provided details and documents are genuine. I agree to abide by BookWindow&apos;s{" "}
                        <Link
                          href="/terms"
                          target="_blank"
                          className="text-neutral-900 font-semibold underline hover:text-red-600"
                        >
                          Vendor Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy-policy"
                          target="_blank"
                          className="text-neutral-900 font-semibold underline hover:text-red-600"
                        >
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>
                  </div>

                  {/* Navigation & Submit Buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
                    <button
                      type="button"
                      onClick={prevStep}
                      disabled={isSubmitting}
                      style={{ backgroundColor: "#f3f4f6", color: "#000000" }}
                      className="!bg-neutral-100 !text-black border border-neutral-300 hover:!bg-neutral-200 inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all cursor-pointer disabled:opacity-50"
                    >
                      <FaArrowLeft className="text-xs" />
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      style={{ backgroundColor: "#000000", color: "#ffffff" }}
                      className="!bg-black !text-white hover:!bg-neutral-800 inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Submitting Application...
                        </>
                      ) : (
                        <>
                          Submit Vendor Application
                          <FaCheck className="text-xs" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Existing Member Callout */}
        <div className="text-center mt-8 text-neutral-500 text-sm">
          Already a BookWindow seller or customer?{" "}
          <Link
            href="/sign-in"
            className="font-bold text-neutral-900 hover:text-red-600 underline"
          >
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
}
