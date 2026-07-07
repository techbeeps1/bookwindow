
"use client";

import Image from "next/image";
import { FaMinus, FaPlus, FaRegWindowClose, FaShoppingBag } from "react-icons/fa";
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
          <h2 className="text-xl font-semibold">
            Shopping Cart ({cart?.items_count ?? 0})
          </h2>

          <button onClick={() => dispatch(closeCartDrawer())}>
            <FaRegWindowClose size={24} />
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
                    <h4 className="line-clamp-2 font-medium">
                      {item.product_name}
                    </h4>

                    <p className="mt-2 font-bold text-red-600">
                      ₹{item.product_price}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded border">
                        <button
                          disabled={updating}
                          onClick={() => handleDecrease(item.product_id)}
                          className="px-3 py-2 hover:bg-gray-100"
                        >
                          <FaMinus size={12} />
                        </button>

                        <span className="px-4">{item.quantity}</span>

                        <button
                          disabled={updating}
                          onClick={() => handleIncrease(item.product_id)}
                          className="px-3 py-2 hover:bg-gray-100"
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>

                      <button
                        disabled={removing}
                        onClick={() => handleRemove(item.product_id)}
                        className="text-red-600"
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
