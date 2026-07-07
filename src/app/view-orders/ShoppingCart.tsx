"use client";

import { useEffect, useState } from "react";

import config from "@/app/config";
import axios from "axios";

import Image from "next/image";

interface CartItem {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  total: number;
  product_image: string;
}

export default function ShoppingCart() {
  
  const orderNumber = "5555" ;

  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [orderData, setOrderData] = useState<any>({});

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!orderNumber) return;

    const viewOrder = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/orders/${orderNumber}`,
          responseType: "json",
        });

        const data = response?.data?.data;
        setOrderItems(data?.items || []);
        setOrderData(data?.order || {});
      } catch (error) {
        console.log("error", error);
      }
    };

    viewOrder();
  }, [orderNumber]);

  return (
    <>


      <section className="bg-white py-8 md:py-16 mb-4">
        <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
          <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            Your Orders
          </h2>

          <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
            
            {/* ITEMS */}
            <div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl">
              <div className="space-y-6">

                <div className="hidden md:grid grid-cols-5 gap-6 px-4 md:px-6 py-2 text-sm font-semibold text-gray-600 border-b border-gray-300">
                  <div>#</div>
                  <div>Product</div>
                  <div className="text-center">Unit Price</div>
                  <div className="text-center">Quantity</div>
                  <div className="text-end">Total</div>
                </div>

                {orderItems?.length > 0 &&
                  orderItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6"
                    >
                      <div className="grid grid-cols-5 gap-6 items-center">

                        <Image
                          className="object-contain"
                          src={`${config.apiUrl}storage/${item.product_image}`}
                          alt={item.product_name}
                          width={150}
                          height={200}
                        />

                        <div className="text-base font-medium text-gray-900">
                          {item.product_name}
                        </div>

                        <div className="text-center font-bold text-gray-900">
                          ₹{item.price}
                        </div>

                        <div className="text-center font-bold text-gray-900">
                          {item.quantity}
                        </div>

                        <div className="text-end font-bold text-gray-900">
                          ₹{item.total}
                        </div>

                      </div>
                    </div>
                  ))}

              </div>
            </div>

            {/* SUMMARY */}
            <div className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full">
              <div className="space-y-4 border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                
                <p className="text-xl font-semibold text-gray-900">
                  Order Summary
                </p>

                <div className="space-y-4">

                  <div className="flex justify-between">
                    <span>Order Number</span>
                    <span>{orderData?.order_number}</span>
                  </div>

                  <div className="flex justify-between border-t pt-2">
                    <span>Subtotal</span>
                    <span>₹{orderData?.subtotal}</span>
                  </div>

                  <div className="flex justify-between border-t pt-2 text-green-500">
                    <span>Discount</span>
                    <span>-₹{orderData?.discount_amount}</span>
                  </div>

                  <div className="flex justify-between border-t pt-2">
                    <span>Total</span>
                    <span>₹{orderData?.total_amount}</span>
                  </div>

                  <div className="flex justify-between border-t pt-2">
                    <span>Status</span>
                    <span>{orderData?.status}</span>
                  </div>

                  <div className="flex justify-between border-t pt-2">
                    <span>Ordered On</span>
                    <span>{orderData?.created_at}</span>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


    </>
  );
}