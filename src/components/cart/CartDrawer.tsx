
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

export default function CartDrawer() {
  const dispatch = useAppDispatch();
  const { cartDrawer } = useAppSelector((state) => state.ui);
 const sessionId = useSession();

  const { data: cart, isLoading, isFetching } = useViewCartQuery(sessionId, {
    skip: !sessionId,
  });

  console.log("Cart Data:", cart);  

  const [updateCart, { isLoading: updating }] = useUpdateCartMutation();
  const [removeCart, { isLoading: removing }] = useRemoveCartMutation();

  const handleIncrease = (productId: string) => {
    updateCart({
      product_id: productId,
      session_id: sessionId,
      quantity_change: 1,
    });
  };

  const handleDecrease = (productId: string) => {
    updateCart({
      product_id: productId,
      session_id: sessionId,
      quantity_change: -1,
    });
  };

  const handleRemove = (productId: string) => {
    removeCart({
      product_id: productId,
      session_id: sessionId,
    });
  };

  return (
    <>
      <div
        onClick={() => dispatch(closeCartDrawer())}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
          cartDrawer ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      <aside
        className={`fixed top-0 right-0 z-[9999] h-screen w-full sm:w-[430px] bg-white shadow-2xl transition-transform duration-300 ${
          cartDrawer ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <div className="relative flex items-center justify-center w-8 h-8">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5 text-black"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                />
              </svg>
              <span className="absolute -top-1 -right-1 bg-black text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                {cart?.items_count ?? 0}
              </span>
            </div>
            <span>Shopping Cart</span>
          </h2>

          <button
            onClick={() => dispatch(closeCartDrawer())}
            className="p-1 hover:bg-neutral-100 rounded-full transition-colors focus:outline-none"
            aria-label="Close cart"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-gray-500 hover:text-black transition-colors"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {(isLoading || isFetching) && (
          <div className="p-6 text-center">Loading cart...</div>
        )}

        {!isLoading && cart?.items?.length === 0 && (
          <div className="flex h-[70vh] flex-col items-center justify-center">
            <FaShoppingBag className="text-gray-300" size={60} />
            <h3 className="mt-4 text-xl font-semibold">Your cart is empty</h3>
          </div>
        )}

        {!isLoading && cart?.items?.length > 0 && (
          <>
            <div className="h-[calc(100vh-220px)] overflow-y-auto">
              {cart.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex gap-4 border-b p-4"
                >
                  <Image
                    src={`${config.apiUrl}storage/app/public/${item.image}`}                   
                    alt={item.product_name}
                    width={80}
                    height={80}
                    className="rounded-lg object-cover"
                  />

                  <div className="flex-1">
                    <h4 className="line-clamp-2 font-medium text-sm text-neutral-800">
                      {item.product_name}
                    </h4>

                    <p className="mt-2 font-bold text-black text-sm">
                      ₹{item.product_price}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center bg-[#f4f4f4] rounded-full p-1 border border-neutral-200">
                        <button
                          type="button"
                          disabled={updating}
                          onClick={() => handleDecrease(item.product_id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-white hover:text-black hover:shadow-sm active:scale-95 transition-all duration-200 focus:outline-none disabled:opacity-50 shrink-0"
                        >
                          <FaMinus size={10} className="pointer-events-none" />
                        </button>

                        <span className="w-10 text-center text-sm font-bold text-gray-900 select-none">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          disabled={updating}
                          onClick={() => handleIncrease(item.product_id)}
                          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-600 hover:bg-white hover:text-black hover:shadow-sm active:scale-95 transition-all duration-200 focus:outline-none disabled:opacity-50 shrink-0"
                        >
                          <FaPlus size={10} className="pointer-events-none" />
                        </button>
                      </div>

                      <button
                        disabled={removing}
                        onClick={() => handleRemove(item.product_id)}
                        className="text-neutral-400 hover:text-black transition-colors"
                      >
                        <CiTrash size={22} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-0 w-full border-t bg-white p-5">
              <div className="mb-4 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>₹{cart.total}</span>
              </div>

              <Link href="/checkout" onClick={()=>{    dispatch(closeCartDrawer());}} className="block w-full rounded-lg bg-black py-3 text-white text-center font-semibold hover:bg-gray-800 transition-colors">
                Proceed to Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
