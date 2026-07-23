"use client";

import React from "react";
import { Dialog, DialogHeader, DialogBody } from "@material-tailwind/react";
import { useRouter } from "next/navigation";

import axios from "axios";
import config from "@/app/config";
import Image from "next/image";
import { IoClose } from "react-icons/io5";
import { ImageBook } from "@/components/ImageBook";
import { useAddToCartMutation } from "@/lib/api/cartApi";
import { openCartDrawer } from "@/lib/slices/uiSlice";
import { useAppDispatch } from "@/hooks/useStore";
import { useCart } from "@/hooks/useCart";
import { useSession } from "@/hooks/useSession";
import { FaRegImage } from "react-icons/fa6";
import { HiOutlineShoppingCart } from "react-icons/hi2";

export default function ProductDialog({ open, handleOpen, slug }: any) {
  const router = useRouter();


  const [productData, setProductData] = React.useState([] as any);

  const [addToCart, { isLoading }] = useAddToCartMutation();
  const [loading, setloading] = React.useState(true);
  const { refetch } = useCart();
  const dispatch = useAppDispatch();
  const sessionId = useSession();


  const handleAddToCart = async (productId: string, quantity: number) => {
    try {
      await addToCart({
        session_id: sessionId,
        product_id: productId,
        quantity,
      }).unwrap();

      // wait until cart is refreshed
      await refetch();

      // then open drawer
      dispatch(openCartDrawer());
    } catch (error) {
      console.error(error);
    }
  };
  React.useEffect(() => {
    const fetchProductBySlug = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/products/${slug}`,
          responseType: "json",
        });
        if (response.status == 200) {
          setloading(false);
          setProductData(response.data?.product);
        }

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

            {loading ? (
              <div
                role="status"
                className="container mx-auto space-y-8 mt-10 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex justify-center md:items-center w-[80%]"
              >
                <div className="w-[50%] p-20 flex items-center justify-center w-full h-full bg-gray-300 rounded-sm sm:w-96 dark:bg-gray-700">
                  <FaRegImage className="w-[100px] h-[100px] text-gray-200 dark:text-gray-600" />
                </div>

                <div className="w-[50%]">
                  <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[440px] mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[460px] mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                  <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[460px] mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                  <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                </div>

                <span className="sr-only">Loading...</span>
              </div>


            ) : (
              <div className="flex gap-[30px] flex-col lg:flex-row">
                {/* Product Images */}
                <ImageBook src={`${config.apiUrl}storage/app/public/${productData?.image}`} alt={"Product"} />

                {/* Product Details */}
                <div className="w-full">
                  <h2 className="text-lg font-medium mb-2 text-black">{productData?.name}</h2>
                  <p className="text-gray-600">Model: {productData?.model}</p>
                  <p className="text-gray-600 mb-4">
                    Publication: {productData?.production?.name}
                  </p>
                  <div className="mb-4">
                    <span className="text-2xl font-bold text-black mr-2">
                      {" "}
                      ₹{productData.price}
                    </span>
                  </div>


                  <div className="flex md:flex-row flex-col gap-4 mb-6 relative">
                    <button
                      onClick={() => handleAddToCart(productData?.id, 1)}
                      disabled={isLoading}
                      className={`bg-black h-[50px] flex gap-2 items-center justify-center text-white px-6 py-2 rounded-full transition-all duration-300
                     ${isLoading
                          ? "opacity-70 cursor-not-allowed"
                          : "hover:scale-[1.02] active:scale-95"
                        }`}
                    >
                      {isLoading ? (
                        <>
                          <svg
                            className="w-5 h-5 animate-spin"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-20"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-80"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                          </svg>

                          Adding...
                        </>
                      ) : (
                        <>

                          <HiOutlineShoppingCart size={20} />
                          Add to Cart
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => router.push(`/product-detail/${slug}`)}
                      className="bg-transparent justify-center border hover:bg-black hover:text-white duration-300 border-black flex gap-2 items-center text-black px-6 py-2 rounded-full focus:outline-none"
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
            )}
          </div>
        </DialogBody>
      </Dialog>
    </>
  );
}
