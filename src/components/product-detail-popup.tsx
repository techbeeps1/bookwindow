"use client";

import React from "react";
import { Dialog, DialogHeader, DialogBody } from "@material-tailwind/react";
import { useRouter } from "next/navigation";

import axios from "axios";
import config from "@/app/config";
import Image from "next/image";
import { IoClose } from "react-icons/io5";
import { ImageBook } from "@/components/ImageBook";

export default function ProductDialog({ open, handleOpen, slug }: any) {
  const router = useRouter();
  const [showPopup, setShowPopup] = React.useState(false);
  const popupRef = React.useRef(null);
  const [productData, setProductData] = React.useState([] as any);

  React.useEffect(() => {
    const fetchProductBySlug = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/products/${slug}`,
          responseType: "json",
        });
        setProductData(response.data?.product);
      } catch (error) {
        console.log("error", error);
      } finally {
        // console.log("An error occured");
      }
    };

    fetchProductBySlug();
  }, [slug]);

  React.useEffect(() => {
    // console.log("productData", productData);
  }, [productData]);
  return (
    <>
      <Dialog 
        {...({
          size: "lg",
          open: open,
          handler: handleOpen,
          title: "Dialog Title",
          color: "blue",
          translate: "yes",
          slot: undefined,
          style: {},
        } as any)}
      >
        <div
          onClick={handleOpen}
          className="cursor-pointer ms-auto mt-[10px] mr-[10px] duration-300 hover:bg-black hover:text-white h-[40px] w-[40px] border border-black  flex justify-center rounded-full  items-center shrink-0  text-blue-gray-900 antialiased font-sans text-2xl font-semibold leading-snug cursor-pointer"
          {...({} as React.ComponentProps<typeof DialogHeader>)}
        >
          <IoClose size={20} />
        </div>
        <DialogBody {...({} as React.ComponentProps<typeof DialogBody>)}>
          <div className="container px-4 pb-4 md:flex md:col-12 w-full h-[500px] overflow-auto overflow-y">
            <div className="flex gap-[30px] flex-col lg:flex-row">
              {/* Product Images */}              
                <ImageBook src={`${config.apiUrl}storage/app/public/${productData?.image}`} alt={"Product"} />         

              {/* Product Details */}
              <div className="w-full">
                <h2 className="text-lg font-medium mb-2 text-black">{productData?.name}</h2>
                <p className="text-gray-600">Model: {productData?.model}</p>
                {/* <p className="text-gray-600">Author: {productData?.author}</p> */}
                <p className="text-gray-600 mb-4">
                  Publication: {productData?.production?.name}
                </p>
                <div className="mb-4">
                  <span className="text-2xl font-bold text-black mr-2">
                    {" "}
                    ₹{productData.price}
                  </span>
                </div>

                {/* <div className="flex items-center mb-4">
                
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-6 text-yellow-500"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ))}
                  <span className="ml-2 text-gray-600">4.5 (120 reviews)</span>
                </div> */}

                <div className="flex md:flex-row flex-col gap-4 mb-6 relative">
                  <button
                    onClick={() => setShowPopup(true)}
                    className="bg-black h-[50px] flex gap-2 items-center text-white px-6 py-2 rounded-full focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                      />
                    </svg>
                    Add to Cart
                  </button>
                  {/* Popup */}
                  {showPopup && (
                    <></>
                    // <CartPopup
                    //   popupRef={popupRef}
                    //   setShowPopup={setShowPopup}
                    //   showPopup={showPopup}
                    //   productName={productData?.name}
                    //   productImage={`${config.apiUrl}storage/${productData?.image}`}
                    // ></CartPopup>
                  )}
                  <button
                    onClick={() => router.push(`/product-detail/${slug}`)}
                    className="bg-transparent border hover:bg-black hover:text-white duration-300 border-black flex gap-2 items-center text-black px-6 py-2 rounded-full focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                    View Product
                  </button>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-black mb-2">Key Features:</h3>
                  <ul className="list-disc list-inside text-gray-700">
                    <li>Stock Quantity: {productData?.quantity}</li>
                    {/* <li>
                      Discount:{" "}
                      {(productData?.mrp && productData?.price
                        ? ((productData?.mrp - productData?.price) /
                            productData?.mrp) *
                          100
                        : 0
                      ).toFixed(2)}{" "}
                      %
                    </li> */}
                    <li>Book Language: {productData?.book_language}</li>
                    <li>Number of Pages: {productData?.number_of_pages}</li>
                    <li>Publication Year: {productData?.published_at}</li>
                    <li>ISBN: {productData?.isbn || "N/A"}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </DialogBody>
      </Dialog>
    </>
  );
}
