"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import config from "@/app/config";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/solid";
import logo from "../../public/logos/logo.svg";

export function Navbar({ items_count, customerData, isCartEmpty }: any) {
  const [access_token, setAccessToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [session, setSession] = useState("");
  const [itemsCount, setItemsCount] = useState(items_count || 0);
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [headerMenu, setHeaderMenu] = useState([] as any);
  const [openMobileSubmenus, setOpenMobileSubmenus] = useState<Record<number, boolean>>({});
  const router = useRouter();

  // Sync customer details
  useEffect(() => {
    if (customerData) {
      setCustomer(customerData.customer);
      setAccessToken(customerData.access_token);
    }
  }, [customerData]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      const customerDataVal = localStorage.getItem("customer");
      setAccessToken(token);
      setCustomer(customerDataVal ? JSON.parse(customerDataVal) : null);
    }
  }, []);

  // Check user session
  const checkSession = async () => {
    try {
      const res = await fetch("/api/debug", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      setSession(data?.session_id);
    } catch (error) {
      console.log("error fetching session", error);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  // Fetch cart data when session is active
  useEffect(() => {
    if (session) {
      const viewCart = async () => {
        try {
          const response = await axios({
            method: "get",
            url: `${config.apiUrl}api/cart/viewcart?session_id=${session}`,
            responseType: "json",
          });
          const data = response?.data;
          setItemsCount(data?.items_count);
        } catch (error) {
          console.log("error viewing cart", error);
        }
      };
      viewCart();
    }
  }, [session]);

  // Fetch header menu items
  useEffect(() => {
    const fetchHeaderMenu = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/menus/header_menu`,
          responseType: "json",
        });
        setHeaderMenu(response.data?.data || []);
      } catch (error) {
        console.log("error fetching header menu", error);
      }
    };
    fetchHeaderMenu();
  }, []);

  // Fetch all products for search autocomplete
  useEffect(() => {
    const fetchProductsForSearch = async () => {
      try {
        const res = await axios({
          method: "get",
          url: `${config.apiUrl}api/products`,
          responseType: "json",
        });
        if (res.data) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error("Error fetching products for search:", err);
      }
    };
    fetchProductsForSearch();
  }, []);

  // Filter products as search term updates
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts([]);
      return;
    }
    const query = searchTerm.toLowerCase();
    const filtered = products.filter((p: any) =>
      p.name?.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered.slice(0, 8));
  }, [searchTerm, products]);

  const handleOpen = () => setOpen((cur) => !cur);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 960) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("customer");
      localStorage.clear();
      window.location.reload();
    }
  };

  const toggleMobileSubmenu = (index: number) => {
    setOpenMobileSubmenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-black border-b border-gray-900 py-4 px-4 md:px-8 transition-all duration-300">
      <div className="max-w-[1400px] mx-auto flex flex-col">
        {/* ================= DESKTOP VIEW ================= */}
        <div className="hidden lg:flex items-stretch w-full gap-10">
          {/* Left Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              <Image
                src={logo}
                alt="Bookwindow Logo"
                className="h-auto w-[60px] object-contain"
                priority
              />
            </Link>
          </div>

          {/* Right Column: Search row on top, Menu row on bottom */}
          <div className="flex-grow flex flex-col justify-between">
            {/* Top Row: Search and Icons */}
            <div className="flex items-center justify-between gap-8 w-full">
              {/* Centered Search Bar */}
              <div className="flex-grow max-w-4xl">
                <div className="relative w-full">
                  {/* Search icon */}
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.8"
                      stroke="#333333"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                      />
                    </svg>
                  </div>

                  <input
                    type="text"
                    placeholder="What are you looking for?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white text-gray-900 placeholder-gray-500 text-sm border border-transparent rounded-full py-2.5 pl-11 pr-11 transition-all focus:outline-none focus:shadow-md focus:bg-white"
                  />

                  {/* Dropdown popup */}
                  {searchTerm && filteredProducts.length > 0 && (
                    <div className="absolute top-full left-0 w-full z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-96 overflow-y-auto mt-3 p-1.5">
                      {filteredProducts.map((product: any) => (
                        <Link
                          key={product?.id}
                          href={`/product-detail/${product?.slug}`}
                          onClick={() => setSearchTerm("")}
                          className="flex gap-4 items-center px-4 py-3 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-100 last:border-b-0"
                        >
                          <div className="relative w-10 h-14 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                            <Image
                              src={`${config.apiUrl}storage/app/public/${product?.image}`}
                              alt={product?.name || "Product"}
                              className="object-cover"
                              fill
                              sizes="40px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs text-gray-800 hover:text-[#A9001F] transition-colors truncate">
                              {product?.name}
                            </h4>
                            <div className="text-xs font-bold text-[#A9001F] mt-1">
                              ₹{product?.price}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Icons (Profile/Cart) */}
              <div className="flex-shrink-0 flex items-center gap-6">
                {/* User Account Dropdown */}
                {access_token && customer ? (
                  <div className="relative group">
                    <button className="flex items-center gap-1 text-white hover:text-white/80 transition-colors focus:outline-none py-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                        />
                      </svg>
                      <span className="text-xs font-medium max-w-[80px] truncate hidden md:inline ml-1">
                        {customer?.first_name}
                      </span>
                      <ChevronDownIcon className="h-3 w-3 text-white/80 ml-0.5 transition-transform group-hover:rotate-180" />
                    </button>
                    <div className="absolute right-0 top-full hidden group-hover:block z-50 pt-2 min-w-[150px]">
                      <div className="bg-white border border-gray-200 text-gray-800 shadow-2xl p-2 rounded-2xl">
                        <Link
                          href="/my-account"
                          className="block hover:bg-gray-50 text-gray-700 hover:text-[#A9001F] rounded-xl transition-colors py-2.5 px-4 text-xs font-semibold"
                        >
                          My Account
                        </Link>
                        <button
                          onClick={logout}
                          className="w-full text-left block hover:bg-gray-50 text-red-500 hover:text-red-400 rounded-xl transition-colors py-2.5 px-4 text-xs font-semibold"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Link href="/sign-in" className="text-white hover:text-white/80 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                  </Link>
                )}

                {/* Shopping Bag / Cart */}
                <Link href="/checkout?step=cart" className="relative text-white hover:text-white/80 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                  <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-black shadow-sm">
                    {items_count || isCartEmpty ? items_count : itemsCount || 0}
                  </span>
                </Link>
              </div>
            </div>

            {/* Bottom Row: Categories Menu */}
            <div className="border-t border-white/20 mt-3 pt-2">
              <div className="flex justify-start items-center text-[13px] text-white font-semibold tracking-wider space-x-8">              
                {headerMenu?.map((item: any, index: number) => {
                  const hasChildren = item.children && item.children.length > 0;
                  if (hasChildren) {
                    return (
                      <div key={item?.id || index} className="relative group">
                        <button className="flex items-center gap-1 text-white hover:text-white/80 transition-colors focus:outline-none py-1">
                          {item.name || item.label}
                          <ChevronDownIcon className="h-3 w-3 text-white/70 transition-transform group-hover:rotate-180" />
                        </button>
                        <div className="absolute left-0 top-full hidden group-hover:block z-50 pt-2 min-w-[200px]">
                          <div className="bg-white border border-gray-200 text-gray-800 shadow-2xl p-2 rounded-2xl">
                            {item.children.map((child: any, cidx: number) => (
                              <Link
                                key={child?.id || cidx}
                                href={`/category/${child.url}`}
                                className="block hover:bg-gray-50 text-gray-700 hover:text-[#A9001F] rounded-xl transition-colors py-2.5 px-4 text-xs font-semibold"
                              >
                                {child.name}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={item?.id || index}
                      href={index === 6 ? "/current-affairs" : `/category/${item.url}`}
                      className="text-white hover:text-white/80 transition-colors"
                    >
                      {item.name || item.label}
                    </Link>
                  );
                })}

                
              </div>
            </div>
          </div>
        </div>

        {/* ================= MOBILE VIEW ================= */}
        <div className="lg:hidden w-full flex flex-col">
          {/* Header Row */}
          <div className="flex items-center justify-between w-full text-white">
            <button
              onClick={handleOpen}
              className="text-white hover:bg-[#1a1a1a] p-2 rounded-lg focus:outline-none"
            >
              {open ? (
                <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
              ) : (
                <Bars3Icon strokeWidth={2.5} className="h-5 w-5 text-white" />
              )}
            </button>

            <Link href="/">
              <Image
                src={logo}
                alt="Bookwindow Logo"
                className="h-[42px] w-auto object-contain"
                priority
              />
            </Link>

            <div className="flex items-center gap-4">
              {/* User Account / Profile */}
              {access_token && customer ? (
                <Link href="/my-account" className="text-white hover:text-white/80 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                </Link>
              ) : (
                <Link href="/sign-in" className="text-white hover:text-white/80 transition-colors">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                </Link>
              )}

              {/* Shopping Bag / Cart */}
              <Link href="/checkout?step=cart" className="relative text-white hover:text-white/80 transition-colors">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                  />
                </svg>
                <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-black shadow-sm">
                  {items_count || isCartEmpty ? items_count : itemsCount || 0}
                </span>
              </Link>
            </div>
          </div>          {/* Search Row */}
          <div className="w-full mt-3 relative">
            {/* Search Icon */}
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="#333333"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </div>

            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-gray-900 placeholder-gray-500 text-sm border border-transparent rounded-full py-2 pl-10 pr-10 transition-all focus:outline-none focus:shadow-md focus:bg-white"
            />

            {/* Mic Icon */}
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.8"
                stroke="#333333"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                />
              </svg>
            </div>

            {/* Dropdown autocomplete for mobile */}
            {searchTerm && filteredProducts.length > 0 && (
              <div className="absolute top-full left-0 w-full z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-72 overflow-y-auto mt-3 p-1.5">
                {filteredProducts.map((product: any) => (
                  <Link
                    key={product?.id}
                    href={`/product-detail/${product?.slug}`}
                    onClick={() => setSearchTerm("")}
                    className="flex gap-3 items-center px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors border-b border-gray-100 last:border-b-0"
                  >
                    <div className="relative w-8 h-11 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                      <Image
                        src={`${config.apiUrl}storage/app/public/${product?.image}`}
                        alt={product?.name || "Product"}
                        className="object-cover"
                        fill
                        sizes="32px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs text-gray-800 truncate">
                        {product?.name}
                      </h4>
                      <div className="text-xs font-bold text-[#A9001F] mt-0.5">
                        ₹{product?.price}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Collapse Menu */}
          {/* Mobile Collapse Menu */}
          <div
            className={`lg:hidden transition-all duration-300 overflow-hidden ${
              open ? "max-h-[85vh] opacity-100 mt-4" : "max-h-0 opacity-0 pointer-events-none"
            }`}
          >
            <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
              {/* Dynamic categories for mobile */}
              <div className="flex flex-col">
                <div className="text-[11px] font-semibold text-white/50 tracking-widest px-2 mb-2 uppercase border-b border-white/10 pb-2">
                  Categories
                </div>
                <div className="flex flex-col text-white">
                  {headerMenu.map((item: any, index: number) => {
                    const hasChildren = item.children && item.children.length > 0;
                    const isSubmenuOpen = !!openMobileSubmenus[index];
                    return (
                      <div key={item?.id || index} className="w-full border-b border-white/10">
                        {hasChildren ? (
                          <div className="w-full">
                            <button
                              onClick={() => toggleMobileSubmenu(index)}
                              className="w-full py-4 px-2 flex items-center justify-between text-sm font-semibold text-white focus:outline-none"
                            >
                              <span className="tracking-wide">{item.name || item.label}</span>
                              <ChevronDownIcon
                                className={`h-4 w-4 text-white/70 transition-transform duration-200 ${
                                  isSubmenuOpen ? "rotate-180 text-white" : ""
                                }`}
                              />
                            </button>
                            {isSubmenuOpen && (
                              <div className="pl-4 pb-4 flex flex-col gap-3">
                                {item.children.map((child: any, cidx: number) => (
                                  <Link
                                    key={child?.id || cidx}
                                    href={`/category/${child.url}`}
                                    onClick={() => setOpen(false)}
                                    className="text-white/70 active:text-white py-1 block text-[13px] font-normal transition-colors"
                                  >
                                    {child.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Link
                            href={index === 6 ? "/current-affairs" : `/category/${item.url}`}
                            onClick={() => setOpen(false)}
                            className="w-full block py-4 px-2 text-sm font-semibold text-white tracking-wide"
                          >
                            {item.name || item.label}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
