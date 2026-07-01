"use client";

// components/AccountPage.tsx
import Footer from "@/components/footer";
import MainNavbar from "@/components/main-navbar";
import Navbar from "@/components/navbar";
import axios from "axios";
import { FormEvent, useEffect, useState } from "react";
import config from "../config";
import { useRouter } from "next/navigation";
// types/account.ts
type AccountTab =
  | "dashboard"
  | "orders"
  | "addresses"
  // | "payment-methods"
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
  // { key: "payment-methods", label: "Payment methods" },
  { key: "account-details", label: "Account details" },
  { key: "password", label: "Password" },
  { key: "logout", label: "Log out" },
];

export default function AccountPage() {
  const [activeTab, setActiveTab] = useState<AccountTab>("dashboard");
  const [access_token, setAccessToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [userOrders, setUserOrders] = useState([] as any);
  const router = useRouter();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      const customerData = localStorage.getItem("customer");
      if (customerData && token) {
        setAccessToken(token);
        setCustomer(customerData ? JSON.parse(customerData) : null);
      } else {
        router.push("/");
      }
    }
  }, [router]);

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
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
        // setError(error.message);
      } finally {
        // setLoading(false);
      }
    };

    fetchOrdersData();
  }, [customer?.id]);

  useEffect(() => {}, [userOrders]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardTab customer={customer} logout={logout} />;
      case "orders":
        return <OrdersTab userOrders={userOrders} />;
      case "password":
        return <PasswordTab customer={customer} />;
      case "addresses":
        return <AddressesTab customer={customer} />;
      // case "payment-methods":
      //   return <PaymentMethodsTab />;
      case "account-details":
        return <AccountDetailsTab customer={customer} />;
      case "logout":
        return <div className="p-4">You have been logged out.</div>;
      default:
        return null;
    }
  };

  return (
    <>
      <Navbar />
      <MainNavbar />
      <div className="container mx-auto md:flex  min-h-screen max-w-screen-xl px-2 pt-8 2xl:px-0 shadow-xl">
        <aside className="w-64 border-r p-4">
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key === "logout") {
                    logout();
                  }
                }}
                className={`block w-full text-left p-2 rounded hover:bg-gray-100 border-b cursor-pointer ${
                  activeTab === tab.key ? "bg-gray-200 font-semibold" : ""
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>
        <main className="flex-1 p-6">{renderTabContent()}</main>
      </div>
      <Footer />
    </>
  );
}

// components/tabs/DashboardTab.tsx
function DashboardTab({ customer, logout }: any) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>
        Hello <strong>{customer?.first_name}</strong> (not{" "}
        <strong>{customer?.first_name}</strong>?{" "}
        <a href="/" onClick={() => logout()} className="text-blue-600">
          Log out
        </a>
        )
      </p>
      <p className="mt-2">
        From your account dashboard you can view your{" "}
        <a href="#" className="text-blue-600">
          recent orders
        </a>
        , manage your{" "}
        <a href="#" className="text-blue-600">
          shipping and billing addresses
        </a>
        , and{" "}
        <a href="#" className="text-blue-600">
          edit your password and account details
        </a>
        .
      </p>
    </div>
  );
}

// components/tabs/OrdersTab.tsx
function OrdersTab({ userOrders }: any) {
  const [isOrderShow, setIsOrderShow] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null); // New state
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
        const dateA = new Date(
          a.order_details.created_at.replace(" ", "T")
        ).getTime();
        const dateB = new Date(
          b.order_details.created_at.replace(" ", "T")
        ).getTime();
        return dateB - dateA; // ✅ Newest (latest date) first
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
          <h1 className="text-2xl font-bold mb-4">Orders</h1>
          <table className="w-full text-left border">
            <thead>
              <tr>
                <th className="p-2 border">Order</th>
                <th className="p-2 border">Date</th>
                <th className="p-2 border">Status</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border hidden md:block">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((order: any) => (
                <tr key={order?.id}>
                  <td
                    className="p-2 border cursor-pointer hover:underline"
                    onClick={() => handleViewOrder(order)}
                  >
                    #{order?.order_details?.order_number}
                  </td>
                  <td className="p-2 border">
                    {order?.order_details?.created_at}
                  </td>
                  <td className="p-2 border">{order?.order_details?.status}</td>
                  <td className="p-2 border">
                    ₹{order?.order_details?.total_amount} for{" "}
                    {order?.items.length} items
                  </td>
                  <td className="p-2 border hidden md:block">
                    <p
                      onClick={() => handleViewOrder(order)}
                      className="bg-black text-white px-3 py-1 rounded cursor-pointer text-center"
                    >
                      View
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 && (
            <div className="flex justify-center mt-8 items-center space-x-4 shadow-lg pb-8">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 border rounded ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white text-black"
                }`}
              >
                Previous
              </button>

              <span className="text-lg font-semibold">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className={`px-4 py-2 border rounded ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-white text-black"
                }`}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {isOrderShow && selectedOrder && (
        <div className="max-w-4xl mx-auto px-4  text-gray-900">
          {/* Order Header */}
          <div className="flex gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6 cursor-pointer"
              onClick={() => setIsOrderShow(false)}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
              />
            </svg>
            <h1 className="text-2xl font-bold mb-4">Order Details</h1>
          </div>
          <div className="bg-gray-100 border border-gray-300 p-4 mb-8 text-sm">
            Order{" "}
            <span className="bg-yellow-300 font-medium">
              # {selectedOrder?.order_details?.order_number}
            </span>{" "}
            was placed on{" "}
            <span className="bg-yellow-300 font-medium">
              {selectedOrder?.order_details?.created_at}
            </span>{" "}
            and is currently{" "}
            <span className="bg-yellow-300 font-medium">
              {selectedOrder?.order_details?.status}
            </span>
            .
          </div>

          {/* Order Details Section */}
          <h2 className="text-2xl font-semibold mb-4">Order details</h2>
          <div className="border border-gray-300">
            <div className="grid grid-cols-2 bg-gray-100 font-semibold p-4 border-b border-gray-300">
              <span>Product</span>
              <span className="text-right">Total</span>
            </div>

            {selectedOrder?.items?.map((item: any) => (
              <div key={item?.id} className="p-4 border-b border-gray-200">
                <div className="flex justify-between">
                  <div>
                    {item.product_name} × <strong>{item.quantity || 1}</strong>
                    {item.size && (
                      <div className="text-sm mt-1">Size: {item.size}</div>
                    )}
                  </div>
                  <div className="text-right font-medium">₹{item.price}</div>
                </div>
              </div>
            ))}

            {/* Summary */}
            <div className="p-4 border-b border-gray-200 flex justify-between">
              <span>Subtotal:</span>
              <span>₹{selectedOrder?.order_details?.subtotal}</span>
            </div>
            <div className="p-4 border-b border-gray-200 flex justify-between">
              <span>Discount:</span>
              <span className="text-red-500">
                -₹{selectedOrder?.order_details?.discount_amount}
              </span>
            </div>
            <div className="p-4 border-b border-gray-200 flex justify-between">
              <span>Payment method:</span>
              <span>{selectedOrder?.order_details?.payment_method}</span>
            </div>
            <div className="p-4 border-b border-gray-200 flex justify-between">
              <span>Shipping:</span>
              <span>
                {selectedOrder?.order_details?.shipping_method
                  ? selectedOrder?.order_details?.shipping_method
                  : `₹${selectedOrder?.order_details?.shipping_amount}`}
              </span>
            </div>
            <div className="p-4 font-bold text-lg flex justify-between">
              <span>Total:</span>
              <span>₹{selectedOrder?.order_details?.total_amount}</span>
            </div>
          </div>

          {/* Billing Info */}
          <h2 className="text-2xl font-semibold mt-12 mb-4">Billing address</h2>
          <div className="text-sm space-y-1 leading-relaxed">
            <p>{selectedOrder?.order_details?.billing_name}</p>
            <p>{selectedOrder?.order_details?.address}</p>
            <p>{selectedOrder?.order_details?.billing_city}</p>
            <p>{selectedOrder?.order_details?.billing_state}</p>
            <p>{selectedOrder?.order_details?.billing_zip}</p>
            <p>{selectedOrder?.order_details?.billing_country}</p>
            <p>{selectedOrder?.order_details?.customer_phone}</p>
            <p>{selectedOrder?.order_details?.email}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// components/tabs/PasswordTab.tsx
function PasswordTab({ customer }: any) {
  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(event.currentTarget);
    const email = customer?.email;
    const password_confirmation =
      formData.get("password_confirmation")?.toString().trim() || "";
    const password = formData.get("password")?.toString() || "";
    const response = await fetch(`${config.apiUrl}api/v1/passwordchange`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, password_confirmation }),
    });
    if (response.ok) {
      const data = await response.json();
      alert("password updated!");
    } else {
      console.log("something went wrong!!");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Password</h1>
      <form className="space-y-4" onSubmit={changePassword}>
        <div>
          <label className="block mb-1">Password</label>
          <input
            type="password"
            name="password"
            defaultValue="12345678"
            className="w-full border p-2"
          />
        </div>
        <div>
          <label className="block mb-1">Confirm Password</label>
          <input
            type="password"
            name="password_confirmation"
            defaultValue="12345678"
            className="w-full border p-2"
          />
        </div>
        <button type="submit" className="bg-black text-white px-3 py-1 rounded">
          Save changes
        </button>
      </form>
    </div>
  );
}

