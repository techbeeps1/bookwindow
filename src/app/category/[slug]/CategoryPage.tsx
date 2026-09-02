"use client";
import BookCard from "@/components/book-card";
import { useEffect, useState, useMemo } from "react";
import config from "../../config";
import CategoryPublicationSidebar from "@/components/category-publication-sidebar";
import ProductFilterBar from "@/components/ProductFilterBar";
import { FiSearch, FiFilter, FiGrid, FiList } from "react-icons/fi";
import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import { FaChevronRight } from "react-icons/fa";
import Link from "next/link";

import { extractCategoryTitle } from "@/helper/helperfun";

export default function CategoryPage({
  categoryData,
  slug,
}: {
  categoryData: any;
  slug?: string;
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedPublicationIds, setSelectedPublicationIds] = useState<number[]>([]);
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<string[]>([]);

  // Toolbar States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categoryTitle = useMemo(() => {
    return categoryData?.["parent-cateogry"]?.name || extractCategoryTitle(categoryData, slug);
  }, [categoryData, slug]);


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
        product.category_id.some((id: any) => selectedCategoryIds.includes(Number(id)));

      const publicationMatch =
        selectedPublicationIds.length === 0 ||
        selectedPublicationIds.includes(product.production_id);
        
      const languageMatch =
        selectedLanguageIds.length === 0 ||
        selectedLanguageIds.some(
          (lang) => 
            product.book_language?.toLowerCase() === lang.toLowerCase()
        );
        
      const searchMatch =
        !searchQuery.trim() ||
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase());

      return categoryMatch && publicationMatch && languageMatch && searchMatch;
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
  }, [products, selectedCategoryIds, selectedPublicationIds, selectedLanguageIds, searchQuery, sortBy]);

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
      {/* Category Header & Breadcrumb */}
      <div className="container mx-auto px-3 sm:px-5 lg:px-8 pt-6 lg:pt-8 lg:mt-0 mt-[90px]">

        {/* Category Title & Count */}
        <div className="pb-4 mb-6 border-b border-neutral-200/80 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-neutral-900 tracking-tight">
              {categoryTitle}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-medium mt-1">
              Showing {filteredProducts.length} {filteredProducts.length === 1 ? "book" : "books"} available
            </p>
          </div>
        </div>
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-neutral-500 mb-3">
          <Link href="/" className="hover:text-black transition-colors font-medium">
            Home
          </Link>
          <FaChevronRight className="w-2.5 h-2.5 text-neutral-400" />
          <Link href="/all-products" className="hover:text-black transition-colors font-medium">
            Categories
          </Link>
          <FaChevronRight className="w-2.5 h-2.5 text-neutral-400" />
          <span className="text-neutral-900 font-semibold truncate max-w-[200px] sm:max-w-none">
            {categoryTitle}
          </span>
        </nav>

      </div>

      <section className="container mx-auto mb-12 flex flex-col md:flex-row px-3 sm:px-5 lg:px-8 gap-4 lg:gap-6">
        <CategoryPublicationSidebar
          onCategorySelect={handleCategorySelect}
          onPublicationSelect={handlePublicationSelect}
          onLanguageSelect={handleLanguageSelect}
          selectedCategoryIds={selectedCategoryIds}
          selectedPublicationIds={selectedPublicationIds}
          selectedLanguages={selectedLanguageIds}
          childCategory={childCategory}
          products={products}
          publications={publicationData}
          category_id={childCategory[0]?.parent_id}
          isFetched={false}
        />

        <div className="flex-1 w-full min-w-0">
          {/* Top Filter & Toolbar matching Wishlist header */}
          <ProductFilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchPlaceholder="Search products..."
            sortBy={sortBy}
            setSortBy={setSortBy}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {displayedProducts?.length === 0 ? (
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
                    onItemsCountUpdate={() => { }}
                    subcategoryName={subcategory?.name}
                    mainCategoryName={categoryTitle}
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
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full border transition-all duration-200 active:scale-95 ${currentPage === 1
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
                className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full border transition-all duration-200 active:scale-95 ${currentPage === totalPages
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
    </>
  );
}

