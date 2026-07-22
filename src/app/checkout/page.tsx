"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
// components

import { useRouter } from "next/navigation";
import config from "@/app/config";
import axios from "axios";

import Checkout from "@/components/Checkout";
import { ThankYouDialog } from "@/components/thank-you-popup";
import { NotificationDialog } from "@/components/notification";

import Link from "next/link";
import FadeLoaderOverlay from "@/components/loader";
import { useCart } from "@/hooks/useCart";
import {
  useRemoveCartMutation,
  useUpdateCartMutation,
  useViewCartQuery,
} from "@/lib/api/cartApi";
import { useSession } from "@/hooks/useSession";

interface CartItem {
  product_id: number;
  product_name: string;
  product_price: number;
  quantity: number;
  image: string;
  product_weight: number;
  subtotal: number;
  product_slug: string;
  category_id: number;
  sub_category_id: number;
}
const steps = ["cart", "shipping", "order"];

export default function ShoppingCart() {
  const router = useRouter();
  const sessionId = useSession();
  const initialStep = "cart";
  const [cartFetched, setCartFetched] = useState(false);

  const [cartItems, setCartItems] = useState([] as CartItem[] | any[]);
  const [items_count, setItemsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCoupon, setShowCoupon] = useState(true);
  const [isCouponApplied, setIsCoupnApplied] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState("");
  const [couponError, setCouponError] = useState("");

  const { refetch } = useViewCartQuery(sessionId);

  const [deliveryType, setDeliveryType] = useState("standard");
  const [payment_method, setPaymentMethod] = useState("cod");
  const [orderNumber, setOrderNumber] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const errorPopup = () => setOpen(!open);
  const [isOpen, setIsOpen] = useState(false);
  const thankYouPopup = () => setIsOpen(!isOpen);
  const [activeTab, setActiveTab] = useState(initialStep);
  const [isorderProcess, setIsOrderProcess] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [shippingData, setShippingData] = useState({});
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );

  const [coupon_code, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState({} as any);
  const [mainCategories, setMainCategories] = useState([] as any);
  const [loginUpdated, setLoginUpdated] = useState(0);
  
  
  const { data } = useCart();
  const [updateCart, { isLoading: updating }] = useUpdateCartMutation();
  const [removeCart, { isLoading: removing }] = useRemoveCartMutation();

  useEffect(() => {
    fetch("/api/my-account/user")
      .then((res) => res.json())
      .then((userData) => {
        if (userData && userData.id) {
          setShippingData(userData);
        }
      })
      .catch((error) => {
        console.error("Error checking user session:", error);
        router.push("/login");
      });
  }, [sessionId,loginUpdated]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveTab("cart");
  }, []);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const getStepStatus = (step: string) => {
    const index = steps.indexOf(step);
    const activeIndex = steps.indexOf(activeTab);
    if (step === activeTab) return "active";
    if (completedSteps.includes(step)) return "completed";
    if (index < activeIndex) return "completed";
    return "upcoming";
  };

  const goToStep = (step: string) => {
    const currentIndex = steps.indexOf(activeTab);
    const targetIndex = steps.indexOf(step);
    step === "order" ? setShowCoupon(false) : setShowCoupon(true);
    // Only allow navigation to current or previous or completed step
    if (
      step === activeTab ||
      completedSteps.includes(step) ||
      targetIndex < currentIndex
    ) {
      setActiveTab(step);
    }
  };

  const handleNext = () => {
    const currentIndex = steps.indexOf(activeTab);
    const nextStep = steps[currentIndex + 1];
    if (nextStep) {
      setCompletedSteps((prev) =>
        prev.includes(activeTab) ? prev : [...prev, activeTab],
      );
      setActiveTab(nextStep);
    }
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(activeTab);
    const prevStep = steps[currentIndex - 1];
    // prevStep === "cart" ? setShowCoupon(true) : setShowCoupon(false);
    if (prevStep) setActiveTab(prevStep);
  };

  useEffect(() => {
    const viewCart = async () => {
      setLoading(true);
      try {
        setCartItems(data?.items || []);
        setItemsCount(data?.items_count || 0);
        setCartFetched(true);
      } catch (error) {
        console.error("Error loading cart:", error);
        setCartItems([]);
        setItemsCount(0);
        setCartFetched(true);
      } finally {
        setLoading(false);
      }
    };
    if (sessionId) {
      viewCart();
    }
  }, [sessionId, data]);

  const updateCartQuantity = async (productId: number, quantity: number) => {
    try {
      updateCart({
        product_id: productId,
        session_id: sessionId,
        quantity_change: quantity,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const removeCartItem = async (productId: number) => {
    try {
      removeCart({
        product_id: productId,
        session_id: sessionId,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const updateQuantity = (id: number, action: "increment" | "decrement") => {
    updateCartQuantity(id, action === "increment" ? +1 : -1);
  };

  const removeItem = (id: number) => {
    const itemToRemove = cartItems?.find((item) => item.product_id === id);
    if (!itemToRemove) return;

    const quantity = itemToRemove.quantity || 1;
    const newItemsCount = items_count - quantity;

    removeCartItem(id);
    setCartItems(cartItems?.filter((item) => item.product_id !== id));
    setItemsCount(newItemsCount);

    
  };

  const calculateTotal = () => {
    const subtotal = cartItems?.reduce((acc, item) => {
      const itemTotal = item.product_price * item.quantity;

      if (isCouponApplied && couponData && couponSuccess) {
        const couponCategories = couponData.category_id
          ? JSON.parse(couponData.category_id)
          : null;

        const isCategoryMatch =
          !couponCategories ||
          couponCategories.includes(String(item.category_id));

        if (isCategoryMatch) {
          return (
            acc +
            (couponData.type === "fixed"
              ? itemTotal - parseFloat(couponData.value)
              : itemTotal - (itemTotal * parseFloat(couponData.value)) / 100)
          );
        }
      }

      return acc + itemTotal;
    }, 0);

    return subtotal;
  };

  // Function to return shipping cost as a number
  const calculateShippingValue = (
    weightInGrams: number,
    quantity: number,
  ): number => {
    // if (deliveryType === "free") return 0;
    const weight = weightInGrams * 1000;
    let shipping = deliveryType === "standard" ? 49 : 125;

    if (weight <= 500) return shipping;
    else {
      shipping = shipping * quantity;
    }

    // const extraWeight = weight - 500;
    // const increments = Math.ceil(extraWeight / 200);
    // shipping += increments * 25;

    return shipping;
  };

  // Function to return shipping as a formatted string
  const calculateShipping = (
    weightInGrams: number,
    quantity: number,
  ): string => {
    const value = calculateShippingValue(weightInGrams, quantity);
    // return deliveryType === "free" ? "Free" : `₹${value}`;
    return `₹${value}`;
  };

  const totalWeight = cartItems?.reduce(
    (acc, item) => acc + item.product_weight * item.quantity,
    0,
  );

  const subtotal = cartItems?.reduce(
    (acc, item) => acc + item.product_price * item.quantity,
    0,
  );

  const handleCouponChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCouponCode(value);
    setCouponSuccess("");
    setCouponError("");
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      checkCoupon(value);
    }, 500); // 500ms delay after stop typing
    setDebounceTimeout(timeout);
  };

  // API call
  const checkCoupon = async (couponToCheck: string) => {
    try {
      const response = await axios.post(
        `${config.apiUrl}api/cart/coupon/${couponToCheck}`,
      );
      if (response.data) {
        setCouponData(response.data);
      } else if (response.data.error) {
      }
    } catch (error) {
      console.error("API error:", error);
    } finally {
    }
  };

  const couponValidation = (
    max_cart_amount: number,
    min_cart_amount: number,
    totalAmount: number,
  ) => {
    if (
      (totalAmount <= max_cart_amount && totalAmount >= min_cart_amount) ||
      (min_cart_amount === null && max_cart_amount === null) ||
      (totalAmount > min_cart_amount && max_cart_amount === null) ||
      (totalAmount < max_cart_amount && min_cart_amount === null)
    ) {
      setCouponSuccess("coupon is valid");
    } else if (totalAmount > max_cart_amount && max_cart_amount !== null) {
      setCouponError(`Maximum cart amount should be ${max_cart_amount}`);
    } else if (totalAmount < min_cart_amount && min_cart_amount !== null) {
      setCouponError(`Minimum cart amount should be ${min_cart_amount}`);
    }
  };

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      setLoading(true);
      try {
        const response2 = await axios({
          method: "get",
          url: `${config.apiUrl}api/category`,
          responseType: "json",
        });
        setMainCategories(response2?.data);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductsByCategory();
  }, []);

  useEffect(() => {}, [couponData, mainCategories]);

  const handlePlaceOrder = async () => {
    if (isorderProcess) return; // Prevent multiple submissions
    setIsOrderProcess(true);
    try {
      const response = await fetch(`${config.apiUrl}api/cart/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...shippingData,
          session_id: sessionId,
          shipping_method: deliveryType,
          payment_method: payment_method,
          coupon_code:
            isCouponApplied && couponData && couponSuccess
              ? couponData?.code
              : "",
          discount_amount:
            isCouponApplied && couponData && couponSuccess
              ? cartItems?.reduce(
                  (acc, item) => acc + item.product_price * item.quantity,
                  0,
                ) - calculateTotal()
              : 0,
        }),
      });
      const result = await response.json();
      // Reset the order process state after the request completes

      if (result?.order_number && !result?.razorpay_order_id) {
        setOrderNumber(result?.order_number);
        refetch();
        router.push(`/view-orders?order_number=${result?.order_number}`);

        // thankYouPopup();
        setTimeout(() => {
          // setCartItems([]);
          setItemsCount(0);
         
        }, 2000);
      }
      if (response.ok && result?.razorpay_order_id) {
        // 1. Load Razorpay script
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          alert("Failed to load Razorpay SDK");
          return;
        }
        setIsOrderProcess(false);
        // 2. Launch Razorpay checkout
        const options = {
          key: result.razorpay_key,
          amount: result.amount, // in paise (e.g., 26050)
          currency: "INR",
          name: result.name,
          description: "Order Payment",
          order_id: result.razorpay_order_id,
          handler: async function (response: any) {
            // 3. Send the callback details to your server
            const verifyRes = await fetch(
              `${config.apiUrl}api/cart/razorpay/callback`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              },
            );

            const verifyData = await verifyRes.json();
            console.log("RAzorpay data", verifyData);
            if (verifyRes.ok) {
              refetch();
              setOrderNumber(result?.order?.order_number);
              router.push(
                `/view-orders?order_number=${result?.order?.order_number}`,
              );
              // thankYouPopup();
              setTimeout(() => {
                setCartItems([]);
                setItemsCount(0);
              }, 2000);
            } else {
              errorPopup();
            }
          },
          prefill: {
            name: result.name,
            email: result.email,
            contact: result.contact,
          },
          notes: {
            order_number: result?.order?.order_number,
          },
          theme: {
            color: "#F37254",
          },
          modal: {
            ondismiss: async function () {
              // Call your server's cancel API explicitly
              try {
                await fetch(`${config.apiUrl}api/cart/razorpay/cancel`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  credentials: "include",
                  body: JSON.stringify({
                    order_id: result?.order?.id,
                    order_number: result?.order?.order_number,
                    razorpay_order_id: result?.order?.razorpay_order_id,
                  }),
                });
                errorPopup(); // Show cancellation feedback to user
              } catch (error) {
                console.error("Failed to call cancel API:", error);
              }
            },
          },

          // Optional: Handle payment failure (e.g., invalid card, insufficient funds)
          // callback_url: "",
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        if (result.message === "Your cart is empty") {
          setOpen(true);
          errorPopup();
        }
      }
      if (result.error) {
        alert("Something went wrong. Please try again later.");
      }
      setIsOrderProcess(false);
    } catch (error) {
      setOpen(true);
      console.log("Error in:", error);
      errorPopup();
    }
  };

  return (
    <>
      <section className="bg-white py-8 md:py-16 mb-4 min-h-screen">
        {!cartFetched ? (
          <FadeLoaderOverlay />
        ) : cartItems?.length > 0 && items_count > 0 ? (
          <div className="mx-auto container p-4 sm:p-6 lg:p-8 2xl:px-0">
            {/* Step Progress Tracker (Centered, Clean Minimal Segment stepper) */}
            <div className="flex w-full items-center justify-center border-b border-neutral-200/80 mb-12 max-w-4xl mx-auto pb-4">
              <div className="flex w-full max-w-2xl justify-between text-center select-none font-bold uppercase tracking-wider text-xs sm:text-sm">
                {steps.map((step, idx) => {
                  const isCurrent = step === activeTab;
                  const isDone =
                    completedSteps.includes(step) ||
                    steps.indexOf(step) < steps.indexOf(activeTab);

                  return (
                    <div
                      key={step}
                      onClick={() => goToStep(step)}
                      className={`pb-2 px-4 transition-all duration-300 border-b-2 cursor-pointer ${
                        isCurrent
                          ? "border-black text-black scale-105"
                          : isDone
                            ? "border-green-600 text-green-700"
                            : "border-transparent text-neutral-300 hover:text-neutral-500"
                      }`}
                    >
                      <span className="mr-1">{idx + 1}.</span> {step}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart Tab */}
            {activeTab === "cart" && (
              <>
                {/* Title & subtitle */}
                <div className="mb-8 pb-5 border-b border-neutral-100">
                  <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
                    Shopping Cart
                  </h1>
                  <p className="text-sm text-neutral-400 font-bold mt-1">
                    {items_count} {items_count === 1 ? "item" : "items"} in your
                    cart
                  </p>
                </div>

                <div className="mt-6 md:gap-8 lg:flex lg:items-start">
                  {/* Left Column: Cart Items List */}
                  <div className="me-auto w-full flex-none xl:max-w-3xl lg:max-w-[500px]">
                    {/* Cart Items List Container */}
                    <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm space-y-4">
                      {cartItems?.map((item) => {
                        const couponCategories = couponData.category_id
                          ? JSON.parse(couponData.category_id)
                          : null;

                        const isCategoryMatched =
                          !couponCategories ||
                          couponCategories.includes(String(item.category_id));

                        return (
                          <div
                            key={item.product_id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 last:border-b-0 last:pb-0"
                          >
                            {/* Product Cover and Title */}
                            <div className="flex items-center gap-4 flex-1">
                              <div className="relative w-20 h-20 bg-neutral-50 border border-neutral-200/80 rounded-xl p-1.5 flex items-center justify-center flex-shrink-0">
                                <Image
                                  className="object-contain max-h-full max-w-full rounded-md"
                                  src={`${config.apiUrl}storage/app/public/${item.image}`}
                                  alt={item.product_name}
                                  width={80}
                                  height={80}
                                />
                              </div>
                              <div className="flex flex-col">
                                <Link
                                  href={`/product-detail/${item.product_slug}`}
                                  className="text-sm sm:text-base font-bold text-neutral-800 hover:text-black line-clamp-2 transition-colors"
                                >
                                  {item.product_name}
                                </Link>
                                <span className="text-xs text-neutral-400 font-semibold mt-1">
                                  ₹{item.product_price}
                                </span>
                              </div>
                            </div>

                            {/* Adjuster, Price, Trash */}
                            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                              {/* Quantity selector */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.product_id, "decrement")
                                  }
                                  className="w-8 h-8 rounded border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-500 font-bold text-sm cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="w-10 h-8 flex items-center justify-center bg-neutral-100/80 rounded font-bold text-xs text-neutral-800">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.product_id, "increment")
                                  }
                                  className="w-8 h-8 rounded border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-500 font-bold text-sm cursor-pointer"
                                >
                                  +
                                </button>
                              </div>

                              {/* Subtotal */}
                              <span className="text-sm sm:text-base font-black text-neutral-900 w-24 text-right">
                                ₹
                                {(() => {
                                  const itemTotal =
                                    item.product_price * item.quantity;
                                  if (
                                    isCouponApplied &&
                                    couponData &&
                                    couponSuccess
                                  ) {
                                    const couponCategories =
                                      couponData.category_id
                                        ? JSON.parse(couponData.category_id)
                                        : null;

                                    const isCategoryMatch =
                                      !couponCategories ||
                                      couponCategories.includes(
                                        String(item.category_id),
                                      );

                                    if (isCategoryMatch) {
                                      return (
                                        couponData.type === "fixed"
                                          ? itemTotal -
                                            parseFloat(couponData.value)
                                          : itemTotal -
                                            (itemTotal *
                                              parseFloat(couponData.value)) /
                                              100
                                      ).toFixed(2);
                                    }
                                  }
                                  return itemTotal.toFixed(2);
                                })()}
                              </span>

                              {/* Delete */}
                              <button
                                onClick={() => removeItem(item.product_id)}
                                className="text-red-500 hover:text-red-700 transition-colors p-1 cursor-pointer"
                                title="Remove Item"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  strokeWidth="2"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Bottom Coupon code elements */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                      <div className="flex gap-2 w-full sm:w-auto">
                        <input
                          type="text"
                          value={coupon_code}
                          onChange={handleCouponChange}
                          name="coupon_code"
                          className="bg-white border border-neutral-300 text-neutral-850 text-xs rounded-lg px-4 py-2.5 focus:outline-none focus:border-black w-full sm:w-48 transition-colors"
                          placeholder="Coupon code"
                        />
                        <button
                          onClick={() => {
                            couponValidation(
                              couponData && couponData.max_cart_amount,
                              couponData && couponData.min_cart_amount,
                              cartItems?.reduce(
                                (acc, item) =>
                                  acc + item.product_price * item.quantity,
                                0,
                              ),
                            );
                            couponData && setIsCoupnApplied(true);
                          }}
                          className="bg-black hover:bg-neutral-850 text-white font-extrabold text-xs px-5 py-2.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors"
                        >
                          Apply Coupon
                        </button>
                      </div>

                      <button
                        onClick={() => router.refresh()}
                        className="text-xs font-bold text-neutral-400 hover:text-black transition-colors border-b border-neutral-300 hover:border-black cursor-pointer pb-0.5 uppercase tracking-wider"
                      >
                        Update Cart
                      </button>
                    </div>

                    <div className="mt-2">
                      {couponSuccess && isCouponApplied && couponData
                        ? (() => {
                            const couponCategories = couponData.category_id
                              ? JSON.parse(couponData.category_id)
                              : null;

                            const isCategoryMatch =
                              !couponCategories ||
                              cartItems?.some((item) =>
                                couponCategories.includes(
                                  String(item.category_id),
                                ),
                              );
                            return (
                              isCategoryMatch && (
                                <div className="inline-flex items-center gap-1 bg-green-50 text-green-800 px-3 py-1 rounded-lg text-xs font-bold border border-green-150 shadow-sm mt-1">
                                  <span>Code: {couponData?.code}</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setIsCoupnApplied(false);
                                      setCouponError("");
                                      setCouponSuccess("");
                                    }}
                                    className="p-0.5 hover:bg-green-100 rounded-full transition-colors text-green-600 hover:text-green-900 cursor-pointer"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                      className="w-3.5 h-3.5"
                                    >
                                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                                    </svg>
                                  </button>
                                </div>
                              )
                            );
                          })()
                        : couponError && (
                            <p className="text-red-700 text-xs font-bold pl-1 mt-1">
                              {couponError}
                            </p>
                          )}
                    </div>
                  </div>

                  {/* Right Column: Order Summary */}
                  <div className="w-full lg:max-w-md flex-1">
                    <div className="bg-neutral-50/50 border border-neutral-150/60 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 lg:sticky lg:top-8">
                      <p className="text-lg font-bold text-neutral-900">
                        Order Summary
                      </p>

                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm font-semibold text-neutral-600">
                          <span>Subtotal</span>
                          <span className="text-neutral-900 font-bold">
                            ₹
                            {cartItems?.reduce(
                              (acc, item) =>
                                acc + item.product_price * item.quantity,
                              0,
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-sm font-semibold text-neutral-600">
                          <span>Discount</span>
                          <span className="text-green-700 font-bold">
                            - ₹
                            {isCouponApplied && couponData && couponSuccess
                              ? cartItems?.reduce(
                                  (acc, item) =>
                                    acc + item.product_price * item.quantity,
                                  0,
                                ) - calculateTotal()
                              : 0}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-sm font-semibold text-neutral-600">
                          <span>Shipping</span>
                          <span className="text-neutral-900 font-bold">
                            {calculateShipping(
                              totalWeight,
                              cartItems?.reduce(
                                (acc, item) => acc + item.quantity,
                                0,
                              ),
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between items-baseline border-t border-neutral-200/60 pt-4">
                          <span className="text-sm font-extrabold text-neutral-900 uppercase">
                            Total
                          </span>
                          <span className="text-xl font-black text-neutral-950">
                            ₹
                            {calculateTotal() +
                              calculateShippingValue(
                                totalWeight,
                                cartItems?.reduce(
                                  (acc, item) => acc + item.quantity,
                                  0,
                                ),
                              )}
                          </span>
                        </div>
                      </div>

                      {/* Action CTA Button */}
                      <button
                        onClick={handleNext}
                        className="w-full py-4 bg-black hover:bg-neutral-900 text-white rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-200 shadow-md active:scale-98 flex items-center justify-center cursor-pointer"
                      >
                        Proceed To Checkout
                      </button>

                      <div className="text-center mt-4">
                        <Link
                          href="/all-products"
                          className="inline-block text-sm font-semibold text-neutral-500 hover:text-black hover:underline transition-all"
                        >
                          Continue Shopping
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Shipping Tab */}
            {activeTab === "shipping" && (
              <Checkout
                shippingData={shippingData}
                onBack={() => {
                  setActiveTab("cart");
                }}
                onNext={(data: any) => {
                  setShippingData(data);
                  setActiveTab("order");
                }}
                formData={shippingData}
                setLoginUpdated={setLoginUpdated}
              />
            )}

            {/* Order Review Tab */}
            {activeTab === "order" && (
              <div className="mt-6 sm:mt-8">
                <div className="mb-8 pb-5 border-b border-neutral-100">
                  <h1 className="text-3xl font-black text-neutral-900 tracking-tight">
                    Review & Order
                  </h1>
                  <p className="text-sm text-neutral-400 font-bold mt-1">
                    Please review details and select delivery & payment options
                  </p>
                </div>

                <div className="mt-6 md:gap-8 lg:flex lg:items-start">
                  {/* Left Column: Order Items */}
                  <div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-3xl p-4">
                    <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm space-y-4">
                      {cartItems?.map((item) => {
                        const couponCategories = couponData.category_id
                          ? JSON.parse(couponData.category_id)
                          : null;

                        const isCategoryMatched =
                          !couponCategories ||
                          couponCategories.includes(String(item.category_id));

                        return (
                          <div
                            key={item.product_id}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 last:border-b-0 last:pb-0"
                          >
                            {/* Product Cover and details */}
                            <div className="flex items-center gap-4 flex-1">
                              <div className="relative w-20 h-20 bg-neutral-50 border border-neutral-200/80 rounded-xl p-1.5 flex items-center justify-center flex-shrink-0">
                                <Image
                                  className="object-contain max-h-full max-w-full rounded-md"
                                  src={`${config.apiUrl}storage/app/public/${item.image}`}
                                  alt={item.product_name}
                                  width={80}
                                  height={80}
                                />
                              </div>
                              <div className="flex flex-col">
                                <Link
                                  href={`/product-detail/${item.product_slug}`}
                                  className="text-sm sm:text-base font-bold text-neutral-800 hover:text-black line-clamp-2 transition-colors"
                                >
                                  {item.product_name}
                                </Link>
                                <span className="text-xs text-neutral-400 font-semibold mt-1">
                                  ₹{item.product_price}
                                </span>
                              </div>
                            </div>

                            {/* Adjuster, Price */}
                            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                              {/* Quantity selector */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    updateQuantity(item.product_id, "decrement")
                                  }
                                  className="w-8 h-8 rounded border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-500 font-bold text-sm cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="w-10 h-8 flex items-center justify-center bg-neutral-100/80 rounded font-bold text-xs text-neutral-800">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() =>
                                    updateQuantity(item.product_id, "increment")
                                  }
                                  className="w-8 h-8 rounded border border-neutral-200 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-500 font-bold text-sm cursor-pointer"
                                >
                                  +
                                </button>
                              </div>

                              {/* Subtotal */}
                              <span className="text-sm sm:text-base font-black text-neutral-900 w-24 text-right">
                                ₹
                                {(() => {
                                  const itemTotal = item.subtotal;
                                  if (
                                    isCouponApplied &&
                                    couponData &&
                                    couponSuccess
                                  ) {
                                    const couponCategories =
                                      couponData.category_id
                                        ? JSON.parse(couponData.category_id)
                                        : null;

                                    const isCategoryMatch =
                                      !couponCategories ||
                                      couponCategories.includes(
                                        String(item.category_id),
                                      );

                                    if (isCategoryMatch) {
                                      return (
                                        couponData.type === "fixed"
                                          ? itemTotal -
                                            parseFloat(couponData.value)
                                          : itemTotal -
                                            (itemTotal *
                                              parseFloat(couponData.value)) /
                                              100
                                      ).toFixed(2);
                                    }
                                  }
                                  return itemTotal;
                                })()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Order summary and settings */}
                  <div className="w-full lg:max-w-md flex-1 p-4">
                    <div className="bg-neutral-50/50 border border-neutral-100 rounded-2xl p-6 shadow-sm space-y-6 lg:sticky lg:top-8">
                      <p className="text-lg font-bold text-neutral-900">
                        Order Summary
                      </p>

                      {/* Delivery Type Option Cards */}
                      <div className="space-y-3">
                        <p className="text-xs font-black uppercase text-neutral-400 tracking-wider">
                          Delivery Type
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {/* Standard Delivery Option */}
                          <div
                            onClick={() => setDeliveryType("standard")}
                            className={`flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                              deliveryType === "standard"
                                ? "border-black bg-white"
                                : "border-neutral-200 bg-white hover:border-neutral-300"
                            }`}
                          >
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-850">
                              Standard
                            </span>
                            <span className="text-[10px] text-neutral-400 font-bold mt-1">
                              3-5 Days
                            </span>
                            <span className="text-xs font-black text-neutral-900 mt-2.5">
                              ₹49
                            </span>
                          </div>

                          {/* Express Delivery Option */}
                          {/* <div
                            onClick={() => setDeliveryType("express")}
                            className={`flex flex-col p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                              deliveryType === "express"
                                ? "border-black bg-white"
                                : "border-neutral-200 bg-white hover:border-neutral-300"
                            }`}
                          >
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-850">
                              Express
                            </span>
                            <span className="text-[10px] text-neutral-400 font-bold mt-1">
                              1-2 Days
                            </span>
                            <span className="text-xs font-black text-neutral-900 mt-2.5">
                              ₹125
                            </span>
                          </div> */}
                        </div>
                      </div>

                      {/* Payment Method Option Cards */}
                      <div className="space-y-3">
                        <p className="text-xs font-black uppercase text-neutral-400 tracking-wider">
                          Payment Method
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          {/* Cash On Delivery Option */}
                          <div
                            onClick={() => setPaymentMethod("cod")}
                            className={`flex flex-col justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                              payment_method === "cod"
                                ? "border-black bg-white"
                                : "border-neutral-200 bg-white hover:border-neutral-300"
                            }`}
                          >
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-855">
                              COD
                            </span>
                            <span className="text-[10px] text-neutral-400 font-bold mt-1">
                              Cash on delivery
                            </span>
                          </div>

                          {/* Online Payment Option */}
                          <div
                            onClick={() => setPaymentMethod("razorpay")}
                            className={`flex flex-col justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                              payment_method === "razorpay"
                                ? "border-black bg-white"
                                : "border-neutral-200 bg-white hover:border-neutral-300"
                            }`}
                          >
                            <span className="text-xs font-bold uppercase tracking-wider text-neutral-850">
                              Online
                            </span>
                            <span className="text-[10px] text-neutral-400 font-bold mt-1">
                              Razorpay secure
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Prices breakdown list */}
                      <div className="space-y-4 pt-4 border-t border-neutral-100">
                        <div className="flex justify-between text-xs text-neutral-500 font-bold uppercase tracking-wider">
                          <span>Subtotal</span>
                          <span className="text-neutral-800 font-black">
                            ₹{subtotal}
                          </span>
                        </div>

                        <div className="flex justify-between text-xs text-neutral-500 font-bold uppercase tracking-wider">
                          <span>Discount</span>
                          <span className="text-green-700 font-black">
                            - ₹
                            {isCouponApplied && couponData && couponSuccess
                              ? cartItems?.reduce(
                                  (acc, item) =>
                                    acc + item.product_price * item.quantity,
                                  0,
                                ) - calculateTotal()
                              : 0}
                          </span>
                        </div>

                        <div className="flex justify-between text-xs text-neutral-500 font-bold uppercase tracking-wider">
                          <span>Shipping</span>
                          <span className="text-neutral-800 font-black">
                            {calculateShipping(
                              totalWeight,
                              cartItems?.reduce(
                                (acc, item) => acc + item.quantity,
                                0,
                              ),
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between items-baseline pt-4 border-t border-neutral-100">
                          <span className="text-sm font-extrabold text-neutral-900 uppercase">
                            Total
                          </span>
                          <span className="text-2xl font-black text-neutral-950">
                            ₹
                            {calculateTotal() +
                              calculateShippingValue(
                                totalWeight,
                                cartItems?.reduce(
                                  (acc, item) => acc + item.quantity,
                                  0,
                                ),
                              )}
                          </span>
                        </div>
                      </div>

                      {/* Dialogs */}
                      {open && (
                        <NotificationDialog
                          open={open}
                          handleOpen={errorPopup}
                        />
                      )}

                      {isOpen && (
                        <ThankYouDialog
                          open={isOpen}
                          handleOpen={thankYouPopup}
                          orderNumber={orderNumber}
                        />
                      )}

                      {/* Action buttons */}
                      <div className="flex gap-4 pt-2">
                        <button
                          onClick={handleBack}
                          className="flex-1 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-855 font-bold text-xs rounded-xl uppercase transition-all duration-200 cursor-pointer text-center"
                        >
                          Back
                        </button>
                        <button
                          onClick={handlePlaceOrder}
                          className="flex-1 py-3.5 bg-black hover:bg-neutral-900 text-white font-bold text-xs rounded-xl uppercase transition-all duration-200 shadow-md cursor-pointer text-center"
                        >
                          {isorderProcess ? "Processing..." : "Place Order"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mx-auto container p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh] bg-white border border-neutral-200/50 rounded-3xl shadow-sm">
            <div className="mb-6 p-5 bg-neutral-50 rounded-full border border-neutral-200/40 shadow-inner">
              <svg
                className="w-16 h-16 text-neutral-450"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>

            <h2 className="text-xl font-black text-neutral-800 uppercase tracking-widest">
              Your bag is empty
            </h2>

            <p className="text-neutral-500 text-sm text-center mt-2 max-w-xs font-semibold leading-relaxed">
              Must add items to the cart before you proceed to check out.
            </p>

            <Link
              className="mt-6 px-8 py-4 rounded-2xl bg-black hover:bg-neutral-900 text-white font-black text-xs uppercase tracking-widest transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 cursor-pointer"
              href="/all-products"
            >
              <span>Return to Shop</span>
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
