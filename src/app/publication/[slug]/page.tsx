"use client";

import BookCard from "@/components/book-card";
import { useEffect, useState, useMemo } from "react";
import { use } from "react";

import config from "../../config";
import CategoryPublicationSidebar from "@/components/category-publication-sidebar";
import { FiSearch, FiFilter, FiGrid, FiList } from "react-icons/fi";
import { useViewPublicationQuery } from "@/lib/api/publicationApi";

export default function Category({ params }: {
  params: Promise<{ slug: string }>;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const { slug } = use(params);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedPublicationIds, setSelectedPublicationIds] = useState<number[]>([]);

  // Toolbar States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: categoryData, isLoading: isProductFetched , isFetching } = useViewPublicationQuery(slug);
  const isDataLoading = isProductFetched || isFetching;
const products = useMemo(
  () => categoryData?.products ?? [],
  [categoryData]
);

const childCategory = useMemo(
  () => categoryData?.category ?? [],
  [categoryData]
);

const publicationData = useMemo(
  () => categoryData?.production ?? [],
  [categoryData]
);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  const filteredProducts = useMemo(() => {
    let filtered = products.filter((product: any) => {
      const categoryMatch =
        selectedCategoryIds.length === 0 ||
        product.category_id.some((id:any) => selectedCategoryIds.includes(Number(id)) );
     
      const publicationMatch =
        selectedPublicationIds.length === 0 ||
        selectedPublicationIds.includes(product.production_id);
      const searchMatch =
        !searchQuery.trim() ||
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return categoryMatch && publicationMatch && searchMatch;
    });

    // Apply sorting
    if (sortBy === "price-low") {
      filtered.sort((a: any, b: any) => Number(a.price || a.mrp) - Number(b.price || b.mrp));
    } else if (sortBy === "price-high") {
      filtered.sort((a: any, b: any) => Number(b.price || b.mrp) - Number(a.price || a.mrp));
    } else if (sortBy === "name") {
      filtered.sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
    }

    
    return filtered;
  }, [products, selectedCategoryIds, selectedPublicationIds, searchQuery, sortBy]);

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

  const displayedProducts = filteredProducts;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = displayedProducts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(displayedProducts.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProducts, products]);

  return (
    <>
      <section className="container mx-auto mb-10 mt-10 md:flex px-[20px] gap-[20px]">
        <CategoryPublicationSidebar
          onCategorySelect={handleCategorySelect}
          onPublicationSelect={handlePublicationSelect}
          selectedCategoryIds={selectedCategoryIds}
          selectedPublicationIds={selectedPublicationIds}
          childCategory={childCategory}
          products={products}
          publications={publicationData}
          category_id={childCategory[0]?.parent_id}
          isFetched={isProductFetched}
          publicationVisible={false}
        />

        <div className="flex-1 w-full">
          {/* Top Filter & Toolbar matching Wishlist header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            
            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search in category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort Dropdown & View Mode Switches */}
            <div className="flex flex-wrap items-center justify-between w-full md:w-auto gap-3">
              {/* Sort Selection */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                  <FiFilter className="w-3.5 h-3.5" /> Sort:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 font-medium focus:outline-none focus:ring-2 focus:ring-black"
                >
                  <option value="default">Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Book Title (A-Z)</option>
                </select>
              </div>

              {/* View Mode Switchers */}
              <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "grid"
                      ? "bg-white text-black shadow-sm font-semibold"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                  title="Grid View"
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "list"
                      ? "bg-white text-black shadow-sm font-semibold"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                  title="List View"
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {isDataLoading  ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((_i) => (
                <div key={_i} className="animate-pulse bg-white p-4 rounded-2xl border border-gray-200">
                  <div className="w-full h-48 bg-gray-200 rounded-xl mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : displayedProducts?.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-xl font-bold text-gray-600">
             <div className="text-4xl mb-4">
              Products not found
             </div>
            </div>
          ) : (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" 
              : "flex flex-col gap-4"
            }>
              {currentItems.map((product: any) => {
                const subcategory = childCategory?.find(
                  (sub: any) => sub.id == product.category_id[0]
                );

   
             
                return (
                  <BookCard
                    key={product.id}
                    img={`${config.apiUrl}storage/app/public/${product.image}`}
                    category={(product?.mrp && product?.price
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
                    onItemsCountUpdate={()=>{}}
                    subcategoryName={subcategory?.name}
                    mainCategoryName={"slug"}
                    viewMode={viewMode}
                  />
                );
              })}
            </div>
          )}

          {/* Pagination */}
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-4 h-4 pointer-events-none"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-4 h-4 pointer-events-none"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

