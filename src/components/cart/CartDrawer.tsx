"use client";

import Image from "next/image";
import { FaMinus, FaPlus, FaShoppingBag } from "react-icons/fa";
import { CiTrash } from "react-icons/ci";
import { useAppDispatch, useAppSelector } from "@/hooks/useStore";
import { closeCartDrawer } from "@/lib/slices/uiSlice";
import {
  useViewCartQuery,
  useUpdateCartMutation,
  useRemoveCartMutation,
} from "@/lib/api/cartApi";
import Link from "next/link";
import config from "@/app/config";
import { useSession } from "@/hooks/useSession";
import { motion, AnimatePresence } from "framer-motion";
import { FiX } from "react-icons/fi";
import { IoBagOutline } from "react-icons/io5";
import { BsCartCheck } from "react-icons/bs";
import { useState, useEffect } from "react";

// Loading Skeleton Component - Only shown on initial load
const CartSkeleton = () => (
  <div className="p-4 space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="flex gap-4 animate-pulse">
        <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="flex justify-between">
            <div className="h-8 bg-gray-200 rounded-full w-24"></div>
            <div className="h-8 bg-gray-200 rounded-full w-8"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Cart Item Component with per-item loading states
const CartItem = ({ 
  item, 
  onIncrease, 
  onDecrease, 
  onRemove,
  isUpdatingThisItem,
  isRemovingThisItem,
}:any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ 
        opacity: 0, 
        x: -100,
        transition: { duration: 0.2 }
      }}
      layout
      className={`flex gap-4 p-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-200 group relative ${
        isUpdatingThisItem ? 'bg-blue-50/30' : ''
      }`}
    >
      {/* Subtle update indicator overlay */}
      {isUpdatingThisItem && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10"
        >
          <div className="flex items-center gap-3 bg-white/90 px-4 py-2 rounded-full shadow-lg">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700">Updating...</span>
          </div>
        </motion.div>
      )}

      {/* Removing overlay */}
      {isRemovingThisItem && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-gray-200 border-t-red-500 rounded-full animate-spin"></div>
            <span className="text-xs text-gray-500 font-medium">Removing...</span>
          </div>
        </motion.div>
      )}

      <div className="relative w-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        <Image
          src={`${config.apiUrl}storage/app/public/${item.image}`}
          alt={item.product_name}
          width={180}
          height={100}
          className="object-cover"

        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-gray-800 line-clamp-2 group-hover:text-black transition-colors">
          {item.product_name}
        </h4>

        <p className="mt-1 font-bold text-black text-sm">
          ₹{item.product_price}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center bg-gray-100 rounded-full p-0.5 border border-gray-200">
            <button
              type="button"
              disabled={isUpdatingThisItem || isRemovingThisItem}
              onClick={() => onDecrease(item.product_id)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-600 hover:bg-white hover:text-black hover:shadow-sm active:scale-95 transition-all duration-200 focus:outline-none disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none disabled:cursor-not-allowed shrink-0"
            >
              <FaMinus size={10} className="pointer-events-none" />
            </button>

            <span className="w-8 text-center text-sm font-semibold text-gray-900 select-none">
              {item.quantity}
            </span>

            <button
              type="button"
              disabled={isUpdatingThisItem || isRemovingThisItem}
              onClick={() => onIncrease(item.product_id)}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-600 hover:bg-white hover:text-black hover:shadow-sm active:scale-95 transition-all duration-200 focus:outline-none disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:shadow-none disabled:cursor-not-allowed shrink-0"
            >
              <FaPlus size={10} className="pointer-events-none" />
            </button>
          </div>

          <button
            disabled={isUpdatingThisItem || isRemovingThisItem}
            onClick={() => onRemove(item.product_id)}
            className="text-red-500 hover:text-red-900 transition-all duration-200 hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <CiTrash size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function CartDrawer() {
  const dispatch = useAppDispatch();
  const { cartDrawer } = useAppSelector((state) => state.ui);
  const sessionId = useSession();

  // Track which item is being updated/removed
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { data: cart, isLoading, isFetching, refetch } = useViewCartQuery(sessionId, {
    skip: !sessionId,
  });
  
  const [updateCart] = useUpdateCartMutation();
  const [removeCart] = useRemoveCartMutation();

  // Set initial load to false after first data load
  useEffect(() => {
    if (!isLoading && cart) {
      setIsInitialLoad(false);
    }
  }, [isLoading, cart]);

  const handleIncrease = async (productId: string) => {
    if (updatingItemId || removingItemId) return;
    
    setUpdatingItemId(productId);
    try {
      await updateCart({
        product_id: productId,
        session_id: sessionId,
        quantity_change: 1,
      }).unwrap();
      // Refetch in background without showing loading state
      await refetch();
    } catch (error) {
      console.error('Failed to update cart:', error);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleDecrease = async (productId: string) => {
    if (updatingItemId || removingItemId) return;
    
    setUpdatingItemId(productId);
    try {
      await updateCart({
        product_id: productId,
        session_id: sessionId,
        quantity_change: -1,
      }).unwrap();
      await refetch();
    } catch (error) {
      console.error('Failed to update cart:', error);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (productId: string) => {
    if (updatingItemId || removingItemId) return;
    
    setRemovingItemId(productId);
    try {
      await removeCart({
        product_id: productId,
        session_id: sessionId,
      }).unwrap();
      await refetch();
    } catch (error) {
      console.error('Failed to remove item:', error);
    } finally {
      setRemovingItemId(null);
    }
  };

  const isCartEmpty = !isLoading && cart?.items?.length === 0;
  const hasItems = !isLoading && cart?.items?.length > 0;
  
  // Only show skeleton on initial load, not on subsequent fetches
  const showSkeleton = isLoading && isInitialLoad;

  return (
    <>
      {/* Backdrop with blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: cartDrawer ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => dispatch(closeCartDrawer())}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 ${
          cartDrawer ? "visible" : "invisible"
        }`}
      />

      {/* Drawer */}
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: cartDrawer ? 0 : "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={`fixed top-0 right-0 z-[10000] h-screen w-full sm:w-[420px] bg-white shadow-2xl flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-lg font-bold flex items-center gap-3"
          >
            <div className="relative flex items-center justify-center w-8 h-8">
              <IoBagOutline className="w-5 h-5 text-black" />
              {!isLoading && cart?.items_count > 0 && (
                <motion.span
                  key={cart?.items_count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full"
                >
                  {cart.items_count}
                </motion.span>
              )}
            </div>
            <span>Cart</span>
          </motion.h2>

          <button
            onClick={() => dispatch(closeCartDrawer())}
            className="p-2 hover:bg-gray-100 rounded-full transition-all duration-200 hover:rotate-90 focus:outline-none"
            aria-label="Close cart"
          >
            <FiX className="w-5 h-5 text-gray-500 hover:text-black transition-colors" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden relative">
          {/* Only show skeleton on initial load */}
          {showSkeleton && <CartSkeleton />}

          {/* Show empty state */}
          {!isLoading && isCartEmpty && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="h-full flex flex-col items-center justify-center p-8"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <FaShoppingBag className="text-gray-400" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800">Your cart is empty</h3>
              <p className="text-gray-500 text-sm mt-2 text-center">
                Looks like you haven't added anything to your cart yet
              </p>
              <button
                onClick={() => dispatch(closeCartDrawer())}
                className="mt-6 px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Continue Shopping
              </button>
            </motion.div>
          )}

          {/* Show cart items */}
          {hasItems && (
            <>
              <div className="h-[calc(100vh-220px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent hover:scrollbar-thumb-gray-300">
                <AnimatePresence mode="popLayout">
                  {cart.items.map((item: any) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onIncrease={handleIncrease}
                      onDecrease={handleDecrease}
                      onRemove={handleRemove}
                      isUpdatingThisItem={updatingItemId === item.product_id}
                      isRemovingThisItem={removingItemId === item.product_id}
                    />
                  ))}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute bottom-0 w-full border-t border-gray-200 bg-white p-5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-800">Subtotal</p>
                    <p className="text-xs text-gray-600">
                      {cart.items_count} {cart.items_count === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <motion.span
                    key={cart.total}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-bold text-black"
                  >
                    ₹{cart.total}
                  </motion.span>
                </div>

                <Link
                  href="/checkout"
                  onClick={() => dispatch(closeCartDrawer())}
                  className="group flex items-center justify-center gap-2 w-full rounded-lg bg-black py-3.5 text-white text-center font-semibold hover:bg-gray-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  <BsCartCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Proceed to Checkout
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </motion.aside>
    </>
  );
}