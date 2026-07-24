import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "@/hooks/useStore";
import config from "@/app/config";
import { ChevronDownIcon, XMarkIcon, Bars3Icon } from "@heroicons/react/24/solid";
import logo from "../../public/logos/logo.svg";
import { useAppDispatch } from "@/hooks/useStore";
import { openCartDrawer } from "@/lib/slices/uiSlice";
import { useCart } from "@/hooks/useCart";
import { useViewProductsQuery } from "@/lib/api/productsApi";
import { logout } from "@/lib/slices/authSlice";
import { useRouter } from "next/navigation";
import { IoSearchSharp, IoClose } from "react-icons/io5";
import { FaHeart, FaUser } from "react-icons/fa";
import { HiShoppingCart } from "react-icons/hi2";


const resolveUrl = (url: string) => {

  if (!url) return "#";

  const cleanUrl = url.trim();

  if (cleanUrl === "current-affairs") return "/current-affairs";

  if (cleanUrl.startsWith("/") || cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
    return cleanUrl;
  }

  if (cleanUrl.includes("?page=")) {


    const urld = cleanUrl.split("?")[0];
    return `/${urld}`
  }
  if (cleanUrl === "#") return "#";
  return `/category/${cleanUrl}`;
};

export function Navbar({ menuData }: any) {

  const [searchTerm, setSearchTerm] = useState("");

  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [openMobileSubmenus, setOpenMobileSubmenus] = useState<Record<number, boolean>>({});
  const [openMobileNestedSubmenus, setOpenMobileNestedSubmenus] = useState<Record<string | number, boolean>>({});
  const headerMenu = menuData;
  const { data: productdatas } = useViewProductsQuery();
  const products = productdatas;
  const { user, isAuthenticated, loading } = useAppSelector((state) => state.auth);


  const { data } = useCart();
  const dispatch = useAppDispatch();
  const router = useRouter();




  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts([]);
      return;
    }
    const query = searchTerm.toLowerCase();
    if (products && products.length > 0) {
      const filtered = products.filter((p: any) =>
        p.name?.toLowerCase().includes(query)
      );

      setFilteredProducts(filtered.slice(0, 8));
    }
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

  const toggleMobileNestedSubmenu = (childId: string | number) => {
    setOpenMobileNestedSubmenus((prev) => ({
      ...prev,
      [childId]: !prev[childId],
    }));
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 w-full">
        <nav className="w-full bg-black py-4 px-5 transition-all duration-300 relative">
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
                        <IoSearchSharp className="w-[18px] h-[18px] transition-colors text-white" />
                      </div>

                      <input
                        type="text"
                        placeholder="What are you looking for?"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-sm text-white bg-white/5 placeholder-white border-2 border-white/50  rounded-full py-2.5 pl-11 pr-12 transition-all duration-300 outline-none"
                      />

                      {/* Clear Search Button */}
                      {searchTerm && (
                        <button
                          type="button"
                          onClick={() => setSearchTerm("")}
                          className="absolute inset-y-0 right-4 flex items-center justify-center text-white/80 hover:text-white transition-colors z-10 cursor-pointer p-1 rounded-full hover:bg-white/10"
                          aria-label="Clear search"
                        >
                          <IoClose className="w-5 h-5 text-white" />
                        </button>
                      )}

                      {/* Dropdown popup */}
                      {searchTerm && filteredProducts.length > 0 && (
                        <div className="absolute top-full left-0 w-full z-50 bg-white/95 backdrop-blur-md border border-neutral-200/80 rounded-2xl shadow-2xl max-h-96 overflow-y-auto mt-3 p-2 flex flex-col gap-1 custom-scrollbar">
                          {filteredProducts.map((product: any) => (
                            <Link
                              key={product?.id}
                              href={`/product-detail/${product?.slug}`}
                              onClick={() => setSearchTerm("")}
                              className="flex gap-4 items-center px-4 py-3 hover:bg-neutral-100/70 rounded-xl transition-all duration-200 border-b border-neutral-100 last:border-b-0 text-left"
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
                                <h4 className="font-semibold text-sm text-neutral-855 hover:text-black transition-colors truncate">
                                  {product?.name}
                                </h4>


                                {product.price && <span className="font-extrabold text-black mt-1 mr-2">
                                  ₹{product.price}
                                </span>
                                }
                                {(product.mrp && product.mrp != 0 && product.mrp != product.price) && <span className={`${product.price ? "text-gray-500 line-through text-xs " : "text-sm font-bold mr-2"}`}>
                                  ₹{product.mrp}
                                </span>
                                }
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Icons (Profile/Cart) */}
                  <div className="flex-shrink-0 flex items-center gap-6">
                    <Link href="/wishlist" className="text-white hover:text-white/80 transition-colors">
                      <FaHeart className="w-5 h-5" />
                    </Link>
                    {/* User Account Dropdown */}
                    {isAuthenticated ? (
                      <div className="relative group">

                        <button className="flex items-center gap-1 text-white hover:text-white/80 transition-colors focus:outline-none py-1">
                          <FaUser className="w-4 h-4" />
                          <span className="text-xs font-medium max-w-[80px] truncate hidden md:inline ml-1">
                            {user?.name}
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
                              onClick={logoutUser}
                              className="w-full text-left block hover:bg-gray-50 text-red-500 hover:text-red-400 rounded-xl transition-colors py-2.5 px-4 text-xs font-semibold"
                            >
                              Logout
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Link href="/sign-in" className="text-white hover:text-white/80 transition-colors">
                        <FaUser className="w-5 h-5" />
                      </Link>
                    )}
                    <button className="relative text-white hover:text-white/80 transition-colors" onClick={() => dispatch(openCartDrawer())}>
                      <HiShoppingCart className="w-5 h-5" />
                      {data?.items_count > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-white text-black text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-black shadow-sm">
                          {data.items_count}
                        </span>
                      )}
                    </button>

                  </div>
                </div>
                {/* Bottom Row: Categories Menu */}
                <div className="border-t border-white/20 mt-3 pt-3 flex justify-center w-full">
                  <div className="flex justify-center items-center text-[13px] font-semibold tracking-wider space-x-8">
                    {headerMenu?.map((item: any, index: number) => {
                      const hasChildren = item.children && item.children.length > 0;
                      if (hasChildren) {
                        const hasNestedChildren = item.children.some((child: any) => child.children && child.children.length > 0);

                        // Dynamic column configuration for mega menu
                        let gridColsClass = "grid-cols-4";
                        if (hasNestedChildren) {
                          const cols = item.children.length;
                          gridColsClass = cols === 2 ? "grid-cols-2" : cols === 3 ? "grid-cols-3" : "grid-cols-4";
                        } else {
                          const count = item.children.length;
                          if (count === 2) {
                            gridColsClass = "grid-cols-2";
                          } else if (count === 3) {
                            gridColsClass = "grid-cols-3";
                          } else {
                            gridColsClass = "grid-cols-4";
                          }
                        }

                        return (
                          <div key={item?.id || index} className="group">
                            <Link
                              href={resolveUrl(item.url)}
                              className="flex items-center gap-1 text-white hover:text-white/85 transition-colors focus:outline-none py-1.5"
                            >
                              {item.name || item.label}
                              <ChevronDownIcon className="h-3 w-3 text-white/70 transition-transform group-hover:rotate-180" />
                            </Link>

                            {/* Mega Menu Dropdown Container - Spans full width of the parent menu row */}
                            <div className="absolute container  top-[90%] left-[50%] translate-x-[-50%] right-auto w-full opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 transform translate-y-1 group-hover:translate-y-0 z-50">
                              <div className="bg-white border border-neutral-200/80 shadow-[0_25px_55px_rgba(0,0,0,0.15)] p-8 rounded-2xl relative w-full">
                                {/* Decorative top accent line */}
                                <div className="bg-gradient-to-r from-neutral-800 to-black h-[3px] rounded-t-2xl absolute top-0 left-0 right-0" />

                                {/* Scrollable Container with max-height and custom scrollbar */}
                                <div className="max-h-[400px] overflow-y-auto pr-6 custom-scrollbar">
                                  {/* Centered container inside full-width dropdown */}
                                  <div className="max-w-[1200px] mx-auto">
                                    {hasNestedChildren ? (
                                      <div className={`grid ${gridColsClass} gap-8`}>
                                        {item.children.map((child: any, cidx: number) => {
                                          const hasLevel3 = child.children && child.children.length > 0;
                                          return (
                                            <div key={child?.id || cidx} className="flex flex-col text-left">
                                              <Link
                                                href={resolveUrl(child.url)}
                                                className="font-bold text-[12px] capitalize tracking-wider !text-black border-b border-neutral-100 pb-1.5 mb-2.5 hover:!text-neutral-700 transition-colors"
                                              >
                                                {child.name}
                                              </Link>
                                              {hasLevel3 && (
                                                <div className="flex flex-col gap-2">
                                                  {child.children.map((subChild: any, sidx: number) => (
                                                    <Link
                                                      key={subChild?.id || sidx}
                                                      href={resolveUrl(subChild.url)}
                                                      className="group/inner text-xs !text-neutral-600 hover:!text-black hover:translate-x-1.5 transition-all duration-200 font-medium py-0.5 flex items-center"
                                                    >
                                                      <span className="relative py-0.5">
                                                        {subChild.name}
                                                        <span className="absolute bottom-0 left-0 w-full h-[1px] bg-black transform scale-x-0 origin-left transition-transform duration-300 ease-out group-hover/inner:scale-x-100" />
                                                      </span>
                                                    </Link>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div className={`grid ${gridColsClass} gap-x-8 gap-y-4`}>
                                        {item.children.map((child: any, cidx: number) => (
                                          <Link
                                            key={child?.id || cidx}
                                            href={resolveUrl(child.url)}
                                            className="group/inner text-xs !text-neutral-700 hover:!text-black hover:translate-x-1.5 transition-all duration-200 font-semibold py-1 flex items-center text-left"
                                          >
                                            <span className="relative py-0.5">
                                              {child.name}
                                              <span className="absolute bottom-0 left-0 w-full h-[1px] bg-black transform scale-x-0 origin-left transition-transform duration-300 ease-out group-hover/inner:scale-x-100" />
                                            </span>
                                          </Link>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return (
                        <Link
                          key={item?.id || index}
                          href={resolveUrl(item.url)}
                          className="text-white hover:text-white/80 transition-colors py-1.5"
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
                <Link href="/" className="flex-shrink-0">
                  <Image
                    src={logo}
                    alt="Bookwindow Logo"
                    className="h-[42px] w-auto object-contain"
                    priority
                  />
                </Link>

                <span className="text-white text-center text-xs sm:text-sm font-medium px-2 flex-1">
                  “ सर्वं सम्भाव्यते त्वयि। ”
                </span>

                <button
                  onClick={handleOpen}
                  className="flex-shrink-0 text-white hover:bg-[#1a1a1a] p-2 rounded-lg focus:outline-none"
                >
                  {open ? (
                    <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
                  ) : (
                    <Bars3Icon strokeWidth={2.5} className="h-5 w-5 text-white" />
                  )}
                </button>
              </div>
              <div
                className={`lg:hidden transition-all duration-300 ${open ? "max-h-[70vh] overflow-y-auto opacity-100 mt-4 pr-1 custom-scrollbar" : "max-h-0 overflow-hidden opacity-0 pointer-events-none"
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
                                    className={`h-4 w-4 text-white/70 transition-transform duration-200 ${isSubmenuOpen ? "rotate-180 text-white" : ""
                                      }`}
                                  />
                                </button>
                                {isSubmenuOpen && (
                                  <div className="pl-4 pb-4 flex flex-col gap-1.5">
                                    {item.children.map((child: any, cidx: number) => {
                                      const hasLevel3 = child.children && child.children.length > 0;
                                      const isNestedOpen = !!openMobileNestedSubmenus[child.id];
                                      return (
                                        <div key={child?.id || cidx} className="w-full">
                                          {hasLevel3 ? (
                                            <div className="w-full">
                                              <button
                                                onClick={() => toggleMobileNestedSubmenu(child.id)}
                                                className="w-full py-2.5 flex items-center justify-between text-[13px] font-semibold text-white/80 focus:outline-none"
                                              >
                                                <span className="tracking-wide">{child.name}</span>
                                                <ChevronDownIcon
                                                  className={`h-3.5 w-3.5 text-white/50 transition-transform duration-200 ${isNestedOpen ? "rotate-180 text-white" : ""
                                                    }`}
                                                />
                                              </button>
                                              {isNestedOpen && (
                                                <div className="pl-4 pb-2 flex flex-col gap-2 border-l border-white/10 ml-1.5 mt-1">
                                                  {child.children.map((subChild: any, sidx: number) => (
                                                    <Link
                                                      key={subChild?.id || sidx}
                                                      href={resolveUrl(subChild.url)}
                                                      onClick={() => setOpen(false)}
                                                      className="text-white/60 active:text-white py-1 block text-xs font-normal transition-colors text-left"
                                                    >
                                                      {subChild.name}
                                                    </Link>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <Link
                                              href={resolveUrl(child.url)}
                                              onClick={() => setOpen(false)}
                                              className="text-white/70 active:text-white py-2.5 block text-[13px] font-normal transition-colors text-left"
                                            >
                                              {child.name}
                                            </Link>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <Link
                                href={resolveUrl(item.url)}
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
      </div>

      <div className="lg:block hidden p-4 bg-black border-t border-white/20 mt-[133px] ">
        <p className="text-white text-center">“ सर्वं सम्भाव्यते त्वयि। ”</p>
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
          <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
            {filteredProducts.length > 0 ? (
              <div className="flex flex-col gap-3">
                {filteredProducts.map((product: any) => (
                  <Link
                    key={product?.id}
                    href={`/product-detail/${product?.slug}`}
                    onClick={() => setSearchTerm("")}
                    className="flex gap-4 items-center p-3 hover:bg-neutral-50 rounded-2xl transition-all border border-neutral-100 hover:border-neutral-200"
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
                      <h4 className="font-semibold text-xs text-neutral-855 hover:text-black transition-colors text-left truncate">
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
                <IoSearchSharp className="w-12 h-12 text-gray-300 mb-3" />
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
          {isAuthenticated ? (
            <Link href="/my-account" className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white border border-white/20 shadow-md transform active:scale-95 transition-all">
              <span className="text-sm font-bold uppercase">
                {user?.name ? user.name[0] : "U"}
              </span>
            </Link>
          ) : (
            <Link href="/sign-in" className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 text-white border border-white/10 shadow-md hover:bg-neutral-800 transform active:scale-95 transition-all">
              <FaUser className="w-4 h-4" />
            </Link>
          )}
        </div>

        <div className="flex-grow relative group">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <IoSearchSharp className="w-4 h-4 transition-colors text-white" />
          </div>

          <input
            type="text"
            placeholder="Search books..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs text-white bg-white/5 placeholder-white border border-white rounded-full py-2.5 pl-9 pr-9 transition-all duration-300 outline-none "
          />


        </div>

        <div className="flex-shrink-0">
          <Link href="/wishlist" className="text-white hover:text-white/80 transition-colors">
            <FaHeart className="w-5 h-5" />
          </Link>


        </div>
        <div className="flex-shrink-0">

          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-900 text-white border border-white/10 shadow-md hover:bg-neutral-800 transform active:scale-95 transition-all " onClick={() => dispatch(openCartDrawer())}>
            <HiShoppingCart className="w-5 h-5" />
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
