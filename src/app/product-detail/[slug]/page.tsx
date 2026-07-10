"use client";
import { useSession } from "@/hooks/useSession";
import { useState, useRef, useEffect } from "react";

import OtherBookOffers from "@/components/other-book-offers";
import { CartPopup } from "@/components/cart-popup";
import axios from "axios";
import config from "@/app/config";
import Image from "next/image";
import { use } from "react";
import FadeLoaderOverlay from "@/components/loader";
import { useCart } from "@/hooks/useCart";
import { useAddToCartMutation } from "@/lib/api/cartApi";
import { ImageBook } from "@/components/ImageBook";

const parseGallery = (gallery: any): string[] => {
  if (!gallery) return [];
  if (typeof gallery === "string") {
    if (!gallery.trim().startsWith("[") && !gallery.trim().startsWith("{")) {
      return gallery.split(",").map(img => img.trim()).filter(Boolean);
    }
    try {
      const parsed = JSON.parse(gallery);
      return parseGallery(parsed);
    } catch (e) {
      return [gallery];
    }
  }
  if (Array.isArray(gallery)) {
    let list: string[] = [];
    gallery.forEach((item) => {
      if (!item) return;
      if (typeof item === "string") {
        if (item.trim().startsWith("[") || item.trim().startsWith("{")) {
          try {
            const parsedItem = JSON.parse(item);
            list = list.concat(parseGallery(parsedItem));
          } catch (e) {
            list.push(item);
          }
        } else {
          list.push(item);
        }
      } else if (typeof item === "object") {
        const path = item.image || item.file || item.url || item.path;
        if (path) {
          list.push(path);
        }
      }
    });
    return list;
  }
  return [];
};

