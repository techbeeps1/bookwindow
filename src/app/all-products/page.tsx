"use client";


import BookCard from "@/components/book-card";
import { useEffect, useState } from "react";
import axios from "axios";
import config from "../config";

import AllProductSidebar from "@/components/all-products-sidebar";
import { useViewProductsQuery } from "@/lib/api/productsApi";

export default function Category() {

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;



  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [selectedPublicationIds, setSelectedPublicationIds] = useState<
    number[]
  >([]);

    const {data:productdatas} = useViewProductsQuery();

      const [products, setProducts] = useState(() => {
    if (productdatas) {
      return productdatas;
    }
    return [];
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (productdatas) {
      setProducts(productdatas);
      setLoading(false);
    }
  }, [productdatas]);

  useEffect(() => {}, [products]);

  useEffect(() => {
    const filtered = products.filter((product: any) => {
      const categoryMatch =
        selectedCategoryIds.length === 0 ||
        selectedCategoryIds.includes(product.sub_category_id);

      const publicationMatch =
        selectedPublicationIds.length === 0 ||
        selectedPublicationIds.includes(product.production_id);

      return categoryMatch && publicationMatch;
    });

    setFilteredProducts(filtered);
  }, [products, selectedCategoryIds, selectedPublicationIds]);

  const handleCategorySelect = (categoryId: number | "clear") => {
    if (categoryId === "clear") {
      setSelectedCategoryIds([]); // Clear all filters
    } else {
      setSelectedCategoryIds(
        (prev) =>
          prev.includes(categoryId)
            ? prev.filter((id) => id !== categoryId) // uncheck
            : [...prev, categoryId] // check
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
  // filteredProducts.length > 0 ? filteredProducts : products;
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

            <section className="container mx-auto mb-10 mt-10 md:flex gap-[20px] px-[20px] border border-1">
        <AllProductSidebar
          onCategorySelect={handleCategorySelect}
          onPublicationSelect={handlePublicationSelect}
          selectedCategoryIds={selectedCategoryIds}
          selectedPublicationIds={selectedPublicationIds}
          products={products}
        />
        {loading ? (
          [1, 2].map((_i) => (
            <div
              key={_i}
              className="grid grid-cols-1 w-full p-4 text-center text-6xl font-extrabold"
            >
              <div
                role="status"
                className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 rtl:space-x-reverse md:flex flex-col md:items-center p-4"
              >
                <div className="flex items-center justify-center w-full h-48 bg-gray-300 rounded-sm sm:w-96 dark:bg-gray-700">
                  <svg
                    className="w-10 h-20 text-gray-200 dark:text-gray-600"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 20 18"
                  >
                    <path d="M18 0H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm-5.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Zm4.376 10.481A1 1 0 0 1 16 15H4a1 1 0 0 1-.895-1.447l3.5-7A1 1 0 0 1 7.468 6a.965.965 0 0 1 .9.5l2.775 4.757 1.546-1.887a1 1 0 0 1 1.618.1l2.541 4a1 1 0 0 1 .028 1.011Z" />
                  </svg>
                </div>
                <div className="w-full">
                  <div className="h-2.5 bg-gray-200 rounded-full dark:bg-gray-700 w-48 mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[480px] mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[440px] mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[460px] mb-2.5"></div>
                  <div className="h-2 bg-gray-200 rounded-full dark:bg-gray-700 max-w-[360px]"></div>
                </div>
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ))
        ) : !loading && displayedProducts?.length === 0 ? (
          <div className="grid grid-cols-1 shadow-lg w-full p-4 text-center text-6xl font-extrabold">
            No record Found 😔 !
          </div>
        ) : (
          <div className="col-8">
            <div className="grid grid-cols-1 gap-[15px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {currentItems.map((product: any) => (
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
                />
              ))}
            </div>
          </div>
        )}
      </section>
      {totalPages > 1 && (
        <div className="flex justify-center mt-12 mb-12 items-center space-x-6">
          {/* Previous Button */}
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

    </>
  );
}
