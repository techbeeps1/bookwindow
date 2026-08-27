"use client";
import { useRouter } from "next/navigation";
import { useSession } from "@/hooks/useSession";
import { useState, useEffect, useMemo } from "react";
import { useAppDispatch } from "@/hooks/useStore";
import OtherBookOffers from "@/components/other-book-offers";
import { openCartDrawer } from "@/lib/slices/uiSlice";
import Link from "next/link";
import Image from "next/image";
import config from "@/app/config";
import { FaChevronRight, FaTruck, FaShieldAlt, FaCheckCircle } from "react-icons/fa";

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
  data,
}: {
  data: any;
}) {
  const productData = data.product;
  const similarProducts = data?.related_products || [];
  const FBTProducts = data?.bought_together || [];
  const sessionId = useSession();
  const router = useRouter();
  const [mainImage, setMainImage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const [addToWishlist, { isLoading: addWishlistLoading }] = useAddToWishlistMutation();
  const { refetch } = useCart();

  const { data: wishlistIds, refetch: refetchWishlist } = useViewWishlistIdQuery();

  const wishlistSet = useMemo(
    () => new Set(wishlistIds?.data ?? []),
    [wishlistIds]
  );

  const isWishlisted = wishlistSet.has(productData?.id);

  const discountPercent = useMemo(() => {
    if (productData?.mrp && productData?.price && productData.mrp > productData.price) {
      return Math.round(((productData.mrp - productData.price) / productData.mrp) * 100);
    }
    return 0;
  }, [productData]);

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

  async function handleWishlistClick() {
    if (productData?.id) {
      await addToWishlist(productData?.id);
      await refetchWishlist();
      toast.success("Product added to wishlist");
    }
  }

  const handleItemsCountUpdate = (count: number) => {
    // setItemsCount(count);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
      {/* Breadcrumbs Navigation */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 lg:mt-0 mt-[90px]">
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 mb-4 flex-wrap">
          <Link href="/" className="hover:text-black transition-colors font-medium">
            Home
          </Link>
          <FaChevronRight className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
          <Link href="/all-products" className="hover:text-black transition-colors font-medium">
            Books
          </Link>
          {productData?.production?.name && (
            <>
              <FaChevronRight className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
              <Link
                href={`/publication/${productData.production.slug}`}
                className="hover:text-black transition-colors font-medium truncate max-w-[150px] sm:max-w-none"
              >
                {productData.production.name}
              </Link>
            </>
          )}
          <FaChevronRight className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
          <span className="text-neutral-900 font-semibold truncate max-w-[200px] sm:max-w-[320px] md:max-w-[450px]">
            {productData?.name}
          </span>
        </nav>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="flex flex-wrap -mx-4">
          {/* Left Column: Images & Carousel */}
          <div className="w-full md:w-[45%] px-4 mb-8 flex flex-col gap-4">
            <div className="relative group/slider w-full bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-sm flex items-center justify-center min-h-[360px] md:min-h-[440px]">
              <ImageBook src={mainImage} alt={productData?.name || "Product"} size="70px" />

              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 z-10 bg-red-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow">
                  {discountPercent}% OFF
                </div>
              )}

              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-black p-2.5 rounded-full shadow-md transition-all duration-200 opacity-0 group-hover/slider:opacity-100 focus:outline-none hover:scale-105 active:scale-95 border border-neutral-200 cursor-pointer"
                    aria-label="Previous image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-4 h-4"
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
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white text-black p-2.5 rounded-full shadow-md transition-all duration-200 opacity-0 group-hover/slider:opacity-100 focus:outline-none hover:scale-105 active:scale-95 border border-neutral-200 cursor-pointer"
                    aria-label="Next image"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m8.25 4.5 7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Selector */}
            {allImages.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-2">
                {allImages.map((img, index) => {
                  const isSelected = index === currentImageIndex;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        setCurrentImageIndex(index);
                        setMainImage(`${config.apiUrl}storage/app/public/${img}`);
                      }}
                      className={`relative w-16 h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 bg-neutral-50 p-1 cursor-pointer ${isSelected
                        ? "border-black shadow-sm scale-102"
                        : "border-neutral-200/80 opacity-70 hover:opacity-100 hover:border-neutral-400"
                        }`}
                    >
                      <Image
                        src={`${config.apiUrl}storage/app/public/${img}`}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-contain p-1"
                        sizes="64px"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Details & Actions */}
          <div className="w-full md:w-[55%] px-4">
            <div className="flex justify-between items-start gap-4 mb-3">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 leading-tight">
                  {productData?.name}
                </h1>
                {productData?.sub_title && (
                  <h2 className="text-neutral-500 text-base sm:text-lg mt-1 font-medium">
                    {productData.sub_title}
                  </h2>
                )}
              </div>
              <button
                onClick={handleWishlistClick}
                className="flex items-center justify-center w-11 h-11 rounded-full border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-300 shadow-sm shrink-0 cursor-pointer"
                aria-label="Add to wishlist"
                title={isWishlisted ? "In your wishlist" : "Add to wishlist"}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill={isWishlisted ? "#ef4444" : "none"}
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke={isWishlisted ? "#ef4444" : "currentColor"}
                  className={`w-6 h-6 transition-all duration-300 ${isWishlisted ? "scale-110" : "text-neutral-700"}`}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                  />
                </svg>
              </button>
            </div>

            {/* Author & Publisher meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-neutral-600 mb-4 pb-3 border-b border-neutral-100">
              {productData?.author && (
                <div>
                  <span className="font-semibold text-neutral-900">Author: </span>
                  <span>{productData.author}</span>
                </div>
              )}
              {productData?.production?.name && (
                <div>
                  <span className="font-semibold text-neutral-900">Publisher: </span>
                  <Link
                    href={`/publication/${productData.production.slug}`}
                    className="text-black hover:underline font-medium"
                  >
                    {productData.production.name}
                  </Link>
                </div>
              )}
            </div>

            {/* Pricing section */}
            <div className="flex items-baseline gap-3 mb-6">
              {productData?.price && (
                <span className="text-3xl font-black text-neutral-950">
                  ₹{productData.price}
                </span>
              )}
              {productData?.mrp && productData.mrp != 0 && productData.mrp != productData.price && (
                <span
                  className={`${productData.price ? "text-lg text-neutral-400 line-through font-semibold" : "text-3xl font-black text-neutral-950"}`}
                >
                  ₹{productData.mrp}
                </span>
              )}
              {discountPercent > 0 && (
                <span className="text-xs font-extrabold bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg">
                  {discountPercent}% OFF
                </span>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label
                htmlFor="quantity"
                className="block text-xs font-bold text-neutral-700 mb-2 uppercase tracking-wider"
              >
                Quantity
              </label>
              <div className="inline-flex items-center bg-neutral-100/90 rounded-full p-1 border border-neutral-200">
                <button
                  type="button"
                  onClick={handleDecrease}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-700 hover:bg-white hover:text-black hover:shadow-sm active:scale-95 transition-all duration-200 focus:outline-none cursor-pointer"
                  aria-label="Decrease quantity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-3.5 h-3.5 pointer-events-none"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                  </svg>
                </button>
                <span className="w-12 text-center text-sm font-black text-neutral-900 select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={handleIncrease}
                  className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-700 hover:bg-white hover:text-black hover:shadow-sm active:scale-95 transition-all duration-200 focus:outline-none cursor-pointer"
                  aria-label="Increase quantity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-3.5 h-3.5 pointer-events-none"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Action Buttons: Buy Now & Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <button
                onClick={() => BuyNow(productData?.id, quantity)}
                disabled={isLoading && clicktype == "buynow"}
                className="flex-1 border-2 border-black h-[50px] hover:bg-black hover:text-white duration-300 flex gap-2 items-center justify-center text-black font-extrabold text-sm uppercase tracking-wide px-6 py-2 rounded-full cursor-pointer shadow-sm active:scale-98 transition-all disabled:opacity-50"
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
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.75}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                    <span>Buy Now</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleAddToCart(productData?.id, quantity)}
                disabled={isLoading && clicktype == "addtocart"}
                className="flex-1 bg-black h-[50px] flex gap-2 items-center justify-center text-white font-extrabold text-sm uppercase tracking-wide px-6 py-2 rounded-full transition-all duration-300 hover:bg-neutral-800 active:scale-98 shadow-md cursor-pointer disabled:opacity-50"
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
                    <span>Adding...</span>
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.75}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                      />
                    </svg>
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200/80 mb-8 text-center text-xs font-semibold text-neutral-700">
              <div className="flex flex-col items-center gap-1">
                <FaTruck className="w-4 h-4 text-neutral-800" />
                <span>Fast Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-1 border-x border-neutral-200 px-1">
                <FaShieldAlt className="w-4 h-4 text-neutral-800" />
                <span>100% Genuine</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <FaCheckCircle className="w-4 h-4 text-neutral-800" />
                <span>Secure Payments</span>
              </div>
            </div>

            {/* Specifications / Key Features */}
            <div className="mb-8">
              <h3 className="text-base font-extrabold text-neutral-900 mb-3 uppercase tracking-wider">
                Product Details
              </h3>
              <div className="bg-white rounded-2xl border border-neutral-200/80 overflow-hidden divide-y divide-neutral-100 text-sm">
                {productData?.production?.name && (
                  <div className="flex py-2.5 px-4">
                    <span className="w-40 font-semibold text-neutral-500">Publisher</span>
                    <span className="flex-1 font-medium text-neutral-900">
                      <Link
                        href={`/publication/${productData.production.slug}`}
                        className="hover:underline text-black font-semibold"
                      >
                        {productData.production.name}
                      </Link>
                    </span>
                  </div>
                )}
                {productData?.author && (
                  <div className="flex py-2.5 px-4">
                    <span className="w-40 font-semibold text-neutral-500">Author</span>
                    <span className="flex-1 font-medium text-neutral-900">{productData.author}</span>
                  </div>
                )}
                {productData?.model && (
                  <div className="flex py-2.5 px-4">
                    <span className="w-40 font-semibold text-neutral-500">Edition / Model</span>
                    <span className="flex-1 font-medium text-neutral-900">{productData.model}</span>
                  </div>
                )}
                {productData?.year && (
                  <div className="flex py-2.5 px-4">
                    <span className="w-40 font-semibold text-neutral-500">Publication Year</span>
                    <span className="flex-1 font-medium text-neutral-900">{productData.year}</span>
                  </div>
                )}
                {productData?.book_language && (
                  <div className="flex py-2.5 px-4">
                    <span className="w-40 font-semibold text-neutral-500">Language</span>
                    <span className="flex-1 font-medium text-neutral-900">{productData.book_language}</span>
                  </div>
                )}
                {productData?.number_of_pages && (
                  <div className="flex py-2.5 px-4">
                    <span className="w-40 font-semibold text-neutral-500">Pages</span>
                    <span className="flex-1 font-medium text-neutral-900">{productData.number_of_pages}</span>
                  </div>
                )}
                {productData?.weight && (
                  <div className="flex py-2.5 px-4">
                    <span className="w-40 font-semibold text-neutral-500">Weight</span>
                    <span className="flex-1 font-medium text-neutral-900">{productData.weight}</span>
                  </div>
                )}
                {(productData?.isbn || productData?.isbn13 || productData?.isbn10) && (
                  <div className="flex py-2.5 px-4">
                    <span className="w-40 font-semibold text-neutral-500">ISBN</span>
                    <span className="flex-1 font-medium text-neutral-900">
                      {productData.isbn || productData.isbn13 || productData.isbn10}
                    </span>
                  </div>
                )}
              </div>
            </div>


          </div>

          <div className="mb-12">
            {productData?.description && (
              <div className="mb-6">
                <h3 className="text-base font-extrabold text-neutral-900 mb-3 uppercase tracking-wider px-4">
                  About this book
                </h3>
                <div
                  className="mx-4 text-neutral-700 leading-relaxed text-sm bg-neutral-50/70 rounded-2xl p-5 border border-neutral-200/80 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: productData.description,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <OtherBookOffers
        similarProducts={similarProducts}
        onItemsCountUpdate={handleItemsCountUpdate}
      />
      <FrequentlyBougth
        similarProducts={FBTProducts}
        onItemsCountUpdate={handleItemsCountUpdate}
      />
    </>
  );
}
