"use client";

import axios from "axios";
import { FormEvent, useEffect, useState } from "react";
import config from "../config";
import { useRouter } from "next/navigation";

type AccountTab =
  | "dashboard"
  | "orders"
  | "addresses"
  | "account-details"
  | "password"
  | "logout";

interface TabItem {
  key: AccountTab;
  label: string;
}

const tabs: TabItem[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "orders", label: "Orders" },
  { key: "addresses", label: "Addresses" },
  { key: "account-details", label: "Account Details" },
  { key: "password", label: "Password" },
  { key: "logout", label: "Log Out" },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<AccountTab>("dashboard");
  const [customer, setCustomer] = useState<any>(null);
  const [userOrders, setUserOrders] = useState([] as any);
  const router = useRouter();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const customerData = localStorage.getItem("customer");
      if (customerData) {
        setCustomer(JSON.parse(customerData));
      } else {
        router.push("/");
      }
    }
  }, [router]);

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("customer");
      localStorage.clear();
      window.location.reload();
    }
  };

  useEffect(() => {
    const fetchOrdersData = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/user_order/${customer?.id}`,
          responseType: "json",
        });
        const orders = response?.data;
        setUserOrders(orders?.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    if (customer?.id) {
      fetchOrdersData();
    }
  }, [customer?.id]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab customer={customer} logout={logout} setActiveTab={setActiveTab} />;
      case "orders":
        return <OrdersTab userOrders={userOrders} />;
      case "password":
        return <PasswordTab customer={customer} />;
      case "addresses":
        return <AddressesTab customer={customer} />;
      case "account-details":
        return <AccountDetailsTab customer={customer} />;
      case "logout":
        return (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <svg className="w-12 h-12 text-neutral-300 mb-3 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <p className="text-sm font-bold text-neutral-800 uppercase tracking-widest">Logging out...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-white py-12 min-h-screen">
        <div className="container mx-auto max-w-screen-xl px-4">
          
          {/* Main Layout Card Grid */}
          <div className="bg-white border border-neutral-200/80 rounded-3xl flex flex-col md:flex-row overflow-hidden min-h-[60vh]">
            
            {/* Sidebar container */}
            <aside className="w-full md:w-64 flex-shrink-0 bg-[#fbfbfb] border-b md:border-b-0 md:border-r border-neutral-200/80 p-6 flex flex-col gap-6">
              
              {/* User block info */}
              {customer && (
                <div className="pb-4 border-b border-neutral-200">
                  <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider block mb-1">Account Workspace</span>
                  <span className="text-sm font-bold text-neutral-900 block truncate">
                    {customer.first_name} {customer.last_name}
                  </span>
                  <span className="text-sm text-neutral-450 block truncate mt-0.5">
                    {customer.email}
                  </span>
                </div>
              )}

              {/* Navigation Tabs */}
              <nav className="flex flex-col gap-2">
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveTab(tab.key);
                        if (tab.key === "logout") {
                          logout();
                        }
                      }}
                      className={`w-full text-left py-2.5 transition-all text-sm uppercase tracking-wider cursor-pointer ${
                        isActive
                          ? "border-l-2 border-black pl-3 text-black font-bold"
                          : "border-l-2 border-transparent pl-3 text-neutral-400 hover:text-black hover:border-neutral-300 font-medium"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </aside>

            {/* Main Content Area wrapper */}
            <main className="flex-1 bg-white p-6 sm:p-10">
              {renderTabContent()}
            </main>
          </div>

        </div>
      </div>
    </>
  );
}

// ================= TAB SECTIONS =================

function DashboardTab({ customer, logout, setActiveTab }: any) {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 tracking-tight uppercase mb-1">Dashboard</h1>
        <p className="text-sm text-neutral-500">
          Hello <span className="text-black font-bold">{customer?.first_name}</span> (not {customer?.first_name}?{" "}
          <button onClick={() => logout()} className="text-red-500 hover:underline font-bold cursor-pointer">
            Log out
          </button>)
        </p>
      </div>

      <p className="text-sm text-neutral-500 font-medium leading-relaxed pt-2">
        From your account dashboard you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.
      </p>

      {/* Grid of clean shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        {/* Orders Card */}
        <div
          onClick={() => setActiveTab("orders")}
          className="p-5 bg-[#fbfbfb] hover:bg-neutral-50 border border-neutral-200/80 rounded-2xl cursor-pointer transition-all duration-200"
        >
          <span className="text-sm font-bold uppercase text-neutral-800 tracking-wider">Recent Orders</span>
          <p className="text-xs text-neutral-500 mt-1.5">View and track your purchases</p>
        </div>

        {/* Addresses Card */}
        <div
          onClick={() => setActiveTab("addresses")}
          className="p-5 bg-[#fbfbfb] hover:bg-neutral-50 border border-neutral-200/80 rounded-2xl cursor-pointer transition-all duration-200"
        >
          <span className="text-sm font-bold uppercase text-neutral-800 tracking-wider">Addresses</span>
          <p className="text-xs text-neutral-500 mt-1.5">Update shipping & billing details</p>
        </div>

        {/* Account Details Card */}
        <div
          onClick={() => setActiveTab("account-details")}
          className="p-5 bg-[#fbfbfb] hover:bg-neutral-50 border border-neutral-200/80 rounded-2xl cursor-pointer transition-all duration-200"
        >
          <span className="text-sm font-bold uppercase text-neutral-800 tracking-wider">Account Details</span>
          <p className="text-xs text-neutral-500 mt-1.5">Edit password and profile info</p>
        </div>
      </div>
    </div>
  );
}

