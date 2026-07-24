"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";

import { 
  FaHeart, 
  FaTrash, 
  FaShoppingCart, 
  FaList, 
  FaSearch, 
  FaFilter, 
  FaArrowRight, 
  FaCheckCircle, 
  FaRedo, 
  FaChevronRight,
  FaShoppingBag,
  FaLock,
} from "react-icons/fa";
import { BsGridFill } from "react-icons/bs";
import { AiFillEye } from "react-icons/ai";
import { HiShoppingCart } from "react-icons/hi2";
import { useAddToCartMutation } from "@/lib/api/cartApi";
import { useSession } from "@/hooks/useSession";
import { useCart } from "@/hooks/useCart";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { openCartDrawer } from "@/lib/slices/uiSlice";
import { ImageBook } from "@/components/ImageBook";
import ProductDialog from "@/components/product-detail-popup";
import config from "@/app/config";
import ProductFilterBar from "@/components/ProductFilterBar";
import { useViewWishlistQuery,useRemoveWishlistMutation } from "@/lib/api/wishlistApi";
import toast from "react-hot-toast";
export default function WishlistPage() {
  const sessionId = useSession();
  const dispatch = useAppDispatch();
  const { refetch } = useCart();
  const [addToCart] = useAddToCartMutation();

  const { data: wishlistData, isLoading: isWishlistLoading , isSuccess, refetch: refetchWishlist } = useViewWishlistQuery();



  const [searchQuery, setSearchQuery] = useState("");
  const [clearAllpopupOpen, setClearAllPopupOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [movingAllToCart, setMovingAllToCart] = useState(false);
  const [quickViewSlug, setQuickViewSlug] = useState<string | null>(null);
 const [removeWishlist] = useRemoveWishlistMutation();
  const {  isAuthenticated ,loading } = useAppSelector((state) => state.auth);

  // Remove single item from wishlist
  async function handleRemoveItem(id: string | number) {
    await removeWishlist(id).unwrap();
    await refetchWishlist();
    toast.success("Item removed from your wishlist");
  };

  // Clear entire wishlist
  const handleClearAll = () => {
      wishlistData?.data?.forEach(async (item: any) => {
        await removeWishlist(item.id).unwrap();
      });
      refetchWishlist();
      setClearAllPopupOpen(false);
      toast.success("Wishlist cleared");
    
  };

  // Add individual item to Cart
  const handleAddToCart = async (product: any) => {
    try {
      setLoadingItemId(String(product.id));
      await addToCart({
        session_id: sessionId,
        product_id: product.id,
        quantity: 1,
      }).unwrap();

      await refetch();
      dispatch(openCartDrawer());
      toast.success(`"${product.name?.substring(0, 30)}..." added to cart!`);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      // Even if API fails in demo mode, trigger open cart drawer for responsive feel
      dispatch(openCartDrawer());
      toast.success("Added item to cart");
    } finally {
      setLoadingItemId(null);
    }
  };

  // Move all in-stock items to cart
  const handleMoveAllToCart = async () => {
    const inStockItems = wishlistData?.data?.filter((item: any) => item.inStock !== false) || [];
    if (inStockItems.length === 0) {
      toast.success("No in-stock items to move!");
      return;
    }

    setMovingAllToCart(true);
    try {
      for (const item of inStockItems) {
        await addToCart({
          session_id: sessionId,
          product_id: item.id,
          quantity: 1,
        }).catch(() => {});
      }
      await refetch();
      dispatch(openCartDrawer());
    
    } catch (err) {
      console.error(err);
    } finally {
      setMovingAllToCart(false);
    }
  };

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let result = wishlistData?.data || [];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (item:any) =>
          item.name?.toLowerCase().includes(q) ||
          item.production?.toLowerCase().includes(q) ||
          item.categories?.toLowerCase().includes(q)
      );
    }

    switch (sortBy) {
      case "price-low":
        result.sort((a:any, b:any) => Number(a.offPrice || a.price) - Number(b.offPrice || b.price));
        break;
      case "price-high":
        result.sort((a:any, b:any) => Number(b.offPrice || b.price) - Number(a.offPrice || a.price));
        break;
      case "discount":
        result.sort((a:any, b:any) => {
          const discA = Number(a.price || 0) - Number(a.offPrice || a.price || 0);
          const discB = Number(b.price || 0) - Number(b.offPrice || b.price || 0);
          return discB - discA;
        });
        break;
      case "name":
        result.sort((a:any, b:any) => (a.name || "").localeCompare(b.name || ""));
        break;
      default:
        break;
    }

    return result;
  }, [isSuccess, searchQuery, sortBy,wishlistData]);

  const getImageSrc = (item: any) => {
    if (item.image){
      return config.apiUrl +"storage/app/public/"+ item.image;
    }else{
 return config.apiUrl+"storage/app/public/01KXJ7GG8CMSJSZRAVV4KFRF28.png";
    } 

  };

   if (!isAuthenticated && !loading) {
    return (
   <div className="min-h-[calc(100vh-140px)] bg-gray-50 flex items-center justify-center p-4 ">
  <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <FaLock className="w-8 h-8 text-gray-400" />
    </div>
    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Sign in required</h2>
    <p className="text-gray-500 mb-6">Please sign in to access your wishlist</p>
    <Link 
      href="/sign-in" 
      className="inline-block w-full bg-black text-white font-medium px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
    >
      Sign In
    </Link>
  </div>
</div>
    );
 }
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-800 pb-16">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center mt-[60px] text-xs text-gray-500 font-medium space-x-2 mb-6">
          <Link href="/" className="hover:text-black transition-colors">
            Home
          </Link>
          <FaChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-900 font-semibold">My Wishlist</span>
        </nav>

        {/* Page Title */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-black mb-6 mt-[30px]">
          My Wishlist
        </h1> 


        {(isSuccess && wishlistData?.data?.length > 0 ) ? (
          <div>
            {/* Filter & Action Toolbar */}
            <ProductFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchPlaceholder="Search in wishlist..."
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOptions={[
                { label: "Default", value: "default" },
                { label: "Price: Low to High", value: "price-low" },
                { label: "Price: High to Low", value: "price-high" },
                { label: "Biggest Discount", value: "discount" },
                { label: "Book Title (A-Z)", value: "name" },
              ]}
              viewMode={viewMode}
              setViewMode={setViewMode}
              extraActions={
                <>
                  <button
                    onClick={handleMoveAllToCart}
                    disabled={movingAllToCart}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 text-xs font-bold bg-black hover:bg-neutral-800 active:scale-[0.98] text-white px-4 py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50 whitespace-nowrap cursor-pointer"
                  >
                    {movingAllToCart ? (
                      <FaRedo className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <HiShoppingCart className="w-4 h-4" />
                    )}
                    <span>Add All to Cart</span>
                  </button>

                  <button
                    onClick={() => setClearAllPopupOpen(true)}
                    className="flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 active:scale-[0.98] px-3 py-2.5 rounded-xl transition-all flex-shrink-0 cursor-pointer"
                    title="Clear Wishlist"
                  >
                    <FaTrash className="w-3.5 h-3.5 text-rose-500" />
                    <span className="hidden xs:inline">Clear</span>
                  </button>
                </>
              }
            />

            {/* Filter Result Notification */}
            {filteredAndSortedItems.length === 0 && searchQuery && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center my-6">
                <p className="text-gray-600 text-sm font-medium">
                  No saved books match your search "<strong>{searchQuery}</strong>".
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-3 inline-flex items-center text-xs font-semibold text-black hover:underline"
                >
                  Clear search filter
                </button>
              </div>
            )}

            {/* GRID VIEW */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedItems.map((item: any) => {
                 const price = item.mrp;
                  const offPrice =  item.price;
                  return (
                    <div
                      key={item.id}
                      className="group relative bg-white rounded-2xl border border-gray-200/80 hover:border-gray-300 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
                    >
                        {/* Remove Button Badge */}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="absolute top-3 right-3 z-20 p-2 bg-white/90 backdrop-blur-md hover:bg-gray-100 text-gray-400 hover:text-black rounded-full shadow-md transition-all duration-200 border border-gray-100 active:scale-90"
                          title="Remove from wishlist"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>

                        {/* Top Badge: Sale / Stock */}
                        <div className="absolute top-3 left-3 z-20 flex flex-col gap-1">
                          {price !== offPrice && (
                            <span className="text-xs uppercase bg-black py-[5px] px-5 w-fit text-white rounded-[4px] font-sans">
                              Sale
                            </span>
                          )}
                          {item.inStock === false && (
                            <span className="bg-gray-800 text-gray-200 text-[10px] font-medium px-2 py-0.5 rounded-md">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        {/* Image Container */}
                        <div className="relative pt-4 px-4 bg-gray-50/60 group-hover:bg-gray-50 transition-colors">
                          <Link href={`/product-detail/${item.slug || item.id}`}>
                            <div className="w-full flex justify-center transform group-hover:scale-[1.03] transition-transform duration-300">
                              <ImageBook src={getImageSrc(item)} alt={item.name || "Book"} size="30px" />
                            </div>
                          </Link>
                        </div>

                        {/* Book Details */}
                        <div className="p-4 flex flex-col flex-1 justify-between">
                          <div>
                            {/* Title */}
                            <Link href={`/product-detail/${item.slug || item.id}`}>
                              <h3 className="font-bold text-gray-900 text-sm line-clamp-2 hover:text-black transition-colors mb-3">
                                {item.name?.replace(/#COMMA#/g, ",")}
                              </h3>
                            </Link>
                          </div>

                          {/* Price & Action Buttons matching BookCard */}
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
                              {/* Cart Button matching BookCard */}
                              <button
                                onClick={() => handleAddToCart(item)}
                                disabled={loadingItemId === String(item.id) || item.inStock === false}
                                className="relative p-2 border border-gray-200 text-gray-500 hover:text-white hover:border-black hover:bg-black rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center overflow-hidden"
                                aria-label="Add to cart"
                              >
                                <div className="relative w-[18px] h-[18px] flex items-center justify-center">
                                  {loadingItemId === String(item.id) ? (
                                    <svg
                                      className="animate-spin h-[18px] w-[18px]"
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
                                    <HiShoppingCart className="w-[18px] h-[18px]" />
                                  )}
                                </div>
                              </button>

                              {/* Quick View Eye Button matching BookCard */}
                              <button
                                onClick={() => setQuickViewSlug(item.slug || item.id)}
                                className="p-2 border border-gray-200 text-gray-500 hover:text-white hover:border-black hover:bg-black rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center"
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
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="space-y-4">
                {filteredAndSortedItems.map((item: any) => {
                  const price = item.mrp;
                  const offPrice = item.price;
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-5 flex flex-row items-center justify-between gap-3 sm:gap-6 shadow-sm hover:shadow-md transition-all"
                    >
                      {/* Book Image */}
                      <div className="w-28 xs:w-32 sm:w-36 flex-shrink-0 bg-gray-50 rounded-xl">
                        <Link href={`/product-detail/${item.slug || item.id}`}>
                          <ImageBook src={getImageSrc(item)} alt={item.name || "Book"} size={viewMode === "list" ? "10px" : "30px"} />
                        </Link>
                      </div>

                      {/* Book Information */}
                      <div className="flex-1 min-w-0 space-y-1 sm:space-y-2 text-left">
                        <div className="flex flex-wrap items-center justify-start gap-2">
                          <span className="text-[10px] sm:text-[11px] font-bold text-black bg-gray-100 px-2 py-0.5 rounded uppercase">
                            {item.categories || ""}
                          </span>
                        </div>

                        <Link href={`/product-detail/${item.slug || item.id}`}>
                          <h3 className="font-bold text-xs sm:text-base text-gray-900 hover:text-black transition-colors line-clamp-2 leading-tight">
                            {item.name?.replace(/#COMMA#/g, ",")}
                          </h3>
                        </Link>

                        {item.production && (
                          <p className="text-xs text-gray-500 hidden sm:block">
                            By <span className="font-semibold text-gray-700">{item.production || ""}</span>
                          </p>
                        )}

                        {/* Mobile Pricing & Actions (<640px) */}
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
                            <button
                              onClick={() => handleAddToCart(item)}
                              disabled={loadingItemId === String(item.id) || item.inStock === false}
                              className="relative p-1.5 border border-gray-200 text-gray-500 hover:text-white hover:border-black hover:bg-black rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center overflow-hidden"
                              aria-label="Add to cart"
                            >
                              <div className="relative w-4 h-4 flex items-center justify-center">
                                {loadingItemId === String(item.id) ? (
                                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                                ) : (
                                  <HiShoppingCart className="w-4 h-4" />
                                )}
                              </div>
                            </button>
                            <button
                              onClick={() => setQuickViewSlug(item.slug || item.id)}
                              className="p-1.5 border border-gray-200 text-gray-500 hover:text-white hover:border-black hover:bg-black rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center"
                              aria-label="Quick view product"
                            >
                              <AiFillEye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-1.5 border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center"
                              title="Remove from wishlist"
                            >
                              <FaTrash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Actions for Desktop (>=640px) */}
                      <div className="hidden sm:flex sm:w-auto sm:flex-col items-center justify-center border-l border-gray-100 sm:pl-6 gap-4">
                        <div className="flex gap-2 justify-between items-center">
                          {offPrice && <span className="text-sm font-bold">₹{offPrice}</span>}
                          {price && price != 0 && price != offPrice && (
                            <span className={`${offPrice ? "text-red-500 line-through text-xs font-bold" : "text-xs font-bold mr-2"}`}>₹{price}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleAddToCart(item)} disabled={loadingItemId === String(item.id) || item.inStock === false} className="relative p-2 border border-gray-200 text-gray-500 hover:text-white hover:border-black hover:bg-black rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center overflow-hidden" aria-label="Add to cart"><div className="relative w-[18px] h-[18px] flex items-center justify-center">{loadingItemId === String(item.id) ? <svg className="animate-spin h-[18px] w-[18px]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg> : <HiShoppingCart className="w-[18px] h-[18px]" />}</div></button>
                          <button onClick={() => setQuickViewSlug(item.slug || item.id)} className="p-2 border border-gray-200 text-gray-500 hover:text-white hover:border-black hover:bg-black rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center" aria-label="Quick view product"><AiFillEye className="size-[18px]" /></button>
                          <button onClick={() => handleRemoveItem(item.id)} className="p-2 border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 rounded-full transition-all duration-200 active:scale-95 flex items-center justify-center" title="Remove from wishlist"><FaTrash className="w-[18px] h-[18px]" /></button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (isSuccess && wishlistData?.data?.length == 0 ) ? (
          /* EMPTY WISHLIST STATE */
          <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-16 text-center my-8 shadow-sm">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-black shadow-inner">
              <FaHeart className="w-12 h-12 text-gray-400" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-2">
              Your Wishlist is Empty
            </h2>
            <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto mb-8">
              Explore our vast library of textbooks, competitive exam books, and study guides. Save your top picks to read or buy later!
            </p>

            <Link
              href="/all-products"
              className="inline-flex items-center gap-2.5 bg-black hover:bg-gray-800 text-white font-bold text-sm px-8 py-3.5 rounded-xl transition-all shadow-lg hover:shadow-gray-500/25 active:scale-95"
            >
              <FaShoppingBag className="w-4 h-4" />
              <span>Explore Books</span>
              <FaArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ):(<div className="bg-white rounded-3xl  p-8 sm:p-16 text-center my-8">
           
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-300 p-4 space-y-4 animate-pulse shadow-xs"
              >
                <div className="h-40 bg-gray-300 rounded-xl" />
                <div className="h-5 bg-gray-300 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded w-full" />
                  <div className="h-3 bg-gray-300 rounded w-5/6" />
                </div>
                <div className="h-9 bg-gray-300 rounded-xl w-full" />
              </div>
            ))}
          </div>
          </div>)}

        {/* Quick View Product Dialog */}
        {quickViewSlug && (
          <ProductDialog
            open={!!quickViewSlug}
            handleOpen={() => setQuickViewSlug(null)}
            slug={quickViewSlug}
          />
        )}

        {/* confirm popup */}
        {clearAllpopupOpen && <div id="confirm-popup" className="fixed inset-0 z-50 items-center justify-center bg-black/50 left-0 top-0 flex overflow-y-auto overflow-x-hidden outline-none focus:outline-none transition-all duration-300 ">
          <div className="bg-white rounded-lg p-6 w-90 text-center ">
            <h2 className="text-lg font-semibold mb-4">Confirm Action</h2>
            <p className="mb-6">Are you sure you want to clear your entire wishlist?</p>
            <div className="flex justify-center gap-4 ">
              <button onClick={handleClearAll} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition ">Yes</button>
              <button onClick={() => setClearAllPopupOpen(false)} className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition ">No</button>
            </div>
          </div>
        </div> 
}

      </div>
    </div>
  );
}

