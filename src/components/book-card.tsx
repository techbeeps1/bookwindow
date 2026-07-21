"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/hooks/useStore";
import ProductDialog from "./product-detail-popup";
import Link from "next/link";
import { useAddToCartMutation } from "@/lib/api/cartApi";
import { useSession } from "@/hooks/useSession";
import { ImageBook } from "./ImageBook";
import { useCart } from "@/hooks/useCart";
import { openCartDrawer } from "@/lib/slices/uiSlice";
import { motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";

interface BookCardProps {
  img: string;
  title: string;
  desc?: string;
  category?: string;
  price: string | number;
  offPrice?: string | number;
  slug?: string;
  id?: string | any;
  quantity?: number;
  subcategoryName?: string;
  mainCategoryName?: string;
  viewMode?: "grid" | "list";
  onItemsCountUpdate?: (count: number) => void;
}

export function BookCard({
  img,
  category,
  title,
  desc,
  price,
  offPrice,
  slug,
  id,
  quantity = 1,
  subcategoryName,
  mainCategoryName,
  viewMode = "grid",
  onItemsCountUpdate,
}: BookCardProps) {
  const sessionId = useSession();
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(!open);
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Add to cart animation states
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [cartButtonScale, setCartButtonScale] = useState(1);
  const [cartBounce, setCartBounce] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && id) {
      const storedWishlist = localStorage.getItem("wishlist");
      const wishlist = storedWishlist ? JSON.parse(storedWishlist) : [];
      setIsWishlisted(wishlist.includes(id));
    }
  }, [id]);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const storedWishlist = localStorage.getItem("wishlist");
      let wishlist = storedWishlist ? JSON.parse(storedWishlist) : [];
      if (wishlist.includes(id)) {
        wishlist = wishlist.filter((itemId: string) => itemId !== id);
        setIsWishlisted(false);
      } else {
        wishlist.push(id);
        setIsWishlisted(true);
      }
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
    }
  };

  const [addToCart, { isLoading }] = useAddToCartMutation();
  const dispatch = useAppDispatch();
  const { refetch } = useCart();

  const handleAddToCart = async (productId: string, qty: number) => {
    try {
      setCartButtonScale(0.85);
      
      await addToCart({
        session_id: sessionId,
        product_id: productId,
        quantity: qty,
      }).unwrap();

      setIsAddedToCart(true);
      setCartBounce(true);
      setTimeout(() => setCartButtonScale(1), 150);
      setTimeout(() => setCartBounce(false), 600);

      await refetch();
      dispatch(openCartDrawer());

      setTimeout(() => {
        setIsAddedToCart(false);
      }, 2000);

    } catch (error) {
      console.error(error);
      setCartButtonScale(1);
      setIsAddedToCart(false);
    }
  };

  const maxLength = 50;
  const formattedTitle = title?.replace(/#COMMA#/g, ",");
  const limitedTitle =
    formattedTitle?.length > maxLength
      ? formattedTitle.substring(0, maxLength) + "..."
      : formattedTitle;

  // RENDER LIST VIEW
  if (viewMode === "list") {
    return (
      <motion.div
      
        className="bg-white rounded-2xl border  p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all w-full relative group"
      >
        {/* Book Cover Image */}
        <div className="w-28 sm:w-36 flex-shrink-0  rounded-xl">
          <Link href={`/product-detail/${slug}`}>
            <ImageBook src={img} alt={title} size={ viewMode === "list" ? "16px" : "30px" } />
          </Link>
        </div>

        {/* Book Information */}
        <div className="flex-1 space-y-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {(subcategoryName || category) && (
              <span className="text-[11px] font-bold text-black bg-gray-100 px-2.5 py-0.5 rounded uppercase">
                {subcategoryName || category || "Publication"}
              </span>
            )}
            <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded flex items-center gap-1">
              <FiCheckCircle className="w-3 h-3" /> In Stock
            </span>
          </div>

          <Link href={`/product-detail/${slug}`}>
            <h3 className="font-bold text-base text-gray-900 hover:text-black transition-colors">
              {formattedTitle}
            </h3>
          </Link>

          {desc && (
            <p className="text-xs text-gray-600 line-clamp-2 max-w-xl hidden md:block">
              {desc?.replace(/<[^>]*>?/gm, '')}
            </p>
          )}
        </div>

        {/* Pricing & Action Buttons */}
        <div className="w-full sm:w-auto flex sm:flex-col items-center justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6 gap-4">
          <div className="flex gap-2 justify-between items-center">
            {offPrice && (
              <span className="text-sm font-bold">
                ₹{offPrice}
              </span>
            )}
            {price && price != 0 && price != offPrice && (
              <span className={`${offPrice ? "text-red-500 line-through text-xs font-bold" : "text-xs font-bold mr-2"}`}>
                ₹{price}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Add to Cart Button */}
            <button
              onClick={() => handleAddToCart(id, 1)}
              disabled={isLoading}
              className={`relative w-9 h-9 border border-gray-200 text-gray-700 bg-gray-100/80 hover:bg-black hover:text-white hover:border-black rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center overflow-hidden ${
                isAddedToCart ? "bg-green-600 border-green-600 text-white hover:bg-green-700 hover:border-green-700 shadow-md" : ""
              }`}
              style={{
                transform: `scale(${cartButtonScale})`,
              }}
              aria-label="Add to cart"
              title="Add to cart"
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5"
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
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className={`w-5 h-5 transition-all duration-300 ${
                      isAddedToCart ? "scale-110 text-white" : ""
                    } ${cartBounce ? "animate-bounce" : ""}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                    />
                  </svg>
                )}
              </div>
            </button>

            {/* Quick View Button */}
            <button
              onClick={handleOpen}
              className="w-9 h-9 border border-gray-200 text-gray-700 bg-gray-100/80 hover:bg-black hover:text-white hover:border-black rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center"
              aria-label="Quick view product"
              title="Quick view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </button>

            {/* Wishlist Toggle Heart Button */}
            <button
              onClick={handleWishlistClick}
              className="w-9 h-9 border border-gray-200 text-gray-500 bg-gray-100/80 hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center"
              title="Toggle Wishlist"
            >
              {isWishlisted ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-red-500 transition-transform scale-110 drop-shadow-sm"
                >
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="currentColor"
                  className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Product Quick View Dialog */}
        {open && (
          <ProductDialog
            open={open}
            handleOpen={handleOpen}
            slug={slug}
          />
        )}
      </motion.div>
    );
  }

  // RENDER GRID VIEW (DEFAULT)
  return (
    <motion.div
      layout

      className="group relative bg-white rounded-2xl border border-gray-200/80 hover:border-gray-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
    >
      
      {/* Floating Wishlist Heart Icon */}
      <button
        onClick={handleWishlistClick}
        className="absolute top-3 right-3 z-20 w-9 h-9 bg-white/95 backdrop-blur-md hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200/80 hover:border-red-200 active:scale-90 flex items-center justify-center"
        aria-label="Toggle wishlist"
        title="Toggle Wishlist"
      >
        {isWishlisted ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-red-500 transition-transform scale-110 drop-shadow-sm"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
        )}
      </button>

      {/* Top Left Sale Tag */}
      {price !== offPrice && (
        <span className="text-xs uppercase bg-black py-[5px] px-5 w-fit text-white rounded-[4px] font-sans absolute top-3 left-3 z-20">
          Sale
        </span>
      )}

      {/* Book Cover Image Container */}
      <div className="relative pt-4 px-4 bg-gray-50/60 group-hover:bg-gray-50 transition-colors">
        <Link href={`/product-detail/${slug}`}>
          <div className="w-full flex justify-center transform transition-transform duration-300">
            <ImageBook src={img} alt={title} size="30px" />
          </div>
        </Link>
      </div>

      {/* Details & Bottom Bar */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          <Link href={`/product-detail/${slug}`}>
            <h3 className="font-bold text-gray-900 text-sm line-clamp-2 hover:text-black transition-colors mb-3">
              {limitedTitle}
            </h3>
          </Link>
        </div>

        {/* Price & Action Buttons */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="flex gap-2 justify-between items-center">
            {offPrice && (
              <span className="text-sm font-bold">
                ₹{offPrice}
              </span>
            )}
            {price && price != 0 && price != offPrice && (
              <span className={`${offPrice ? "text-red-500 line-through text-xs font-bold" : "text-xs font-bold mr-2"}`}>
                ₹{price}
              </span>
            )}
          </div>

          <div className="flex gap-2 items-center">
            {/* Add to Cart Button */}
            <button
              onClick={() => handleAddToCart(id, 1)}
              disabled={isLoading}
              className={`relative w-9 h-9 border border-gray-200 text-gray-700 bg-gray-100/80 hover:bg-black hover:text-white hover:border-black rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center overflow-hidden ${
                isAddedToCart ? "bg-green-600 border-green-600 text-white hover:bg-green-700 hover:border-green-700 shadow-md" : ""
              }`}
              style={{
                transform: `scale(${cartButtonScale})`,
              }}
              aria-label="Add to cart"
              title="Add to cart"
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                {isLoading ? (
                  <svg
                    className="animate-spin h-5 w-5"
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
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className={`w-5 h-5 transition-all duration-300 ${
                      isAddedToCart ? "scale-110 text-white" : ""
                    } ${cartBounce ? "animate-bounce" : ""}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                    />
                  </svg>
                )}
              </div>
            </button>

            {/* Quick View Button */}
            <button
              onClick={handleOpen}
              className="w-9 h-9 border border-gray-200 text-gray-700 bg-gray-100/80 hover:bg-black hover:text-white hover:border-black rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center"
              aria-label="Quick view product"
              title="Quick view"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.8}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Product Quick View Dialog */}
      {open && (
        <ProductDialog
          open={open}
          handleOpen={handleOpen}
          slug={slug}
        />
      )}
    </motion.div>
  );
}

export default BookCard;

