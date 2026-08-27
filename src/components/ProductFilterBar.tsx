"use client";

import React from "react";
import { FiSearch, FiFilter, FiGrid, FiList, FiX } from "react-icons/fi";

export interface SortOption {
  label: string;
  value: string;
}

interface ProductFilterBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchPlaceholder?: string;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOptions?: SortOption[];
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  extraActions?: React.ReactNode;
}

const defaultSortOptions: SortOption[] = [
  { label: "Default", value: "default" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
  { label: "Book Title (A-Z)", value: "name" },
];

export default function ProductFilterBar({
  searchQuery,
  setSearchQuery,
  searchPlaceholder = "Search products...",
  sortBy,
  setSortBy,
  sortOptions = defaultSortOptions,
  viewMode,
  setViewMode,
  extraActions,
}: ProductFilterBarProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-3 sm:p-4 mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 w-full transition-all">
      {/* Search Input Bar */}
      <div className="relative w-full md:w-72 lg:w-80">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-gray-50/80 border border-gray-200/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white focus:border-transparent transition-all placeholder:text-gray-400 font-medium"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-200/60 transition-colors"
            title="Clear search"
          >
            <FiX className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Sort, View Mode & Extra Actions Group */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between md:justify-end gap-2.5 sm:gap-3 w-full md:w-auto">
        {/* Controls Row (Sort + Grid/List Toggle) */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Sort Dropdown */}
          <div className="flex-1 sm:flex-initial flex items-center gap-2 bg-gray-50/80 border border-gray-200/80 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100/80 transition-all focus-within:ring-2 focus-within:ring-black focus-within:bg-white">
            <FiFilter className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
            <span className="text-gray-400 font-normal hidden xs:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-semibold text-gray-900 focus:outline-none cursor-pointer w-full sm:w-auto py-0.5"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100/90 p-1 rounded-xl border border-gray-200/70 flex-shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                viewMode === "grid"
                  ? "bg-white text-black shadow-sm font-bold scale-[1.02]"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              title="Grid View"
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                viewMode === "list"
                  ? "bg-white text-black shadow-sm font-bold scale-[1.02]"
                  : "text-gray-500 hover:text-gray-800"
              }`}
              title="List View"
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Extra Actions (e.g. Wishlist Add All to Cart + Clear Wishlist) */}
        {extraActions && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 sm:border-t-0 sm:pt-0 sm:border-l sm:border-gray-200/80 sm:pl-3 w-full sm:w-auto">
            {extraActions}
          </div>
        )}
      </div>
    </div>
  );
}
