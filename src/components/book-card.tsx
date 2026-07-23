"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAppDispatch } from "@/hooks/useStore";
import ProductDialog from "./product-detail-popup";
import Link from "next/link";
import { useAddToCartMutation } from "@/lib/api/cartApi";
import { useSession } from "@/hooks/useSession";
import { ImageBook } from "./ImageBook";
import { useCart } from "@/hooks/useCart";
import { openCartDrawer } from "@/lib/slices/uiSlice";
import { motion } from "framer-motion";
import { useAddToWishlistMutation, useViewWishlistIdQuery } from "@/lib/api/wishlistApi";
import toast from "react-hot-toast";
import { HiOutlineShoppingCart } from "react-icons/hi2";
import { AiOutlineEye } from "react-icons/ai";
import { LuHeart } from "react-icons/lu";


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

  // Add to cart animation states
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [cartButtonScale, setCartButtonScale] = useState(1);
  const [cartBounce, setCartBounce] = useState(false);
  const [addToWishlist, { isLoading: addWishlistLoading }] = useAddToWishlistMutation();
  const { data: wishlistIds, refetch: refetchWishlist } = useViewWishlistIdQuery()


  const wishlistSet = useMemo(
    () => new Set(wishlistIds?.data ?? []),
    [wishlistIds]
  );

  const isWishlisted = wishlistSet.has(id);

  async function handleWishlistClick() {
    await addToWishlist(id)
    await refetchWishlist()
    toast.success("Product added to wishlist")

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
        className="bg-white rounded-2xl border p-3 sm:p-5 flex flex-row items-center justify-between gap-3 sm:gap-6 shadow-sm hover:shadow-md transition-all w-full relative group"
      >
        {/* Book Cover Image */}
        <div className="w-28 xs:w-32 sm:w-36 flex-shrink-0 rounded-xl">
          <Link href={`/product-detail/${slug}`}>
            <ImageBook src={img} alt={title} size={viewMode === "list" ? "10px" : "30px"} />
          </Link>
        </div>

        {/* Book Information */}
        <div className="flex-1 min-w-0 space-y-1 sm:space-y-2 text-left">
          <div className="flex flex-wrap items-center justify-start gap-2">
            {(subcategoryName || category) && (
              <span className="text-[10px] sm:text-[11px] font-bold text-black bg-gray-100 px-2 py-0.5 rounded uppercase">
                {subcategoryName || category || "Publication"}
              </span>
            )}
          </div>

          <Link href={`/product-detail/${slug}`}>
            <h3 className="font-bold text-xs sm:text-base text-gray-900 hover:text-black transition-colors line-clamp-2 leading-tight">
              {formattedTitle}
            </h3>
          </Link>

          {desc && (
            <p className="text-xs text-gray-600 line-clamp-2 max-w-xl hidden md:block">
              {desc?.replace(/<[^>]*>?/gm, '')}
            </p>
          )}

          {/* Pricing & Actions for Mobile (<640px) */}
          <div className="flex sm:hidden items-center justify-between pt-2 border-t border-gray-100 gap-2 mt-1">
            <div className="flex gap-1.5 items-center flex-wrap">
              {offPrice && (
                <span className="text-xs font-bold">
                  ₹{offPrice}
                </span>
              )}
              {price && price != 0 && price != offPrice && (
                <span className={`${offPrice ? "text-red-500 line-through text-[10px] font-bold" : "text-xs font-bold mr-1"}`}>
                  ₹{price}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {/* Add to Cart Button */}
              <button
                onClick={() => handleAddToCart(id, 1)}
                disabled={isLoading}
                className={`relative w-8 h-8 border border-gray-200 text-gray-700 bg-gray-100/80 hover:bg-black hover:text-white hover:border-black rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center overflow-hidden ${isAddedToCart ? "bg-green-600 border-green-600 text-white hover:bg-green-700 hover:border-green-700 shadow-md" : ""
                  }`}
                style={{
                  transform: `scale(${cartButtonScale})`,
                }}
                aria-label="Add to cart"
                title="Add to cart"
              >
                <div className="relative w-4 h-4 flex items-center justify-center">
                  {isLoading ? (
                    <HiOutlineShoppingCart size={20} />
                  ) : (
                    <HiOutlineShoppingCart size={20} />
                  )}
                </div>
              </button>

              {/* Quick View Button */}
              <button
                onClick={handleOpen}
                className="w-8 h-8 border border-gray-200 text-gray-700 bg-gray-100/80 hover:bg-black hover:text-white hover:border-black rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center"
                aria-label="Quick view product"
                title="Quick view"
              >
                <AiOutlineEye />

              </button>

              {/* Wishlist Toggle Heart Button */}
              <button
                onClick={handleWishlistClick}
                className="w-8 h-8 border border-gray-200 text-gray-500 bg-gray-100/80 hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center"
                title="Toggle Wishlist"
              >
                {isWishlisted ? (
                  <LuHeart className="w-4 h-4" />
                ) : (
                  <LuHeart className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Pricing & Action Buttons for Desktop (>=640px) */}
        <div className="hidden sm:flex sm:w-auto sm:flex-col items-center justify-center border-l border-gray-100 sm:pl-6 gap-4">
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
              className={`relative w-9 h-9 border border-gray-200 text-gray-700 bg-gray-100/80 hover:bg-black hover:text-white hover:border-black rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center overflow-hidden ${isAddedToCart ? "bg-green-600 border-green-600 text-white hover:bg-green-700 hover:border-green-700 shadow-md" : ""
                }`}
              style={{
                transform: `scale(${cartButtonScale})`,
              }}
              aria-label="Add to cart"
              title="Add to cart"
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                {isLoading ? (
                  <HiOutlineShoppingCart size={20} />
                ) : (
                  <HiOutlineShoppingCart size={20} />
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
              <AiOutlineEye />
            </button>

            {/* Wishlist Toggle Heart Button */}
            <button
              onClick={handleWishlistClick}
              className="w-9 h-9 border border-gray-200 text-gray-500 bg-gray-100/80 hover:bg-red-50 hover:text-red-500 hover:border-red-200 rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center"
              title="Toggle Wishlist"
            >
              {isWishlisted ? (
                <LuHeart className="w-4 h-4" />
              ) : (
                <LuHeart className="w-4 h-4" />
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
          <LuHeart size={18} />
        ) : (
          <LuHeart size={18} />
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
              className={`relative w-9 h-9 border border-gray-200 text-gray-700 bg-gray-100/80 hover:bg-black hover:text-white hover:border-black rounded-full transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm flex items-center justify-center overflow-hidden ${isAddedToCart ? "bg-green-600 border-green-600 text-white hover:bg-green-700 hover:border-green-700 shadow-md" : ""
                }`}
              style={{
                transform: `scale(${cartButtonScale})`,
              }}
              aria-label="Add to cart"
              title="Add to cart"
            >
              <div className="relative w-5 h-5 flex items-center justify-center">
                {isLoading ? (
                  <HiOutlineShoppingCart size={20} />
                ) : (
                  <HiOutlineShoppingCart size={20} />
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
              <AiOutlineEye size={20} />
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

