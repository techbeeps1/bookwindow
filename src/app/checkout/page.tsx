"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import config from "@/app/config";
import axios from "axios";
import Checkout from "@/components/Checkout";
import { ThankYouDialog } from "@/components/thank-you-popup";
import { NotificationDialog } from "@/components/notification";
import Link from "next/link";
import FadeLoaderOverlay from "@/components/loader";
import { useCart } from "@/hooks/useCart";
import { RiDeleteBinFill } from "react-icons/ri";
import { IoClose, IoBag } from "react-icons/io5";
import { HiOutlineTag } from "react-icons/hi2";
import { MdLocationPin } from "react-icons/md";
import { FaShieldAlt, FaTruck, FaUndo, FaCheckCircle, FaLock, FaQrcode, FaCheck } from "react-icons/fa";
import { SiGooglepay, SiPaytm } from "react-icons/si";
import CouponsDrawer, { AvailableCoupon } from "@/components/cart/CouponsDrawer";
import {
  useRemoveCartMutation,
  useUpdateCartMutation,
  useViewCartQuery,
} from "@/lib/api/cartApi";
import { useSession } from "@/hooks/useSession";
import {
  getIndianMobileValidationError,
  normalizeIndianPhoneNumber,
  isValidIndianPinCode,
} from "@/helper/helperfun";

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
  product_mrp?: number;
}
const steps = ["cart", "shipping", "order"];

