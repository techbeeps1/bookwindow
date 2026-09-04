"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import config from "../config";
import BookCard from "@/components/book-card";
import AllProductSidebar from "@/components/all-products-sidebar";
import ProductFilterBar from "@/components/ProductFilterBar";
import { useViewProductsQuery } from "@/lib/api/productsApi";
import { filterAndRankProducts } from "@/helper/searchHelper";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { IoSearchSharp } from "react-icons/io5";
import { FaChevronRight, FaBookOpen } from "react-icons/fa";

export default function SearchResultsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read search term from URL query parameters (supports ?q=, ?key=, ?query=)
  const initialQuery =
    searchParams.get("q") ||
    searchParams.get("key") ||
    searchParams.get("query") ||
    "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter & Toolbar States
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedPublicationIds, setSelectedPublicationIds] = useState<number[]>([]);
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Fetch all products
  const { data: productdatas, isLoading } = useViewProductsQuery();
  const products = useMemo(() => productdatas || [], [productdatas]);

  // Synchronize local search state when URL param changes
  useEffect(() => {
    setSearchQuery(initialQuery);
    setCurrentPage(1);
  }, [initialQuery]);

  // Update URL search query (debounced / smooth)
  const handleQueryChange = (newQuery: string) => {
    setSearchQuery(newQuery);
    setCurrentPage(1);

    const params = new URLSearchParams(searchParams.toString());
    if (newQuery.trim()) {
      params.set("q", newQuery.trim());
    } else {
      params.delete("q");
      params.delete("key");
      params.delete("query");
    }
    router.replace(`/search?${params.toString()}`, { scroll: false });
  };

  // Scroll to top on page mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Multi-word smart search & filtering
  const filteredProducts = useMemo(() => {
    // 1. Smart tokenized matching & relevance ranking
    let list = filterAndRankProducts(products, searchQuery);

    // 2. Sidebar Filters
    list = list.filter((product: any) => {
      const categoryMatch =
        selectedCategoryIds.length === 0 ||
        selectedCategoryIds.includes(product.sub_category_id) ||
        (Array.isArray(product.category_id) &&
          product.category_id.some((id: any) =>
            selectedCategoryIds.includes(Number(id))
          ));

      const publicationMatch =
        selectedPublicationIds.length === 0 ||
        selectedPublicationIds.includes(product.production_id);

      const languageMatch =
        selectedLanguageIds.length === 0 ||
        selectedLanguageIds.some(
          (lang) =>
            product.book_language?.toLowerCase() === lang.toLowerCase()
        );

      return categoryMatch && publicationMatch && languageMatch;
    });

    // 3. User-Selected Sorting (preserves relevance order if "default")
    if (sortBy === "price-low") {
      list = [...list].sort(
        (a: any, b: any) => Number(a.price || a.mrp) - Number(b.price || b.mrp)
      );
    } else if (sortBy === "price-high") {
      list = [...list].sort(
        (a: any, b: any) => Number(b.price || b.mrp) - Number(a.price || a.mrp)
      );
    } else if (sortBy === "name") {
      list = [...list].sort((a: any, b: any) =>
        (a.name || "").localeCompare(b.name || "")
      );
    }

    return list;
  }, [
    products,
    searchQuery,
    selectedCategoryIds,
    selectedPublicationIds,
    selectedLanguageIds,
    sortBy,
  ]);

  // Reset pagination when filtered list changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategoryIds, selectedPublicationIds, selectedLanguageIds, sortBy]);

  // Sidebar Filter Handlers
  const handleCategorySelect = (categoryId: number | "clear") => {
    if (categoryId === "clear") {
      setSelectedCategoryIds([]);
    } else {
      setSelectedCategoryIds((prev) =>
        prev.includes(categoryId)
          ? prev.filter((id) => id !== categoryId)
          : [...prev, categoryId]
      );
    }
  };

  const handlePublicationSelect = (publicationId: number | "clear") => {
    if (publicationId === "clear") {
      setSelectedPublicationIds([]);
    } else {
      setSelectedPublicationIds((prev) =>
        prev.includes(publicationId)
          ? prev.filter((id) => id !== publicationId)
          : [...prev, publicationId]
      );
    }
  };

  const handleLanguageSelect = (language: string | "clear") => {
    if (language === "clear") {
      setSelectedLanguageIds([]);
    } else {
      setSelectedLanguageIds((prev) =>
        prev.includes(language)
          ? prev.filter((l) => l !== language)
          : [...prev, language]
      );
    }
  };

  const clearAllFilters = () => {
    setSelectedCategoryIds([]);
    setSelectedPublicationIds([]);
    setSelectedLanguageIds([]);
    setSortBy("default");
    handleQueryChange("");
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="bg-neutral-50/50 min-h-screen pb-16">
      {/* ================= BREADCRUMBS & HEADER ================= */}
      <div className="bg-white border-b border-neutral-200/80 pt-4 pb-6 mb-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs font-medium text-neutral-500 mb-4">
            <Link href="/" className="hover:text-black transition-colors">
              Home
            </Link>
            <FaChevronRight className="w-2.5 h-2.5 text-neutral-400" />
            <span className="text-neutral-900 font-semibold">Search</span>
            {searchQuery.trim() && (
              <>
                <FaChevronRight className="w-2.5 h-2.5 text-neutral-400" />
                <span className="text-neutral-600 truncate max-w-[200px]">
                  "{searchQuery}"
                </span>
              </>
            )}
          </nav>

          {/* Title and Result Count Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                {searchQuery.trim() ? (
                  <>
                    Search results for{" "}
                    <span className="text-black underline decoration-neutral-300 decoration-2 underline-offset-4">
                      "{searchQuery}"
                    </span>
                  </>
                ) : (
                  "Explore All Books"
                )}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                {isLoading
                  ? "Searching catalog..."
                  : `Showing ${filteredProducts.length} ${
                      filteredProducts.length === 1 ? "book" : "books"
                    } matching your search`}
              </p>
            </div>

            {/* Quick suggested searches */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-neutral-400 font-medium mr-1 hidden md:inline">
                Popular:
              </span>
              {["REET", "UPSC", "Rajasthan GK", "NCERT", "Current Affairs"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleQueryChange(tag)}
                  className="text-[11px] px-2.5 py-1 bg-neutral-100 hover:bg-black hover:text-white rounded-full text-neutral-700 font-medium transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT (SIDEBAR + GRID) ================= */}
      <section className="container mx-auto flex flex-col md:flex-row px-3 sm:px-5 lg:px-8 gap-4 lg:gap-6">
        {/* Left Filter Sidebar */}
        <AllProductSidebar
          onCategorySelect={handleCategorySelect}
          onPublicationSelect={handlePublicationSelect}
          onLanguageSelect={handleLanguageSelect}
          selectedCategoryIds={selectedCategoryIds}
          selectedPublicationIds={selectedPublicationIds}
          selectedLanguages={selectedLanguageIds}
          products={filteredProducts.length > 0 ? filteredProducts : products}
        />

        {/* Right Product Grid Column */}
        <div className="flex-1 w-full min-w-0">
          {/* Top Filter Bar (Search Refiner, Sort, View Mode) */}
          <ProductFilterBar
            searchQuery={searchQuery}
            setSearchQuery={handleQueryChange}
            searchPlaceholder="Refine your search (e.g. REET, UPSC, NCERT)..."
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
            extraActions={
              (selectedCategoryIds.length > 0 ||
                selectedPublicationIds.length > 0 ||
                selectedLanguageIds.length > 0 ||
                searchQuery.trim() !== "") && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-xs font-semibold text-neutral-500 hover:text-red-500 transition-colors whitespace-nowrap"
                >
                  Clear Filters
                </button>
              )
            }
          />

          {/* Skeletons Loading State */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((_i) => (
                <div
                  key={_i}
                  className="animate-pulse bg-white p-4 rounded-2xl border border-gray-200"
                >
                  <div className="w-full h-48 bg-gray-200 rounded-xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-gray-200/80 p-8 sm:p-14 text-center shadow-xs flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-4">
                <IoSearchSharp className="w-8 h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-neutral-900 mb-1">
                No books found matching "{searchQuery}"
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto mb-6">
                We couldn't find any exact or related books. Try searching with fewer keywords, check for spelling errors, or clear active filters.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-black hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold rounded-full transition-all active:scale-95 shadow-sm"
                >
                  View All Books
                </button>
                <Link
                  href="/category/exam"
                  className="px-6 py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs sm:text-sm font-semibold rounded-full transition-all"
                >
                  Browse Exam Categories
                </Link>
              </div>
            </div>
          ) : (
            /* Results Grid / List */
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  : "flex flex-col gap-4"
              }
            >
              {currentItems.map((product: any) => (
                <BookCard
                  key={product.id}
                  img={`${config.apiUrl}storage/app/public/${product.image}`}
                  category={(
                    product?.mrp && product?.price
                      ? ((product?.mrp - product?.price) / product?.mrp) * 100
                      : 0
                  ).toFixed(2)}
                  title={product.name}
                  desc={product.description}
                  price={product.mrp}
                  offPrice={product.price}
                  slug={product.slug}
                  id={product.id}
                  quantity={product.quantity}
                  onItemsCountUpdate={() => {}}
                  viewMode={viewMode}
                />
              ))}
            </div>
          )}

          {/* ================= PAGINATION ================= */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12 mb-12 items-center space-x-6">
              <button
                type="button"
                onClick={() => {
                  setCurrentPage((prev) => Math.max(prev - 1, 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={currentPage === 1}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full border transition-all duration-200 active:scale-95 ${
                  currentPage === 1
                    ? "bg-[#f5f5f5] text-neutral-400 border-transparent cursor-not-allowed opacity-60"
                    : "bg-white text-black border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 hover:shadow-sm"
                }`}
              >
                <MdKeyboardArrowLeft className="w-6 h-6" />
                <span>Previous</span>
              </button>

              <div className="flex items-center bg-[#f4f4f4] px-4 py-2 rounded-full border border-neutral-200">
                <span className="text-sm font-bold text-neutral-800">
                  Page <span className="text-black">{currentPage}</span> of{" "}
                  <span className="text-black">{totalPages}</span>
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={currentPage === totalPages}
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full border transition-all duration-200 active:scale-95 ${
                  currentPage === totalPages
                    ? "bg-[#f5f5f5] text-neutral-400 border-transparent cursor-not-allowed opacity-60"
                    : "bg-white text-black border-neutral-300 hover:bg-neutral-50 hover:border-neutral-400 hover:shadow-sm"
                }`}
              >
                <span>Next</span>
                <MdKeyboardArrowRight className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
