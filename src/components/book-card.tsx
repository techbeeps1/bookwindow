"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { CartPopup } from "@/components/cart-popup";
import {
  Typography,
  Card,
  CardBody,
  CardHeader,
} from "@material-tailwind/react";
import ProductDialog from "./product-detail-popup";
import config from "@/app/config";
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

  const [addToCart, { isLoading }] = useAddToCartMutation();
  const handleAddToCart = async (productId: string, quantity: number) => {
    try {
      await addToCart({
        session_id: sessionId,
        product_id: productId,
        quantity: quantity,
      }).unwrap();

      // console.log("Cart updated:", result);
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

      <div {...({} as React.ComponentProps<typeof CardBody>)}>
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
        {/* <Typography
          color="blue"
          className="text-xs !font-semibold"
          {...({} as React.ComponentProps<typeof Typography>)}
        >
          {subcategoryName
            ? `${mainCategoryName}/${subcategoryName}`
            : `${mainCategoryName || ""}`}
        </Typography> */}
        {/* <Typography 
          className="mb-4 font-normal !text-gray-500"
          dangerouslySetInnerHTML={{ __html: desc?.replace(/#COMMA#/g, ",") }}
          {...({} as React.ComponentProps<typeof Typography>)}
        >
        </Typography> */}
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
          <div className="flex gap-2 relative">
            <div className="">
              <svg
                onClick={() => {
                  setShowPopup(true);
                  handleAddToCart(id, 1);
                }}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="size-5 hover:border hover:border-black cursor-pointer"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                />
              </svg>
            </div>
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
            <svg
              onClick={handleOpen}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5 hover:border hover:border-black cursor-pointer"
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
            {/* Product popup */}
            {open && (
              <ProductDialog
                open={open}
                handleOpen={handleOpen}
                slug={slug}
              ></ProductDialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default BookCard;
