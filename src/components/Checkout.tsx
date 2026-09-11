"use client";

import { FormEvent, useEffect, useState } from "react";
import config from "@/app/config";
import axios from "axios";
import React from "react";
import { useAppSelector } from "@/hooks/useStore";
import { useDispatch } from "react-redux";
import { login } from "@/lib/slices/authSlice";
import toast from "react-hot-toast";
import { FaUser, FaPhoneAlt, FaCity, FaSpinner, FaCheckCircle } from "react-icons/fa";
import { FaGlobe } from "react-icons/fa6";
import { MdLocationPin } from "react-icons/md";
import { IoMail } from "react-icons/io5";
import { IoMdLock, IoIosArrowBack } from "react-icons/io";
import { fetchPincodeDetails, matchState, matchCity } from "@/lib/pincode";
import {
  normalizeIndianPhoneNumber,
  isValidIndianMobile,
  getIndianMobileValidationError,
  isValidIndianPinCode,
} from "@/helper/helperfun";

type CheckoutProps = {
  onBack: () => void;
  onNext: (data: any) => void; // <-- accept data here
  formData: any;
  setLoginUpdated: React.Dispatch<React.SetStateAction<number>>;
  shippingData?: any;
};

export default function Checkout({
  onNext,
  onBack,
  formData,
  setLoginUpdated,
  shippingData,
}: CheckoutProps) {

  const initialFormValues = {
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    address_2: "",
    state: "",
    city: "",
    zip_code: "",
    country: "India",
  };



  const [isEdit, setIsEdit] = useState<boolean>(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userFound, setUserFound] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isBuffering, setIsBuffering] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const [selectedState, setSelectedState] = useState<string>("");
  const [states, setStates] = useState([] as any);
  const [statesFeteched, setStatesFatched] = useState(false);
  const [filteredCities, setFilteredCities] = useState([]);

  const [formValues, setFormValues] = useState(formData?.first_name ? formData : initialFormValues);

  const [isPincodeLoading, setIsPincodeLoading] = useState<boolean>(false);
  const [pincodeStatus, setPincodeStatus] = useState<{
    type: "success" | "error" | "info" | null;
    message: string;
  }>({ type: null, message: "" });

  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();


  useEffect(() => {
    if (formData?.first_name) {
      setFormValues(formData);
      if (formData?.state) {
        setSelectedState(formData.state);
      }
    }
  }, [formData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormValues((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setSelectedState(value);
    setFormValues((prev: any) => ({ ...prev, state: value, city: "" }));
    setPincodeStatus({ type: null, message: "" });
  };

  const lookupAndFillPincode = async (pin: string) => {
    setIsPincodeLoading(true);
    setPincodeStatus({ type: "info", message: "Fetching location details..." });

    try {
      const data = await fetchPincodeDetails(pin);
      if (data.success && data.state) {
        const matchedState = matchState(data.state, states);
        const stateName = matchedState ? matchedState.name : data.state;
        const stateCities = matchedState?.cities || [];
        const { cityName } = matchCity(data.district || "", data.cities || [], stateCities, data.block || "");

        setSelectedState(stateName);
        setFormValues((prev: any) => ({
          ...prev,
          zip_code: pin,
          state: stateName,
          city: cityName || prev.city || "",
        }));

        setPincodeStatus({
          type: "success",
          message: cityName
            ? `Auto-filled: ${cityName}, ${stateName}`
            : `Auto-filled: ${stateName}`,
        });
      } else {
        setPincodeStatus({
          type: "error",
          message: data.message || "Location not found for this PIN code. Please select manually.",
        });
      }
    } catch {
      setPincodeStatus({
        type: "error",
        message: "Could not auto-fill location. Please select State and City manually.",
      });
    } finally {
      setIsPincodeLoading(false);
    }
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanPin = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormValues((prev: any) => ({ ...prev, zip_code: cleanPin }));

    if (cleanPin.length === 6) {
      lookupAndFillPincode(cleanPin);
    } else {
      setPincodeStatus({ type: null, message: "" });
    }
  };

  useEffect(() => {
    const fetchStatesAndCities = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/state-of-india`,
          responseType: "json",
        });
        setStates(response?.data);
        setStatesFatched(true);
      } catch (error) {
        // error handling
      }
    };
    fetchStatesAndCities();
  }, []);

  useEffect(() => {
    let allCities = [];
    if (selectedState) {
      const selectedStateValue = states.find(
        (pub: any) => pub.name === selectedState
      );
      allCities = selectedStateValue?.cities || [];
    }
    setFilteredCities(allCities);
  }, [selectedState, states]);



  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormValues((prev: any) => ({
      ...prev,
      email: value,
    }));
    setEmail(value);
    setUserFound(null);
    setErrorMessage("");

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value || !emailRegex.test(value.trim())) {
      setIsBuffering(false);
      return;
    }

    setIsBuffering(true);
    const timeout = setTimeout(() => {
      checkUser(value.trim());
    }, 500);

    setDebounceTimeout(timeout);
  };

  const checkUser = async (emailToCheck: string) => {
    if (!emailToCheck) {
      setIsBuffering(false);
      return;
    }
    try {
      const response = await axios.post(`${config.apiUrl}api/v1/checkuser`, {
        email: emailToCheck,
      });

      if (response?.data?.success) {
        setUserFound(true);
        setErrorMessage("");
      } else {
        setUserFound(false);
        setErrorMessage("This email is not registered with us.");
      }
    } catch {
      setUserFound(false);
      setErrorMessage("This email is not registered with us.");
    } finally {
      setIsBuffering(false);
    }
  };

  async function handleLogin(event?: FormEvent<HTMLFormElement> | any) {
    if (event?.preventDefault) event.preventDefault();
    if (!password) {
      toast.error("Please enter your password to login");
      return;
    }
    try {
      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email || formValues.email, password: password }),
      });
      if (response.ok) {
        const data = await response.json();
        setUserFound(false);
        setPassword("");
        dispatch(
          login({
            user: data,
          })
        );
        setLoginUpdated((prev) => prev + 1);
        toast.success("Logged in successfully!");
      } else {
        const data = await response.json();
        console.error("Login failed", response.status);
        toast.error(data?.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Something went wrong during login");
    }
  }

  useEffect(() => {
    const source = shippingData && shippingData;
    if (!source) return;

    if (source.state) {
      setSelectedState(source.state);
    }

    setFormValues((prev: any) => {
      const alreadyFilled = Object.keys(prev).some((key) => prev[key]);
      if (alreadyFilled) return prev;
      return {
        ...prev,
        first_name: source.first_name || "",
        last_name: source.last_name || "",
        phone: source.phone || "",
        address: source.address || "",
        address_2: source.address_2 || "",
        zip_code: source.zip_code || "",
        state: source.state || "",
        city: source.city || "",
        country: "India",
      };
    });
  }, [shippingData]);

  const handleNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const requiredFields = [
      "first_name",
      "last_name",
      "phone",
      "address",
      "zip_code",
      "state",
      "city",

    ];

    for (const field of requiredFields) {
      const value =
        formValues[field as keyof typeof formValues]
      if (!value?.toString().trim()) {
        toast.error(`${field.replace(/_/g, " ")} is required`);
        return;
      }
    }

    // Validate Indian mobile number (must be 10 digits starting with 6, 7, 8, or 9)
    const phoneError = getIndianMobileValidationError(formValues.phone);
    if (phoneError) {
      toast.error(phoneError);
      if (!isEdit && isAuthenticated && shippingData) {
        setIsEdit(true);
      }
      return;
    }

    // Validate 6-digit Indian PIN code
    const cleanZip = (formValues.zip_code || "").toString().replace(/\D/g, "");
    if (!isValidIndianPinCode(cleanZip)) {
      toast.error("Please enter a valid 6-digit Indian PIN code.");
      if (!isEdit && isAuthenticated && shippingData) {
        setIsEdit(true);
      }
      return;
    }

    const normalizedPhone = normalizeIndianPhoneNumber(formValues.phone);

    const source =
      formValues && formValues;

    const data = {
      ...source,
      phone: normalizedPhone,
      zip_code: cleanZip,
      email: email || formValues?.email || "",
      password: password || "",
      is_guest: !password,
      country: "India",
    };

    onNext(data);
  };


  return (
    <>
      <form
        className="w-full"
        onSubmit={handleNext}
      >
        <div className="bg-white p-5 sm:p-7 md:p-8 rounded-2xl border border-neutral-200/80 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onBack}
                className="p-2 hover:bg-neutral-100 rounded-xl transition-colors text-neutral-500 hover:text-black cursor-pointer flex items-center gap-1 text-sm font-semibold"
                title="Back to Cart"
              >
                <IoIosArrowBack className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">
                  Shipping Address
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Where should we deliver your books?
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-3 py-1 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold rounded-full">
              Step 2 of 3
            </span>
          </div>

          {(!isEdit && isAuthenticated) && shippingData ? (
            <div className="p-5 sm:p-6 border border-neutral-200 bg-neutral-50/50 rounded-2xl space-y-2">
              <div className="flex items-center justify-between border-b border-neutral-200/60 pb-3">
                <span className="text-sm font-bold text-neutral-900">Saved Address</span>
                <button
                  type="button"
                  onClick={() => setIsEdit(true)}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer flex items-center gap-1"
                >
                  Edit Address
                </button>
              </div>

              <div className="pt-1 text-sm text-neutral-700 space-y-1">
                <p className="font-bold text-base text-neutral-900">
                  {shippingData?.first_name || " "}{" "}
                  {shippingData?.last_name || " "}
                </p>
                <p>{shippingData?.address || " "}</p>
                {shippingData?.address_2 && <p>{shippingData?.address_2 || ""}</p>}
                <p>
                  {shippingData?.city || ""},{" "}
                  {shippingData?.state || ""} - {shippingData?.zip_code || ""}
                </p>
                <p className="font-semibold text-neutral-900 pt-1">
                  Mobile: +91 {shippingData?.phone || ""}
                </p>
                {!isValidIndianMobile(shippingData?.phone) && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-700 text-xs font-medium">
                    <span>⚠️ Saved mobile number is invalid.</span>
                    <button
                      type="button"
                      onClick={() => setIsEdit(true)}
                      className="font-bold underline text-red-700 hover:text-red-900 ml-2 cursor-pointer flex-shrink-0"
                    >
                      Update Address
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Account / Login Prompt for Guests */}
              {!isAuthenticated && (
                <>
                  {/* <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200/80 flex items-center justify-between text-sm mb-1">
                    <span className="text-neutral-700 font-medium">Have a Bookwindow account?</span>
                    <a
                      href="/login?redirect=/checkout"
                      className="text-red-600 font-semibold hover:underline flex items-center gap-1 shrink-0"
                    >
                      <span>Log In</span>
                      <span>&rarr;</span>
                    </a>
                  </div> */}

                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-neutral-700">
                      Email address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-red-600 transition-colors">
                        <IoMail size={18} />
                      </div>
                      <input
                        type="email"
                        placeholder="name@mail.com"
                        className="w-full pl-10 pr-4 py-3 text-sm text-neutral-900 bg-white hover:border-neutral-400 focus:border-red-600 border border-neutral-300 rounded-xl outline-none focus:ring-1 focus:ring-red-600 transition-colors placeholder:text-neutral-400 font-normal"
                        required
                        value={email || formValues.email}
                        onChange={handleEmailChange}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Buffering Spinner */}
              {isBuffering && (
                <p className="text-neutral-500 text-xs font-semibold mb-2 flex items-center gap-1.5">
                  <FaSpinner className="animate-spin text-red-600 w-3 h-3" />
                  <span>Checking account...</span>
                </p>
              )}

              {/* Error Message & Guest Mode */}
              {userFound === false && !isBuffering && errorMessage && (
                <div className="space-y-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                  <p className="text-neutral-600 text-xs font-semibold">{errorMessage}</p>
                  <button
                    type="button"
                    onClick={() => setErrorMessage("")}
                    className="bg-black hover:bg-gray-900 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Continue as guest
                  </button>
                </div>
              )}

              {/* Password Input / Login */}
              {userFound === true && !isBuffering && (
                <div className="space-y-3 bg-red-50/30 p-5 rounded-2xl border border-red-200">
                  <p className="text-sm text-neutral-700 font-medium">
                    This email is registered with us. You can log in with your password, or continue as a guest.
                  </p>
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-neutral-700">
                      Password (Optional for guest)
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-red-600 transition-colors">
                        <IoMdLock size={18} />
                      </div>
                      <input
                        type="password"
                        placeholder="Enter password to log in"
                        name="password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPassword(e.target.value)
                        }
                        className="w-full pl-10 pr-4 py-3 text-sm text-neutral-900 bg-white hover:border-neutral-400 focus:border-red-600 border border-neutral-300 rounded-xl outline-none focus:ring-1 focus:ring-red-600 transition-colors font-normal"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleLogin()}
                      className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer shadow-sm"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserFound(null);
                        setPassword("");
                      }}
                      className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Continue as guest
                    </button>
                  </div>
                </div>
              )}

              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-neutral-700">
                    First name <span className="text-red-600">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-red-600 transition-colors">
                      <FaUser className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      placeholder="First Name"
                      name="first_name"
                      value={formValues.first_name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 text-sm text-neutral-900 bg-white hover:border-neutral-400 focus:border-red-600 border border-neutral-300 rounded-xl outline-none focus:ring-1 focus:ring-red-600 transition-colors placeholder:text-neutral-400 font-normal"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-neutral-700">
                    Last name <span className="text-red-600">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-red-600 transition-colors">
                      <FaUser className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Last Name"
                      name="last_name"
                      value={formValues.last_name}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 text-sm text-neutral-900 bg-white hover:border-neutral-400 focus:border-red-600 border border-neutral-300 rounded-xl outline-none focus:ring-1 focus:ring-red-600 transition-colors placeholder:text-neutral-400 font-normal"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Number */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-neutral-700">
                  Mobile number <span className="text-red-600">*</span>
                </label>
                <div
                  className={`flex rounded-xl overflow-hidden border transition-colors bg-white ${
                    formValues.phone && !/^[6-9]/.test(formValues.phone)
                      ? "border-red-400 focus-within:border-red-600 focus-within:ring-1 focus-within:ring-red-600"
                      : isValidIndianMobile(formValues.phone)
                      ? "border-emerald-400 focus-within:border-emerald-600 focus-within:ring-1 focus-within:ring-emerald-600"
                      : "border-neutral-300 focus-within:border-red-600 focus-within:ring-1 focus-within:ring-red-600"
                  }`}
                >
                  <div className="px-3.5 bg-neutral-50 border-r border-neutral-200 flex items-center gap-1.5 text-sm font-semibold text-neutral-700 select-none">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    name="phone"
                    maxLength={10}
                    value={formValues.phone}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if ((raw.startsWith("+") && !raw.startsWith("+91")) || (raw.startsWith("00") && !raw.startsWith("0091"))) {
                        toast.error("Please enter a valid 10-digit mobile number.");
                        return;
                      }
                      let clean = raw.replace(/\D/g, "");
                      if (clean.startsWith("91") && clean.length > 10) {
                        clean = clean.slice(2);
                      } else if (clean.startsWith("0") && clean.length > 10) {
                        clean = clean.slice(1);
                      }
                      clean = clean.slice(0, 10);
                      setFormValues((prev: any) => ({ ...prev, phone: clean }));
                    }}
                    className="w-full px-4 py-3 text-sm text-neutral-900 bg-transparent outline-none placeholder:text-neutral-400 font-normal"
                    required
                  />
                  {isValidIndianMobile(formValues.phone) && (
                    <div className="flex items-center pr-3.5 text-emerald-600 pointer-events-none" title="Valid mobile number">
                      <FaCheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>

                {formValues.phone && formValues.phone.length > 0 && !/^[6-9]/.test(formValues.phone) && (
                  <p className="text-xs text-red-600 font-medium mt-0.5">
                    Please enter a valid 10-digit mobile number.
                  </p>
                )}
                {formValues.phone && formValues.phone.length > 0 && /^[6-9]/.test(formValues.phone) && formValues.phone.length < 10 && (
                  <p className="text-xs text-neutral-500 font-normal mt-0.5 flex items-center justify-between">
                    <span>Must be 10 digits</span>
                    <span>{formValues.phone.length}/10</span>
                  </p>
                )}
              </div>

              {/* Address 1 */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-neutral-700">
                  House / Flat no., Building, Street <span className="text-red-600">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-red-600 transition-colors">
                    <MdLocationPin className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Flat 402, Sunshine Apartments, MG Road"
                    name="address"
                    value={formValues.address}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 text-sm text-neutral-900 bg-white hover:border-neutral-400 focus:border-red-600 border border-neutral-300 rounded-xl outline-none focus:ring-1 focus:ring-red-600 transition-colors placeholder:text-neutral-400 font-normal"
                    required
                  />
                </div>
              </div>

              {/* Address 2 (Optional) */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-neutral-700">
                  Area, Landmark (Optional)
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-red-600 transition-colors">
                    <MdLocationPin className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Near City Hospital or Metro Gate 2"
                    name="address_2"
                    value={formValues.address_2}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 text-sm text-neutral-900 bg-white hover:border-neutral-400 focus:border-red-600 border border-neutral-300 rounded-xl outline-none focus:ring-1 focus:ring-red-600 transition-colors placeholder:text-neutral-400 font-normal"
                  />
                </div>
              </div>

              {/* PIN Code, State, City */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Postcode / PIN Code */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-neutral-700">
                      PIN code <span className="text-red-600">*</span>
                    </label>
                    {isPincodeLoading && (
                      <span className="text-xs text-red-600 font-medium animate-pulse flex items-center gap-1">
                        <FaSpinner className="animate-spin w-2.5 h-2.5" /> Fetching...
                      </span>
                    )}
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400 group-focus-within:text-red-600 transition-colors">
                      <MdLocationPin className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="6-digit PIN"
                      name="zip_code"
                      maxLength={6}
                      value={formValues.zip_code}
                      onChange={handleZipCodeChange}
                      className="w-full pl-10 pr-10 py-3 text-sm text-neutral-900 bg-white hover:border-neutral-400 focus:border-red-600 border border-neutral-300 rounded-xl outline-none focus:ring-1 focus:ring-red-600 transition-colors placeholder:text-neutral-400 font-normal"
                      required
                    />
                    {isPincodeLoading && (
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-red-600">
                        <FaSpinner className="animate-spin w-4 h-4" />
                      </div>
                    )}
                    {!isPincodeLoading && pincodeStatus.type === "success" && (
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-600">
                        <FaCheckCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  {pincodeStatus.message && (
                    <p
                      className={`text-xs font-medium mt-1 leading-tight ${pincodeStatus.type === "success"
                        ? "text-emerald-700 font-semibold"
                        : pincodeStatus.type === "error"
                          ? "text-red-600 font-semibold"
                          : "text-neutral-600"
                        }`}
                    >
                      {pincodeStatus.message}
                    </p>
                  )}
                </div>

                {/* State */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-neutral-700">
                    State <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <MdLocationPin className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Auto-detected"
                      name="state"
                      value={formValues.state}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 text-sm text-neutral-800 bg-neutral-50 border border-neutral-250 rounded-xl outline-none cursor-not-allowed select-none font-medium"
                      required
                    />
                  </div>
                </div>

                {/* City */}
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-neutral-700">
                    City <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <FaCity className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="Auto-detected"
                      name="city"
                      value={formValues.city}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 text-sm text-neutral-800 bg-neutral-50 border border-neutral-250 rounded-xl outline-none cursor-not-allowed select-none font-medium"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Country */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-neutral-700">
                  Country
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <FaGlobe className="w-4 h-4" />
                  </div>
                  <div className="w-full pl-10 pr-4 py-3 text-sm text-neutral-700 bg-neutral-50 border border-neutral-250 rounded-xl outline-none select-none cursor-not-allowed font-medium">
                    {formValues?.country || "India"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="save_address"
                  defaultChecked
                  className="w-4 h-4 rounded text-red-600 border-neutral-300 focus:ring-red-600 cursor-pointer accent-red-600"
                />
                <label htmlFor="save_address" className="text-sm text-neutral-600 cursor-pointer select-none">
                  Make this my default delivery address
                </label>
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-neutral-100">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-sm rounded-xl transition-colors cursor-pointer text-center"
            >
              &larr; Back to Cart
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 bg-black hover:bg-black/80 text-white font-semibold text-sm rounded-xl transition-all cursor-pointer text-center shadow-sm"
            >
              Proceed to Payment &rarr;
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
