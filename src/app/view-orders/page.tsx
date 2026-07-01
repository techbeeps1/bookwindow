"use client";

import { useEffect, useState } from "react";
// components
import { Navbar, Footer } from "@/components";
import MainNavbar from "@/components/main-navbar";
import config from "@/app/config";
import axios from "axios";
import { useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();
  // const [session, setSession] = useState("");
  const [orderItems, setOrderItems] = useState([] as CartItem[]);
  const orderNumber = searchParams.get("order_number");
  const [orderData, setOrderData] = useState({} as any);
  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);
  // const checkSession = async () => {
  //   const res = await fetch("/api/debug", {
  //     method: "GET",
  //     credentials: "include",
  //   });
  //   const data = await res.json();
  //   setSession(data?.session_id);
  //   // console.log("Session info:", data);
  // };

  useEffect(() => {
    const viewOrder = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/orders/${orderNumber}`,
          responseType: "json",
        });
        const data = response?.data?.data;
        // console.log("data?.order", data?.order);
        setOrderItems(data?.items);
        setOrderData(data?.order);
      } catch (error) {
        console.log("error", error);
      } finally {
        // console.log("An error occured");89192
      }
    };

    viewOrder();
  }, [orderNumber]);

  // useEffect(() => {
  //   checkSession();
  // }, []);

  useEffect(() => {}, [orderItems, orderData]);

  return (
    <>
      <Navbar />
      <MainNavbar />
      <section className="bg-white py-8 md:py-16 mb-4">
        <div className="mx-auto max-w-screen-xl px-4 2xl:px-0">
          <h2 className="text-xl font-semibold text-gray-900  sm:text-2xl">
            Your Orders
          </h2>

          <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
            {/* Cart Items */}
            <div className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl">
              <div className="space-y-6">
                {/* Header Row */}
                <div className="hidden md:grid grid-cols-5 gap-6 px-4 md:px-6 py-2 text-sm font-semibold text-gray-600 border-b border-gray-300">
                  <div>#</div>
                  <div>Product</div>
                  <div className="text-center">Unit Price</div>
                  <div className="text-center">Quantity</div>
                  <div className="text-end">Total</div>
                </div>
                {orderItems?.length &&
                  orderItems?.map((item) => (
                    <div
                      key={item?.id}
                      className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-6"
                    >
                      <div className="grid grid-cols-5 gap-6 items-center">
                        {/* Image */}
                        <Image
                          className="object-contain"
                          src={`${config.apiUrl}storage/${item.product_image}`}
                          alt={`item.product_name`}
                          width={150}
                          height={200}
                        />

                        {/* Product Name */}
                        <div className="space-y-1">
                          <a
                            href={"#"}
                            className="text-base font-medium text-gray-900 hover:underline"
                          >
                            {item.product_name}
                          </a>
                        </div>

                        {/* Unit Price */}
                        <div className="text-center text-base font-bold text-gray-900">
                          ₹{item.price}
                        </div>

                        {/* Quantity */}
                        <div className="text-center text-base font-bold text-gray-900">
                          {item.quantity}
                        </div>

                        {/* Total */}
                        <div className="text-end text-base font-bold text-gray-900">
                          ₹{item.total}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full">
              <div className="space-y-4 border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <p className="text-xl font-semibold text-gray-900">
                  Order Summary
                </p>

                <div className="space-y-4">
                  <dl className="flex justify-between gap-4">
                    <dt className="text-base font-normal text-gray-900">
                      Order Number
                    </dt>
                    <dd className="text-base font-medium text-gray-500">
                      {orderData?.order_number}
                    </dd>
                  </dl>
                  <dl className="flex justify-between gap-4 border-t border-gray-200 pt-2">
                    <dt className="text-base font-normal text-gray-900">
                      Subtotal
                    </dt>
                    <dd className="text-base font-bold text-gray-500">
                      ₹{orderData?.subtotal}
                    </dd>
                  </dl>
                  <dl className="flex justify-between gap-4 border-t border-gray-200 pt-2">
                    <dt className="text-base font-normal text-green-400">
                      Discount
                    </dt>
                    <dd className="text-base font-bold text-green-400">
                      -₹{orderData?.discount_amount}
                    </dd>
                  </dl>
                  <dl className="flex justify-between gap-4 border-t border-gray-200 pt-2">
                    <dt className="text-base font-normal text-gray-900">
                      Total
                    </dt>
                    <dd className="text-base font-bold text-gray-500">
                      ₹{orderData?.total_amount}
                    </dd>
                  </dl>
                  <dl className="flex justify-between gap-4 border-t border-gray-200 pt-2">
                    <dt className="text-base font-normal text-gray-900">
                      Order Status
                    </dt>
                    <dd className="text-base font-bold text-gray-500">
                      {orderData?.status}
                    </dd>
                  </dl>
                  <dl className="flex justify-between gap-4 border-t border-gray-200 pt-2">
                    <dt className="text-base font-normal text-gray-900">
                      Ordered On
                    </dt>
                    <dd className="text-base font-bold text-gray-500">
                      {/* 16/04/2025  */}
                      {orderData?.created_at}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
