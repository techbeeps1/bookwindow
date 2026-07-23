"use client";

import { FormEvent, useEffect, useState } from "react";
import config from "@/app/config";
import axios from "axios";
import React from "react";
import { useAppSelector } from "@/hooks/useStore";
import { useDispatch } from "react-redux";
import { login } from "@/lib/slices/authSlice";
import { count } from "node:console";
import toast from "react-hot-toast";

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

  const { user, isAuthenticated ,loading } = useAppSelector((state) => state.auth);
     const dispatch = useDispatch();

 
  useEffect(() => {
    if (formData?.first_name) {
      setFormValues(formData);
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
    formValues.city = ""; // Reset city when state changes
    setFormValues((prev: any) => ({ ...prev, state: value })); // Update form values
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
    setIsBuffering(true);

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const timeout = setTimeout(() => {
      checkUser(value);
    }, 500);

    setDebounceTimeout(timeout);
  };

  const checkUser = async (emailToCheck: string) => {
    try {
      const response = await axios.post(`${config.apiUrl}api/v1/checkuser`, {
        email: emailToCheck,
      });

      if (response.data.success) {
        setUserFound(true);
        setErrorMessage("");
      } else if (response.data.error) {
        setUserFound(false);
        setErrorMessage("This email is not registered with us.");
      }
    } catch (error) {
      console.error("API error:", error);
      setUserFound(false);
      setErrorMessage("This email is not registered with us.");
    } finally {
      setIsBuffering(false);
    }
  };

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(`/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password }),
    });
    if (response.ok) {
      const data = await response.json();
      setUserFound(false);
  
         dispatch(
                    login({
                      user: data,
                    })
                  );
      setLoginUpdated((prev) => prev + 1);
    } else {
      const data = await response.json();
      console.error("Login failed", response.status);
      alert(data?.error);
    }
  }

  useEffect(() => {
    const source = shippingData && shippingData;
    if (!source) return;

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
        country:  "India",
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
      formValues &&  formValues  ;

    const data = {
      ...source,
      email: email || formValues?.email || "",
      password: password || "",
      is_guest: !password,
      country:  "India",
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
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                />
              </svg>
            </button>
            <h1 className="text-xl font-bold text-neutral-900 tracking-tight uppercase">Shipping Details</h1>
          </div>

          {(!isEdit && isAuthenticated) && shippingData ? (
            <div className="text-sm space-y-2.5 leading-relaxed p-6 border border-neutral-200 bg-neutral-50/40 rounded-xl">
              <div className="font-bold text-neutral-900">
                {shippingData?.first_name ||" "}{" "}
                {shippingData?.last_name || " "}
              </div>
              <div className="text-neutral-600 space-y-0.5 font-medium">
                <p>{shippingData?.address || " "}</p>
                { shippingData?.address_2 && <p>{shippingData?.address_2 || ""}</p> }
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
                      <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
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
                <div className="space-y-4 bg-neutral-50 p-5 rounded-2xl border border-neutral-250">
                  <div className="flex flex-col gap-1.5">
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
                        placeholder="********"
                        name="password"
                        value={password}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          setPassword(e.target.value)
                        }
                        className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        const fakeFormEvent = {
                          preventDefault: () => {},
                          currentTarget: document.querySelector(
                            "form"
                          ) as HTMLFormElement,
                        } as unknown as FormEvent<HTMLFormElement>;

                        handleLogin(fakeFormEvent);
                      }}
                      className="bg-black hover:bg-neutral-900 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
                    >
                      Login
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
                      <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
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
                      <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
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
                    <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
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
                    <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
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
                    <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                    State
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <select
                      className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200 cursor-pointer"
                      name="state"
                      value={formValues.state}
                      onChange={handleStateChange}
                    >
                      <option defaultValue={shippingData?.state || ""}>
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

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                    City
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <select
                      className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200 cursor-pointer disabled:bg-neutral-100 disabled:cursor-not-allowed"
                      name="city"
                      value={formValues.city}
                      onChange={handleInputChange}
                      disabled={!selectedState}
                    >
                      <option defaultValue={formValues.city || ""}>
                        {selectedState ? "Select city" : formValues.city || "Select city"}
                      </option>
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

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                    Postcode
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Postcode"
                      name="zip_code"
                      value={formValues.zip_code}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-800 uppercase tracking-wider">
                  Country
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center justify-center pointer-events-none text-neutral-400">
                    <svg className="w-5 h-5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2a2.5 2.5 0 002.5-2.5V9a2 2 0 00-2-2h-1.03a3.374 3.374 0 00-3-3V3.545M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div
                 className="w-full pl-11 pr-4 py-3 text-sm text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200 cursor-not-allowed"
                 
                  >
                    {formValues?.country|| "India"}
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
