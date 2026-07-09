import  { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

import config from "@/app/config";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/solid";
import logo from "../../public/logos/logo.svg";
import { useAppDispatch } from "@/hooks/useStore";
import { openCartDrawer } from "@/lib/slices/uiSlice";
import { useCart } from "@/hooks/useCart";
import { useViewProductsQuery } from "@/lib/api/productsApi";


export function Navbar({  menuData }: any) {
  const [customer, setCustomer] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [openMobileSubmenus, setOpenMobileSubmenus] = useState<Record<number, boolean>>({});
   const headerMenu =menuData;
   const {data:productdatas} = useViewProductsQuery();
   const products = productdatas;


  const { data } = useCart();
const dispatch = useAppDispatch();


  useEffect(() => {
    if (typeof window !== "undefined") {
      const customerDataVal = localStorage.getItem("customer");
      setCustomer(customerDataVal ? JSON.parse(customerDataVal) : null);
    }
  }, []);


  
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
        document.body.style.paddingBottom = "0px";
      } else {
        document.body.style.paddingBottom = "76px";
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.paddingBottom = "0px";
    };
  }, []);

  const logout = () => {
    if (typeof window !== "undefined") {
 
      localStorage.removeItem("customer");
      localStorage.clear();
      window.location.reload();
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.innerWidth < 960 && searchTerm.trim() !== "") {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
    return () => {
      if (typeof window !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, [searchTerm]);

  const toggleMobileSubmenu = (index: number) => {
    setOpenMobileSubmenus((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <>
    <nav className="sticky top-0 z-50 w-full bg-black py-4 px-4 md:px-8 transition-all duration-300">
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
              <div className="flex-grow flex justify-center">
                <div className="relative w-full max-w-3xl group">
                  {/* Search icon */}
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="rgba(255,255,255,0.45)"
                      className="w-4 h-4 transition-colors group-focus-within:stroke-purple-400"
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
                    className="w-full text-sm text-white bg-white/5 hover:bg-white/10 focus:bg-zinc-950/80 placeholder-white/35 border border-white/15 rounded-full py-2.5 pl-11 pr-12 transition-all duration-300 focus:outline-none focus:border-purple-500/80 focus:ring-4 focus:ring-purple-500/10 shadow-inner"
                  />

                  {/* Clear Search Button */}
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-4 flex items-center text-white/40 hover:text-white transition-colors"
                      aria-label="Clear search"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className="w-4.5 h-4.5"
                      >
                        <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                      </svg>
                    </button>
                  )}

                  {/* Dropdown popup */}
                  {searchTerm && filteredProducts.length > 0 && (
                    <div className="absolute top-full left-0 w-full z-50 bg-white/95 backdrop-blur-md border border-neutral-200/80 rounded-2xl shadow-2xl max-h-96 overflow-y-auto mt-3 p-2 flex flex-col gap-1">
                      {filteredProducts.map((product: any) => (
                        <Link
                          key={product?.id}
                          href={`/product-detail/${product?.slug}`}
                          onClick={() => setSearchTerm("")}
                          className="flex gap-4 items-center px-4 py-3 hover:bg-purple-50/60 rounded-xl transition-all duration-200 border-b border-neutral-100 last:border-b-0 text-left"
                        >
                          <div className="relative w-10 h-14 bg-neutral-50 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-200/50 shadow-sm">
                            <Image
                              src={`${config.apiUrl}storage/app/public/${product?.image}`}
                              alt={product?.name || "Product"}
                              className="object-cover"
                              fill
                              sizes="40px"
                            />
                          </div>
                          <div className="flex-1 min-w-0 text-left">
                            <h4 className="font-semibold text-xs text-neutral-850 hover:text-purple-650 transition-colors truncate">
                              {product?.name}
                            </h4>
                            <div className="text-xs font-extrabold text-black mt-1">
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
                { customer ? (
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
                          className="block hover:bg-gray-50 text-gray-700 hover:text-black rounded-xl transition-colors py-2.5 px-4 text-xs font-semibold"
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
                <button  className="relative text-white hover:text-white/80 transition-colors" onClick={() => dispatch(openCartDrawer())}>
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
                 

  {data?.items_count > 0 && (
     <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-black shadow-sm">
                   {data.items_count}
                  </span>
  )}
</button>


              </div>
            </div>

            {/* Bottom Row: Categories Menu */}
            <div className="border-t border-white/20 mt-3 pt-3 flex justify-center">
              <div className="flex justify-center items-center text-[13px] text-white font-semibold tracking-wider space-x-8">              
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
                                className="block hover:bg-gray-50 text-gray-700 hover:text-black rounded-xl transition-colors py-2.5 px-4 text-xs font-semibold"
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
        <div className="lg:hidden w-full flex flex-col">          {/* Header Row */}
          <div className="flex items-center justify-between w-full text-white">
            <Link href="/">
              <Image
                src={logo}
                alt="Bookwindow Logo"
                className="h-[42px] w-auto object-contain"
                priority
              />
            </Link>

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

          </div>   
          <div
            className={`lg:hidden transition-all duration-300 overflow-hidden ${
              open ? "max-h-[85vh] opacity-100 mt-4" : "max-h-0 opacity-0 pointer-events-none"
            }`}
          >
            <div className="pt-4 border-t border-white/10 flex flex-col gap-4">           
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
    <div className="p-4 bg-black border-t border-white/20">
      <p className="text-white text-center">“Test your limits. Discover your strengths.”</p>
    </div>

    {/* ================= MOBILE SEARCH PANEL ================= */}
    {searchTerm.trim() !== "" && (
      <div className="lg:hidden fixed inset-x-0 top-[74px] bottom-[64px] z-40 bg-white flex flex-col shadow-inner">
        {/* Header of Search Panel */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <span className="text-sm font-semibold text-gray-850">
            Search Results for "{searchTerm}"
          </span>
          <button
            onClick={() => setSearchTerm("")}
            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-800 transition-colors"
            aria-label="Close search"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
        
        {/* Results list */}
        <div className="flex-1 overflow-y-auto px-4 py-4">
          {filteredProducts.length > 0 ? (
            <div className="flex flex-col gap-3">
              {filteredProducts.map((product: any) => (
                <Link
                  key={product?.id}
                  href={`/product-detail/${product?.slug}`}
                  onClick={() => setSearchTerm("")}
                  className="flex gap-4 items-center p-3 hover:bg-purple-50/50 rounded-2xl transition-all border border-neutral-100 hover:border-purple-100/30"
                >
                  <div className="relative w-12 h-16 bg-neutral-50 rounded-xl overflow-hidden flex-shrink-0 border border-neutral-200 shadow-sm">
                    <Image
                      src={`${config.apiUrl}storage/app/public/${product?.image}`}
                      alt={product?.name || "Product"}
                      className="object-cover"
                      fill
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-xs text-neutral-850 hover:text-purple-650 transition-colors text-left truncate">
                      {product?.name}
                    </h4>
                    <div className="text-xs font-extrabold text-neutral-900 mt-1 text-left">
                      ₹{product?.price}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="w-12 h-12 text-gray-300 mb-3"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
              <p className="text-sm font-semibold text-gray-850">No results found</p>
              <p className="text-xs text-gray-500 mt-1 px-4">
                We couldn't find any books matching "{searchTerm}". Please try another search term.
              </p>
            </div>
          )}
        </div>
      </div>
    )}

    {/* ================= MOBILE BOTTOM NAVIGATION BAR ================= */}
     <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0c0c0e]/95 backdrop-blur-md border-t border-white/10 px-4 py-3 flex items-center justify-between gap-3 shadow-[0_-8px_30px_rgb(0,0,0,0.5)]">

      <div className="flex-shrink-0">
        {  customer ? (
          <Link href="/my-account" className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white border border-white/20 shadow-md transform active:scale-95 transition-all">
            <span className="text-sm font-bold uppercase">
              {customer?.first_name ? customer.first_name[0] : "U"}
            </span>
          </Link>
        ) : (
          <Link href="/sign-in" className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 text-white border border-white/10 shadow-md hover:bg-neutral-800 transform active:scale-95 transition-all">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5 text-white/90"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          </Link>
        )}
      </div>

      <div className="flex-grow relative group">
        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="rgba(255,255,255,0.4)"
            className="w-4 h-4 transition-colors group-focus-within:stroke-purple-400"
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
          placeholder="Search books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs text-white bg-white/5 placeholder-white/35 border border-white/15 rounded-full py-2.5 pl-9 pr-9 transition-all duration-300 focus:outline-none focus:border-purple-500/80 focus:ring-2 focus:ring-purple-500/10 focus:bg-zinc-950"
        />

        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-3 flex items-center text-white/40 hover:text-white transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4.5 h-4.5"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        )}
      </div>


      <div className="flex-shrink-0">
                 <button  className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 text-white border border-white/10 shadow-md hover:bg-neutral-800 transform active:scale-95 transition-all " onClick={() => dispatch(openCartDrawer())}>
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
                 

  {data?.items_count > 0 && (
     <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-black shadow-sm">
            {data.items_count}
      </span>
  )}
</button>
        
      </div>
    </div> 
    </>
  );
}

export default Navbar;
