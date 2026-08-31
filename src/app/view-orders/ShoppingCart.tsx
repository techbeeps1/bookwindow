"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import config from "@/app/config";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { IoCheckmarkCircle, IoBagHandle, IoArrowForward, IoLocationOutline, IoCallOutline, IoMailOutline } from "react-icons/io5";
import FadeLoaderOverlay from "@/components/loader";

interface CartItem {
  id: number;
  product_name: string;
  price: number;
  quantity: number;
  total: number;
  product_image: string;
  size?: string;
}

export default function ShoppingCart() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order_number");

  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const [orderData, setOrderData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }

    const viewOrder = async () => {
      setLoading(true);
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
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    viewOrder();
  }, [orderNumber]);

  if (loading) {
    return <FadeLoaderOverlay />;
  }

  if (!orderNumber || (!loading && Object.keys(orderData).length === 0 && orderItems.length === 0)) {
    return (
      <section className="bg-white py-16 min-h-[60vh] flex items-center justify-center">
        <div className="container mx-auto px-4 text-center max-w-lg">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-400">
            <IoBagHandle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-neutral-900 mb-2">No Order Details Found</h1>
          <p className="text-neutral-500 text-sm mb-6">
            We couldn&apos;t find details for this order number. Please check your order history or return to the store.
          </p>
          <Link
            href="/all-products"
            className="inline-flex items-center gap-2 bg-black hover:bg-neutral-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-md"
          >
            <span>Browse Products</span>
            <IoArrowForward className="w-4 h-4" />
          </Link>
        </div>
      </section>
    );
  }

  const isCod =
    orderData?.payment_method?.toLowerCase() === "cod" ||
    Number(orderData?.delivery_amount) > 0 ||
    Number(orderData?.cod_amount) > 0 ||
    Number(orderData?.cod_charges) > 0;

  const codCharge =
    Number(orderData?.delivery_amount) ||
    Number(orderData?.cod_amount) ||
    Number(orderData?.cod_charges) ||
    (isCod ? 49 : 0);

  const subtotalAmount =
    Number(orderData?.subtotal) ||
    orderItems.reduce((acc, it) => acc + (Number(it.total) || Number(it.price) * Number(it.quantity)), 0);

  const discountAmount = Number(orderData?.discount_amount) || 0;

  const shippingCost =
    orderData?.shipping_amount !== undefined &&
    orderData?.shipping_amount !== null &&
    orderData?.shipping_amount !== ""
      ? orderData?.shipping_amount
      : orderData?.shipping_method
        ? orderData?.shipping_method === "standard"
          ? "49"
          : orderData?.shipping_method
        : "49";

  const shippingCostNum = !isNaN(Number(shippingCost))
    ? Number(shippingCost)
    : !isNaN(Number(String(shippingCost).replace(/[^\d.]/g, "")))
      ? Number(String(shippingCost).replace(/[^\d.]/g, ""))
      : 49;

  const codChargeNum = isCod ? codCharge : 0;

  // Correct Total = Subtotal - Discount + Shipping + COD Charges
  const calculatedTotal = subtotalAmount - discountAmount + shippingCostNum + codChargeNum;

  const finalTotal =
    calculatedTotal > 0
      ? calculatedTotal.toFixed(2)
      : Number(orderData?.total_amount) > 0
        ? Number(orderData?.total_amount).toFixed(2)
        : "0.00";

  const customerName =
    orderData?.billing_name ||
    (orderData?.first_name ? `${orderData?.first_name} ${orderData?.last_name || ""}`.trim() : "") ||
    orderData?.name;

  const fullAddress = [
    orderData?.address,
    orderData?.billing_city || orderData?.city,
    orderData?.billing_state || orderData?.state,
    orderData?.billing_zip || orderData?.zip_code || orderData?.zip,
  ]
    .filter(Boolean)
    .join(", ");

  const customerPhone = orderData?.customer_phone || orderData?.phone;

  return (
    <>
      <section className="bg-neutral-50/40 py-8 md:py-14 min-h-screen">
        <div className="mx-auto container max-w-5xl px-4 sm:px-6">
          {/* Success Banner */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 mb-8 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 text-green-600 rounded-full mb-4 border border-green-100 shadow-inner">
              <IoCheckmarkCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-tight mb-2">
              Thank you for your order!
            </h1>
            <p className="text-neutral-500 text-sm sm:text-base max-w-xl mx-auto font-medium">
              Your order <span className="font-bold text-neutral-900 font-mono">#{orderData?.order_number || orderNumber}</span> has been placed successfully.
            </p>
          </div>

          {/* Quick Meta Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block mb-1">
                Order No.
              </span>
              <span className="text-xs sm:text-sm font-black text-neutral-900 font-mono truncate block">
                #{orderData?.order_number || orderNumber}
              </span>
            </div>

            <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block mb-1">
                Order Date
              </span>
              <span className="text-xs sm:text-sm font-bold text-neutral-800 truncate block">
                {orderData?.created_at || "Just now"}
              </span>
            </div>

            <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block mb-1">
                Payment
              </span>
              <span className="text-xs sm:text-sm font-black uppercase text-neutral-900 truncate block">
                {isCod ? "COD" : orderData?.payment_method ? String(orderData?.payment_method).toUpperCase() : "Online"}
              </span>
            </div>

            <div className="bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-sm">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block mb-1">
                Status
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider bg-green-50 text-green-800 border border-green-200">
                {orderData?.status || "Placed"}
              </span>
            </div>
          </div>

          {/* Main Grid: Items and Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Ordered Items */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
                  <h2 className="text-base font-extrabold uppercase tracking-wider text-neutral-900">
                    Order Items ({orderItems.length})
                  </h2>
                </div>

                <div className="divide-y divide-neutral-100 space-y-4">
                  {orderItems?.map((item) => (
                    <div key={item.id} className="pt-4 first:pt-0 flex items-center gap-4">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-neutral-50 border border-neutral-200/80 rounded-xl p-1.5 flex items-center justify-center flex-shrink-0">
                        <Image
                          className="object-contain max-h-full max-w-full rounded-md"
                          src={
                            item.product_image?.startsWith("http")
                              ? item.product_image
                              : `${config.apiUrl}storage/app/public/${item.product_image}`
                          }
                          alt={item.product_name}
                          width={80}
                          height={80}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs sm:text-sm font-bold text-neutral-900 line-clamp-2 leading-snug">
                          {item.product_name ? item.product_name.replace(/#COMMA#/g, ",") : ""}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-neutral-500 font-semibold">
                          <span>Unit: ₹{item.price}</span>
                          <span>•</span>
                          <span className="bg-neutral-100 px-2 py-0.5 rounded font-bold text-neutral-800">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="text-right font-black text-sm sm:text-base text-neutral-900 whitespace-nowrap">
                        ₹{item.total || Number(item.price) * Number(item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address Card (if available) */}
              {fullAddress && (
                <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-sm">
                  <div className="flex items-center gap-2 pb-3 mb-3 border-b border-neutral-100">
                    <IoLocationOutline className="w-5 h-5 text-neutral-700" />
                    <h2 className="text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                      Delivery Address
                    </h2>
                  </div>
                  {customerName && (
                    <p className="text-sm font-bold text-neutral-900 mb-1">{customerName}</p>
                  )}
                  <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
                    {fullAddress}
                  </p>
                  {customerPhone && (
                    <p className="flex items-center gap-1.5 text-xs text-neutral-500 font-semibold mt-3">
                      <IoCallOutline className="w-3.5 h-3.5" />
                      <span>{customerPhone}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-sm space-y-5">
                <p className="text-base font-extrabold uppercase tracking-wider text-neutral-900 pb-3 border-b border-neutral-100">
                  Order Summary
                </p>

                <div className="space-y-3.5 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center">
                    <span>Subtotal</span>
                    <span className="text-neutral-900 font-black text-sm">
                      ₹{orderData?.subtotal || orderItems.reduce((acc, it) => acc + (it.total || it.price * it.quantity), 0)}
                    </span>
                  </div>

                  {/* Discount */}
                  {discountAmount > 0 && (
                    <div className="flex justify-between items-center text-green-700">
                      <span>Discount</span>
                      <span className="font-black text-sm">-₹{discountAmount}</span>
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex justify-between items-center">
                    <span>Shipping Charges</span>
                    <span className="text-neutral-900 font-black text-sm">
                      {shippingCost ? (String(shippingCost).startsWith("₹") ? shippingCost : `₹${shippingCost}`) : "₹49"}
                    </span>
                  </div>

                  {/* COD Charges */}
                  {isCod && (
                    <div className="flex justify-between items-center bg-neutral-50 px-3 py-2 rounded-xl border border-neutral-200/70">
                      <span className="text-neutral-800">COD Charges</span>
                      <span className="text-neutral-950 font-black text-sm">₹{codCharge}</span>
                    </div>
                  )}

                  {/* Payment Method */}
                  <div className="flex justify-between items-center pt-2 border-t border-neutral-100">
                    <span className="text-neutral-400">Payment Mode</span>
                    <span className="text-neutral-900 font-extrabold">
                      {isCod ? "Cash On Delivery (+₹49)" : "Online Payment"}
                    </span>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-baseline pt-4 border-t border-neutral-200">
                    <span className="text-sm font-black text-neutral-900 uppercase">Total Amount</span>
                    <span className="text-2xl font-black text-neutral-950">
                      ₹{finalTotal}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2.5 pt-2">
                  <Link
                    href="/all-products"
                    className="w-full py-3.5 bg-black hover:bg-neutral-900 text-white rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Continue Shopping</span>
                    <IoArrowForward className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/my-account"
                    className="w-full py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl font-bold text-xs tracking-wider uppercase transition-all duration-200 flex items-center justify-center cursor-pointer"
                  >
                    View All Orders
                  </Link>
                </div>
              </div>

              {/* Support info card */}
              <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm space-y-2 text-xs text-neutral-600">
                <p className="font-extrabold uppercase tracking-wider text-neutral-900">Need help with your order?</p>
                <div className="flex items-center gap-2 text-neutral-500 font-medium">
                  <IoMailOutline className="w-4 h-4 text-neutral-400" />
                  <span>info@bookwindow.in</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-500 font-medium">
                  <IoCallOutline className="w-4 h-4 text-neutral-400" />
                  <span>+91 96023 68227</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}