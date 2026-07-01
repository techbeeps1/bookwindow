"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import config from "@/app/config";

export function CartPopup({
  popupRef,
  setShowPopup,
  showPopup,
  productName,
  productImage,
}: any) {
  // console.log("cartData", cartData);
  const router = useRouter();
  // Function to handle clicks outside the popup
  useEffect(() => {
    function handleClickOutside(event: any) {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setShowPopup(false);
      }
    }

    if (showPopup) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto-close after 3 seconds
      const timer = setTimeout(() => setShowPopup(false), 3000);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        clearTimeout(timer);
      };
    }
  }, [popupRef, setShowPopup, showPopup]);

  return (
    <div
      ref={popupRef}
      className="fixed bottom-28 right-4 bg-white shadow-2xl border rounded-lg p-4 w-80 border-green-400 z-40"
    >
      <div className="flex gap-3">
        <Image
          src={productImage}
          alt="Book"
          className="object-contain rounded-md h-20 w-30"
          width={120}
          height={150}
        />
        <div>
          <h2 className="font-semibold text-sm">
            {/* Dr. Bhalla - Contemporary Rajasthan by Kuldeep Publication x 1 */}
            {productName}
          </h2>
          <p className="text-gray-600 text-sm mt-1">Added to cart</p>
          <button
            className="mt-2 bg-green-600 text-white text-sm px-4 py-2 rounded-md hover:bg-green-700"
            onClick={() => {
              router.push("/checkout?step=cart");
              setShowPopup(false);
            }}
          >
            View Cart
          </button>
        </div>
      </div>
    </div>
  );
}
