"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CartPopup } from "@/components/cart-popup";
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
} from "@material-tailwind/react";
import ProductDialog from "./product-detail-popup";
import Link from "next/link";
import { useAddToCartMutation } from "@/lib/api/cartApi";
import { useSession } from "@/hooks/useSession";
import { ImageBook } from "./ImageBook";

interface BookCardProps {
  img: string;
  title: string;
  desc: string;
  category: string;
  price: string;
  offPrice?: string;
  slug?: string;
  id?: string | any;
  quantity: number;
  subcategoryName?: string;
  mainCategoryName?: string;
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
  quantity,
  subcategoryName,
  mainCategoryName,
  onItemsCountUpdate,
}: BookCardProps) {
  const sessionId = useSession();
  const [showPopup, setShowPopup] = useState(false);
  const [open, setOpen] = React.useState(false);
  const popupRef = useRef(null as any);
  const handleOpen = () => setOpen(!open);

  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && id) {
      const storedWishlist = localStorage.getItem("wishlist");
      const wishlist = storedWishlist ? JSON.parse(storedWishlist) : [];
      setIsWishlisted(wishlist.includes(id));
    }
  }, [id]);

  const handleWishlistClick = () => {
    if (typeof window !== "undefined") {
      const customer = localStorage.getItem("customer");
      if (!customer) {
        setShowWishlistModal(true);
        return;
      }
      
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
  const handleAddToCart = async (productId: string, quantity: number) => {
    try {
      await addToCart({
        session_id: sessionId,
        product_id: productId,
        quantity: quantity,
      }).unwrap();
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  const maxLength = 50; // Change this to your desired limit
  const formattedTitle = title?.replace(/#COMMA#/g, ",");

  const limitedTitle =
    formattedTitle?.length > maxLength
      ? formattedTitle.substring(0, maxLength) + "..."
      : formattedTitle;

  return (
    <div className="relative flex flex-col bg-transparent text-gray-700  mb-4 border-1 overflow-hidden">

      <Link href={`/product-detail/${slug}`} className="">
      <ImageBook src={img} alt={title} size="small" />
      </Link>

      {/* Floating Wishlist Icon */}
      <button
        onClick={handleWishlistClick}
        className="absolute top-[15px] right-[15px] z-10 p-2 bg-white hover:bg-gray-100 text-gray-700 rounded-full shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center border border-gray-100"
        aria-label="Toggle wishlist"
      >
        {isWishlisted ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5 text-red-500"
          >
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5 text-gray-600 hover:text-red-500 transition-colors"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
        )}
      </button>

      <div {...({} as React.ComponentProps<typeof CardBody>)} className="p-2">
        {price !== offPrice && (
          <p className="text-xs uppercase bg-black py-[5px] px-5 w-fit text-white rounded-[4px] font-sans absolute top-[15px] left-[15px] ">
            Sale
          </p>
        )}

        <Link href={`/product-detail/${slug}`}>
          <Typography
            variant="h6"
            color="blue-gray"
            className="font-bold normal-case text-sm mb-3"
            {...({} as React.ComponentProps<typeof Typography>)}
          >
            {limitedTitle}
          </Typography>
        </Link>
        
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {" "}
            {price !== offPrice && (
              <Typography
                variant="h5"
                color="red"
                className={offPrice ? "line-through text-xs" : ""}
                {...({} as React.ComponentProps<typeof Typography>)}
              >
                ₹{price}
              </Typography>
            )}
            <Typography
              variant="h5"
              color="blue-gray"
              className="text-xs"
              {...({} as React.ComponentProps<typeof Typography>)}
            >
              ₹{offPrice}
            </Typography>
          </div>
          <div className="flex gap-2 items-center">
            {/* Add to Cart Button */}
            <button
              onClick={() => {
                setShowPopup(true);
                handleAddToCart(id, 1);
              }}
              className="p-2 border border-gray-200 text-gray-500 hover:text-black hover:border-black hover:bg-gray-50 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center"
              aria-label="Add to cart"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-[18px]"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
            </button>

            {/* cart Popup */}
            {showPopup && (
              <CartPopup
                popupRef={popupRef}
                setShowPopup={setShowPopup}
                showPopup={showPopup}
                productName={title?.replace(/#COMMA#/g, ",")}
                productImage={img}
              ></CartPopup>
            )}

            {/* Quick View Button */}
            <button
              onClick={handleOpen}
              className="p-2 border border-gray-200 text-gray-500 hover:text-black hover:border-black hover:bg-gray-50 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center"
              aria-label="Quick view product"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-[18px]"
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

            {/* Product popup */}
            {open && (
              <ProductDialog
                open={open}
                handleOpen={handleOpen}
                slug={slug}
              ></ProductDialog>
            )}

            {/* Wishlist Login Prompt Modal */}
            {showWishlistModal && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
                <div className="bg-white border border-gray-100 text-gray-900 rounded-3xl shadow-2xl max-w-md w-full p-8 relative mx-4 transition-all transform scale-100">
                  {/* Close Button */}
                  <button
                    onClick={() => setShowWishlistModal(false)}
                    className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer font-bold text-sm"
                    aria-label="Close modal"
                  >
                    ✕
                  </button>
                  
                  <div className="text-center">
                    <h2 className="text-xl font-bold tracking-tight mb-2">Your Wishlist</h2>
                    <div className="w-16 h-[2px] bg-gray-200 mx-auto my-4 rounded-full" />
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-8">
                      You need to login first to create and save your wishlist
                    </p>
                    
                    <div className="flex items-center justify-center gap-4">
                      <button
                        onClick={() => {
                          setShowWishlistModal(false);
                          router.push("/sign-in?tab=register");
                        }}
                        className="flex-1 py-3 px-5 border border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50 transition-all rounded-full text-sm font-semibold uppercase tracking-wider"
                      >
                        Create Account
                      </button>
                      <button
                        onClick={() => {
                          setShowWishlistModal(false);
                          router.push("/sign-in");
                        }}
                        className="flex-1 py-3 px-5 bg-black text-white hover:bg-neutral-800 transition-all rounded-full text-sm font-semibold uppercase tracking-wider"
                      >
                        Login
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default BookCard;
