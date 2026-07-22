"use client";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { useState, useRef, useEffect, useMemo } from "react";
import { useAppDispatch } from "@/hooks/useStore";
import OtherBookOffers from "@/components/other-book-offers";
import { openCartDrawer } from "@/lib/slices/uiSlice";
import axios from "axios";
import config from "@/app/config";

import { use } from "react";

import { useCart } from "@/hooks/useCart";
import { useAddToCartMutation } from "@/lib/api/cartApi";
import { ImageBook } from "@/components/ImageBook";

import { FrequentlyBougth } from "@/components/FrequentlyBougth";
import { useAddToWishlistMutation, useViewWishlistIdQuery } from "@/lib/api/wishlistApi";
import toast from "react-hot-toast";

const parseGallery = (gallery: any): string[] => {
  if (!gallery) return [];
  if (typeof gallery === "string") {
    if (!gallery.trim().startsWith("[") && !gallery.trim().startsWith("{")) {
      return gallery
        .split(",")
        .map((img) => img.trim())
        .filter(Boolean);
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

export default function ProductDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const sessionId = useSession();
  const router = useRouter();
  const [mainImage, setMainImage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [loading, setLoading] = useState(true);

  const [productData, setProductData] = useState([] as any);
  const [similarProducts, setSimilarProducts] = useState([] as any);
  const [FBTProducts, setFBTProducts] = useState([] as any);

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
  const dispatch = useAppDispatch();

  const [addToCart, { isLoading }] = useAddToCartMutation();
  const [clicktype, setClicktype] = useState("");
const [addToWishlist,{isLoading:addWishlistLoading}] = useAddToWishlistMutation();
  const { refetch } = useCart();

   const { data:wishlistIds , refetch:refetchWishlist } = useViewWishlistIdQuery()
  
  
  const wishlistSet = useMemo(
   () => new Set(wishlistIds?.data ?? []),
   [wishlistIds]
 );
 
 const isWishlisted = wishlistSet.has(productData.id);
  

  const handlePrevImage = () => {
    if (allImages.length > 0) {
      const newIndex =
        (currentImageIndex - 1 + allImages.length) % allImages.length;
      setCurrentImageIndex(newIndex);
      setMainImage(`${config.apiUrl}storage/app/public/${allImages[newIndex]}`);
    }
  };

  const handleNextImage = () => {
    if (allImages.length > 0) {
      const newIndex = (currentImageIndex + 1) % allImages.length;
      setCurrentImageIndex(newIndex);
      setMainImage(`${config.apiUrl}storage/app/public/${allImages[newIndex]}`);
    }
  };


  async function handleWishlistClick()  {
    if(productData?.id){
   await addToWishlist(productData?.id)
   toast.success("Product added to wishlist")
    }
  };

  const handleItemsCountUpdate = (count: number) => {
    // setItemsCount(count);
  };

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
        setSimilarProducts(response.data?.related_products || []);
        setFBTProducts(response.data?.bought_together || []);
      } catch (error) {
        console.log("error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductBySlug();
  }, [slug]);

  useEffect(() => {
    setCurrentImageIndex(0);
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
    setClicktype("addtocart");
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

  async function BuyNow(productId: string, quantity: number) {
    setClicktype("buynow");
    try {
      await addToCart({
        session_id: sessionId,
        product_id: productId,
        quantity,
      }).unwrap();

      // wait until cart is refreshed
      await refetch();

      router.push("/checkout");
    } catch (error) {
      console.error(error);
    }
  }
  return (
    <>
      <div className="container mx-auto px-4 py-8 md:flex md:col-12">
        {loading ? (
          <div
            role="status"
            className="container mx-auto space-y-8 mt-10 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex justify-center md:items-center w-[80%]"
          >
            <div className="w-[50%] p-20 flex items-center justify-center w-full h-full bg-gray-300 rounded-sm sm:w-96 dark:bg-gray-700">
              <svg
                className="w-75   h-auto text-gray-200 dark:text-gray-600"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 20 18"
              >
                <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
              </svg>
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
          <div className="flex flex-wrap">
            <div className="w-full md:w-[45%] md:px-4 px-0 md:px-10 mb-8 flex flex-col gap-6">
              <div className="relative group/slider w-full">
                <ImageBook src={mainImage} alt={"Product"} size="70px" />

                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-6 top-[45%] -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-black p-2.5 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover/slider:opacity-100 focus:outline-none hover:scale-105 active:scale-95 border border-gray-100"
                      aria-label="Previous image"
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
                    <button
                      onClick={handleNextImage}
                      className="absolute right-6 top-[45%] -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-black p-2.5 rounded-full shadow-lg transition-all duration-200 opacity-0 group-hover/slider:opacity-100 focus:outline-none hover:scale-105 active:scale-95 border border-gray-100"
                      aria-label="Next image"
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
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 z-10 bg-black/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
                      {allImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentImageIndex(index);
                            setMainImage(
                              `${config.apiUrl}storage/app/public/${allImages[index]}`,
                            );
                          }}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            index === currentImageIndex
                              ? "w-6 bg-black"
                              : "w-2 bg-black/40 hover:bg-black/60"
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="w-full md:w-[55%] md:px-4 px-0">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold mb-2">
                    {productData?.name}
                  </h2>
                  <h3 className="text-gray-600 text-lg mb-2">
                    {productData?.sub_title}
                  </h3>
                </div>
                <button
                  onClick={handleWishlistClick}
                  className="flex items-center justify-center w-12 h-12 rounded-full border border-neutral-300 hover:border-black/50 hover:bg-neutral-50 transition-all duration-300 shadow-sm shrink-0 animate-fade-in"
                  aria-label="Add to wishlist"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill={isWishlisted ? "#ef4444" : "none"}
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke={isWishlisted ? "#ef4444" : "currentColor"}
                    className={`w-6 h-6 transition-all duration-300 ${isWishlisted ? "scale-110" : ""}`}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                    />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-4">
                <span className="text-black font-semibold">Author:</span>{" "}
                {productData?.author}
              </p>
              <div className="mb-4">
                {productData.price && (
                  <span className="text-2xl font-bold mr-2">
                    ₹{productData.price}
                  </span>
                )}
                {productData.mrp &&
                  productData.mrp != 0 &&
                  productData.mrp != productData.price && (
                    <span
                      className={`${productData.price ? "text-gray-500 line-through" : "text-2xl font-bold mr-2"}`}
                    >
                      ₹{productData.mrp}
                    </span>
                  )}
              </div>
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
              <div className="flex my-5 space-x-4 relative">
                <button
                  onClick={() => BuyNow(productData?.id, quantity)}
                  disabled={isLoading && clicktype == "buynow"}
                  className={`border border-black h-[50px] hover:bg-black hover:text-white duration-300 flex gap-2 items-center text-black px-6 py-2 rounded-full ${
    isLoading && clicktype == "addtocart"
      ? "opacity-70 cursor-not-allowed"
      : ""
  }`}
                >
                    {isLoading && clicktype == "buynow" ? (
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
                      Buy Now
                    </>
                  ) : ( <>
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
                  Buy Now</> )}
                </button>

                <button
                  onClick={() => handleAddToCart(productData?.id, quantity)}
                  disabled={isLoading && clicktype == "addtocart"}
                  className={`bg-black h-[50px] flex gap-2 items-center justify-center
  text-white px-6 py-2 rounded-full transition-all duration-300
  ${
    isLoading && clicktype == "addtocart"
      ? "opacity-70 cursor-not-allowed"
      : "hover:scale-[1.02] active:scale-95"
  }`}
                >
                  {isLoading && clicktype == "addtocart" ? (
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
                    </>
                  )}
                </button>
              </div>

              {productData?.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">
                    About this product:
                  </h3>
                  <div
                    className="text-gray-700 leading-relaxed text-sm"
                    dangerouslySetInnerHTML={{
                      __html: productData.description,
                    }}
                  />
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-2">Key Features:</h3>
                <ul className="list-disc list-inside text-gray-700">
                  <li>Publication: {productData?.production?.name}</li>
                  <li>Edition: {productData?.model}</li>
                  <li>Publication Year: {productData?.year}</li>
                  <li>Book Language: {productData?.book_language}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
      <OtherBookOffers
        similarProducts={similarProducts}
        onItemsCountUpdate={handleItemsCountUpdate}
      />
      <FrequentlyBougth
        similarProducts={FBTProducts}
        onItemsCountUpdate={handleItemsCountUpdate}
      />

      {/* {showWishlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white border border-gray-100 text-gray-900 rounded-3xl shadow-2xl max-w-md w-full p-8 relative mx-4 transition-all transform scale-100">       
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
      )} */}
    </>
  );
}
