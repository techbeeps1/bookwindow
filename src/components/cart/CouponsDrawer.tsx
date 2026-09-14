"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoClose, IoCheckmarkCircle, IoTicketOutline } from "react-icons/io5";
import { HiOutlineTag } from "react-icons/hi2";
import { FiArrowRight } from "react-icons/fi";
import axios from "axios";
import config from "@/app/config";
import { trackViewPromotions } from "@/helper/analytics";

export interface AvailableCoupon {
  id?: number;
  code: string;
  type: "fixed" | "percent";
  value: number | string;
  min_cart_amount?: number | string | null;
  max_cart_amount?: number | string | null;
  description?: string;
  valid_to?: string;
}

interface CouponsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartSubtotal: number;
  appliedCouponCode: string;
  onApplyCoupon: (code: string) => Promise<boolean | void> | void;
  onRemoveCoupon: () => void;
  isLoading?: boolean;
}

export default function CouponsDrawer({
  isOpen,
  onClose,
  cartSubtotal,
  appliedCouponCode,
  onApplyCoupon,
  onRemoveCoupon,
  isLoading = false,
}: CouponsDrawerProps) {
  const [couponInput, setCouponInput] = useState("");
  const [couponsList, setCouponsList] = useState<AvailableCoupon[]>([]);
  const [fetchingCoupons, setFetchingCoupons] = useState(false);
  const [applyingCode, setApplyingCode] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  // Fetch available coupons from API
  useEffect(() => {
    if (!isOpen) return;

    const fetchCoupons = async () => {
      setFetchingCoupons(true);
      try {
        const response = await axios.get(`${config.apiUrl}api/cart/coupons`);
        if (
          response.data?.success &&
          Array.isArray(response.data?.coupons)
        ) {
          const list = response.data.coupons;
          setCouponsList(list);
          if (list.length > 0) {
            trackViewPromotions(
              list.map((c: AvailableCoupon) => ({
                id: c.id,
                code: c.code,
                name: `${c.code} (${c.type === "percent" ? `${c.value}% OFF` : `₹${c.value} OFF`})`,
              }))
            );
          }
        } else {
          setCouponsList([]);
        }
      } catch (err) {
        setCouponsList([]);
      } finally {
        setFetchingCoupons(false);
      }
    };

    fetchCoupons();
  }, [isOpen]);

  const handleManualApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = couponInput.trim().toUpperCase();
    if (!cleanCode) {
      setActionError("Please enter a coupon code");
      return;
    }
    setActionError("");
    setApplyingCode(cleanCode);
    try {
      await onApplyCoupon(cleanCode);
      setCouponInput("");
    } catch (err: any) {
      setActionError(err?.message || "Failed to apply coupon");
    } finally {
      setApplyingCode(null);
    }
  };

  const handleSelectCoupon = async (code: string) => {
    setActionError("");
    setCouponInput(code);
    setApplyingCode(code);
    try {
      await onApplyCoupon(code);
    } catch (err: any) {
      setActionError(err?.message || "Failed to apply coupon");
    } finally {
      setApplyingCode(null);
    }
  };

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isOpen) {
      const prevBodyOverflow = document.body.style.overflow;
      const prevHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevBodyOverflow;
        document.documentElement.style.overflow = prevHtmlOverflow;
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Slide-over Container - strict height constraint to eliminate outer scrollbar */}
          <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 h-full overflow-hidden pointer-events-none">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="pointer-events-auto w-screen max-w-md bg-white shadow-2xl flex flex-col h-full max-h-screen overflow-hidden"
            >
              {/* Drawer Header */}
              <div className="shrink-0 p-5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
                <div className="flex items-center gap-2.5">
                  {/* <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shadow-2xs">
                    <IoTicketOutline className="w-5 h-5" />
                  </div> */}
                  <div>
                    <h2 className="text-base font-bold text-neutral-900 leading-tight">
                      Coupons & Offers
                    </h2>
                    <p className="text-xs text-neutral-500 font-medium">
                      Select or apply best offers for your order
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                  aria-label="Close coupons drawer"
                >
                  <IoClose className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content - single clean scrollable container */}
              <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
                {/* Active Cart Value Pill */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 text-white flex items-center justify-between shadow-sm border border-neutral-800">
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Current Cart Value
                    </p>
                    <p className="text-xl font-black mt-0.5 text-white">₹{cartSubtotal.toFixed(2)}</p>
                  </div>
                  {appliedCouponCode ? (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 border border-emerald-400/30 rounded-xl text-emerald-300 text-xs font-bold">
                      <IoCheckmarkCircle className="w-4 h-4" />
                      <span>{appliedCouponCode} Applied</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600 text-xs font-semibold">
                      <HiOutlineTag className="w-4 h-4 text-red-600" />
                      <span>Offers Available</span>
                    </div>
                  )}
                </div>

                {/* Manual Coupon Input */}
                <div>
                  <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block mb-2">
                    Have a coupon code?
                  </label>
                  <form onSubmit={handleManualApply} className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                        <HiOutlineTag className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => {
                          setCouponInput(e.target.value);
                          setActionError("");
                        }}
                        placeholder="ENTER COUPON CODE"
                        className="w-full pl-10 pr-3 py-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs font-bold tracking-wider uppercase text-neutral-900 placeholder:text-neutral-400 placeholder:normal-case placeholder:font-medium focus:bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={!couponInput.trim() || applyingCode !== null}
                      className="px-5 py-3 bg-black hover:bg-neutral-850 disabled:bg-neutral-200 disabled:text-neutral-400 text-white rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
                    >
                      {applyingCode === couponInput.trim().toUpperCase()
                        ? "Applying..."
                        : "Apply"}
                    </button>
                  </form>
                  {actionError && (
                    <p className="text-red-500 text-xs font-semibold mt-2 pl-1">
                      {actionError}
                    </p>
                  )}
                </div>

                {/* Currently Applied Banner (with remove action) */}
                {appliedCouponCode && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <IoCheckmarkCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-xs font-bold text-emerald-900">
                          Coupon <span className="font-mono uppercase underline">{appliedCouponCode}</span> Applied!
                        </p>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          Savings included in order summary
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onRemoveCoupon();
                        setActionError("");
                      }}
                      className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline px-2 py-1 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Offers List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold text-neutral-500 uppercase tracking-wider">
                      Best Offers For You
                    </h3>
                    <span className="text-[11px] font-bold text-neutral-400">
                      {couponsList.length} Available
                    </span>
                  </div>

                  {fetchingCoupons ? (
                    <div className="space-y-3 py-4">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-28 rounded-2xl bg-neutral-100 animate-pulse"
                        />
                      ))}
                    </div>
                  ) : couponsList.length === 0 ? (
                    <div className="p-8 text-center text-sm text-neutral-500 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                      <p className="font-semibold text-neutral-700">No active coupons available right now.</p>
                      <p className="text-xs text-neutral-400 mt-1">If you have a promo code, you can enter it above.</p>
                    </div>
                  ) : (
                    couponsList.map((coupon) => {
                      const isApplied =
                        appliedCouponCode &&
                        appliedCouponCode.toUpperCase() === coupon.code.toUpperCase();
                      const minCart = coupon.min_cart_amount
                        ? Number(coupon.min_cart_amount)
                        : 0;
                      const isQualified = cartSubtotal >= minCart;
                      const diff = Math.max(0, minCart - cartSubtotal);

                      return (
                        <div
                          key={coupon.code}
                          onClick={() => {
                            setCouponInput(coupon.code);
                            if (isQualified && !isApplied) {
                              handleSelectCoupon(coupon.code);
                            } else if (!isQualified) {
                              setActionError(`Add ₹${diff.toFixed(0)} more to your cart to unlock ${coupon.code}!`);
                            }
                          }}
                          className={`relative rounded-2xl border transition-all duration-200 overflow-hidden cursor-pointer ${
                            isApplied
                              ? "bg-emerald-50/40 border-emerald-300 ring-1 ring-emerald-300"
                              : isQualified
                                ? "bg-white border-neutral-300 hover:border-black hover:shadow-md active:scale-[0.99]"
                                : "bg-neutral-50/60 border-neutral-200/80 opacity-85 hover:border-neutral-300"
                          }`}
                        >
                          {/* Ticket edge decorative notches */}
                          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-neutral-100 border border-neutral-200" />
                          <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-neutral-100 border border-neutral-200" />

                          <div className="p-4 pl-5 pr-5">
                            {/* Top row: Code badge & Apply button */}
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 border border-dashed border-red-300 rounded-lg text-neutral-900 font-mono font-black text-xs tracking-wider">
                                <HiOutlineTag className="w-3.5 h-3.5 text-red-600" />
                                <span>{coupon.code}</span>
                              </div>

                              {isApplied ? (
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center gap-1 text-emerald-600 font-extrabold text-xs">
                                    <IoCheckmarkCircle className="w-4 h-4" />
                                    APPLIED
                                  </span>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onRemoveCoupon();
                                    }}
                                    className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ) : isQualified ? (
                                <button
                                  type="button"
                                  disabled={applyingCode === coupon.code}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectCoupon(coupon.code);
                                  }}
                                  className="px-4 py-1.5 bg-black hover:bg-red-600 active:bg-neutral-900 text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                                >
                                  {applyingCode === coupon.code ? "Applying..." : "APPLY"}
                                </button>
                              ) : (
                                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                                  Locked
                                </span>
                              )}
                            </div>

                            {/* Offer Description */}
                            <p className="text-xs font-bold text-neutral-800 leading-snug">
                              {coupon.description ||
                                (coupon.type === "percent"
                                  ? `Get ${coupon.value}% OFF on your cart`
                                  : `Flat ₹${coupon.value} OFF on your cart`)}
                            </p>

                            {/* Minimum requirement & terms */}
                            <div className="mt-2 text-[11px] text-neutral-500 font-medium">
                              {minCart > 0 ? (
                                <span>Applicable on orders of ₹{minCart} & above</span>
                              ) : (
                                <span>No minimum order value required</span>
                              )}
                            </div>

                            {/* Progress bar if not yet qualified */}
                            {!isQualified && minCart > 0 && (
                              <div className="mt-3 pt-3 border-t border-neutral-200/60">
                                <div className="flex items-center justify-between text-[11px] font-bold text-red-600 mb-1">
                                  <span>Add ₹{diff.toFixed(0)} more to unlock</span>
                                  <span>{Math.round((cartSubtotal / minCart) * 100)}%</span>
                                </div>
                                <div className="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden">
                                  <div
                                    className="bg-red-600 h-full rounded-full transition-all duration-300"
                                    style={{
                                      width: `${Math.min(100, Math.round((cartSubtotal / minCart) * 100))}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="shrink-0 p-4 border-t border-neutral-100 bg-neutral-50/70 flex items-center justify-between text-xs">
                <span className="text-neutral-500 font-medium">
                  Have more questions?
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  className="font-bold text-neutral-900 hover:text-red-600 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Continue Shopping</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