// components/tabs/AddressesTab.tsx
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
      console.log("customerData1", data);
      setCustomerData(data);
      // customer = customerData?.customer;
      alert("user updated!");
    } else {
      console.log("something went wrong!!");
    }
  }

  useEffect(() => {
    if (typeof window !== "undefined" && customerData?.customer) {
      console.log("customerData2", customerData);
      localStorage.setItem("customer", JSON.stringify(customerData.customer));
    }
  }, [customerData]);

  return (
    <>
      {isEdit ? (
        <div>
          <div className="flex gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6 cursor-pointer"
              onClick={() => setIsEdit(false)}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
              />
            </svg>
            <h1 className="text-2xl font-bold mb-4">Address Details</h1>
          </div>
          <form className="space-y-4" onSubmit={updateUser}>
            <div>
              <label className="block mb-1">Address</label>
              <input
                type="text"
                name="address"
                defaultValue={customer?.address}
                onChange={(e: any) => setAddress(e.target.value)}
                className="w-full border p-2 rounded border-gray-400"
              />
            </div>
            <div>
              <label className="block mb-1">Address2</label>
              <input
                type="text"
                name="address_2"
                defaultValue={customer?.address_2}
                onChange={(e: any) => setAddress2(e.target.value)}
                className="w-full border p-2 rounded border-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">Country</label>
                <select
                  className="border p-2 rounded w-full border-gray-400"
                  name="country"
                  onChange={(e: any) => setCountry(e.target.value)}
                  defaultValue={customer?.country}
                >
                  <option value="India">India</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">State</label>
                <select
                  className="border p-2 rounded w-full border-gray-400"
                  name="state"
                  onChange={(e: any) => setState(e.target.value)}
                  defaultValue={customer?.state}
                >
                  <option>State</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Punjab">Punjab</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1">City</label>
                <select
                  className="border p-2 rounded w-full border-gray-400"
                  name="city"
                  onChange={(e: any) => setCity(e.target.value)}
                  defaultValue={customer?.city}
                >
                  <option>City</option>
                  <option value="Jaipur">Jaipur</option>
                  <option value="Delhi">Delhi</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Zipcode</label>
                <input
                  type="text"
                  name="zip_code"
                  defaultValue={customer?.zip_code}
                  onChange={(e: any) => setZipCode(e.target.value)}
                  className="border p-2 rounded border-gray-400 w-full"
                />
              </div>
            </div>
            <div>
              <button
                type="submit"
                className="bg-black text-white px-3 py-1 rounded"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4">Addresses</h1>
          <div className="mb-8 flex gap-2">
            <h2 className="text-xl font-semibold">Billing Address</h2>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6 cursor-pointer"
              onClick={() => setIsEdit(true)}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
              />
            </svg>
          </div>
          <p>{customer?.address}</p>
          <p>{customer?.address_2}</p>
          <p>
            {customer?.city}, {customer?.zip_code}
          </p>
          <p>
            {customer?.state}, {customer?.country || "India"}
          </p>
          {/* <div>
            <h2 className="text-xl font-semibold">Shipping Address</h2>
            <p>You have not set up this type of address yet.</p>
          </div> */}
        </div>
      )}
    </>
  );
}