export default function ProductDetail({ params }:{
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const sessionId = useSession();
  const [mainImage, setMainImage] = useState("");

  const [showPopup, setShowPopup] = useState(false);
  const popupRef = useRef(null as any);
  const thumbnailSliderRef = useRef<HTMLDivElement>(null);

  const handleScrollLeft = () => {
    if (thumbnailSliderRef.current) {
      thumbnailSliderRef.current.scrollBy({ left: -102, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (thumbnailSliderRef.current) {
      thumbnailSliderRef.current.scrollBy({ left: 102, behavior: "smooth" });
    }
  };

  const [loading, setLoading] = useState(true);

  const handleImageChange = (src: string) => {
    setMainImage(src);
  };

   const handleItemsCountUpdate = (count: number) => {
   // setItemsCount(count);
  };

  const [productData, setProductData] = useState([] as any);
  const [similarProducts, setSimilarProducts] = useState([] as any);

  const galleryImages = parseGallery(productData?.gallery);
  const allImages: string[] = [];
  if (productData?.image) {
    allImages.push(productData.image);
  }
  galleryImages.forEach((img) => {
    if (img !== productData?.image && !allImages.includes(img)) {
      allImages.push(img);
    }
  });


   const [addToCart, { isLoading }] = useAddToCartMutation();

  const { refetch } = useCart();
  // Callback function to receive data from child
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchProductBySlug = async () => {
      setLoading(true);
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/products/${slug}`,
          responseType: "json",
        });
        setProductData(response.data?.product);
        setSimilarProducts(response.data?.related_products);
      } catch (error) {
        console.log("error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductBySlug();
  }, [slug]);

  useEffect(() => {
    setMainImage(`${config.apiUrl}storage/app/public/${productData?.image}`);
  }, [productData, similarProducts]);

  const [quantity, setQuantity] = useState(1);

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };




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

  return (
    <>
            <div className="container mx-auto px-4 py-8 md:flex md:col-12">
        {loading ? (
          <FadeLoaderOverlay />
        ) : (
          // <div
          //   role="status"
          //   className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex md:items-center w-full"
          // >
          //   <div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded-sm sm:w-96 dark:bg-gray-700">
          //     <svg
          //       className="w-10 h-10 text-gray-200 dark:text-gray-600"
          //       aria-hidden="true"
          //       xmlns="http://www.w3.org/2000/svg"
          //       fill="currentColor"
          //       viewBox="0 0 20 18"
          //     >
          //       <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
          //     </svg>
          //   </div>

          //   <div className="w-full">
          //     <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
          //     <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
          //     <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
          //     <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[440px] mb-2.5"></div>
          //     <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[460px] mb-2.5"></div>
          //     <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
          //     <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
          //     <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
          //     <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
          //     <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[460px] mb-2.5"></div>
          //     <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
          //     <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
          //   </div>

          //   <span className="sr-only">Loading...</span>
          // </div>
          <div className="flex flex-wrap">
            {/* Product Images */}
            <div className="w-full md:w-[45%] px-4 md:px-10 mb-8 flex flex-col gap-6">
              {/* Main Product Image */}
              <ImageBook src={mainImage} alt={"Product"} style="w-full"/>

              {/* Gallery thumbnails slider at the bottom */}
              {allImages.length > 0 && (
                <div className="flex items-center justify-center w-full mt-2 gap-2">
                  {/* Left Scroll Button */}
                  {allImages.length > 5 && (
                    <button
                      onClick={handleScrollLeft}
                      className="p-1.5 text-black hover:text-gray-600 transition-colors focus:outline-none shrink-0"
                      aria-label="Scroll left"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 19.5 8.25 12l7.5-7.5"
                        />
                      </svg>
                    </button>
                  )}

                  {/* Slider Wrapper: hides overflow, sets fixed max-width for 5 thumbnails */}
                  <div className="w-full max-w-[498px] overflow-hidden">
                    {/* Scrollable Track */}
                    <div
                      ref={thumbnailSliderRef}
                      className={`flex gap-3 overflow-x-auto scroll-smooth py-1 px-2 no-scrollbar ${
                        allImages.length <= 5 ? "justify-center" : "justify-start"
                      }`}
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                      <style>{`
                        .no-scrollbar::-webkit-scrollbar {
                          display: none;
                        }
                      `}</style>
                      {allImages.map((img: string, index: number) => {
                        const imgSrc = `${config.apiUrl}storage/app/public/${img}`;
                        const isCurrent = mainImage === imgSrc;
                        return (
                          <div
                            key={index}
                            onClick={() => handleImageChange(imgSrc)}
                            className={`relative w-[90px] h-[90px] aspect-square bg-[#f4f4f4] rounded-lg flex items-center justify-center p-2.5 cursor-pointer transition-all duration-300 border shrink-0 ${
                              isCurrent
                                ? "border-black"
                                : "border-transparent hover:border-black/50"
                            }`}
                          >
                            <Image
                              src={imgSrc}
                              alt={`Thumbnail ${index + 1}`}
                              className="object-contain w-full h-full"
                              width={150}
                              height={200}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Scroll Button */}
                  {allImages.length > 5 && (
                    <button
                      onClick={handleScrollRight}
                      className="p-1.5 text-black hover:text-gray-600 transition-colors focus:outline-none shrink-0"
                      aria-label="Scroll right"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m8.25 4.5 7.5 7.5-7.5 7.5"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="w-full md:w-[55%] px-4">
              <h2 className="text-3xl font-bold mb-2">{productData?.name}</h2>
              <p className="text-gray-600">Model: {productData?.model}</p>
              {/* <p className="text-gray-600">Author: {productData?.author}</p> */}
              <p className="text-gray-600 mb-4">
                Publication: {productData?.production?.name}
              </p>
              <div className="mb-4">
                <span className="text-2xl font-bold mr-2">
                  ₹{productData.price}
                </span>
                {/* <span className="text-sm font-small mr-2">
                  {(productData?.mrp && productData?.price
                    ? ((productData?.mrp - productData?.price) /
                        productData?.mrp) *
                      100
                    : 0
                  ).toFixed(2)}{" "}
                
                </span> */}
                <span className="text-gray-500 line-through">
                  ₹{productData.mrp}
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
              <div className="flex gap-4 items-end mb-6">
                <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-semibold text-gray-800 mb-2 uppercase tracking-wider"
                >
                  Quantity
                </label>
                <div className="inline-flex items-center bg-[#f4f4f4] rounded-full p-1 border border-neutral-200">
                  <button
                    type="button"
                    onClick={handleDecrease}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-white hover:text-black hover:shadow-sm active:scale-95 transition-all duration-200 focus:outline-none"
                    aria-label="Decrease quantity"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-4 h-4 pointer-events-none"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14"
                      />
                    </svg>
                  </button>
                  <span className="w-14 text-center text-base font-bold text-gray-900 select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={handleIncrease}
                    className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:bg-white hover:text-black hover:shadow-sm active:scale-95 transition-all duration-200 focus:outline-none"
                    aria-label="Increase quantity"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-4 h-4 pointer-events-none"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex space-x-4 relative">
                <button
                  onClick={() => {
                    setShowPopup(true);
                    handleAddToCart(productData?.id, quantity);
                  }}
                  className="bg-black h-[50px]  flex gap-2 items-center text-white px-6 py-2 rounded-full  "
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
                  <CartPopup
                    popupRef={popupRef}
                    setShowPopup={setShowPopup}
                    showPopup={showPopup}
                    productName={productData?.name}
                    productImage={mainImage}
                  ></CartPopup>
                )}
              </div>
              </div>
              

              <div>
                <h3 className="text-lg font-semibold mb-2">Key Features:</h3>
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
      <OtherBookOffers
        description={productData?.description}
        similarProducts={similarProducts}
        onItemsCountUpdate={handleItemsCountUpdate}
      />

    </>
  );
}