function OrdersTab({ userOrders }: any) {
  const [isOrderShow, setIsOrderShow] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsOrderShow(true);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const sortedItems = Array.isArray(userOrders?.orders)
    ? [...userOrders?.orders].sort((a, b) => {
        const dateA = new Date(a.order_details.created_at.replace(" ", "T")).getTime();
        const dateB = new Date(b.order_details.created_at.replace(" ", "T")).getTime();
        return dateB - dateA;
      })
    : [];

  const currentItems = sortedItems?.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(userOrders?.orders?.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [userOrders?.orders]);

  return (
    <div>
      {!isOrderShow && (
        <>
          <div className="mb-6 pb-4 border-b border-neutral-100">
            <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 uppercase tracking-tight">Orders</h1>
            <p className="text-sm text-neutral-450 mt-1">Review your recent transactions and order status.</p>
          </div>

          {currentItems.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-neutral-200 rounded-2xl bg-[#fbfbfb]">
              <p className="text-sm text-neutral-450">No orders found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-neutral-200 rounded-xl bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="p-4 text-sm font-semibold uppercase tracking-wider text-neutral-500">Order ID</th>
                    <th className="p-4 text-sm font-semibold uppercase tracking-wider text-neutral-500">Date</th>
                    <th className="p-4 text-sm font-semibold uppercase tracking-wider text-neutral-500">Status</th>
                    <th className="p-4 text-sm font-semibold uppercase tracking-wider text-neutral-500">Total</th>
                    <th className="p-4 text-sm font-semibold uppercase tracking-wider text-neutral-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {currentItems.map((order: any) => {
                    const statusLower = order?.order_details?.status?.toLowerCase();
                    const isSuccess = ["delivered", "completed", "paid", "success"].some((s) => statusLower?.includes(s));
                    const isCancelled = ["cancelled", "failed", "refunded"].some((s) => statusLower?.includes(s));
                    
                    return (
                      <tr key={order?.id} className="hover:bg-neutral-50/40 transition-colors">
                        <td
                          className="p-4 text-sm font-bold text-neutral-900 cursor-pointer hover:underline"
                          onClick={() => handleViewOrder(order)}
                        >
                          #{order?.order_details?.order_number}
                        </td>
                        <td className="p-4 text-sm text-neutral-500">
                          {order?.order_details?.created_at}
                        </td>
                        <td className="p-4 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                            isSuccess
                              ? "bg-green-50 text-green-700 border-green-100"
                              : isCancelled
                              ? "bg-red-50 text-red-700 border-red-100"
                              : "bg-amber-50 text-amber-700 border-amber-100"
                          }`}>
                            {order?.order_details?.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-neutral-800 font-medium">
                          ₹{order?.order_details?.total_amount} <span className="text-neutral-455">({order?.items.length} {order?.items.length === 1 ? "item" : "items"})</span>
                        </td>
                        <td className="p-4 text-right">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="bg-black hover:bg-neutral-900 text-white text-xs font-semibold uppercase tracking-wider px-3.5 py-2 rounded-lg transition-all active:scale-95 cursor-pointer shadow-sm"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center mt-8 items-center space-x-6">
              {/* Previous Button */}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full border transition-all duration-200 active:scale-95 ${
                  currentPage === 1
                    ? "bg-[#f5f5f5] text-neutral-400 border-transparent cursor-not-allowed opacity-60"
                    : "bg-white text-black border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 hover:shadow-sm"
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-4 h-4 pointer-events-none"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                <span>Previous</span>
              </button>

              {/* Page Info */}
              <div className="flex items-center bg-[#f4f4f4] px-4 py-2 rounded-full border border-neutral-200">
                <span className="text-sm font-bold text-neutral-800">
                  Page <span className="text-black">{currentPage}</span> of{" "}
                  <span className="text-black">{totalPages}</span>
                </span>
              </div>

              {/* Next Button */}
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full border transition-all duration-200 active:scale-95 ${
                  currentPage === totalPages
                    ? "bg-[#f5f5f5] text-neutral-400 border-transparent cursor-not-allowed opacity-60"
                    : "bg-white text-black border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 hover:shadow-sm"
                }`}
              >
                <span>Next</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-4 h-4 pointer-events-none"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}

      {isOrderShow && selectedOrder && (
        <div className="max-w-4xl mx-auto text-neutral-900">
          {/* Order Header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
            <button
              onClick={() => setIsOrderShow(false)}
              className="w-9 h-9 rounded-full border border-neutral-200 hover:border-black flex items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer"
              title="Go back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight">Order Details</h1>
              <p className="text-sm text-neutral-400 mt-0.5">Order #{selectedOrder?.order_details?.order_number}</p>
            </div>
          </div>

          <div className="bg-[#fbfbfb] border border-neutral-200 rounded-xl p-4 mb-6 text-sm font-semibold text-neutral-700 leading-relaxed shadow-sm">
            Order{" "}
            <span className="bg-amber-100 text-neutral-900 px-1.5 py-0.5 rounded font-bold">
              #{selectedOrder?.order_details?.order_number}
            </span>{" "}
            was placed on{" "}
            <span className="bg-neutral-100 text-neutral-900 px-1.5 py-0.5 rounded font-bold">
              {selectedOrder?.order_details?.created_at}
            </span>{" "}
            and is currently{" "}
            <span className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
              {selectedOrder?.order_details?.status}
            </span>.
          </div>

          {/* Ordered items */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden bg-white mb-6">
            <div className="grid grid-cols-2 bg-neutral-50 font-semibold text-xs uppercase tracking-wider p-4 border-b border-neutral-200 text-neutral-500">
              <span>Product</span>
              <span className="text-right">Total</span>
            </div>

            <div className="divide-y divide-neutral-100">
              {selectedOrder?.items?.map((item: any) => (
                <div key={item?.id} className="p-4 hover:bg-neutral-50/20 transition-colors">
                  <div className="flex justify-between items-center gap-4">
                    <div className="text-sm font-semibold text-neutral-800">
                      <span className="font-bold text-neutral-950">{item.product_name}</span> × <strong className="font-bold text-neutral-900 bg-neutral-100 px-1.5 py-0.5 rounded text-xs">{item.quantity || 1}</strong>
                      {item.size && (
                        <div className="text-xs text-neutral-450 font-semibold mt-1">Size: {item.size}</div>
                      )}
                    </div>
                    <div className="text-right font-bold text-sm text-neutral-900">₹{item.price}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-neutral-50/30 p-4 border-t border-neutral-200 divide-y divide-neutral-200/60 text-sm font-semibold text-neutral-600 space-y-3">
              <div className="flex justify-between pb-3">
                <span>Subtotal</span>
                <span className="text-neutral-950 font-bold">₹{selectedOrder?.order_details?.subtotal}</span>
              </div>
              <div className="flex justify-between py-3">
                <span>Discount</span>
                <span className="text-green-700 font-bold">-₹{selectedOrder?.order_details?.discount_amount}</span>
              </div>
              <div className="flex justify-between py-3">
                <span>Payment Method</span>
                <span className="text-neutral-955 uppercase font-bold">{selectedOrder?.order_details?.payment_method}</span>
              </div>
              <div className="flex justify-between py-3">
                <span>Shipping</span>
                <span className="text-neutral-955 font-bold">
                  {selectedOrder?.order_details?.shipping_method
                    ? selectedOrder?.order_details?.shipping_method
                    : `₹${selectedOrder?.order_details?.shipping_amount}`}
                </span>
              </div>
              <div className="flex justify-between pt-3 font-bold text-sm text-neutral-955">
                <span>Total</span>
                <span className="text-lg font-bold">₹{selectedOrder?.order_details?.total_amount}</span>
              </div>
            </div>
          </div>

          {/* Billing Info Address Card */}
          <div className="bg-[#fbfbfb] border border-neutral-200 rounded-xl p-5 max-w-md shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-3 border-b border-neutral-200 pb-1.5">Billing Address</h2>
            <div className="text-sm space-y-2 leading-relaxed text-neutral-600 font-medium">
              <p className="font-bold text-neutral-900">{selectedOrder?.order_details?.billing_name}</p>
              <p>{selectedOrder?.order_details?.address}</p>
              <p>{selectedOrder?.order_details?.billing_city}, {selectedOrder?.order_details?.billing_zip}</p>
              <p>{selectedOrder?.order_details?.billing_state}, {selectedOrder?.order_details?.billing_country}</p>
              <p className="pt-2 border-t border-neutral-100 flex items-center gap-1.5 text-neutral-500">
                <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {selectedOrder?.order_details?.customer_phone}
              </p>
              <p className="flex items-center gap-1.5 text-neutral-500">
                <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {selectedOrder?.order_details?.email}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PasswordTab({ customer }: any) {
  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const email = customer?.email;
    const password_confirmation = formData.get("password_confirmation")?.toString().trim() || "";
    const password = formData.get("password")?.toString() || "";
    const response = await fetch(`${config.apiUrl}api/v1/passwordchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, password_confirmation }),
    });
    if (response.ok) {
      alert("Password updated!");
    } else {
      console.log("something went wrong!!");
    }
  }

  return (
    <div>
      <div className="mb-6 border-b border-neutral-100 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight uppercase">Change Password</h1>
        <p className="text-sm text-neutral-400 font-semibold mt-1">Update your password security credentials.</p>
      </div>

      <form className=" space-y-4" onSubmit={changePassword}>
        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              type="password"
              name="password"
              defaultValue="12345678"
              className="w-full pl-11 pr-4 py-3.5 text-base text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
              required
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">Confirm New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <input
              type="password"
              name="password_confirmation"
              defaultValue="12345678"
              className="w-full pl-11 pr-4 py-3.5 text-base text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
              required
            />
          </div>
        </div>

        {/* Save button */}
        <button
          type="submit"
          className="w-full py-4 mt-2 bg-black hover:bg-neutral-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-200 shadow-md cursor-pointer"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}

function AddressesTab({ customer }: any) {
  const [isEdit, setIsEdit] = useState(false);
  const [address, setAddress] = useState("");
  const [address_2, setAddress2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipcode, setZipCode] = useState("");
  const [country, setCountry] = useState("India");
  const [customerData, setCustomerData] = useState({} as any);

  async function updateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(`${config.apiUrl}api/v1/updateuser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: customer.email,
        first_name: customer.first_name,
        last_name: customer.first_name,
        phone: customer.phone,
        date_of_birth: customer.date_of_birth,
        address: address ? address : customer?.address,
        address_2: address_2 ? address_2 : customer?.address_2,
        city: city ? city : customer?.city,
        state: state ? state : customer?.state,
        zip_code: zipcode ? zipcode : customer?.zip_code,
        country: country ? country : customer?.country,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      setCustomerData(data);
      alert("Address updated!");
      setIsEdit(false);
    } else {
      console.log("something went wrong!!");
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && customerData?.customer) {
      localStorage.setItem("customer", JSON.stringify(customerData.customer));
    }
  }, [customerData]);

  return (
    <>
      {isEdit ? (
        <div>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
            <button
              onClick={() => setIsEdit(false)}
              className="w-9 h-9 rounded-full border border-neutral-200 hover:border-black flex items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight">Edit Address</h1>
              <p className="text-sm text-neutral-400 font-semibold mt-0.5">Modify your shipping and billing coordinates.</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={updateUser}>
            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">Address Line 1</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="address"
                  defaultValue={customer?.address}
                  onChange={(e: any) => setAddress(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 text-base text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                />
              </div>
            </div>

            {/* Address 2 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">Address Line 2</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="address_2"
                  defaultValue={customer?.address_2}
                  onChange={(e: any) => setAddress2(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 text-base text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                />
              </div>
            </div>

            {/* Country and State grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Country */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">Country</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h2m-4-7a1 1 0 00-1-1V2a1 1 0 00-1-1H9.5a1 1 0 00-1-1H9.5a1 1 0 00-1 1v1M12 21a9 9 0 100-18 9 9 0 000 18z" />
                    </svg>
                  </div>
                  <select
                    className="w-full pl-11 pr-4 py-3.5 text-base text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200 appearance-none cursor-pointer"
                    name="country"
                    onChange={(e: any) => setCountry(e.target.value)}
                    defaultValue={customer?.country}
                  >
                    <option value="India">India</option>
                  </select>
                </div>
              </div>

              {/* State */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">State</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <select
                    className="w-full pl-11 pr-4 py-3.5 text-base text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200 appearance-none cursor-pointer"
                    name="state"
                    onChange={(e: any) => setState(e.target.value)}
                    defaultValue={customer?.state}
                  >
                    <option value="">Select State</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Punjab">Punjab</option>
                  </select>
                </div>
              </div>
            </div>

            {/* City and Zipcode grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* City */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">City</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <select
                    className="w-full pl-11 pr-4 py-3.5 text-base text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200 appearance-none cursor-pointer"
                    name="city"
                    onChange={(e: any) => setCity(e.target.value)}
                    defaultValue={customer?.city}
                  >
                    <option value="">Select City</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Delhi">Delhi</option>
                  </select>
                </div>
              </div>

              {/* Zipcode */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">Zipcode</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A2 2 0 013 15.487V7.513a2 2 0 011.085-1.789L9 3.003l5.447 2.724A2 2 0 0115 7.513v7.974a2 2 0 01-1.085 1.789L9 20z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="zip_code"
                    defaultValue={customer?.zip_code}
                    onChange={(e: any) => setZipCode(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-base text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-black hover:bg-neutral-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-200 shadow-md cursor-pointer"
              >
                Update Address
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className="mb-8 border-b border-neutral-100 pb-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 uppercase tracking-tight">Addresses</h1>
              <p className="text-sm text-neutral-450 font-semibold mt-1">Configure your default shipping destinations.</p>
            </div>
            
            <button
              onClick={() => setIsEdit(true)}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-200 hover:border-black rounded-xl text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-black transition-all bg-white cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                />
              </svg>
              <span>Edit Address</span>
            </button>
          </div>

          <div className="max-w-md bg-[#fbfbfb] border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-4 border-b border-neutral-200 pb-2">Billing Address</h2>
            <div className="text-sm space-y-2.5 font-semibold text-neutral-600 leading-relaxed">
              <p className="font-bold text-neutral-900">{customer?.first_name} {customer?.last_name}</p>
              <p className="flex items-center gap-2">
                <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <span>{customer?.address || "No address specified"}</span>
              </p>
              {customer?.address_2 && (
                <p className="pl-6 text-neutral-455">{customer?.address_2}</p>
              )}
              <p className="pl-6">
                {customer?.city || "City"}, {customer?.zip_code || "Zip"}
              </p>
              <p className="pl-6">
                {customer?.state || "State"}, {customer?.country || "India"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AccountDetailsTab({ customer }: any) {
  const [isEdit, setIsEdit] = useState(false);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [DOB, setDob] = useState("");
  const [customerData, setCustomerData] = useState({} as any);

  async function updateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch(`${config.apiUrl}api/v1/updateuser`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: customer?.email,
        first_name: firstName ? firstName : customer?.first_name,
        last_name: lastName ? lastName : customer?.last_name,
        phone: phone ? phone : customer?.phone,
        date_of_birth: DOB ? DOB : customer?.date_of_birth,
        address: customer?.address,
        address_2: customer?.address_2,
        city: customer?.city,
        state: customer?.state,
        zip_code: customer?.zip_code,
        country: customer?.country || "India",
      }),
    });
    if (response.ok) {
      const data = await response.json();
      setCustomerData(data);
      alert("User details updated!");
      setIsEdit(false);
    } else {
      console.log("something went wrong!!");
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && customerData?.customer) {
      localStorage.setItem("customer", JSON.stringify(customerData.customer));
    }
  }, [customerData]);

  return (
    <>
      {isEdit ? (
        <div>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
            <button
              onClick={() => setIsEdit(false)}
              className="w-9 h-9 rounded-full border border-neutral-200 hover:border-black flex items-center justify-center hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight">Edit Profile</h1>
              <p className="text-sm text-neutral-400 font-semibold mt-0.5">Edit your personal contact parameters.</p>
            </div>
          </div>
          <form className="space-y-6" onSubmit={updateUser}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="first_name"
                    defaultValue={customer?.first_name}
                    onChange={(e: any) => setFirstName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-base text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Last Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-450">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="last_name"
                    defaultValue={customer?.last_name}
                    onChange={(e: any) => setLastName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-base text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">Phone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="phone"
                    defaultValue={customer?.phone}
                    onChange={(e: any) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-base text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* DOB */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">Date of Birth</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="date"
                    name="date_of_birth"
                    defaultValue={customer?.date_of_birth}
                    onChange={(e: any) => setDob(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-base text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 bg-black hover:bg-neutral-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-200 shadow-md cursor-pointer"
              >
                Update Profile
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className="mb-8 border-b border-neutral-100 pb-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 uppercase tracking-tight">Account Details</h1>
              <p className="text-sm text-neutral-450 font-semibold mt-1">Review your personal profile parameters.</p>
            </div>

            <button
              onClick={() => setIsEdit(true)}
              className="flex items-center gap-2 px-4 py-2 border border-neutral-200 hover:border-black rounded-xl text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-black transition-all bg-white cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2.5"
                stroke="currentColor"
                className="w-3.5 h-3.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                />
              </svg>
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="max-w-md bg-[#fbfbfb] border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-4 border-b border-neutral-200 pb-2">User Profile</h2>
            <div className="text-sm space-y-3 font-semibold text-neutral-600 leading-relaxed">
              <p className="flex items-center gap-2 text-neutral-900 font-bold text-sm pb-2 border-b border-neutral-100">
                <span className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-xs text-neutral-700">
                  {customer?.first_name?.[0] || "U"}
                </span>
                <span>{customer?.first_name} {customer?.last_name}</span>
              </p>
              
              <p className="flex items-center gap-2 pt-1">
                <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{customer?.email}</span>
              </p>

              <p className="flex items-center gap-2">
                <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{customer?.phone || "No phone specified"}</span>
              </p>

              <p className="flex items-center gap-2">
                <svg className="w-4 h-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>DOB: {customer?.date_of_birth || "No date specified"}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>  
  );

}
