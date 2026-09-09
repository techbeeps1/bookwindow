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

    const source =
      formValues && formValues;

    const data = {
      ...source,
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
        className="container mx-auto p-4 md:p-6 grid grid-cols-1 gap-8 mb-8 mt-4 max-w-screen-md"
        onSubmit={handleNext}
      >
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-neutral-200/80 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-neutral-100 pb-4 mb-6">
            <button
              type="button"
              onClick={() => setIsEdit(!isEdit)}
              className="p-2 hover:bg-neutral-100 rounded-full transition-colors text-neutral-500 hover:text-black cursor-pointer"
              title="Toggle Edit Mode"
            >
              <IoIosArrowBack className="w-4 h-4" />
            </button>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight uppercase">Shipping Details</h1>
          </div>

          {(!isEdit && isAuthenticated) && shippingData ? (
            <div className="text-sm space-y-2.5 leading-relaxed p-6 border border-neutral-200 bg-neutral-50/40 rounded-xl">
              <div className="font-bold text-neutral-900">
                {shippingData?.first_name || " "}{" "}
                {shippingData?.last_name || " "}
              </div>
              <div className="text-neutral-600 space-y-0.5 font-medium">
                <p>{shippingData?.address || " "}</p>
                {shippingData?.address_2 && <p>{shippingData?.address_2 || ""}</p>}
                <p>
                  {shippingData?.city || ""},{" "}
                  {shippingData?.state || ""} {shippingData?.zip_code || ""}
                </p>
                <p>Phone: {shippingData?.phone || ""}</p>
              </div>
              <div className="text-end pt-3 border-t border-neutral-200/60 mt-4">
                <button
                  type="button"
                  onClick={() => setIsEdit(true)}
                  className="bg-black hover:bg-neutral-900 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  Edit Address 🖊️
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {!isAuthenticated && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <IoMail size={20} />
                    </div>
                    <input
                      type="email"
                      placeholder="name@mail.com"
                      className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                      required
                      value={email || formValues.email}
                      onChange={handleEmailChange}
                    />
                  </div>
                </div>
              )}

              {/* Buffering Spinner */}
              {isBuffering && (
                <p className="text-blue-500 text-xs font-semibold mb-2">Checking email...</p>
              )}

              {/* Error Message & Guest Mode */}
              {userFound === false && !isBuffering && (
                <div className="space-y-4 bg-neutral-50 p-5 rounded-2xl border border-neutral-250">
                  <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">{errorMessage}</p>
                  {errorMessage && (
                    <>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setErrorMessage("")}
                          className="bg-black hover:bg-neutral-900 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Continue as guest
                        </button>
                      </div>

                    </>
                  )}
                </div>
              )}

              {/* Password Input / Login */}
              {userFound === true && !isBuffering && (
                <div className="space-y-3 bg-neutral-50 p-5 rounded-2xl border border-neutral-250">
                  <p className="text-xs text-neutral-600 font-medium">
                    This email is registered with us. You can log in with your password, or continue as a guest.
                  </p>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                      Password (Optional for guest)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                        <IoMdLock size={20} />
                      </div>
                      <input
                        type="password"
                        placeholder="Enter password to log in"
                        name="password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPassword(e.target.value)
                        }
                        className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleLogin()}
                      className="bg-black hover:bg-neutral-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserFound(null);
                        setPassword("");
                      }}
                      className="bg-neutral-200 hover:bg-neutral-300 text-neutral-800 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Continue as guest
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                    First Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <FaUser className="w-4 h-4 pointer-events-none" />
                    </div>
                    <input
                      type="text"
                      placeholder="First Name"
                      name="first_name"
                      value={formValues.first_name}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <FaUser className="w-4 h-4 pointer-events-none" />
                    </div>
                    <input
                      type="text"
                      placeholder="Last Name"
                      name="last_name"
                      value={formValues.last_name}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <FaPhoneAlt className="w-4 h-4 pointer-events-none" />
                  </div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    name="phone"
                    value={formValues.phone}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                  Address 1
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <MdLocationPin className="w-5 h-5 pointer-events-none" />
                  </div>
                  <input
                    type="text"
                    placeholder="Address 1"
                    name="address"
                    value={formValues.address}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                  Address 2 (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <MdLocationPin className="w-5 h-5 pointer-events-none" />
                  </div>
                  <input
                    type="text"
                    placeholder="Address 2 (Optional)"
                    name="address_2"
                    value={formValues.address_2}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Postcode / PIN Code */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                      Postcode
                    </label>
                    {isPincodeLoading && (
                      <span className="text-[10px] text-blue-600 font-semibold animate-pulse flex items-center gap-1">
                        <FaSpinner className="animate-spin w-2.5 h-2.5" /> Fetching...
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <MdLocationPin className="w-5 h-5 pointer-events-none" />
                    </div>
                    <input
                      type="text"
                      placeholder="6-digit PIN code"
                      name="zip_code"
                      maxLength={6}
                      value={formValues.zip_code}
                      onChange={handleZipCodeChange}
                      className="w-full pl-11 pr-10 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                      required
                    />
                    {isPincodeLoading && (
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-blue-500">
                        <FaSpinner className="animate-spin w-4 h-4" />
                      </div>
                    )}
                    {!isPincodeLoading && pincodeStatus.type === "success" && (
                      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-500">
                        <FaCheckCircle className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  {pincodeStatus.message && (
                    <p
                      className={`text-[11px] font-medium mt-0.5 leading-tight ${
                        pincodeStatus.type === "success"
                          ? "text-emerald-600 font-semibold"
                          : pincodeStatus.type === "error"
                          ? "text-amber-600 font-semibold"
                          : "text-blue-600"
                      }`}
                    >
                      {pincodeStatus.message}
                    </p>
                  )}
                </div>

                {/* State */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                    State
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <MdLocationPin className="w-5 h-5 pointer-events-none" />
                    </div>
                    <select
                      className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200 cursor-pointer"
                      name="state"
                      value={formValues.state}
                      onChange={handleStateChange}
                    >
                      <option value="">
                        {shippingData?.state || "Select state"}
                      </option>
                      {!statesFeteched ? (
                        <option className="text-sm text-red-400" disabled>
                          loading ↻
                        </option>
                      ) : (
                        states?.map((state: any) => (
                          <option
                            value={state?.name}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-50 text-sm cursor-pointer"
                            key={state?.id}
                          >
                            {state?.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* City */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                    City
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <FaCity className="w-5 h-5 pointer-events-none" />
                    </div>
                    <select
                      className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200 cursor-pointer disabled:bg-neutral-100 disabled:cursor-not-allowed"
                      name="city"
                      value={formValues.city}
                      onChange={handleInputChange}
                      disabled={!selectedState && !formValues.state}
                    >
                      <option value="">
                        {selectedState || formValues.state ? "Select city" : "Select city"}
                      </option>
                      {/* Dynamic option in case auto-filled city is not in the preset DB cities */}
                      {formValues.city &&
                        !filteredCities.some(
                          (city: any) => city?.name?.toLowerCase() === formValues.city?.toLowerCase()
                        ) && (
                          <option value={formValues.city} key="custom-city">
                            {formValues.city}
                          </option>
                        )}
                      {filteredCities?.map((city: any) => (
                        <option
                          value={city?.name}
                          className="px-4 py-2 text-gray-600 hover:bg-gray-50 text-sm cursor-pointer"
                          key={city?.id}
                        >
                          {city?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                  Country
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center justify-center pointer-events-none text-neutral-400">
                    <FaGlobe className="w-4 h-4 pointer-events-none" />
                  </div>
                  <div
                    className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200 cursor-not-allowed"
                  >
                    {formValues?.country || "India"}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between gap-4 mt-6 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onBack}
              className="w-full sm:w-48 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-bold text-xs rounded-xl uppercase tracking-wider transition-colors cursor-pointer text-center"
            >
              Back
            </button>
            <button
              type="submit"
              className="w-full sm:w-48 py-3.5 bg-black hover:bg-neutral-900 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-colors cursor-pointer text-center shadow-md active:scale-98"
            >
              Next
            </button>
          </div>
        </div>
      </form>
    </>
  );
}