// components/tabs/PaymentMethodsTab.tsx
function PaymentMethodsTab() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Payment Methods</h1>
      <p>No saved payment methods yet.</p>
    </div>
  );
}

// components/tabs/AccountDetailsTab.tsx
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
      console.log("customerData1", data);
      setCustomerData(data);
      // customer = customerData?.customer;
      alert("user updated!");
    } else {
      console.log("something went wrong!!");
    }
  }
  useEffect(() => {
    if (typeof window !== "undefined" && customerData?.customer) {
      console.log("customerData2", customerData);
      localStorage.setItem("customer", JSON.stringify(customerData.customer));
    }
  }, [customerData]);

  return (
    <>
      {isEdit ? (
        <div>
          <div className="flex gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6 cursor-pointer"
              onClick={() => setIsEdit(false)}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
              />
            </svg>
            <h1 className="text-2xl font-bold mb-4">Account Details</h1>
          </div>
          <form className="space-y-4" onSubmit={updateUser}>
            <div>
              <label className="block mb-1">First Name</label>
              <input
                type="text"
                name="first_name"
                defaultValue={customer?.first_name}
                onChange={(e: any) => setFirstName(e.target.value)}
                className="w-full border p-2"
              />
            </div>
            <div>
              <label className="block mb-1">Last Name</label>
              <input
                type="text"
                name="last_name"
                defaultValue={customer?.last_name}
                onChange={(e: any) => setLastName(e.target.value)}
                className="w-full border p-2"
              />
            </div>
            {/* <div>
              <label className="block mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                defaultValue={customer?.email}
                className="w-full border p-2"
                disabled
              />
            </div> */}
            <div>
              <label className="block mb-1">Phone</label>
              <input
                type="text"
                name="phone"
                defaultValue={customer?.phone}
                onChange={(e: any) => setPhone(e.target.value)}
                className="w-full border p-2"
              />
            </div>
            <div>
              <label className="block mb-1">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                defaultValue={customer?.date_of_birth}
                onChange={(e: any) => setDob(e.target.value)}
                className="w-full border p-2"
              />
            </div>
            <div>
              <button
                type="submit"
                className="bg-black text-white px-3 py-1 rounded"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div>
          <div className="mb-8 flex gap-2">
            <h2 className="text-xl font-semibold">User Info</h2>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6 cursor-pointer"
              onClick={() => setIsEdit(true)}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
              />
            </svg>
          </div>
          <p>
            {customer?.first_name} {customer?.last_name}
          </p>
          <p>{customer?.email}</p>
          <p>{customer?.phone}</p>
          <p>DOB: {customer?.date_of_birth}</p>
        </div>
      )}
    </>
  );
}
