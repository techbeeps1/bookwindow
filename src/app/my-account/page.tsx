"use client";

import axios from "axios";
import { FormEvent, useEffect, useState } from "react";
import config from "../config";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/hooks/useStore";
import { logout } from "@/lib/slices/authSlice";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { LuLayoutGrid } from "react-icons/lu";
import { TbClipboardListFilled } from "react-icons/tb";
import { FaHeart, FaPhoneAlt, FaUser, FaCity, FaSpinner, FaCheckCircle } from "react-icons/fa";
import { MdLocationPin, MdLogout, MdDateRange, MdModeEdit } from "react-icons/md";
import { IoIosArrowBack, IoMdLock, IoMdMail } from "react-icons/io";
import { IoSearchSharp } from "react-icons/io5";
import { FaGlobe } from "react-icons/fa6";
import { fetchPincodeDetails, matchState, matchCity } from "@/lib/pincode";
import {
  getIndianMobileValidationError,
  normalizeIndianPhoneNumber,
  isValidIndianMobile,
} from "@/helper/helperfun";

type AccountTab =
  | "dashboard"
  | "orders"
  | "addresses"
  | "account-details"
  | "password"
  | "logout"
  | "wishlist";

interface TabItem {
  key: AccountTab;
  label: string;
}

const tabs: TabItem[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "orders", label: "Orders" },
  { key: "wishlist", label: "Wishlist" },
  { key: "addresses", label: "Addresses" },
  { key: "account-details", label: "Account Details" },
  { key: "password", label: "Password" },
  { key: "logout", label: "Log Out" }

];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<AccountTab>("dashboard");
  const [customer, setCustomer] = useState<any>(null);
  const [userOrders, setUserOrders] = useState([] as any);

  const router = useRouter();
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);




  useEffect(() => {
    if (!isAuthenticated && !loading) {
      router.push("/");
    }

  }, [isAuthenticated]);



  const logoutUser = async () => {
    try {
      await fetch(`/api/auth/logout`, {
        method: "POST",
      });
    } finally {
      dispatch(logout());
      router.push("/sign-in");
    }
  };
  const CustomerDataFetch = async () => {
    try {
      const response = await axios({
        method: "get",
        url: `/api/my-account/view-address/${user?.id}`,
        responseType: "json",
      });
      const Customerdata = response?.data;
      setCustomer(Customerdata?.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  const fetchOrdersData = async () => {
    if (!user?.id) return;
    try {
      const response = await axios({
        method: "get",
        url: `/api/my-account/user_order/${user?.id}`,
        responseType: "json",
      });
      const orders = response?.data;
      setUserOrders(orders?.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchOrdersData();
      CustomerDataFetch();
    }
  }, [user?.id]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab customer={customer} logout={logoutUser} setActiveTab={setActiveTab} />;
      case "orders":
        return <OrdersTab userOrders={userOrders} onRefreshOrders={fetchOrdersData} />;
      case "password":
        return <PasswordTab customer={customer} />;
      case "addresses":
        return <AddressesTab customer={customer} isEdited={CustomerDataFetch} />;
      case "account-details":
        return <AccountDetailsTab customer={customer} isEdited={CustomerDataFetch} />;
      case "wishlist":
        router.push("/wishlist");
        break;
      case "logout":
        logoutUser();
        return (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <MdLogout className="w-12 h-12" />
            <p className="text-sm font-bold text-neutral-800 uppercase tracking-widest">Logging out...</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="bg-white py-12 min-h-screen lg:mt-0 mt-[100px]">
        <div className="container mx-auto max-w-screen-xl px-4">

          {/* Main Layout Card Grid */}
          <div className="bg-white border border-neutral-200/80 rounded-3xl flex flex-col md:flex-row overflow-hidden min-h-[60vh]">

            {/* Sidebar container */}
            <aside className="w-full md:w-64 flex-shrink-0 bg-[#fbfbfb] border-b md:border-b-0 md:border-r border-neutral-200/80 p-5 flex flex-col justify-between gap-6 min-h-[50vh] md:min-h-[70vh]">
              <div>
                {/* Brand/Logo header matching reference image */}
                <div className="flex items-center gap-3 pb-6 border-b border-neutral-200/80">

                  <span className="font-extrabold text-sm uppercase tracking-wider text-neutral-900">Bookwindow</span>
                </div>

                {/* Navigation Tabs */}
                <nav className="flex flex-col gap-1.5 pt-4">
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.key;

                    let icon = null;
                    if (tab.key === "dashboard") {
                      icon = (
                        <LuLayoutGrid className="w-4 h-4" />
                      );
                    } else if (tab.key === "orders") {
                      icon = (
                        <TbClipboardListFilled className="w-4 h-4" />
                      );
                    }
                    else if (tab.key === "wishlist") {
                      icon = (
                        <FaHeart className="w-4 h-4" />
                      );

                    } else if (tab.key === "addresses") {
                      icon = (
                        <MdLocationPin className="w-4 h-4" />

                      );
                    } else if (tab.key === "account-details") {
                      icon = (
                        <FaUser className="w-4 h-4" />

                      );
                    } else if (tab.key === "password") {
                      icon = (
                        <IoMdLock className="w-4 h-4" />
                      );
                    } else if (tab.key === "logout") {
                      icon = (
                        <MdLogout className="w-4 h-4" />
                      );
                    }

                    return (
                      <button
                        key={tab.key}
                        onClick={() => {
                          setActiveTab(tab.key);
                          if (tab.key === "logout") {
                            logout();
                          }
                        }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-xs font-bold uppercase tracking-wider cursor-pointer ${isActive
                          ? "bg-black text-white shadow-sm"
                          : "text-neutral-500 hover:text-black hover:bg-neutral-100"
                          }`}
                      >
                        {icon}
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* User block info styled at bottom */}
              {customer && (
                <div className="pt-4 border-t border-neutral-200/80 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-neutral-900 text-black flex items-center justify-center font-bold text-xs shadow-sm">
                    {customer.first_name?.[0] || "U"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-neutral-900 block truncate leading-tight">
                      {customer.first_name} {customer.last_name}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-bold block truncate mt-0.5 leading-none">
                      {customer.email}
                    </span>
                  </div>
                </div>
              )}
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

function OrdersTab({ userOrders, onRefreshOrders }: any) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isOrderShow, setIsOrderShow] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>({});

  const [cancellingOrder, setCancellingOrder] = useState<any>(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState<string>("Ordered by mistake");
  const [cancelReasonCustom, setCancelReasonCustom] = useState<string>("");
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  const canCancelOrder = (order: any) => {
    const rawStatus = String(order?.order_details?.status || "").toLowerCase().trim();
    if (!rawStatus) return false;

    // Strict non-cancellable check: Any order with status containing these terms cannot be cancelled
    const nonCancellableTerms = [
      "cancel",      // covers "cancelled", "payment_cancelled", "order_cancelled", etc.
      "fail",        // covers "failed", "payment_failed"
      "ship",        // covers "shipped", "order_shipped"
      "deliver",     // covers "delivered"
      "complete",    // covers "completed"
      "decline",     // covers "declined"
      "refund",      // covers "refunded"
      "return",      // covers "returned"
    ];

    if (nonCancellableTerms.some((term) => rawStatus.includes(term))) {
      return false;
    }

    // Only allow cancellation for active/pending orders
    const cancellableStatuses = ["pending", "new", "processing", "payment_pending", "created"];
    return cancellableStatuses.some((st) => rawStatus === st || rawStatus.includes(st));
  };

  const handleConfirmCancel = async () => {
    if (!cancellingOrder) return;
    const finalReason = cancelReasonPreset === "Other reason" 
      ? (cancelReasonCustom.trim() || "Cancelled by customer") 
      : (cancelReasonCustom.trim() ? `${cancelReasonPreset}: ${cancelReasonCustom.trim()}` : cancelReasonPreset);

    try {
      setIsCancelling(true);
      const response = await axios.post("/api/my-account/cancel-order", {
        order_number: cancellingOrder?.order_details?.order_number,
        reason: finalReason,
      }, {
        withCredentials: true,
      });

      if (response.data?.status) {
        toast.success("Order cancelled successfully");
        setCancellingOrder(null);
        setCancelReasonCustom("");
        if (onRefreshOrders) {
          await onRefreshOrders();
        }
        if (selectedOrder && selectedOrder.order_details?.order_number === cancellingOrder.order_details?.order_number) {
          setSelectedOrder((prev: any) => ({
            ...prev,
            order_details: {
              ...prev.order_details,
              status: "cancelled",
              cancelled_by: "customer",
              cancellation_reason: finalReason,
            }
          }));
        }
      } else {
        toast.error(response.data?.message || "Failed to cancel order");
      }
    } catch (err: any) {
      console.error("Cancellation error:", err);
      if (err.response?.status === 401) {
        toast.error("Your session has expired. Please log in again.");
        setTimeout(() => {
          dispatch(logout());
          router.push("/sign-in");
        }, 1500);
        return;
      }
      toast.error(err.response?.data?.message || "Failed to cancel order. Please try again.");
    } finally {
      setIsCancelling(false);
    }
  };

  const itemsPerPage = 6;

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order);
    setIsOrderShow(true);
  };

  const sortedItems = Array.isArray(userOrders?.orders)
    ? [...userOrders?.orders].sort((a, b) => {
      const dateA = new Date(a.order_details.created_at.replace(" ", "T")).getTime();
      const dateB = new Date(b.order_details.created_at.replace(" ", "T")).getTime();
      return dateB - dateA;
    })
    : [];

  const filteredItems = sortedItems.filter((order: any) => {
    const orderNum = order?.order_details?.order_number?.toLowerCase() || "";
    const status = order?.order_details?.status?.toLowerCase() || "";
    const amount = String(order?.order_details?.total_amount) || "";
    const date = order?.order_details?.created_at?.toLowerCase() || "";

    const matchesSearch =
      orderNum.includes(searchQuery.toLowerCase()) ||
      status.includes(searchQuery.toLowerCase()) ||
      amount.includes(searchQuery.toLowerCase()) ||
      date.includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    const isSuccess = ["delivered", "completed", "paid", "success"].some((s) => status?.includes(s));
    const isCancelled = ["cancelled", "failed", "refunded"].some((s) => status?.includes(s));

    if (filterTab === "active") {
      return !isSuccess && !isCancelled;
    }
    if (filterTab === "completed") {
      return isSuccess;
    }
    if (filterTab === "cancelled") {
      return isCancelled;
    }
    return true;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [userOrders?.orders, searchQuery, filterTab]);

  const isAllSelectedOnPage =
    currentItems.length > 0 &&
    currentItems.every((item: any) => {
      const id = item?.order_details?.id || item?.order_details?.order_number;
      return id ? selectedRows[id] : false;
    });

  const handleSelectAll = () => {
    const newSelected = { ...selectedRows };
    if (isAllSelectedOnPage) {
      currentItems.forEach((item: any) => {
        const id = item?.order_details?.id || item?.order_details?.order_number;
        if (id) delete newSelected[id];
      });
    } else {
      currentItems.forEach((item: any) => {
        const id = item?.order_details?.id || item?.order_details?.order_number;
        if (id) newSelected[id] = true;
      });
    }
    setSelectedRows(newSelected);
  };

  const handleSelectRow = (id: string | number) => {
    setSelectedRows((prev) => {
      const updated = { ...prev };
      if (updated[id]) {
        delete updated[id];
      } else {
        updated[id] = true;
      }
      return updated;
    });
  };

  return (
    <div>
      {!isOrderShow && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-neutral-100">
            <div>
              <h1 className="text-2xl font-extrabold text-neutral-900 tracking-tight uppercase">Orders</h1>
              <p className="text-sm text-neutral-450 mt-1">Review your recent transactions and order status.</p>
            </div>

            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <IoSearchSharp className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Search order, status, date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm text-black bg-[#f9f9f9] border border-neutral-200 focus:bg-white rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex border-b border-neutral-200 mb-8 overflow-x-auto gap-8 text-xs font-bold uppercase tracking-wider scrollbar-none">
            <button
              onClick={() => setFilterTab("all")}
              className={`pb-3 transition-all relative whitespace-nowrap cursor-pointer ${filterTab === "all" ? "text-neutral-900 font-bold" : "text-neutral-400 hover:text-neutral-900"
                }`}
            >
              All Orders
              {filterTab === "all" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black rounded-full" />}
            </button>
            <button
              onClick={() => setFilterTab("active")}
              className={`pb-3 transition-all relative whitespace-nowrap cursor-pointer ${filterTab === "active" ? "text-neutral-900 font-bold" : "text-neutral-400 hover:text-neutral-900"
                }`}
            >
              Active
              {filterTab === "active" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black rounded-full" />}
            </button>
            <button
              onClick={() => setFilterTab("completed")}
              className={`pb-3 transition-all relative whitespace-nowrap cursor-pointer ${filterTab === "completed" ? "text-neutral-900 font-bold" : "text-neutral-400 hover:text-neutral-900"
                }`}
            >
              Completed
              {filterTab === "completed" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black rounded-full" />}
            </button>
            <button
              onClick={() => setFilterTab("cancelled")}
              className={`pb-3 transition-all relative whitespace-nowrap cursor-pointer ${filterTab === "cancelled" ? "text-neutral-900 font-bold" : "text-neutral-400 hover:text-neutral-900"
                }`}
            >
              Cancelled
              {filterTab === "cancelled" && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black rounded-full" />}
            </button>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-neutral-200 rounded-3xl bg-[#fbfbfb]">
              <p className="text-sm text-neutral-450 font-medium">No orders found matching the filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200/80 bg-[#fbfbfb]">
                    <th className="p-4 w-12 text-center">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={isAllSelectedOnPage}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black accent-black cursor-pointer"
                        />
                      </div>
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-neutral-450">Order no.</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-neutral-450">Created date</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-neutral-450">Status</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-neutral-450">Order Total</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-neutral-450 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-150">
                  {currentItems.map((order: any, index: number) => {
                    const rowId = order?.order_details?.id || order?.order_details?.order_number || index;
                    const statusLower = String(order?.order_details?.status || "").toLowerCase();
                    const isSuccess = ["delivered", "completed", "paid", "success"].some((s) => statusLower.includes(s));
                    const isCancelled = ["cancelled", "failed", "refunded"].some((s) => statusLower.includes(s));

                    const paymentMethodStr = String(order?.order_details?.payment_method ?? "").toLowerCase().trim();
                    const isCodOrder =
                      paymentMethodStr === "cod" ||
                      paymentMethodStr === "1" ||
                      paymentMethodStr.includes("cash") ||
                      Number(order?.order_details?.delivery_amount) > 0 ||
                      Number(order?.order_details?.cod_amount) > 0 ||
                      Number(order?.order_details?.cod_charges) > 0;
                    const codFee =
                      Number(order?.order_details?.delivery_amount) ||
                      Number(order?.order_details?.cod_amount) ||
                      Number(order?.order_details?.cod_charges) ||
                      (isCodOrder ? 49 : 0);
                    const subtotalVal = Number(order?.order_details?.subtotal) || 0;
                    const discountVal = Number(order?.order_details?.discount_amount) || 0;
                    const shippingVal =
                      order?.order_details?.shipping_amount !== undefined &&
                      order?.order_details?.shipping_amount !== null
                        ? Number(order?.order_details?.shipping_amount)
                        : 49;
                    const orderDbTotal = Number(order?.order_details?.total_amount);
                    const calculatedRowTotal =
                      orderDbTotal > 0
                        ? orderDbTotal.toFixed(2)
                        : subtotalVal > 0
                          ? (subtotalVal - discountVal + shippingVal + (isCodOrder ? codFee : 0)).toFixed(2)
                          : "0.00";

                    return (
                      <tr key={rowId} className={`hover:bg-neutral-50/40 transition-colors ${selectedRows[rowId] ? "bg-neutral-50/20" : ""}`}>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={!!selectedRows[rowId]}
                              onChange={() => handleSelectRow(rowId)}
                              className="w-4 h-4 rounded border-neutral-300 text-black focus:ring-black accent-black cursor-pointer"
                            />
                          </div>
                        </td>
                        <td
                          className="p-4 text-sm font-bold text-neutral-900 cursor-pointer hover:underline"
                          onClick={() => handleViewOrder(order)}
                        >
                          #{order?.order_details?.order_number}
                        </td>
                        <td className="p-4 text-sm text-neutral-500 font-semibold">
                          {order?.order_details?.created_at}
                        </td>
                        <td className="p-4 text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${isSuccess
                            ? "bg-neutral-100 text-neutral-900 border-neutral-300/80"
                            : isCancelled
                              ? "bg-red-50/60 text-red-700 border-red-100/80 line-through"
                              : "bg-white text-black border-2 border-black"
                            }`}>
                            {order?.order_details?.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-neutral-900 font-bold">
                          ₹{calculatedRowTotal}{" "}
                          <span className="text-neutral-400 font-semibold text-xs ml-1">
                            ({order?.items.length} {order?.items.length === 1 ? "item" : "items"})
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="bg-white hover:bg-black hover:text-white text-black border border-neutral-300 hover:border-black text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
                            >
                              View
                            </button>
                            {canCancelOrder(order) && (
                              <button
                                onClick={() => setCancellingOrder(order)}
                                className="bg-white hover:bg-red-600 hover:text-white text-red-600 border border-red-200 hover:border-red-600 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-8">
              <span className="text-xs font-bold text-neutral-450 uppercase tracking-wider">
                Showing page <span className="text-black font-extrabold">{currentPage}</span> of {totalPages}
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`p-2.5 rounded-full border transition-all duration-200 active:scale-95 ${currentPage === 1
                    ? "border-neutral-200 text-neutral-300 cursor-not-allowed opacity-50"
                    : "border-neutral-300 text-black hover:bg-neutral-50 hover:border-black hover:shadow-sm cursor-pointer"
                    }`}
                  title="Previous Page"
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
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`p-2.5 rounded-full border transition-all duration-200 active:scale-95 ${currentPage === totalPages
                    ? "border-neutral-200 text-neutral-300 cursor-not-allowed opacity-50"
                    : "border-neutral-300 text-black hover:bg-neutral-50 hover:border-black hover:shadow-sm cursor-pointer"
                    }`}
                  title="Next Page"
                >
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
            </div>
          )}
        </>
      )}

      {isOrderShow && selectedOrder && (
        <div className="max-w-4xl mx-auto text-neutral-900">
          <div className="flex items-center gap-4 mb-8 pb-4 border-b border-neutral-100">
            <button
              onClick={() => setIsOrderShow(false)}
              className="w-10 h-10 rounded-full border border-neutral-200 hover:border-black flex items-center justify-center hover:bg-neutral-50 transition-all cursor-pointer shadow-sm active:scale-95"
              title="Go back"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-neutral-900">Order Details</h1>
              <p className="text-xs text-neutral-450 font-bold uppercase tracking-wider mt-0.5">Order #{selectedOrder?.order_details?.order_number}</p>
            </div>
          </div>          {/* Redesigned Order Meta Row */}
          <div className="bg-[#fbfbfb] border border-neutral-200/80 rounded-2xl p-6 mb-8 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200/85">
              {/* Order Number */}
              <div className="flex flex-col gap-1.5 pb-4 sm:pb-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Order Number</span>
                <span className="text-base font-extrabold text-neutral-900 font-mono">#{selectedOrder?.order_details?.order_number}</span>
              </div>

              {/* Placed On */}
              <div className="flex flex-col gap-1.5 pt-4 sm:pt-0 sm:pl-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Date Placed</span>
                <span className="text-sm font-bold text-neutral-800">{selectedOrder?.order_details?.created_at}</span>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5 pt-4 sm:pt-0 sm:pl-6">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Order Status</span>
                <div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${["delivered", "completed", "paid", "success"].some((s) => selectedOrder?.order_details?.status?.toLowerCase()?.includes(s))
                    ? "bg-neutral-100 text-neutral-900 border-neutral-350"
                    : ["cancelled", "failed", "refunded"].some((s) => selectedOrder?.order_details?.status?.toLowerCase()?.includes(s))
                      ? "bg-red-50/60 text-red-700 border-red-100/80 line-through"
                      : "bg-white text-black border-2 border-black"
                    }`}>
                    {selectedOrder?.order_details?.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cancellation Info Banner */}
          {["cancel", "decline", "fail"].some((s) => selectedOrder?.order_details?.status?.toLowerCase()?.includes(s)) && (
            <div className="bg-red-50/80 border border-red-200 rounded-2xl p-5 mb-8 shadow-sm">
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 text-red-600 font-bold text-sm">
                  ✕
                </div>
                <div className="flex-1">
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-red-900">
                    {(() => {
                      const cancelledBy = selectedOrder?.order_details?.cancelled_by;
                      const statusLower = String(selectedOrder?.order_details?.status || "").toLowerCase();
                      const reasonLower = String(selectedOrder?.order_details?.cancellation_reason || "").toLowerCase();
                      if (cancelledBy === "customer") {
                        return "Order Cancelled (By You)";
                      }
                      if (cancelledBy === "admin") {
                        return "Order Cancelled (By Store Staff)";
                      }
                      if (cancelledBy === "payment_failed" || statusLower.includes("payment") || reasonLower.includes("payment") || reasonLower.includes("gateway")) {
                        return "Order Cancelled (Payment Incomplete / Cancelled during Checkout)";
                      }
                      return "Order Cancelled";
                    })()}
                  </h2>
                  {selectedOrder?.order_details?.cancellation_reason ? (
                    <p className="text-xs text-red-800 font-medium mt-1.5 leading-relaxed">
                      <span className="font-bold">Reason:</span> {selectedOrder?.order_details?.cancellation_reason}
                    </p>
                  ) : (
                    <p className="text-xs text-red-700 font-medium mt-1">
                      This order has been cancelled.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Shipped Info Banner */}
          {["order_shipped", "shipped"].some((s) => selectedOrder?.order_details?.status?.toLowerCase()?.includes(s)) && (
            <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 mb-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 text-blue-900 font-semibold">
                <span className="text-base">📦</span>
                <span>Your order has been shipped and is on its way. It can no longer be cancelled.</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                {selectedOrder?.order_details?.courier_partner && (
                  <span className="font-semibold bg-blue-100/80 text-blue-900 px-3 py-1 rounded-lg">
                    Courier: {selectedOrder.order_details.courier_partner}
                  </span>
                )}
                {selectedOrder?.order_details?.tracking_id && (
                  <span className="font-mono font-bold bg-blue-100 text-blue-950 px-3 py-1 rounded-lg">
                    Tracking ID: {selectedOrder.order_details.tracking_id}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Active Order Actions */}
          {canCancelOrder(selectedOrder) && (
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setCancellingOrder(selectedOrder)}
                className="bg-white hover:bg-red-600 hover:text-white text-red-600 border border-red-200 hover:border-red-600 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 flex items-center gap-2"
              >
                <span>Cancel Order</span>
              </button>
            </div>
          )}

          {/* Ordered items */}
          <div className="border border-neutral-200/80 rounded-2xl overflow-hidden bg-white mb-8 shadow-sm">
            <div className="flex justify-between items-center bg-[#fbfbfb] font-bold text-xs uppercase tracking-wider px-6 py-4 border-b border-neutral-200 text-neutral-450">
              <span>Product</span>
              <span className="text-right">Total</span>
            </div>

            <div className="divide-y divide-neutral-150">
              {selectedOrder?.items?.map((item: any, itemIdx: number) => (
                <div key={item?.id || item?.product_id || itemIdx} className="p-6 hover:bg-neutral-50/20 transition-colors">
                  <div className="flex justify-between items-start gap-6">
                    <div className="text-sm font-semibold text-neutral-800 flex-1">
                      <span className="font-bold text-neutral-950 block sm:inline">
                        {item.product_name ? item.product_name.replace(/#COMMA#/g, ",") : ""}
                      </span>{" "}
                      <span className="text-neutral-400 font-bold mx-1 hidden sm:inline">×</span>{" "}
                      <strong className="font-bold text-neutral-900 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-lg text-xs font-mono inline-block mt-1 sm:mt-0">
                        Qty: {item.quantity || 1}
                      </strong>
                      {item.size && (
                        <div className="text-xs text-neutral-450 font-bold uppercase tracking-wider mt-1.5">Size: {item.size}</div>
                      )}
                    </div>
                    <div className="text-right font-extrabold text-sm text-neutral-950 whitespace-nowrap pt-0.5">₹{item.price}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-[#fbfbfb]/50 p-5 border-t border-neutral-200/80 divide-y divide-neutral-200/60 text-sm font-semibold text-neutral-600 space-y-3.5">
              <div className="flex justify-between pb-3.5">
                <span className="text-neutral-455 font-bold uppercase tracking-wider text-xs">Subtotal</span>
                <span className="text-neutral-955 font-bold">₹{selectedOrder?.order_details?.subtotal}</span>
              </div>
              <div className="flex justify-between py-3.5">
                <span className="text-neutral-455 font-bold uppercase tracking-wider text-xs">Discount</span>
                <span className="text-green-700 font-bold">-₹{selectedOrder?.order_details?.discount_amount}</span>
              </div>
              <div className="flex justify-between py-3.5">
                <span className="text-neutral-455 font-bold uppercase tracking-wider text-xs">Payment Method</span>
                <span className="text-neutral-955 uppercase font-extrabold">{selectedOrder?.order_details?.payment_method}</span>
              </div>
              <div className="flex justify-between py-3.5">
                <span className="text-neutral-455 font-bold uppercase tracking-wider text-xs">Shipping</span>
                <span className="text-neutral-955 font-bold">
                  {selectedOrder?.order_details?.shipping_method
                    ? selectedOrder?.order_details?.shipping_method
                    : `₹${selectedOrder?.order_details?.shipping_amount}`}
                </span>
              </div>
              {(() => {
                const detailPayMethodStr = String(selectedOrder?.order_details?.payment_method ?? "").toLowerCase().trim();
                const isDetailCod =
                  detailPayMethodStr === "cod" ||
                  detailPayMethodStr === "1" ||
                  detailPayMethodStr.includes("cash") ||
                  Number(selectedOrder?.order_details?.delivery_amount) > 0 ||
                  Number(selectedOrder?.order_details?.cod_amount) > 0 ||
                  Number(selectedOrder?.order_details?.cod_charges) > 0;
                return isDetailCod ? (
                  <div className="flex justify-between py-3.5">
                    <span className="text-neutral-455 font-bold uppercase tracking-wider text-xs">COD Charges</span>
                    <span className="text-neutral-955 font-bold">
                      ₹{selectedOrder?.order_details?.delivery_amount ||
                        selectedOrder?.order_details?.cod_amount ||
                        selectedOrder?.order_details?.cod_charges ||
                        49}
                    </span>
                  </div>
                ) : null;
              })()}
              {(() => {
                const selPayMethodStr = String(selectedOrder?.order_details?.payment_method ?? "").toLowerCase().trim();
                const isSelectedCod =
                  selPayMethodStr === "cod" ||
                  selPayMethodStr === "1" ||
                  selPayMethodStr.includes("cash") ||
                  Number(selectedOrder?.order_details?.delivery_amount) > 0 ||
                  Number(selectedOrder?.order_details?.cod_amount) > 0 ||
                  Number(selectedOrder?.order_details?.cod_charges) > 0;
                const selectedCodFee =
                  Number(selectedOrder?.order_details?.delivery_amount) ||
                  Number(selectedOrder?.order_details?.cod_amount) ||
                  Number(selectedOrder?.order_details?.cod_charges) ||
                  (isSelectedCod ? 49 : 0);
                const selectedSubtotal = Number(selectedOrder?.order_details?.subtotal) || 0;
                const selectedDiscount = Number(selectedOrder?.order_details?.discount_amount) || 0;
                const selectedShipping =
                  selectedOrder?.order_details?.shipping_amount !== undefined &&
                  selectedOrder?.order_details?.shipping_amount !== null
                    ? Number(selectedOrder?.order_details?.shipping_amount)
                    : 49;
                const selectedDbTotal = Number(selectedOrder?.order_details?.total_amount);
                const selectedTotal =
                  selectedDbTotal > 0
                    ? selectedDbTotal.toFixed(2)
                    : selectedSubtotal > 0
                      ? (selectedSubtotal - selectedDiscount + selectedShipping + (isSelectedCod ? selectedCodFee : 0)).toFixed(2)
                      : "0.00";

                return (
                  <div className="flex justify-between pt-3.5 font-bold text-sm text-neutral-955">
                    <span className="text-neutral-900 font-extrabold uppercase tracking-wider text-xs flex items-center">Total Amount</span>
                    <span className="text-xl font-extrabold text-neutral-955">₹{selectedTotal}</span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Billing Info Address Card */}
          { }   <div className="bg-[#fbfbfb] border border-neutral-200/80 rounded-2xl p-6 max-w-md shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-4 border-b border-neutral-200 pb-2">Billing Address</h2>
            <div className="text-sm space-y-2.5 leading-relaxed text-neutral-600 font-semibold">
              <p className="font-bold text-neutral-900 text-base">
                {selectedOrder?.order_details?.billing_name ||
                  (selectedOrder?.order_details?.first_name
                    ? `${selectedOrder.order_details.first_name} ${selectedOrder.order_details.last_name || ""}`.trim()
                    : "") ||
                  selectedOrder?.order_details?.name ||
                  "Customer"}
              </p>
              <p className="flex items-start gap-2">
                <MdLocationPin className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                <span>
                  {selectedOrder?.order_details?.address}
                  {(selectedOrder?.order_details?.billing_city || selectedOrder?.order_details?.city || selectedOrder?.order_details?.billing_zip || selectedOrder?.order_details?.zip_code || selectedOrder?.order_details?.zip) && (
                    <>
                      <br />
                      {[
                        selectedOrder?.order_details?.billing_city || selectedOrder?.order_details?.city,
                        selectedOrder?.order_details?.billing_zip || selectedOrder?.order_details?.zip_code || selectedOrder?.order_details?.zip
                      ].filter(Boolean).join(", ")}
                    </>
                  )}
                  {(selectedOrder?.order_details?.billing_state || selectedOrder?.order_details?.state || selectedOrder?.order_details?.billing_country || selectedOrder?.order_details?.country) && (
                    <>
                      <br />
                      {[
                        selectedOrder?.order_details?.billing_state || selectedOrder?.order_details?.state,
                        selectedOrder?.order_details?.billing_country || selectedOrder?.order_details?.country
                      ].filter(Boolean).join(", ")}
                    </>
                  )}
                </span>
              </p>
              <div className="pt-3.5 mt-3.5 border-t border-neutral-200/60 space-y-2">
                {(selectedOrder?.order_details?.customer_phone || selectedOrder?.order_details?.phone) && (
                  <p className="flex items-center gap-2 text-neutral-500">
                    <FaPhoneAlt className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
                    <span className="font-mono">{selectedOrder?.order_details?.customer_phone || selectedOrder?.order_details?.phone}</span>
                  </p>
                )}
                <p className="flex items-center gap-2 text-neutral-500">
                  <IoMdMail className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                  <span>{selectedOrder?.order_details?.email}</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-neutral-200 relative animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div>
                <h3 className="text-lg font-extrabold text-neutral-900 uppercase tracking-tight">Cancel Order</h3>
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-0.5">
                  Order #{cancellingOrder?.order_details?.order_number}
                </p>
              </div>
              <button
                onClick={() => {
                  if (!isCancelling) {
                    setCancellingOrder(null);
                    setCancelReasonCustom("");
                  }
                }}
                disabled={isCancelling}
                className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:text-black hover:border-black transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-5 space-y-4">
              <p className="text-xs text-neutral-500 font-medium leading-relaxed">
                Please let us know why you want to cancel this order. Once cancelled, this action cannot be undone.
              </p>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Reason for cancellation <span className="text-red-500">*</span>
                </label>
                <select
                  value={cancelReasonPreset}
                  onChange={(e) => setCancelReasonPreset(e.target.value)}
                  disabled={isCancelling}
                  className="w-full px-3.5 py-2.5 text-xs text-black font-semibold bg-[#f9f9f9] border border-neutral-200 focus:bg-white rounded-xl outline-none focus:border-black transition-all"
                >
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                  <option value="Incorrect / change of delivery address">Incorrect / change of delivery address</option>
                  <option value="Delivery time is too long / Changed mind">Delivery time is too long / Changed mind</option>
                  <option value="Need to add more items / change items">Need to add more items / change items</option>
                  <option value="Other reason">Other reason (specify below)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-2">
                  Additional Comments / Remarks {cancelReasonPreset === "Other reason" && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  placeholder={cancelReasonPreset === "Other reason" ? "Please specify your reason here..." : "Any additional notes (optional)..."}
                  value={cancelReasonCustom}
                  onChange={(e) => setCancelReasonCustom(e.target.value)}
                  disabled={isCancelling}
                  className="w-full p-3 text-xs text-black font-medium bg-[#f9f9f9] border border-neutral-200 focus:bg-white rounded-xl outline-none focus:border-black transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => {
                  setCancellingOrder(null);
                  setCancelReasonCustom("");
                }}
                disabled={isCancelling}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 hover:border-black text-neutral-700 hover:text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Keep Order
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isCancelling || (cancelReasonPreset === "Other reason" && !cancelReasonCustom.trim())}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-2"
              >
                {isCancelling ? (
                  <>
                    <FaSpinner className="w-3.5 h-3.5 animate-spin" />
                    <span>Cancelling...</span>
                  </>
                ) : (
                  <span>Confirm Cancellation</span>
                )}
              </button>
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

    if (!customer?.email) {
      toast.error("Customer email is not available.");
      return;
    }
    if (password !== password_confirmation) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    const response = await fetch(`/api/my-account/passwordchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, password_confirmation }),
    });
    if (response.ok) {
      toast.success("Password updated!");
    } else {
      toast.error("Failed to update password.");
    }
    const data = await response.json();
    console.log("Password change response:", data);
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
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
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
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
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

function AddressesTab({ customer, isEdited }: any) {
  const [isEdit, setIsEdit] = useState(false);
  const [address, setAddress] = useState(customer?.address || "");
  const [address_2, setAddress2] = useState(customer?.address_2 || "");
  const [city, setCity] = useState(customer?.city || "");
  const [state, setState] = useState(customer?.state || "");
  const [zipcode, setZipCode] = useState(customer?.zip_code || "");

  const [states, setStates] = useState<any[]>([]);
  const [statesLoading, setStatesLoading] = useState(false);
  const [filteredCities, setFilteredCities] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<{
    type: "success" | "error" | "info" | null;
    message: string;
  }>({ type: null, message: "" });

  // Sync state whenever customer data or isEdit changes
  useEffect(() => {
    if (customer) {
      setAddress(customer.address || "");
      setAddress2(customer.address_2 || "");
      setState(customer.state || "");
      setCity(customer.city || "");
      setZipCode(customer.zip_code || "");
    }
  }, [customer, isEdit]);

  // Fetch states and cities once
  useEffect(() => {
    let isMounted = true;
    const fetchStatesAndCities = async () => {
      setStatesLoading(true);
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/state-of-india`,
          responseType: "json",
        });
        if (isMounted) {
          setStates(response?.data || []);
        }
      } catch (error) {
        console.error("Error fetching states:", error);
      } finally {
        if (isMounted) {
          setStatesLoading(false);
        }
      }
    };
    fetchStatesAndCities();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update filtered cities list whenever state or states array changes
  useEffect(() => {
    if (state && states.length > 0) {
      const selectedStateValue = states.find(
        (s: any) => s.name?.trim().toLowerCase() === state.trim().toLowerCase()
      );
      setFilteredCities(selectedStateValue?.cities || []);
    } else {
      setFilteredCities([]);
    }
  }, [state, states]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newState = e.target.value;
    setState(newState);
    setCity(""); // Reset city selection when state changes
    setPincodeStatus({ type: null, message: "" });
  };

  const lookupAndFillPincode = async (pin: string) => {
    setIsPincodeLoading(true);
    setPincodeStatus({ type: "info", message: "Fetching location..." });
    try {
      const data = await fetchPincodeDetails(pin);
      if (data.success && data.state) {
        const matchedState = matchState(data.state, states);
        const stateName = matchedState ? matchedState.name : data.state;
        const stateCities = matchedState?.cities || [];
        const { cityName } = matchCity(data.district || "", data.cities || [], stateCities, data.block || "");

        setState(stateName);
        if (cityName) {
          setCity(cityName);
        }
        setPincodeStatus({
          type: "success",
          message: cityName ? `Auto-filled: ${cityName}, ${stateName}` : `Auto-filled: ${stateName}`,
        });
      } else {
        setPincodeStatus({
          type: "error",
          message: data.message || "Location not found for this PIN code.",
        });
      }
    } catch {
      setPincodeStatus({
        type: "error",
        message: "Could not auto-fill. Please select manually.",
      });
    } finally {
      setIsPincodeLoading(false);
    }
  };

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const clean = e.target.value.replace(/\D/g, "").slice(0, 6);
    setZipCode(clean);
    if (clean.length === 6) {
      lookupAndFillPincode(clean);
    } else {
      setPincodeStatus({ type: null, message: "" });
    }
  };

  async function updateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedAddress = address?.trim() || "";
    const trimmedAddress2 = address_2?.trim() || "";
    const trimmedState = state?.trim() || "";
    const trimmedCity = city?.trim() || "";
    const trimmedZip = zipcode?.trim() || "";

    if (!trimmedAddress) {
      toast.error("Address Line 1 is required.");
      return;
    }

    if (trimmedAddress.length < 5 || trimmedAddress.length > 100) {
      toast.error("Address Line 1 must be between 5 and 100 characters long.");
      return;
    }

    if (!trimmedState) {
      toast.error("Please select a state.");
      return;
    }

    if (!trimmedCity) {
      toast.error("Please select a city.");
      return;
    }

    if (trimmedZip && !/^\d{6}$/.test(trimmedZip)) {
      toast.error("Please enter a valid 6-digit Indian postal code.");
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanApiUrl = config.apiUrl.replace(/\/+$/, "");
      const response = await fetch(`${cleanApiUrl}/api/v1/updateuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customer?.email,
          first_name: customer?.first_name,
          last_name: customer?.last_name || customer?.first_name,
          phone: customer?.phone,
          date_of_birth: customer?.date_of_birth,
          address: trimmedAddress,
          address_2: trimmedAddress2,
          city: trimmedCity,
          state: trimmedState,
          zip_code: trimmedZip,
          country: "India",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (typeof window !== "undefined" && data?.customer) {
          localStorage.setItem("customer", JSON.stringify(data.customer));
        }
        toast.success("Address updated successfully!");
        if (isEdited) {
          isEdited();
        }
        setIsEdit(false);
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data?.message || data?.error || "Failed to update address.");
      }
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error("An error occurred while updating address.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
              <IoIosArrowBack size={20} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight">Edit Address</h1>
              <p className="text-sm text-neutral-400 font-semibold mt-0.5">Modify your shipping and billing coordinates.</p>
            </div>
          </div>

          <form className="space-y-4" onSubmit={updateUser}>
            {/* Address Line 1 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">Address Line 1</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <MdLocationPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / Flat No., Street, Area"
                  className="w-full pl-11 pr-4 py-3.5 text-base text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Address Line 2 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">Address Line 2</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <MdLocationPin className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="address_2"
                  value={address_2}
                  onChange={(e) => setAddress2(e.target.value)}
                  placeholder="Landmark, Apartment, Suite (Optional)"
                  className="w-full pl-11 pr-4 py-3.5 text-base text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                />
              </div>
            </div>

            {/* Country and State grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">Country</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <FaGlobe className="w-5 h-5" />
                  </div>
                  <div
                    className="w-full pl-11 pr-4 py-3.5 text-base text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200 appearance-none cursor-not-allowed"
                  >
                    India
                  </div>
                </div>
              </div>

              {/* State */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">State</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <MdLocationPin className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="state"
                    value={state}
                    readOnly
                    placeholder="State"
                    className="w-full pl-11 pr-4 py-3.5 text-base text-neutral-800 bg-[#f4f4f4] border border-neutral-200/80 rounded-xl outline-none cursor-not-allowed select-none transition-all duration-200"
                    required
                  />
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
                    <FaCity className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    name="city"
                    value={city}
                    readOnly
                    placeholder="City"
                    className="w-full pl-11 pr-4 py-3.5 text-base text-neutral-800 bg-[#f4f4f4] border border-neutral-200/80 rounded-xl outline-none cursor-not-allowed select-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Zipcode */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">Zipcode</label>
                  {isPincodeLoading && (
                    <span className="text-[10px] text-blue-600 font-semibold animate-pulse flex items-center gap-1">
                      <FaSpinner className="animate-spin w-2.5 h-2.5" /> Fetching...
                    </span>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <MdLocationPin className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="zip_code"
                    maxLength={6}
                    value={zipcode}
                    onChange={handleZipCodeChange}
                    placeholder="e.g. 302001"
                    className="w-full pl-11 pr-10 py-3.5 text-base text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                  />
                  {isPincodeLoading && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-blue-500">
                      <FaSpinner className="animate-spin w-4 h-4" />
                    </div>
                  )}
                  {!isPincodeLoading && pincodeStatus.type === "success" && (
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-emerald-500">
                      <FaCheckCircle className="w-4 h-4" />
                    </div>
                  )}
                </div>
                {pincodeStatus.message && (
                  <p
                    className={`text-[11px] font-medium mt-0.5 leading-tight ${
                      pincodeStatus.type === "success"
                        ? "text-emerald-600 font-semibold"
                        : pincodeStatus.type === "error"
                        ? "text-amber-600 font-semibold"
                        : "text-blue-600"
                    }`}
                  >
                    {pincodeStatus.message}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-black hover:bg-neutral-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-200 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && (
                  <svg
                    className="w-4 h-4 animate-spin"
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
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                <span>{isSubmitting ? "Updating Address..." : "Update Address"}</span>
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
              <MdModeEdit className="w-4 h-4" />
              <span>Edit Address</span>
            </button>
          </div>

          {customer?.address && (
            <div className="max-w-md bg-[#fbfbfb] border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-4 border-b border-neutral-200 pb-2">Billing Address</h2>
              <div className="text-sm space-y-2.5 font-semibold text-neutral-600 leading-relaxed">
                <p className="font-bold text-neutral-900">{customer?.first_name} {customer?.last_name}</p>
                <p className="flex items-center gap-2">
                  <MdLocationPin className="w-4 h-4" />
                  <span>{customer?.address || "No address specified"}</span>
                </p>
                {customer?.address_2 && (
                  <p className="pl-6 text-neutral-455">{customer?.address_2}</p>
                )}
                <p className="pl-6">
                  {customer?.city || ""}, {customer?.zip_code || "Zip"}
                </p>
                <p className="pl-6">
                  {customer?.state || "State"}, {"India"}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function AccountDetailsTab({ customer, isEdited }: any) {
  const [isEdit, setIsEdit] = useState(false);
  const [firstName, setFirstName] = useState(customer?.first_name || "");
  const [lastName, setLastName] = useState(customer?.last_name || "");
  const [phone, setPhone] = useState(customer?.phone || "");
  const [DOB, setDob] = useState(customer?.date_of_birth || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state whenever customer data or isEdit changes
  useEffect(() => {
    if (customer) {
      setFirstName(customer.first_name || "");
      setLastName(customer.last_name || "");
      setPhone(customer.phone || "");
      setDob(customer.date_of_birth || "");
    }
  }, [customer, isEdit]);

  async function updateUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedFirstName = firstName?.trim() || "";
    const trimmedLastName = lastName?.trim() || "";
    const trimmedPhone = phone?.trim() || "";
    const trimmedDOB = DOB?.trim() || "";

    if (!trimmedFirstName) {
      toast.error("First name is required.");
      return;
    }
    if (!trimmedLastName) {
      toast.error("Last name is required.");
      return;
    }
    if (!trimmedPhone) {
      toast.error("Phone is required.");
      return;
    }

    const phoneError = getIndianMobileValidationError(trimmedPhone);
    if (phoneError) {
      toast.error(phoneError);
      return;
    }
    const cleanPhone = normalizeIndianPhoneNumber(trimmedPhone);

    if (!trimmedDOB) {
      toast.error("Date of birth is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const cleanApiUrl = config.apiUrl.replace(/\/+$/, "");
      const response = await fetch(`${cleanApiUrl}/api/v1/updateuser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customer?.email,
          first_name: trimmedFirstName,
          last_name: trimmedLastName,
          phone: cleanPhone,
          date_of_birth: trimmedDOB,
          address: customer?.address,
          address_2: customer?.address_2,
          city: customer?.city,
          state: customer?.state,
          zip_code: customer?.zip_code,
          country: "India",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (typeof window !== "undefined" && data?.customer) {
          localStorage.setItem("customer", JSON.stringify(data.customer));
        }
        toast.success("User details updated!");
        setIsEdit(false);
        if (isEdited) {
          isEdited();
        }
      } else {
        const data = await response.json().catch(() => ({}));
        toast.error(data?.message || data?.error || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("An error occurred while updating profile.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
              <IoIosArrowBack size={20} />
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
                    <FaUser className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="first_name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
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
                    <FaUser className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="last_name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 text-base text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">Mobile Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <FaPhoneAlt className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    maxLength={10}
                    placeholder="10-digit mobile number"
                    value={phone}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if ((raw.startsWith("+") && !raw.startsWith("+91")) || (raw.startsWith("00") && !raw.startsWith("0091"))) {
                        toast.error("Please enter a valid 10-digit mobile number.");
                        return;
                      }
                      let clean = raw.replace(/\D/g, "");
                      if (clean.startsWith("91") && clean.length > 10) {
                        clean = clean.slice(2);
                      } else if (clean.startsWith("0") && clean.length > 10) {
                        clean = clean.slice(1);
                      }
                      setPhone(clean.slice(0, 10));
                    }}
                    className="w-full pl-11 pr-4 py-3.5 text-base text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              {/* DOB */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    name="date_of_birth"
                    value={DOB}
                    onChange={(e) => setDob(e.target.value)}
                    max={new Date(new Date().setFullYear(new Date().getFullYear() - 10)).toISOString().split("T")[0]}
                    className="w-full pl-4 pr-4 py-3.5 text-base text-black bg-[#f4f4f4] hover:bg-neutral-100/50 focus:bg-white border border-neutral-200/80 rounded-xl outline-none focus:border-black focus:ring-2 focus:ring-black/5 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-black hover:bg-neutral-900 text-white rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-200 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting && (
                  <svg
                    className="w-4 h-4 animate-spin"
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
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                )}
                <span>{isSubmitting ? "Updating Profile..." : "Update Profile"}</span>
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
              <MdModeEdit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>

          <div className="max-w-md bg-[#fbfbfb] border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900 mb-4 border-b border-neutral-200 pb-2">User Profile</h2>
            <div className="text-sm space-y-3 font-semibold text-neutral-600 leading-relaxed">
              <p className="flex items-center gap-2 text-neutral-900 font-bold text-sm pb-2 border-b border-neutral-100">
                <span className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-xs text-black">
                  <FaUser className="w-4 h-4 text-neutral-700" />
                </span>
                <span>{customer?.first_name} {customer?.last_name}</span>
              </p>

              <p className="flex items-center gap-2 pt-1">
                <IoMdMail size={16} />
                <span>{customer?.email}</span>
              </p>

              <p className="flex items-center gap-2">
                <FaPhoneAlt size={16} />
                <span>{customer?.phone || "No phone specified"}</span>
              </p>

              <p className="flex items-center gap-2">
                <MdDateRange size={16} />
                <span>DOB: {customer?.date_of_birth || "No date specified"}</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