function CheckoutSkeleton() {
  return (
    <div className="mx-auto container px-5 animate-pulse">
      {/* Step Progress Tracker Skeleton */}
      <div className="flex w-full items-center justify-center border-b border-neutral-200 mb-8 max-w-4xl mx-auto pb-3">
        <div className="flex w-full max-w-md justify-between items-center px-4">
          <div className="h-5 w-20 bg-neutral-200 rounded-md" />
          <div className="h-5 w-24 bg-neutral-100 rounded-md" />
          <div className="h-5 w-24 bg-neutral-100 rounded-md" />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Column Skeleton */}
        <div className="flex-1 space-y-4">
          {/* Top Announcement Banner Skeleton */}
          <div className="h-12 bg-neutral-100 rounded-xl w-full" />

          {/* Main Box Skeleton */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-neutral-100 pb-4">
              <div className="h-5 w-40 bg-neutral-200 rounded-md" />
              <div className="h-4 w-20 bg-neutral-100 rounded-md" />
            </div>

            {/* 2 Book Item Skeletons */}
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-4 pb-4 border-b border-neutral-100 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-16 h-20 bg-neutral-200 rounded-lg shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-neutral-200 rounded w-3/4" />
                    <div className="h-3 bg-neutral-100 rounded w-1/3" />
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="h-8 w-24 bg-neutral-100 rounded-lg" />
                  <div className="h-5 w-16 bg-neutral-200 rounded-md" />
                </div>
              </div>
            ))}
          </div>

          {/* Coupon Box Skeleton */}
          <div className="h-20 bg-neutral-50 rounded-2xl border border-neutral-200/80 p-4" />
        </div>

        {/* Right Column: Order Summary Skeleton */}
        <div className="w-full lg:max-w-md flex-1">
          <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-6 sm:p-8 space-y-6">
            <div className="h-5 w-32 bg-neutral-200 rounded-md" />

            <div className="space-y-3 pt-1">
              <div className="flex justify-between">
                <div className="h-4 w-28 bg-neutral-200 rounded" />
                <div className="h-4 w-16 bg-neutral-200 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-32 bg-neutral-100 rounded" />
                <div className="h-4 w-14 bg-neutral-100 rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-neutral-100 rounded" />
                <div className="h-4 w-12 bg-neutral-100 rounded" />
              </div>
              <div className="flex justify-between pt-4 border-t border-neutral-200">
                <div className="h-6 w-32 bg-neutral-300 rounded" />
                <div className="h-6 w-24 bg-neutral-300 rounded" />
              </div>
            </div>

            <div className="h-12 bg-neutral-200 rounded-xl w-full mt-4" />

            {/* Trust Badges Skeleton */}
            <div className="border-t border-neutral-200 pt-4 flex items-center justify-around">
              <div className="h-8 w-20 bg-neutral-100 rounded" />
              <div className="h-8 w-24 bg-neutral-100 rounded" />
              <div className="h-8 w-20 bg-neutral-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ShoppingCart() {
  const router = useRouter();
  const sessionId = useSession();
  const initialStep = "cart";
  const [cartFetched, setCartFetched] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState([] as CartItem[] | any[]);
  const [items_count, setItemsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showCoupon, setShowCoupon] = useState(true);
  const [isCouponApplied, setIsCoupnApplied] = useState(false);
  const [couponSuccess, setCouponSuccess] = useState("");
  const [couponError, setCouponError] = useState("");
  const [isCouponsDrawerOpen, setIsCouponsDrawerOpen] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<AvailableCoupon[]>([]);

  const { refetch } = useViewCartQuery(sessionId);

  const [deliveryType, setDeliveryType] = useState("standard");
  const [payment_method, setPaymentMethod] = useState("razorpay");
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

  const [loginUpdated, setLoginUpdated] = useState(0);


  const { data, isLoading: isCartLoading } = useCart();
  const [updateCart] = useUpdateCartMutation();
  const [removeCart] = useRemoveCartMutation();


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
  }, [sessionId, loginUpdated]);

  useEffect(() => {
    window.scrollTo(0, 0);
    try {
      const savedTab = sessionStorage.getItem("bw_checkout_tab");
      if (savedTab && ["cart", "shipping", "order"].includes(savedTab)) {
        setActiveTab(savedTab);
      }
    } catch (e) { }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem("bw_checkout_tab", activeTab);
    } catch (e) { }
  }, [activeTab]);

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
    // Wait until session is ready and cart data has actually arrived from API
    if (!sessionId || isCartLoading || data === undefined) {
      return;
    }

    try {
      setCartItems(data?.items || []);
      setItemsCount(data?.items_count || 0);
      setCartFetched(true);
    } catch (error) {
      console.error("Error loading cart:", error);
      setCartItems([]);
      setItemsCount(0);
      setCartFetched(true);
    }
    setLoading(false);
    setUpdatingItemId(null);
  }, [sessionId, data, isCartLoading]);

  const updateCartQuantity = async (productId: number, quantity: number) => {
    try {
      setUpdatingItemId(productId.toString());
      setLoading(true);
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
      setUpdatingItemId(productId.toString());
      setLoading(true);
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

    setUpdatingItemId(null);
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

  // Auto-validate applied coupon whenever cart items or subtotal change
  useEffect(() => {
    if (isCouponApplied && couponData && Object.keys(couponData).length > 0) {
      const currentSubtotal =
        cartItems?.reduce(
          (acc, item) => acc + item.product_price * item.quantity,
          0
        ) || 0;

      const minAmount =
        couponData.min_cart_amount !== null &&
          couponData.min_cart_amount !== undefined &&
          couponData.min_cart_amount !== ""
          ? parseFloat(couponData.min_cart_amount)
          : null;
      const maxAmount =
        couponData.max_cart_amount !== null &&
          couponData.max_cart_amount !== undefined &&
          couponData.max_cart_amount !== ""
          ? parseFloat(couponData.max_cart_amount)
          : null;

      if (minAmount !== null && currentSubtotal < minAmount) {
        setIsCoupnApplied(false);
        setCouponSuccess("");
        setCouponError(
          `Minimum cart amount should be ₹${minAmount} to apply this coupon`
        );
        return;
      }

      if (maxAmount !== null && currentSubtotal > maxAmount) {
        setIsCoupnApplied(false);
        setCouponSuccess("");
        setCouponError(
          `Maximum cart amount should be ₹${maxAmount} for this coupon`
        );
        return;
      }
    }
  }, [cartItems, isCouponApplied, couponData]);

  const couponValidation = (
    max_cart_amount: any,
    min_cart_amount: any,
    totalAmount: number
  ) => {
    const min =
      min_cart_amount !== null &&
        min_cart_amount !== undefined &&
        min_cart_amount !== ""
        ? parseFloat(min_cart_amount)
        : null;
    const max =
      max_cart_amount !== null &&
        max_cart_amount !== undefined &&
        max_cart_amount !== ""
        ? parseFloat(max_cart_amount)
        : null;

    if (min !== null && totalAmount < min) {
      setCouponSuccess("");
      setIsCoupnApplied(false);
      setCouponError(`Minimum cart amount should be ₹${min} to apply this coupon`);
      return false;
    }

    if (max !== null && totalAmount > max) {
      setCouponSuccess("");
      setIsCoupnApplied(false);
      setCouponError(`Maximum cart amount should be ₹${max} for this coupon`);
      return false;
    }

    // Category match check
    if (couponData && couponData.category_id) {
      try {
        const couponCategories = JSON.parse(couponData.category_id);
        const hasMatchingCategory =
          !couponCategories ||
          cartItems?.some((item) =>
            couponCategories.includes(String(item.category_id))
          );
        if (!hasMatchingCategory) {
          setCouponSuccess("");
          setIsCoupnApplied(false);
          setCouponError("Coupon is not applicable to items in your cart");
          return false;
        }
      } catch (e) { }
    }

    setCouponError("");
    setCouponSuccess("coupon is valid");
    setIsCoupnApplied(true);
    return true;
  };

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await axios.get(`${config.apiUrl}api/cart/coupons`);
        if (response.data?.success && Array.isArray(response.data?.coupons)) {
          setAvailableCoupons(response.data.coupons);
        }
      } catch (e) {
        // Fallback or quiet fail
      }
    };
    fetchCoupons();
  }, []);

  const getDynamicSavingsNudge = () => {
    if (isCouponApplied && couponData?.code) {
      return {
        type: "applied",
        title: `🎉 Coupon ${couponData.code} Applied!`,
        subtitle: "You are getting an extra discount on this order.",
        diff: 0,
        unlocked: true,
      };
    }

    if (!availableCoupons || availableCoupons.length === 0) {
      return null;
    }

    const offers: AvailableCoupon[] = availableCoupons;

    const sorted = [...offers].sort(
      (a, b) => Number(a.min_cart_amount || 0) - Number(b.min_cart_amount || 0)
    );

    const nextCoupon = sorted.find(
      (c) => Number(c.min_cart_amount || 0) > subtotal
    );

    const unlockedCoupons = sorted.filter(
      (c) => subtotal >= Number(c.min_cart_amount || 0)
    );
    const topUnlocked = unlockedCoupons[unlockedCoupons.length - 1];

    if (nextCoupon) {
      const minAmount = Number(nextCoupon.min_cart_amount);
      const diff = Math.ceil(minAmount - subtotal);
      const discountLabel =
        nextCoupon.type === "percent"
          ? `${nextCoupon.value}% OFF`
          : `Flat ₹${nextCoupon.value} OFF`;
      return {
        type: "nudge",
        title: `Add ₹${diff} more to get ${discountLabel}`,
        subtitle: `Unlock code ${nextCoupon.code} for maximum savings`,
        diff,
        target: minAmount,
        coupon: nextCoupon,
        unlocked: false,
      };
    } else if (topUnlocked) {
      const discountLabel =
        topUnlocked.type === "percent"
          ? `${topUnlocked.value}% OFF`
          : `Flat ₹${topUnlocked.value} OFF`;
      return {
        type: "unlocked",
        title: `🎉 ${discountLabel} Unlocked for your cart!`,
        subtitle: `Click below to apply coupon code ${topUnlocked.code}`,
        diff: 0,
        coupon: topUnlocked,
        unlocked: true,
      };
    }

    return {
      type: "general",
      title: "🎁 Extra Savings Available!",
      subtitle: "View all coupons to unlock instant discounts",
      diff: 0,
      unlocked: false,
    };
  };

  const getTopBannerMessage = () => {
    if (isCouponApplied && couponData?.code) {
      return (
        <span className="leading-snug text-emerald-800">
          <strong className="font-semibold text-emerald-700">Coupon Applied:</strong> Code{" "}
          <span className="font-mono font-bold bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300 text-xs">
            {couponData.code}
          </span>{" "}
          is active on your bag!
        </span>
      );
    }

    if (availableCoupons && availableCoupons.length > 0) {
      const topCoupon = availableCoupons[0];
      const discountText =
        topCoupon.type === "percent"
          ? `${topCoupon.value}% Extra Savings`
          : `Flat ₹${topCoupon.value} OFF`;

      const minAmountText =
        topCoupon.min_cart_amount && Number(topCoupon.min_cart_amount) > 0
          ? ` on orders above ₹${topCoupon.min_cart_amount}`
          : "";

      return (
        <span className="leading-snug">
          <strong className="font-semibold text-red-600">Special Offer:</strong> Use code{" "}
          <span className="font-mono font-bold text-neutral-900 bg-red-100/80 px-1.5 py-0.5 rounded border border-red-200 text-xs">
            {topCoupon.code}
          </span>{" "}
          to get {discountText}{minAmountText}
          {availableCoupons.length > 1 && (
            <span className="text-neutral-500 font-normal">
              {" "}&bull; +{availableCoupons.length - 1} more offer{availableCoupons.length > 2 ? "s" : ""}
            </span>
          )}
        </span>
      );
    }

    return (
      <span className="leading-snug">
        <strong className="font-semibold text-red-600">Special Offer:</strong> Have a coupon code? Apply it at checkout to get extra savings!
      </span>
    );
  };

  const applyCouponByCode = async (code: string): Promise<boolean> => {
    try {
      const cleanCode = code.trim().toUpperCase();
      const response = await axios.post(
        `${config.apiUrl}api/cart/coupon/${cleanCode}`
      );
      const coupon = response.data;
      if (!coupon || !coupon.code) {
        setCouponError("Invalid coupon code");
        return false;
      }
      setCouponCode(coupon.code);
      setCouponData(coupon);

      const isValid = couponValidation(
        coupon.max_cart_amount,
        coupon.min_cart_amount,
        subtotal
      );

      if (isValid) {
        setCouponSuccess("Coupon applied successfully!");
        setCouponError("");
        setIsCoupnApplied(true);
        setIsCouponsDrawerOpen(false);
        return true;
      }
      return false;
    } catch (err: any) {
      setCouponError(err?.response?.data?.message || "Invalid coupon code");
      return false;
    }
  };

  const removeCoupon = () => {
    setIsCoupnApplied(false);
    setCouponCode("");
    setCouponData({});
    setCouponSuccess("");
    setCouponError("");
  };




  const handlePlaceOrder = async () => {
    if (isorderProcess) return; // Prevent multiple submissions

    // Validate phone number before placing order
    const rawPhone = (shippingData as any)?.phone || "";
    const phoneError = getIndianMobileValidationError(rawPhone);
    if (phoneError) {
      alert(`${phoneError} Please update your delivery address with a valid mobile number.`);
      setActiveTab("shipping");
      return;
    }

    // Validate Indian PIN code
    const rawZip = ((shippingData as any)?.zip_code || "").toString().replace(/\D/g, "");
    if (!isValidIndianPinCode(rawZip)) {
      alert("Please provide a valid 6-digit Indian PIN code in your delivery address.");
      setActiveTab("shipping");
      return;
    }

    const cleanPhone = normalizeIndianPhoneNumber(rawPhone);

    setIsOrderProcess(true);
    try {
      const response = await fetch(`${config.apiUrl}api/cart/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...shippingData,
          phone: cleanPhone,
          zip_code: rawZip,
          country: "India",
          session_id: sessionId,
          shipping_method: deliveryType,
          payment_method: payment_method,
          delivery_amount: payment_method === "cod" ? 49 : 0,
          coupon_code:
            isCouponApplied && couponData && couponSuccess
              ? couponData?.code
              : "",
          discount_amount:
            isCouponApplied && couponData && couponSuccess
              ? parseFloat(Number((subtotal || 0) - calculateTotal()).toFixed(2))
              : 0,
        }),
      });
      const result = await response.json();
      // Reset the order process state after the request completes

      if (!response.ok && !result?.razorpay_order_id && !result?.order_number) {
        setIsOrderProcess(false);
        const msg = result?.message || result?.error || "Order placement failed. Please try again.";
        alert(msg);
        return;
      }

      const orderNum =
        result?.order_number ||
        result?.order?.order_number ||
        result?.data?.order_number ||
        result?.data?.order?.order_number;

      if (orderNum && !result?.razorpay_order_id) {
        setOrderNumber(orderNum);
        refetch();
        router.push(`/view-orders?order_number=${orderNum}`);
        return;
      }
      if (response.ok && result?.razorpay_order_id) {
        // 1. Load Razorpay script
        const isScriptLoaded = await loadRazorpayScript();
        if (!isScriptLoaded) {
          alert("Failed to load Razorpay SDK");
          setIsOrderProcess(false);
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
            setIsOrderProcess(true);
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
              const finalOrderNumber =
                verifyData?.order?.order_number ||
                verifyData?.order_number ||
                result?.order?.order_number ||
                result?.order_number;
              setOrderNumber(finalOrderNumber);
              router.push(
                `/view-orders?order_number=${finalOrderNumber}`,
              );
            } else {
              setIsOrderProcess(false);
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
              setIsOrderProcess(false);
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
        setIsOrderProcess(false);
        if (result.message === "Your cart is empty") {
          setOpen(true);
          errorPopup();
        }
      }
      if (result.error) {
        setIsOrderProcess(false);
        alert("Something went wrong. Please try again later.");
      }
    } catch (error) {
      setIsOrderProcess(false);
      setOpen(true);
      console.log("Error in:", error);
      errorPopup();
    }
  };

  return (
    <>
      <section className="bg-white py-8 md:py-16 mb-4 min-h-screen">
        {isorderProcess ? (
          <FadeLoaderOverlay />
        ) : !cartFetched || !data || isCartLoading ? (
          <CheckoutSkeleton />
        ) : cartItems?.length > 0 && items_count > 0 ? (
          <div className="mx-auto container px-5">
            {/* Step Progress Tracker */}
            <div className="flex w-full items-center justify-center border-b border-neutral-200 mb-8 max-w-4xl mx-auto pb-3">
              <div className="flex w-full max-w-2xl justify-between text-center select-none font-medium text-sm sm:text-base">
                {steps.map((step, idx) => {
                  const isCurrent = step === activeTab;
                  const isDone =
                    completedSteps.includes(step) ||
                    steps.indexOf(step) < steps.indexOf(activeTab);

                  const stepNames: Record<string, string> = {
                    cart: "Cart",
                    shipping: "Shipping",
                    order: "Payment",
                  };

                  return (
                    <div
                      key={step}
                      onClick={() => goToStep(step)}
                      className={`pb-2 px-4 transition-all duration-200 border-b-2 cursor-pointer ${isCurrent
                        ? "border-red-600 text-red-600 font-semibold"
                        : isDone
                          ? "border-neutral-900 text-neutral-900 font-medium"
                          : "border-transparent text-neutral-400 hover:text-neutral-600"
                        }`}
                    >
                      <span className="mr-1">{idx + 1}.</span> {stepNames[step] || step}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cart Tab */}
            {activeTab === "cart" && (
              <>
                {/* Top Perks / Announcement Banner (Dynamic from Admin Coupons) */}
                <div className={`mb-6 p-3 sm:p-3.5 border rounded-xl flex items-center justify-between gap-3 text-sm transition-colors ${isCouponApplied ? "bg-emerald-50 border-emerald-200/80" : "bg-red-50 border-red-200/80"
                  }`}>
                  <div className="text-neutral-800">
                    {getTopBannerMessage()}
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCouponsDrawerOpen(true)}
                    className={`hidden sm:inline-flex items-center gap-1 text-xs font-semibold hover:underline shrink-0 cursor-pointer transition-colors ${isCouponApplied ? "text-emerald-700 hover:text-emerald-800" : "text-red-600 hover:text-red-700"
                      }`}
                  >
                    <span>{isCouponApplied ? "Change Coupon" : "View Coupons"}</span>
                  </button>
                </div>

                {/* Title & subtitle */}
                <div className="mb-6 pb-4 border-b border-neutral-200 flex items-baseline justify-between">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                      Shopping Cart
                    </h1>
                    <p className="text-sm text-neutral-500 mt-1">
                      {items_count} {items_count === 1 ? "book" : "books"} in your bag
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCouponsDrawerOpen(true)}
                    className="sm:hidden inline-flex items-center gap-1 text-xs font-semibold text-red-600 underline cursor-pointer"
                  >
                    <HiOutlineTag className="w-3.5 h-3.5" />
                    <span>Offers</span>
                  </button>
                </div>

                <div className="mt-6 md:gap-8 lg:flex lg:items-start">
                  {/* Left Column: Cart Items List & Offers */}
                  <div className="me-auto w-full flex-none xl:max-w-3xl lg:max-w-[500px] space-y-5">
                    {/* Cart Items List Container */}
                    <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-6 shadow-sm space-y-4">
                      {cartItems?.map((item) => {
                        const price = item.product_price;
                        const mrp =
                          item.product_mrp && Number(item.product_mrp) > price
                            ? Number(item.product_mrp)
                            : Math.round(price * 1.3);
                        const discountPercent = Math.max(
                          0,
                          Math.round(((mrp - price) / mrp) * 100)
                        );
                        const savings = (mrp - price) * item.quantity;

                        return (
                          <div
                            key={item.product_id}
                            className={`${loading && updatingItemId == item.product_id
                              ? "opacity-30 animate-pulse cursor-not-allowed"
                              : ""
                              } transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100 last:border-b-0 last:pb-0`}
                          >
                            {/* Product Cover and Title */}
                            <div className="flex items-center gap-4 flex-1">
                              <div className="relative w-20 h-24 bg-neutral-50 border border-neutral-200/80 rounded-xl p-1.5 flex items-center justify-center flex-shrink-0">
                                <Image
                                  className="object-contain max-h-full max-w-full rounded-md"
                                  src={`${config.apiUrl}storage/app/public/${item.image}`}
                                  alt={item.product_name}
                                  width={80}
                                  height={100}
                                />
                              </div>
                              <div className="flex flex-col">
                                <Link
                                  href={`/product/${item.product_slug}`}
                                  className="text-sm sm:text-base font-bold text-neutral-900 hover:text-black line-clamp-2 transition-colors leading-snug"
                                >
                                  {item.product_name}
                                </Link>

                                {/* Price with MRP strikethrough & discount pill */}
                                <div className="mt-1 flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="text-base font-black text-neutral-950">
                                      ₹{price}
                                    </span>
                                    {mrp > price && (
                                      <>
                                        <span className="text-xs text-neutral-400 line-through font-semibold">
                                          ₹{mrp}
                                        </span>
                                        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded">
                                          {discountPercent}% OFF
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  {mrp > price && (
                                    <span className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                                      You save ₹{savings}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Adjuster, Item Subtotal, Trash */}
                            <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                              {/* Quantity Stepper */}
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(item.product_id, "decrement")
                                  }
                                  className="w-8 h-8 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold text-sm cursor-pointer transition-colors shadow-2xs active:scale-95"
                                  title="Decrease quantity"
                                >
                                  -
                                </button>
                                <span className="w-9 h-8 flex items-center justify-center bg-neutral-100/90 rounded-lg font-black text-xs text-neutral-900">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateQuantity(item.product_id, "increment")
                                  }
                                  className="w-8 h-8 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-100 flex items-center justify-center text-neutral-600 font-bold text-sm cursor-pointer transition-colors shadow-2xs active:scale-95"
                                  title="Increase quantity"
                                >
                                  +
                                </button>
                              </div>

                              {/* Item Total */}
                              <span className="text-sm sm:text-base font-black text-neutral-950 w-20 text-right">
                                ₹{(item.product_price * item.quantity).toFixed(2)}
                              </span>

                              {/* Remove Item */}
                              <button
                                type="button"
                                onClick={() => removeItem(item.product_id)}
                                className="text-neutral-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 cursor-pointer"
                                title="Remove Item"
                              >
                                <RiDeleteBinFill className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Dynamic Extra Savings Nudge Card */}
                    {(() => {
                      const nudge = getDynamicSavingsNudge();
                      if (!nudge) return null;
                      return (
                        <div className="p-4 rounded-xl bg-red-50/60 border border-red-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                          <div>
                            <p className="text-sm font-semibold text-neutral-900">
                              {nudge.title}
                            </p>
                            <p className="text-xs text-neutral-600 mt-0.5">
                              {nudge.subtitle}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsCouponsDrawerOpen(true)}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shrink-0 cursor-pointer"
                          >
                            View All Coupons &gt;
                          </button>
                        </div>
                      );
                    })()}

                    {/* Bottom Coupon Code Direct Input */}
                    <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-sm space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-neutral-800">
                          Coupons & Promo Codes
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsCouponsDrawerOpen(true)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 hover:underline cursor-pointer transition-colors"
                        >
                          View All {availableCoupons.length > 0 ? `(${availableCoupons.length} Available)` : ""} &gt;
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                            <HiOutlineTag className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            value={coupon_code}
                            onChange={handleCouponChange}
                            name="coupon_code"
                            className="w-full pl-10 pr-3 py-2.5 bg-neutral-50 border border-neutral-200 text-neutral-900 text-sm font-medium uppercase rounded-xl focus:outline-none focus:bg-white focus:border-neutral-900 transition-colors placeholder:normal-case placeholder:text-neutral-400 placeholder:font-normal"
                            placeholder="Enter coupon code"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!coupon_code || !coupon_code.trim()) {
                              setCouponError("Please enter a coupon code");
                              return;
                            }
                            applyCouponByCode(coupon_code);
                          }}
                          className="bg-black hover:bg-gray-900 text-white font-semibold text-sm px-6 py-2.5 rounded-xl whitespace-nowrap cursor-pointer transition-colors shadow-sm"
                        >
                          Apply
                        </button>
                      </div>

                      {/* Coupon Status Pill */}
                      {isCouponApplied && couponData?.code ? (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                          <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>Coupon &apos;{couponData.code}&apos; Applied!</span>
                          </div>
                          <button
                            type="button"
                            onClick={removeCoupon}
                            className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : couponError ? (
                        <p className="text-red-600 text-xs font-medium pl-1">
                          {couponError}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Right Column: Order Summary */}
                  <div className="w-full lg:max-w-md flex-1 mt-6 lg:mt-0">
                    <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 lg:sticky lg:top-8">
                      <p className="text-base font-bold text-neutral-900">
                        Order Summary
                      </p>

                      <div className="space-y-3.5 text-sm">
                        <div className="flex justify-between items-center text-neutral-600 font-normal">
                          <span>Cart Subtotal</span>
                          <span className="text-neutral-900 font-semibold">
                            ₹{subtotal.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-neutral-600 font-normal">
                          <span>Coupon Discount</span>
                          <span className="text-emerald-600 font-semibold">
                            - ₹
                            {isCouponApplied && couponData && couponSuccess
                              ? Number(subtotal - calculateTotal()).toFixed(2)
                              : "0.00"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center text-neutral-600 font-normal">
                          <span>Standard Shipping</span>
                          <span className="text-neutral-900 font-semibold">
                            {calculateShipping(totalWeight, items_count)}
                          </span>
                        </div>

                        <div className="flex justify-between items-baseline border-t border-neutral-200 pt-4">
                          <div>
                            <span className="text-base font-bold text-neutral-900">
                              Total Amount
                            </span>
                            <p className="text-xs text-neutral-500 font-normal">
                              Inclusive of all taxes
                            </p>
                          </div>
                          <span className="text-2xl font-bold text-neutral-900">
                            ₹
                            {(
                              calculateTotal() +
                              calculateShippingValue(totalWeight, items_count)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Action CTA Button */}
                      <button
                        onClick={handleNext}
                        className="w-full py-3.5 bg-black hover:bg-gray-900 text-white rounded-xl font-semibold text-sm transition-all duration-200 shadow cursor-pointer flex items-center justify-center"
                      >
                        Continue to Address &rarr;
                      </button>

                      <div className="text-center pt-2">
                        <Link
                          href="/all-products"
                          className="inline-block text-xs font-medium text-neutral-500 hover:text-black hover:underline transition-all"
                        >
                          &larr; Continue Shopping
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Shipping Tab */}
            {activeTab === "shipping" && (
              <div className="mt-6 md:gap-8 lg:flex lg:items-start">
                {/* Left Column: Redesigned Shipping Address Form */}
                <div className="me-auto w-full flex-none xl:max-w-3xl lg:max-w-[580px] space-y-5">
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
                </div>

                {/* Right Column: Order Summary & Item Snapshot */}
                <div className="w-full lg:max-w-md flex-1 mt-6 lg:mt-0">
                  <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 lg:sticky lg:top-8">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                      <p className="text-base font-bold text-neutral-900">
                        Order Summary
                      </p>
                      <span className="text-xs text-neutral-500 font-medium">
                        {items_count} {items_count === 1 ? "Item" : "Items"}
                      </span>
                    </div>

                    <div className="space-y-3.5 text-sm">
                      <div className="flex justify-between items-center text-neutral-600 font-normal">
                        <span>Cart Subtotal</span>
                        <span className="text-neutral-900 font-semibold">
                          ₹{subtotal.toFixed(2)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-neutral-600 font-normal">
                        <span>Coupon Discount</span>
                        <span className="text-emerald-600 font-semibold">
                          - ₹
                          {isCouponApplied && couponData && couponSuccess
                            ? Number(subtotal - calculateTotal()).toFixed(2)
                            : "0.00"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-neutral-600 font-normal">
                        <span>Standard Shipping</span>
                        <span className="text-neutral-900 font-semibold">
                          {calculateShipping(totalWeight, items_count)}
                        </span>
                      </div>

                      <div className="flex justify-between items-baseline border-t border-neutral-200 pt-4">
                        <div>
                          <span className="text-base font-bold text-neutral-900">
                            Total Amount
                          </span>
                          <p className="text-xs text-neutral-500 font-normal">
                            Inclusive of all taxes
                          </p>
                        </div>
                        <span className="text-2xl font-bold text-neutral-900">
                          ₹
                          {(
                            calculateTotal() +
                            calculateShippingValue(totalWeight, items_count)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items Mini preview in summary */}
                    <div className="border-t border-neutral-200 pb-1 pt-4 space-y-3">
                      <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
                        <span>Items ({items_count})</span>
                        <button
                          type="button"
                          onClick={() => setActiveTab("cart")}
                          className="text-red-600 hover:underline cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                        {cartItems?.slice(0, 3).map((item) => (
                          <div key={item.product_id} className="flex items-center gap-2.5 text-xs">
                            <div className="w-9 h-11 bg-white border border-neutral-200 rounded p-0.5 shrink-0 flex items-center justify-center">
                              <Image
                                src={`${config.apiUrl}storage/app/public/${item.image}`}
                                alt={item.product_name}
                                width={32}
                                height={40}
                                className="object-contain max-h-full"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-neutral-900 truncate text-xs leading-snug">
                                {item.product_name}
                              </p>
                              <p className="text-xs text-neutral-400">
                                Qty: {item.quantity}
                              </p>
                            </div>
                            <span className="font-semibold text-neutral-900 text-xs shrink-0">
                              ₹{(item.product_price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                        {cartItems.length > 3 && (
                          <p className="text-xs text-neutral-500 text-center pt-1">
                            +{cartItems.length - 3} more items
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Trust badges */}
                    <div className="border-t border-neutral-200 pt-4 flex items-center justify-around text-center text-neutral-600 text-xs font-medium">
                      <div className="flex flex-col items-center gap-1">
                        <FaShieldAlt className="w-4 h-4 text-emerald-600" />
                        <span>100% Genuine</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <FaLock className="w-4 h-4 text-blue-600" />
                        <span>Secure Checkout</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <FaTruck className="w-4 h-4 text-red-600" />
                        <span>Fast Delivery</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Review Tab */}
            {activeTab === "order" && (
              <div className="mt-4 sm:mt-6">
                {/* Title & subtitle */}
                <div className="mb-6 pb-4 border-b border-neutral-200">
                  <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                    Payment & Review
                  </h1>
                  <p className="text-sm text-neutral-500 mt-1">
                    Select your preferred payment method to complete your order
                  </p>
                </div>

                {/* Deliver To Summary Card */}
                <div className="mb-6 p-4 sm:p-5 bg-neutral-50/90 border border-neutral-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <MdLocationPin className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-neutral-500">
                          Deliver To:
                        </span>
                        <span className="text-sm font-bold text-neutral-900">
                          {(shippingData as any)?.first_name || "Guest"}{" "}
                          {(shippingData as any)?.last_name || ""}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                        {(shippingData as any)?.address || ""}
                        {(shippingData as any)?.address_2
                          ? `, ${(shippingData as any)?.address_2}`
                          : ""}
                        , {(shippingData as any)?.city || ""}
                        {(shippingData as any)?.state
                          ? `, ${(shippingData as any)?.state}`
                          : ""}{" "}
                        {(shippingData as any)?.zip_code || ""}
                      </p>
                      <p className="text-xs text-neutral-800 font-medium mt-0.5">
                        Phone: +91 {(shippingData as any)?.phone || ""}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("shipping")}
                    className="text-xs font-semibold text-neutral-800 bg-white border border-neutral-300 hover:bg-neutral-50 px-4 py-2 rounded-xl transition-all shadow-2xs shrink-0 cursor-pointer"
                  >
                    Change Address
                  </button>
                </div>

                <div className="mt-6 md:gap-8 lg:flex lg:items-start">
                  {/* Left Column: Payment Options & Items Preview */}
                  <div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-3xl space-y-6">
                    {/* Payment Options Container */}
                    <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                        <h2 className="text-sm font-bold text-neutral-900">
                          Select Payment Method
                        </h2>
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-700">
                          <FaLock className="w-3 h-3" />
                          100% Secure &amp; Encrypted
                        </span>
                      </div>

                      <div className="space-y-3 pt-1">
                        {/* Option 1: UPI / Online Payment (Recommended) */}
                        <div
                          onClick={() => setPaymentMethod("razorpay")}
                          className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${payment_method === "razorpay"
                            ? "border-black bg-stone-50/80 shadow-md ring-2 ring-black/10"
                            : "border-neutral-200 bg-white hover:border-neutral-300 opacity-75 hover:opacity-100"
                            }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3.5 flex-1 min-w-0">
                              {/* Custom Radio Circle */}
                              <div className="mt-0.5 shrink-0">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shadow-2xs ${payment_method === "razorpay"
                                    ? "border-black bg-white"
                                    : "border-neutral-300 bg-white"
                                    }`}
                                >
                                  {payment_method === "razorpay" && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-black" />
                                  )}
                                </div>
                              </div>

                              <div className="space-y-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-bold text-neutral-900">
                                    Pay via UPI / Cards / NetBanking
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">
                                    Recommended &bull; Save ₹49
                                  </span>
                                </div>
                                <p className="text-xs text-neutral-500 font-normal">
                                  Zero convenience fee &bull; Instant confirmation &bull; Faster dispatch
                                </p>

                                {/* Brand Badges */}
                                <div className="flex flex-wrap items-center gap-2 pt-2 text-xs font-medium text-neutral-600">
                                  <span className="px-2.5 py-1 bg-white border border-neutral-200 rounded-lg shadow-2xs font-mono font-bold text-neutral-900">
                                    UPI
                                  </span>
                                  <span className="px-2.5 py-1 bg-white border border-neutral-200 rounded-lg shadow-2xs flex items-center gap-1 text-neutral-800">
                                    <SiGooglepay className="w-4 h-4 text-[#4285F4]" /> Google Pay
                                  </span>
                                  <span className="px-2.5 py-1 bg-white border border-neutral-200 rounded-lg shadow-2xs flex items-center gap-1 text-neutral-800">
                                    PhonePe
                                  </span>
                                  <span className="px-2.5 py-1 bg-white border border-neutral-200 rounded-lg shadow-2xs flex items-center gap-1 text-neutral-800">
                                    <SiPaytm className="w-4 h-4 text-[#00BAF2]" /> Paytm
                                  </span>
                                  <span className="px-2 py-1 bg-neutral-100 rounded-lg text-neutral-500 text-xs">
                                    + Debit / Credit Cards
                                  </span>
                                </div>
                              </div>
                            </div>

                            {payment_method === "razorpay" && (
                              <span className="shrink-0 px-2.5 py-1 rounded-full bg-black text-white text-xs font-bold tracking-wide shadow-xs flex items-center gap-1.5">
                                <FaCheck className="w-2.5 h-2.5" /> Selected
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Option 2: Cash On Delivery (COD) */}
                        <div
                          onClick={() => setPaymentMethod("cod")}
                          className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${payment_method === "cod"
                            ? "border-black bg-stone-50/80 shadow-md ring-2 ring-black/10"
                            : "border-neutral-200 bg-white hover:border-neutral-300 opacity-75 hover:opacity-100"
                            }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3.5 flex-1 min-w-0">
                              {/* Custom Radio Circle */}
                              <div className="mt-0.5 shrink-0">
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shadow-2xs ${payment_method === "cod"
                                    ? "border-black bg-white"
                                    : "border-neutral-300 bg-white"
                                    }`}
                                >
                                  {payment_method === "cod" && (
                                    <div className="w-2.5 h-2.5 rounded-full bg-black" />
                                  )}
                                </div>
                              </div>

                              <div className="space-y-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-sm font-bold text-neutral-900">
                                    Cash on Delivery (COD)
                                  </span>
                                  <span className="px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-300 text-neutral-700 text-xs font-medium">
                                    + ₹49 COD Charge
                                  </span>
                                </div>
                                <p className="text-xs text-neutral-500 font-normal">
                                  Pay with cash or UPI QR when your books arrive at your doorstep
                                </p>
                              </div>
                            </div>

                            {payment_method === "cod" && (
                              <span className="shrink-0 px-2.5 py-1 rounded-full bg-black text-white text-xs font-bold tracking-wide shadow-xs flex items-center gap-1.5">
                                <FaCheck className="w-2.5 h-2.5" /> Selected
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items Preview Card */}
                    <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-6 shadow-sm space-y-4">
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                        <h2 className="text-sm font-bold text-neutral-800">
                          Items in this order ({items_count})
                        </h2>
                        <button
                          type="button"
                          onClick={() => setActiveTab("cart")}
                          className="text-xs font-semibold text-red-600 hover:underline cursor-pointer"
                        >
                          Edit Items
                        </button>
                      </div>

                      <div className="space-y-3">
                        {cartItems?.map((item) => (
                          <div
                            key={item.product_id}
                            className="flex items-center justify-between gap-3 text-xs"
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="w-12 h-14 bg-neutral-50 border border-neutral-200 rounded-lg p-1 flex items-center justify-center shrink-0">
                                <Image
                                  className="object-contain max-h-full max-w-full rounded"
                                  src={`${config.apiUrl}storage/app/public/${item.image}`}
                                  alt={item.product_name}
                                  width={48}
                                  height={56}
                                />
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-neutral-900 truncate text-xs leading-snug">
                                  {item.product_name}
                                </p>
                                <p className="text-xs text-neutral-400 mt-0.5">
                                  Qty: {item.quantity} &times; ₹{item.product_price}
                                </p>
                              </div>
                            </div>
                            <span className="font-semibold text-neutral-900 text-xs shrink-0">
                              ₹{(item.product_price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Trust Badges Container */}
                    <div className="border-t border-neutral-200 pt-4 flex items-center justify-around text-center text-neutral-600 text-xs font-medium">
                      <div className="flex flex-col items-center gap-1">
                        <FaShieldAlt className="w-4 h-4 text-emerald-600" />
                        <span>100% Genuine</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <FaLock className="w-4 h-4 text-blue-600" />
                        <span>Secure Checkout</span>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <FaTruck className="w-4 h-4 text-red-600" />
                        <span>Fast Delivery</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Order summary and CTA */}
                  <div className="w-full lg:max-w-md flex-1 mt-6 lg:mt-0">
                    <div className="bg-neutral-50/70 border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 lg:sticky lg:top-8">
                      <p className="text-base font-bold text-neutral-900">
                        Price Details
                      </p>

                      <div className="space-y-3.5 text-sm">
                        <div className="flex justify-between text-neutral-600 font-normal">
                          <span>Items Subtotal</span>
                          <span className="text-neutral-900 font-semibold">
                            ₹{subtotal.toFixed(2)}
                          </span>
                        </div>

                        <div className="flex justify-between text-neutral-600 font-normal">
                          <span>Coupon Discount</span>
                          <span className="text-emerald-600 font-semibold">
                            - ₹
                            {isCouponApplied && couponData && couponSuccess
                              ? Number(subtotal - calculateTotal()).toFixed(2)
                              : "0.00"}
                          </span>
                        </div>

                        <div className="flex justify-between text-neutral-600 font-normal">
                          <span>Shipping Fee</span>
                          <span className="text-neutral-900 font-semibold">
                            {calculateShipping(totalWeight, items_count)}
                          </span>
                        </div>

                        {payment_method === "cod" && (
                          <div className="flex justify-between text-neutral-600 font-normal">
                            <span>COD Handling Fee</span>
                            <span className="text-neutral-900 font-semibold">
                              + ₹49.00
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-baseline pt-4 border-t border-neutral-200">
                          <div>
                            <span className="text-base font-bold text-neutral-900">
                              Total Payable
                            </span>
                            <p className="text-xs text-neutral-500 font-normal">
                              Inclusive of all charges
                            </p>
                          </div>
                          <span className="text-2xl font-bold text-neutral-900">
                            ₹
                            {(
                              calculateTotal() +
                              calculateShippingValue(totalWeight, items_count) +
                              (payment_method === "cod" ? 49 : 0)
                            ).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="w-1/3 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold text-sm rounded-xl transition-all duration-200 cursor-pointer text-center"
                        >
                          &larr; Back
                        </button>
                        <button
                          type="button"
                          onClick={handlePlaceOrder}
                          disabled={isorderProcess}
                          className="w-2/3 py-3.5 bg-black hover:bg-gray-900 disabled:bg-gray-400 text-white font-semibold text-sm rounded-xl transition-all duration-200 shadow cursor-pointer text-center"
                        >
                          {isorderProcess
                            ? "Processing..."
                            : payment_method === "razorpay"
                              ? "Proceed To Pay"
                              : "Place Order (COD)"}
                        </button>
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
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mx-auto container p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-[60vh] bg-white border border-neutral-200/50 rounded-3xl shadow-sm">
            <div className="mb-6 p-5 bg-neutral-50 rounded-full border border-neutral-200/40 shadow-inner">
              <IoBag className="w-16 h-16 text-neutral-400" />
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

        {/* Coupons & Rewards Drawer Component */}
        <CouponsDrawer
          isOpen={isCouponsDrawerOpen}
          onClose={() => setIsCouponsDrawerOpen(false)}
          cartSubtotal={subtotal}
          appliedCouponCode={isCouponApplied && couponData?.code ? couponData.code : ""}
          onApplyCoupon={applyCouponByCode}
          onRemoveCoupon={removeCoupon}
        />
      </section>
    </>
  );
}
