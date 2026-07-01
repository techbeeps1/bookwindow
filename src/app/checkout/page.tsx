"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
// components
import { Navbar, Footer } from "@/components";
import MainNavbar from "@/components/main-navbar";
import { useRouter, useSearchParams } from "next/navigation";
import config from "@/app/config";
import axios from "axios";
import { Button, Input, Typography } from "@material-tailwind/react";
import Checkout from "@/components/Checkout";
import { ThankYouDialog } from "@/components/thank-you-popup";
import { NotificationDialog } from "@/components/notification";
import { CheckIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import FadeLoaderOverlay from "@/components/loader";

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
  const searchParams = useSearchParams();
  const stepParam = searchParams.get("step");
  const initialStep = steps.includes(stepParam || "") ? stepParam! : "cart";
  const [cartFetched, setCartFetched] = useState(false);
  const [session, setSession] = useState("");
  const [cartItems, setCartItems] = useState([] as CartItem[] | any[]);
  const [items_count, setItemsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCoupon, setShowCoupon] = useState(true);
  const [isCouponApplied, setIsCoupnApplied] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState("");
  const [couponError, setCouponError] = useState("");

  //for placeorder
  const [deliveryType, setDeliveryType] = useState("standard");
  const [payment_method, setPaymentMethod] = useState("cod");
  const [orderNumber, setOrderNumber] = useState<number>(0);
  const [open, setOpen] = useState(false);
  const errorPopup = () => setOpen(!open);
  const [isOpen, setIsOpen] = useState(false);
  const thankYouPopup = () => setIsOpen(!isOpen);
  const [activeTab, setActiveTab] = useState(initialStep);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [shippingData, setShippingData] = useState({});
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [customerData, setCustomerData] = useState({} as any);
  const [coupon_code, setCouponCode] = useState("");
  const [couponData, setCouponData] = useState({} as any);
  const [mainCategories, setMainCategories] = useState([] as any);
  const [isCartEmpty, setIsCartEmpty] = useState(false);
  // console.log("viewcart customer",customerData);

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
      // nextStep === "order" ? setShowCoupon(false) : setShowCoupon(true);
      setCompletedSteps((prev) =>
        prev.includes(activeTab) ? prev : [...prev, activeTab]
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
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (params.get("step") !== activeTab) {
      params.set("step", activeTab);
      router.replace(`${window.location.pathname}?${params.toString()}`);
    }
  }, [activeTab, router, searchParams]);

  const checkSession = async () => {
    const res = await fetch("/api/debug", {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json();
    setSession(data?.session_id);
    // console.log("Session info:", data);
  };

  useEffect(() => {
    const viewCart = async () => {
      setLoading(true);
      // try {
      //   const response = await axios({
      //     method: "get",
      //     url: `${config.apiUrl}api/cart/viewcart?session_id=${session}`,
      //     responseType: "json",
      //   });
      //   const data = response?.data;
      //   setCartItems(data?.items);
      //   setItemsCount(data?.items_count);
      // } catch (error) {
      //   console.error("Error loading cart:", error);
      //   setCartItems([]); // fallback to empty array
      // } finally {
      //   setLoading(false); // stop loader
      // }
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/cart/viewcart?session_id=${session}`,
          responseType: "json",
        });
        const data = response?.data;
        setCartItems(data?.items || []);
        setItemsCount(data?.items_count || 0);
        setCartFetched(true); // ✅ mark cart as ready
      } catch (error) {
        console.error("Error loading cart:", error);
        setCartItems([]);
        setItemsCount(0);
        setCartFetched(true); // ✅ mark cart as ready even on failure
      } finally {
        setLoading(false);
      }
    };
    if (session) {
      viewCart();
    }
  }, [session]);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {}, [session, cartItems, items_count, router]);

  const updateCartQuantity = async (productId: number, quantity: number) => {
    try {
      const response = await fetch(`${config.apiUrl}api/cart/cartupdate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          product_id: productId,
          session_id: session,
          quantity_change: quantity,
        }),
      });
      const result = await response.json();
      // setCartData(result);
      // console.log("updated:", result);
      if (result?.message == "Quantity cannot be less than 1") {
        removeItem(productId);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const removeCartItem = async (productId: number) => {
    try {
      const response = await fetch(`${config.apiUrl}api/cart/remove`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          product_id: productId,
          session_id: session,
        }),
      });
      const result = await response.json();
      if (result?.success) {
        // setItemsCount(items_count - 1);
      }
      // setCartData(result);
      // console.log("remove:", result);
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const updateQuantity = (id: number, action: "increment" | "decrement") => {
    updateCartQuantity(id, action === "increment" ? +1 : -1);
    if (couponError) {
      setCouponError("");
    }
    action === "increment"
      ? setItemsCount(items_count + 1)
      : setItemsCount(items_count - 1);
    setCartItems((prev) =>
      prev.map((item) =>
        item.product_id === id
          ? {
              ...item,
              quantity:
                action === "increment"
                  ? item.quantity + 1
                  : Math.max(1, item.quantity - 1),
            }
          : item
      )
    );
  };

  // const removeItem = (id: number) => {
  //   removeCartItem(id);
  //   setCartItems(cartItems?.filter((item) => item.product_id !== id));
  //   setItemsCount(items_count - 1);
  // };
  const removeItem = (id: number) => {
    const itemToRemove = cartItems?.find((item) => item.product_id === id);
    if (!itemToRemove) return;

    const quantity = itemToRemove.quantity || 1;
    const newItemsCount = items_count - quantity;

    removeCartItem(id);
    setCartItems(cartItems?.filter((item) => item.product_id !== id));
    setItemsCount(newItemsCount);

    if (newItemsCount <= 0) {
      setIsCartEmpty(true);
    }
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
    quantity: number
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
    quantity: number
  ): string => {
    const value = calculateShippingValue(weightInGrams, quantity);
    // return deliveryType === "free" ? "Free" : `₹${value}`;
    return `₹${value}`;
  };

  const totalWeight = cartItems?.reduce(
    (acc, item) => acc + item.product_weight * item.quantity,
    0
  );

  const subtotal = cartItems?.reduce(
    (acc, item) => acc + item.product_price * item.quantity,
    0
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
        `${config.apiUrl}api/cart/coupon/${couponToCheck}`
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
    totalAmount: number
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
    try {
      const response = await fetch(`${config.apiUrl}api/cart/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...shippingData,
          session_id: session,
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
                  0
                ) - calculateTotal()
              : 0,
        }),
      });
      const result = await response.json();
      // console.log("Place order", result);

      if (result?.order_number && !result?.razorpay_order_id) {
        setOrderNumber(result?.order_number);
        router.push(`/view-orders?order_number=${result?.order_number}`);
        // thankYouPopup();
        setTimeout(() => {
          // setCartItems([]);
          setItemsCount(0);
          setIsCartEmpty(true);
          localStorage.removeItem("checkoutForm");
        }, 2000);
      }
      if (response.ok && result?.razorpay_order_id) {
        // 1. Load Razorpay script
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          alert("Failed to load Razorpay SDK");
          return;
        }

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
              }
            );

            const verifyData = await verifyRes.json();
            console.log("RAzorpay data", verifyData);
            if (verifyRes.ok) {
              setOrderNumber(result?.order?.order_number);
              router.push(`/view-orders?order_number=${result?.order?.order_number}`);
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
              alert("Payment Cancelled");
              // console.log("checkout data",result)
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
        localStorage.removeItem("checkoutForm");
      } else {
        if (result.message === "Your cart is empty") {
          setOpen(true);
          errorPopup();
        }
      }
    } catch (error) {
      setOpen(true);
      console.log("Error in:", error);
      errorPopup();
    }
  };

  return (
    <>
      <Navbar
        items_count={items_count}
        customerData={customerData || {}}
        isCartEmpty={isCartEmpty}
      />
      <MainNavbar />
      <section className="bg-white py-8 md:py-16 mb-4 min-h-screen">
        {!cartFetched ? (
          <FadeLoaderOverlay />
        ) : cartItems?.length > 0 && items_count > 0 ? (
          <div className="mx-auto container max-w-screen-xl p-4 2xl:px-0 bg-gray-100">
            <div className="flex items-center justify-center bg-white mx-4 mb-4 py-4">
              <div className="flex items-center w-full max-w-xl justify-between">
                {steps.map((step, idx) => {
                  const status = getStepStatus(step);
                  const isLast = idx === steps.length - 1;

                  return (
                    <div key={step} className="flex items-center w-full">
                      <div
                        onClick={() => goToStep(step)}
                        className={`flex items-center gap-2 ${
                          status === "upcoming"
                            ? "cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        <div
                          className={`w-6 h-6 flex items-center justify-center rounded-full border-2 ${
                            status === "active"
                              ? "border-black"
                              : status === "completed"
                              ? "border-green-600"
                              : "border-gray-300"
                          } bg-white`}
                        >
                          {status === "completed" ? (
                            <CheckIcon className="w-4 h-4 text-green-600" />
                          ) : (
                            <div
                              className={`w-2.5 h-2.5 rounded-full ${
                                status === "active" ? "bg-black" : "bg-gray-300"
                              }`}
                            ></div>
                          )}
                        </div>
                        <span
                          className={`font-medium capitalize ${
                            status === "active"
                              ? "text-black"
                              : status === "completed"
                              ? "text-green-600"
                              : "text-gray-500"
                          }`}
                        >
                          {step}
                        </span>
                      </div>

                      {!isLast && (
                        <div className="flex-grow h-px border-t border-dotted border-gray-400 mx-2"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {activeTab === "cart" && (
              <>
                <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl flex ml-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="bi bi-bag mt-2 mr-2"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 1a2.5 2.5 0 0 1 2.5 2.5V4h-5v-.5A2.5 2.5 0 0 1 8 1m3.5 3v-.5a3.5 3.5 0 1 0-7 0V4H1v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V4zM2 5h12v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" />
                  </svg>{" "}
                  My Cart - ({items_count} Items)
                </h2>
                <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
                  <div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-2xl p-4">
                    <div className="space-y-6">
                      {cartItems?.map((item) => {
                        const mainCategory = mainCategories?.find(
                          (main: any) => main.id === item?.category_id
                        );
                        const subcategory = mainCategory?.child?.find(
                          (sub: any) => sub.id === item?.sub_category_id
                        );
                        const couponCategories = couponData.category_id
                          ? JSON.parse(couponData.category_id)
                          : null;

                        const isCategoryMatched =
                          !couponCategories ||
                          couponCategories.includes(String(item.category_id));
                        return (
                          <div
                            key={item.product_id}
                            className="rounded-lg border border-gray-300 shadow-sm bg-white"
                          >
                            <div className="flex flex-wrap items-center justify-between p-4 gap-2">
                              <div>
                                {" "}
                                <Image
                                  className="h-40 w-40 object-contain rounded-lg"
                                  src={`${config.apiUrl}storage/${item.image}`}
                                  alt={item.product_name}
                                  width={150}
                                  height={200}
                                />
                                <div className="border border-1 px-4 mt-2 text-center">
                                  <p className="text-sm text-gray-900">
                                    Quantity - {item.quantity}
                                  </p>
                                  <div className="flex items-center gap-2 ml-4">
                                    <button
                                      onClick={() =>
                                        updateQuantity(
                                          item.product_id,
                                          "decrement"
                                        )
                                      }
                                      className="text-sm cursor-pointer"
                                    >
                                      <svg
                                        className="w-4 h-4 text-gray-600 dark:text-white"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          stroke="currentColor"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M5 12h14"
                                        />
                                      </svg>
                                    </button>
                                    <span className="w-10 text-center text-sm font-medium text-gray-900">
                                      {item.quantity}
                                    </span>
                                    <button
                                      onClick={() =>
                                        updateQuantity(
                                          item.product_id,
                                          "increment"
                                        )
                                      }
                                      className="text-sm cursor-pointer"
                                    >
                                      <svg
                                        className="w-4 h-4 text-gray-600 dark:text-white"
                                        aria-hidden="true"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          stroke="currentColor"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          d="M5 12h14m-7 7V5"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="w-full min-w-0 flex-1">
                                <Link
                                  href={`/product-detail/${item.product_slug}`}
                                  className="text-sm font-[400] text-black"
                                >
                                  {item.product_name}
                                </Link>
                                {/* <Typography
                                  color="blue"
                                  className="text-xs !font-semibold"
                                  {...({} as React.ComponentProps<
                                    typeof Typography
                                  >)}
                                >
                                  {subcategory?.name
                                    ? `${mainCategory?.name}/${subcategory?.name}`
                                    : `${mainCategory?.name || ""}`}
                                </Typography> */}

                                <div className="flex items-center justify-between gap-4 w-full border-t border-b py-1 mt-4">
                                  <p className="text-sm text-gray-900">
                                    Weight -{" "}
                                    {item.product_weight * item.quantity}/kg
                                  </p>

                                  {/* Price aligned to the end/right */}
                                  <div className="w-32 text-end">
                                    {isCategoryMatched &&
                                      isCouponApplied &&
                                      couponSuccess && (
                                        <p
                                          className={`text-sm font-bold text-gray-900 line ${
                                            isCategoryMatched
                                              ? "line-through text-red-700"
                                              : ""
                                          }`}
                                        >
                                          ₹{item.product_price * item.quantity}
                                        </p>
                                      )}
                                    <p className="text-base font-bold text-green-600">
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
                                              ? JSON.parse(
                                                  couponData.category_id
                                                )
                                              : null;

                                          const isCategoryMatch =
                                            !couponCategories ||
                                            couponCategories.includes(
                                              String(item.category_id)
                                            );

                                          if (isCategoryMatch) {
                                            return (
                                              couponData.type === "fixed"
                                                ? itemTotal -
                                                  parseFloat(couponData.value)
                                                : itemTotal -
                                                  (itemTotal *
                                                    parseFloat(
                                                      couponData.value
                                                    )) /
                                                    100
                                            ).toFixed(2);
                                          }
                                        }
                                        return itemTotal.toFixed(2);
                                      })()}
                                    </p>
                                  </div>
                                </div>
                                {isCouponApplied &&
                                  couponData &&
                                  couponSuccess && (
                                    <span className="mt-4 bg-pink-50 text-sm">
                                      {(() => {
                                        const couponCategories =
                                          couponData.category_id
                                            ? JSON.parse(couponData.category_id)
                                            : null;

                                        const isCategoryMatch =
                                          !couponCategories ||
                                          couponCategories.includes(
                                            String(item.category_id)
                                          );

                                        return isCategoryMatch
                                          ? "Coupon Applied"
                                          : "Coupon Not Applicable";
                                      })()}
                                    </span>
                                  )}
                              </div>
                            </div>
                            <div className="border border-top p-4 flex items-center justify-center">
                              <svg
                                onClick={() => removeItem(item.product_id)}
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.5"
                                stroke="currentColor"
                                className="size-6 text-gray-600 cursor-pointer"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                              </svg>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="min-w-4xl flex-1 p-4">
                    <div className="space-y-4 border border-gray-300  p-4 shadow-sm sm:p-6 bg-white rounded-xl">
                      <p className="text-xl font-semibold text-gray-900 whitespace-nowrap">
                        Order Summary
                      </p>
                      <div className="flex justify-between">
                        <p className="font-medium text-gray-900">
                          Add a coupon
                        </p>
                        <svg
                          onClick={() => setShowCoupon(!showCoupon)}
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="size-6 cursor-pointer"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m19.5 8.25-7.5 7.5-7.5-7.5"
                          />
                        </svg>
                      </div>
                      {showCoupon && (
                        <>
                          <div className="flex justify-between">
                            <div className="w-full">
                              <input
                                type="text"
                                value={coupon_code}
                                onChange={handleCouponChange}
                                name="coupon_code"
                                className="bg-gray-50 border border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                placeholder="Enter code"
                              />
                            </div>
                            <button
                              onClick={() => {
                                couponValidation(
                                  couponData && couponData.max_cart_amount,
                                  couponData && couponData.min_cart_amount,
                                  cartItems?.reduce(
                                    (acc, item) =>
                                      acc + item.product_price * item.quantity,
                                    0
                                  )
                                ),
                                  couponData && setIsCoupnApplied(true);
                              }}
                              className="rounded-lg bg-gray-800 px-5 py-2 ml-4 text-white hover:bg-gray-900 whitespace-nowrap"
                            >
                              Apply
                            </button>
                          </div>
                          <small>
                            {couponSuccess && isCouponApplied && couponData ? (
                              (() => {
                                const couponCategories = couponData.category_id
                                  ? JSON.parse(couponData.category_id)
                                  : null;

                                const isCategoryMatch =
                                  !couponCategories ||
                                  cartItems?.some((item) =>
                                    couponCategories.includes(
                                      String(item.category_id)
                                    )
                                  );
                                return (
                                  isCategoryMatch && (
                                    <span className="border border-10 rounded-xl px-2 border-black flex mt-2 text-green-400 w-20">
                                      {couponData?.code}
                                      <svg
                                        onClick={() => {
                                          setIsCoupnApplied(false),
                                            setCouponError(""),
                                            setCouponSuccess("");
                                        }}
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="size-5 cursor-pointer hover:bg-gray-300 rounded-xl"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                        />
                                      </svg>
                                    </span>
                                  )
                                );
                              })()
                            ) : (
                              <span className="text-red-400">
                                {couponError}
                              </span>
                            )}
                          </small>
                        </>
                      )}
                      <hr />
                      <div className="space-y-4">
                        <dl className="flex justify-between gap-4">
                          <dt className="text-base font-normal text-gray-500">
                            Subtotal
                          </dt>
                          <dd className="text-base font-medium text-gray-900">
                            ₹
                            {cartItems?.reduce(
                              (acc, item) =>
                                acc + item.product_price * item.quantity,
                              0
                            )}
                          </dd>
                        </dl>
                        <dl className="flex justify-between gap-4 border-t border-gray-200 pt-2">
                          <dt className="text-sm text-gray-600">
                            Discount <br></br>
                          </dt>
                          <dd className="text-base font-bold text-green-600">
                            {isCouponApplied && couponData && couponSuccess
                              ? cartItems?.reduce(
                                  (acc, item) =>
                                    acc + item.product_price * item.quantity,
                                  0
                                ) - calculateTotal()
                              : 0}
                          </dd>
                        </dl>
                        <dl className="flex justify-between gap-4">
                          <dt className="text-base font-normal text-gray-500">
                            Shipping
                          </dt>
                          <dd className="text-base font-medium text-gray-900">
                            {calculateShipping(
                              totalWeight,
                              cartItems?.reduce(
                                (acc, item) => acc + item.quantity,
                                0
                              )
                            )}
                          </dd>
                        </dl>
                        <dl className="flex justify-between gap-4 border-t border-gray-200 pt-2">
                          <dt className="text-base font-bold text-gray-900">
                            Total
                          </dt>
                          <dd className="text-base font-bold text-gray-900">
                            ₹
                            {calculateTotal() +
                              calculateShippingValue(
                                totalWeight,
                                cartItems?.reduce(
                                  (acc, item) => acc + item.quantity,
                                  0
                                )
                              )}
                          </dd>
                        </dl>
                      </div>
                      <br />

                      <button
                        className="w-full rounded-lg bg-gray-800 px-5 py-2.5 text-white hover:bg-gray-900 whitespace-nowrap"
                        // onClick={() => router.push("/checkout")}
                        onClick={handleNext}
                      >
                        Proceed to Checkout
                      </button>
                      <br />
                      <br />

                      <a
                        href="/all-products"
                        className="text-center text-sm font-medium text-gray-900 underline"
                      >
                        Continue Shopping
                      </a>
                    </div>
                  </div>
                </div>
              </>
            )}
            {activeTab === "shipping" && (
              <Checkout
                shippingData={shippingData}
                onBack={() => {
                  // Just navigating back — formValues should already be in state
                  setActiveTab("cart");
                }}
                onNext={(data: any) => {
                  setShippingData(data); // store validated form data
                  // console.log("data on next", data)
                  setActiveTab("order");
                }}
                onCustomerData={(customerData: any) => {
                  setCustomerData(customerData); // Capture data from child
                }}
                formData={shippingData}
              />
            )}
            {activeTab === "order" && (
              <div className="container mx-auto p-6 grid grid-cols-1 gap-8 mt-4 bg-gray-100">
                <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl flex ml-4">
                  Your Order
                </h2>
                <div className="bg-white border border-1 rounded-lg shadow-lg">
                  <div className="lg:flex lg:items-start xl:gap-8 ">
                    <div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-2xl p-4">
                      <div className="space-y-6">
                        {cartItems?.map((item) => {
                          const mainCategory = mainCategories?.find(
                            (main: any) => main.id === item?.category_id
                          );
                          const subcategory = mainCategory.child?.find(
                            (sub: any) => sub.id === item?.sub_category_id
                          );
                          const couponCategories = couponData.category_id
                            ? JSON.parse(couponData.category_id)
                            : null;

                          const isCategoryMatched =
                            !couponCategories ||
                            couponCategories.includes(String(item.category_id));
                          return (
                            <div key={item.product_id} className=" bg-white">
                              <div className="flex flex-wrap items-center justify-between p-4 gap-2">
                                <div>
                                  {" "}
                                  <Image
                                    className="h-40 w-40 object-contain rounded-lg"
                                    src={`${config.apiUrl}storage/${item.image}`}
                                    alt={item.product_name}
                                    width={150}
                                    height={200}
                                  />
                                  <div className="border border-1 px-4 mt-2 text-center">
                                    <p className="text-sm text-gray-900">
                                      Quantity - {item.quantity}
                                    </p>
                                    <div className="flex items-center gap-2 ml-4">
                                      <button
                                        onClick={() =>
                                          updateQuantity(
                                            item.product_id,
                                            "decrement"
                                          )
                                        }
                                        className="text-sm cursor-pointer"
                                      >
                                        <svg
                                          className="w-4 h-4 text-gray-600 dark:text-white"
                                          aria-hidden="true"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 12h14"
                                          />
                                        </svg>
                                      </button>
                                      <span className="w-10 text-center text-sm font-medium text-gray-900">
                                        {item.quantity}
                                      </span>
                                      <button
                                        onClick={() =>
                                          updateQuantity(
                                            item.product_id,
                                            "increment"
                                          )
                                        }
                                        className="text-sm cursor-pointer"
                                      >
                                        <svg
                                          className="w-4 h-4 text-gray-600 dark:text-white"
                                          aria-hidden="true"
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            stroke="currentColor"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 12h14m-7 7V5"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                <div className="w-full min-w-0 flex-1 space-y-4">
                                  <Link
                                    href={`/product-detail/${item.product_slug}`}
                                    className="text-sm font-[400] text-black"
                                  >
                                    {item.product_name}
                                  </Link>
                                  <p className="text-sm text-gray-900">
                                    Weight -{" "}
                                    {item.product_weight * item.quantity}/kg
                                  </p>
                                  {isCategoryMatched &&
                                    isCouponApplied &&
                                    couponSuccess && (
                                      <p
                                        className={`text-sm font-bold text-gray-900 line ${
                                          isCategoryMatched
                                            ? "line-through text-red-700"
                                            : ""
                                        }`}
                                      >
                                        ₹{item.subtotal}
                                      </p>
                                    )}
                                  <p className="text-base font-bold text-green-600">
                                    {/* ₹{item.subtotal} */}₹
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
                                            String(item.category_id)
                                          );

                                        if (isCategoryMatch) {
                                          return (
                                            couponData.type === "fixed"
                                              ? itemTotal -
                                                parseFloat(couponData.value)
                                              : itemTotal -
                                                (itemTotal *
                                                  parseFloat(
                                                    couponData.value
                                                  )) /
                                                  100
                                          ).toFixed(2);
                                        }
                                      }
                                      return itemTotal;
                                    })()}
                                  </p>
                                  {isCouponApplied &&
                                    couponData &&
                                    couponSuccess && (
                                      <span className="mt-4 bg-pink-50 text-sm">
                                        {(() => {
                                          const couponCategories =
                                            couponData.category_id
                                              ? JSON.parse(
                                                  couponData.category_id
                                                )
                                              : null;

                                          const isCategoryMatch =
                                            !couponCategories ||
                                            couponCategories.includes(
                                              String(item.category_id)
                                            );

                                          return isCategoryMatch
                                            ? "Coupon Applied"
                                            : "Coupon Not Applicable";
                                        })()}
                                      </span>
                                    )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full flex-1 p-4 max-w-4xl">
                      <div className="space-y-4 ">
                        <p className="text-xl font-semibold text-gray-900 whitespace-nowrap">
                          Order Summary
                        </p>
                        <div className="flex justify-between">
                          <p className="font-medium text-gray-900">
                            Add a coupon
                          </p>
                          <svg
                            onClick={() => setShowCoupon(!showCoupon)}
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6 cursor-pointer"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m19.5 8.25-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        </div>
                        {showCoupon && (
                          <>
                            <div className="flex justify-between">
                              <div className="w-full">
                                <input
                                  type="text"
                                  value={coupon_code}
                                  onChange={handleCouponChange}
                                  name="coupon_code"
                                  className="bg-gray-50 border border-gray-600 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                  placeholder="Enter code"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  couponValidation(
                                    couponData && couponData.max_cart_amount,
                                    couponData && couponData.min_cart_amount,
                                    subtotal
                                  ),
                                    couponData && setIsCoupnApplied(true);
                                }}
                                className="rounded-lg bg-gray-800 px-5 py-2 ml-4 text-white hover:bg-gray-900 whitespace-nowrap"
                              >
                                Apply
                              </button>
                            </div>
                            <small>
                              {couponSuccess &&
                              isCouponApplied &&
                              couponData ? (
                                (() => {
                                  const couponCategories =
                                    couponData.category_id
                                      ? JSON.parse(couponData.category_id)
                                      : null;

                                  const isCategoryMatch =
                                    !couponCategories ||
                                    cartItems?.some((item) =>
                                      couponCategories.includes(
                                        String(item.category_id)
                                      )
                                    );
                                  return (
                                    isCategoryMatch && (
                                      <span className="border border-10 rounded-xl px-2 border-black flex mt-2 text-green-400 w-20">
                                        {couponData?.code}
                                        <svg
                                          onClick={() => {
                                            setIsCoupnApplied(false),
                                              setCouponError(""),
                                              setCouponSuccess("");
                                          }}
                                          xmlns="http://www.w3.org/2000/svg"
                                          fill="none"
                                          viewBox="0 0 24 24"
                                          strokeWidth="1.5"
                                          stroke="currentColor"
                                          className="size-5 cursor-pointer hover:bg-gray-300 rounded-xl"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                          />
                                        </svg>
                                      </span>
                                    )
                                  );
                                })()
                              ) : (
                                <span className="text-red-400">
                                  {couponError}
                                </span>
                              )}
                            </small>
                          </>
                        )}

                        <hr />
                        <div className="space-y-4">
                          <dl className="flex justify-between gap-4">
                            <dt className="text-base font-normal text-gray-500">
                              Subtotal
                            </dt>
                            <dd className="text-base font-medium text-gray-900">
                              ₹{subtotal}
                            </dd>
                          </dl>
                          <dl className="flex justify-between gap-4 border-t border-gray-200 pt-2">
                            <dt className="text-sm text-gray-600">
                              Discount <br></br>
                              {isCouponApplied &&
                                couponData &&
                                couponSuccess && (
                                  <span className="border border-10 rounded-xl px-2 border-black flex mt-2">
                                    {couponData?.code}
                                    <svg
                                      onClick={() => setIsCoupnApplied(false)}
                                      xmlns="http://www.w3.org/2000/svg"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      strokeWidth="1.5"
                                      stroke="currentColor"
                                      className="size-5 ml-2 cursor-pointer hover:bg-gray-300 rounded-xl"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                                      />
                                    </svg>
                                  </span>
                                )}
                            </dt>
                            <dd className="text-base font-bold text-green-600">
                              {isCouponApplied && couponData && couponSuccess
                                ? cartItems?.reduce(
                                    (acc, item) =>
                                      acc + item.product_price * item.quantity,
                                    0
                                  ) - calculateTotal()
                                : 0}
                            </dd>
                          </dl>
                          <dl className="flex justify-between gap-4">
                            <dt className="text-base font-normal text-gray-500">
                              Shipping
                            </dt>
                            <dd className="text-base font-medium text-gray-900">
                              {calculateShipping(
                                totalWeight,
                                cartItems?.reduce(
                                  (acc, item) => acc + item.quantity,
                                  0
                                )
                              )}
                            </dd>
                          </dl>

                          <dl className="flex justify-between gap-4 border-t border-gray-200 pt-2">
                            <dt className="text-base font-bold text-gray-900">
                              Total
                            </dt>
                            <dd className="text-base font-bold text-gray-900">
                              ₹
                              {
                                // deliveryType === "free"
                                //   ? calculateTotal()
                                //   :
                                calculateTotal() +
                                  calculateShippingValue(
                                    totalWeight,
                                    cartItems?.reduce(
                                      (acc, item) => acc + item.quantity,
                                      0
                                    )
                                  )
                              }
                            </dd>
                          </dl>
                        </div>
                        {/* Delivery Type */}
                        <div className="space-y-4">
                          <h3 className="font-semibold">Delivery Type</h3>
                          <div>
                            <label className="block mb-2">
                              <input
                                type="radio"
                                name="delivery"
                                checked={deliveryType === "express"}
                                onChange={() => setDeliveryType("express")}
                              />{" "}
                              Express Delivery
                            </label>
                            <label className="block">
                              <input
                                type="radio"
                                name="delivery"
                                checked={deliveryType === "standard"}
                                onChange={() => setDeliveryType("standard")}
                              />{" "}
                              Standard Delivery
                            </label>
                          </div>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-4">
                          <h3 className="font-semibold">Payment Method</h3>
                          <div>
                            <label className="block mb-2">
                              <input
                                type="radio"
                                name="payment"
                                checked={payment_method === "cod"}
                                onChange={() => setPaymentMethod("cod")}
                              />{" "}
                              Cash On Delivery
                            </label>
                            <label className="block">
                              <input
                                type="radio"
                                name="payment"
                                checked={payment_method === "razorpay"}
                                onChange={() => setPaymentMethod("razorpay")}
                              />{" "}
                              Razorpay
                            </label>
                          </div>
                        </div>
                        {open && (
                          <NotificationDialog
                            open={open}
                            handleOpen={errorPopup}
                          ></NotificationDialog>
                        )}
                        {isOpen && (
                          <ThankYouDialog
                            open={isOpen}
                            handleOpen={thankYouPopup}
                            orderNumber={orderNumber}
                          ></ThankYouDialog>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between p-4 gap-4">
                    <button
                      onClick={handleBack}
                      className="w-80 bg-gray-800 text-white p-3 rounded hover:bg-gray-900"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      className="w-80 bg-gray-800 text-white p-3 rounded hover:bg-gray-900"
                    >
                      Place Order
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white p-6 shadow-md rounded-xl">
            <div className="mb-6">
              <Image
                src="/image/bag.png"
                alt="Empty Cart"
                width={768}
                height={768}
                className="h-80 w-80"
              />
            </div>

            <h2 className="text-2xl font-semibold text-gray-700">
              Your Cart is{" "}
              <span className="text-red-800 font-bold">Empty!</span>
            </h2>

            <p className="text-gray-500 mt-2">
              Must add items on the cart before you proceed to check out.
            </p>

            <Link
              className="mt-6 px-6 py-3 rounded-full shadow-lg flex bg-red-800"
              href={"/all-products"}
              // onClick={() => router.push("/all-products")}
              // {...({} as React.ComponentProps<typeof Button>)}
            >
              <svg
                className="w-6 h-6 text-white "
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 4h1.5L9 16m0 0h8m-8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-8.5-3h9.25L19 7H7.312"
                />
              </svg>
              <p className="mt-1 text-white"> Return to Shop</p>
            </Link>
          </div>
        )}
      </section>
      <Footer />
    </>
  );
}
