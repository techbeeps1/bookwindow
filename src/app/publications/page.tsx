"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiSearch,
  FiBookOpen,
  FiArrowRight,
  FiLayers,
  FiRefreshCw,
  FiChevronDown,
  FiChevronRight,
  FiCheckCircle,
  FiGrid,
} from "react-icons/fi";
import config from "@/app/config";

interface Publication {
  name: string;
  slug: string;
  description?: string;
  publication_img?: string;
}

function PublisherCard({
  pub,
  index,
  getImageUrl,
}: {
  pub: Publication;
  index: number;
  getImageUrl: (path?: string) => string;
}) {
  const [imgSrc, setImgSrc] = useState(getImageUrl(pub.publication_img));
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min((index % 12) * 0.04, 0.4) }}
      className="group bg-white rounded-2xl border border-gray-200/90 hover:border-black/30 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden relative"
    >
      {/* Publisher Image Banner */}
      <div className="relative h-44 w-full bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-5 overflow-hidden border-b border-gray-100 group-hover:bg-gray-50/80 transition-colors">
        {!imgError && pub.publication_img ? (
          <img
            src={imgSrc}
            alt={pub.name}
            onError={() => setImgError(true)}
            className="max-h-32 max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-400 p-4 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-2 group-hover:bg-black group-hover:text-white transition-colors duration-300">
              <FiBookOpen className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-gray-600 uppercase tracking-wider line-clamp-1 px-2">
              {pub.name}
            </span>
          </div>
        )}

      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-gray-900 text-lg group-hover:text-black transition-colors line-clamp-1 mb-2">
            {pub.name}
          </h3>

          {pub.description ? (
            <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
              {pub.description.replace(/<[^>]*>?/gm, "")}
            </p>
          ) : (
            <p className="text-xs text-gray-400 italic">
              Explore competitive exam guides, academic publications &amp; materials.
            </p>
          )}
        </div>

        {/* Link Button */}
        <Link
          href={`/publication/${pub.slug || pub.name.toLowerCase().replace(/\s+/g, "-")}`}
          className="w-full mt-2 py-2.5 px-4 bg-gray-900 text-white hover:bg-black rounded-xl font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2 group/btn shadow-xs hover:shadow-md"
        >
          <span>View Books</span>
          <FiArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}

export default function Publications() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState<string>("ALL");
  const [visibleCount, setVisibleCount] = useState(12);

  const fetchPublications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${config.apiUrl}api/publications`);
      console.log("Publications API response:", response.data);
      const dataList =
        response.data?.data?.production ||
        response.data?.production ||
        response.data?.data ||
        [];
      setPublications(Array.isArray(dataList) ? dataList : []);
    } catch (err) {
      console.error("Error fetching publications:", err);
      setError("Failed to load publications. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPublications();
  }, []);

  // Reset pagination on filter/search change
  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, selectedLetter]);

  const alphabet = useMemo(() => {
    const letters = new Set<string>();
    publications.forEach((pub) => {
      if (pub.name) {
        const firstChar = pub.name.trim().charAt(0).toUpperCase();
        if (/[A-Z]/.test(firstChar)) {
          letters.add(firstChar);
        } else {
          letters.add("#");
        }
      }
    });
    return ["ALL", ...Array.from(letters).sort()];
  }, [publications]);

  const filteredPublications = useMemo(() => {
    return publications.filter((pub) => {
      const matchesSearch =
        !searchQuery.trim() ||
        pub.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pub.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const firstChar = pub.name?.trim().charAt(0).toUpperCase() || "";
      const matchesLetter =
        selectedLetter === "ALL" ||
        (selectedLetter === "#" ? !/[A-Z]/.test(firstChar) : firstChar === selectedLetter);

      return matchesSearch && matchesLetter;
    });
  }, [publications, searchQuery, selectedLetter]);

  const visiblePublications = useMemo(() => {
    return filteredPublications.slice(0, visibleCount);
  }, [filteredPublications, visibleCount]);

  const getImageUrl = (imgPath?: string) => {
    if (!imgPath) return "";
    if (imgPath.startsWith("http://") || imgPath.startsWith("https://")) return imgPath;
    const cleanPath = imgPath.startsWith("/") ? imgPath.slice(1) : imgPath;
    if (cleanPath.startsWith("storage/")) return `${config.apiUrl}${cleanPath}`;
    return `${config.apiUrl}storage/app/public/${cleanPath}`;
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 12);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Hero Header Section */}
      <section className="bg-white border-b border-gray-200 pt-10 pb-8 px-4 sm:px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-2xl space-y-2.5">
              <nav className="flex items-center text-xs text-gray-500 font-medium space-x-2 mb-2">
                <Link href="/" className="hover:text-black transition-colors">
                  Home
                </Link>
                <FiChevronRight className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-gray-900 font-semibold">Publications</span>
              </nav>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                Explore Publications
              </h1>              
            </div>

            {/* Search Input */}
            <div className="w-full md:w-80 relative">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search publications..."
                className="w-full pl-10 pr-12 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-black font-semibold bg-gray-200/60 px-2 py-0.5 rounded-md transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Alphabet Quick Filter Bar */}
          {!loading && publications.length > 0 && (
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mr-2 flex items-center gap-1">
                <FiGrid className="w-3 h-3 text-gray-400" /> Filter:
              </span>
              {alphabet.map((letter) => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    selectedLetter === letter
                      ? "bg-black text-white shadow-sm scale-105"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="container mx-auto max-w-6xl px-4 sm:px-6 mt-8">
        {/* Count Bar */}
        {!loading && (
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Showing {visiblePublications.length} of {filteredPublications.length} Publications
              {filteredPublications.length !== publications.length && (
                <span className="text-gray-400"> (filtered from {publications.length})</span>
              )}
            </span>
            {(searchQuery || selectedLetter !== "ALL") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedLetter("ALL");
                }}
                className="text-xs font-semibold text-black hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* Loading Skeleton Grid (12 Cards) */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4 animate-pulse shadow-xs"
              >
                <div className="h-40 bg-gray-100 rounded-xl" />
                <div className="h-5 bg-gray-100 rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                </div>
                <div className="h-9 bg-gray-100 rounded-xl w-full" />
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl text-center space-y-4 my-10 max-w-md mx-auto shadow-xs">
            <p className="text-sm font-medium">{error}</p>
            <button
              onClick={fetchPublications}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors inline-flex items-center gap-2"
            >
              <FiRefreshCw className="w-3.5 h-3.5" /> Retry Loading
            </button>
          </div>
        )}

        {/* Publications Grid */}
        {!loading && !error && filteredPublications.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {visiblePublications.map((pub, index) => (
                <PublisherCard
                  key={pub.slug || `${pub.name}-${index}`}
                  pub={pub}
                  index={index}
                  getImageUrl={getImageUrl}
                />
              ))}
            </div>

            {/* Load More Button */}
            {filteredPublications.length > visibleCount && (
              <div className="mt-12 flex flex-col items-center justify-center space-y-3">
                {/* Visual Progress Bar */}
                <div className="w-full max-w-xs bg-gray-200/80 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-black h-1.5 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.min(
                        100,
                        (visibleCount / filteredPublications.length) * 100
                      )}%`,
                    }}
                  />
                </div>

                <p className="text-xs text-gray-500 font-medium">
                  Showing <span className="font-bold text-gray-900">{visibleCount}</span> of{" "}
                  <span className="font-bold text-gray-900">{filteredPublications.length}</span> publications
                </p>

                <button
                  onClick={handleLoadMore}
                  className="px-8 py-3 bg-black hover:bg-gray-800 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg transition-all duration-300 flex items-center gap-2 group cursor-pointer active:scale-95 border border-black"
                >
                  <span>Load More Publications</span>
                  <FiChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                </button>
              </div>
            )}

            {/* All Loaded Indicator */}
            {filteredPublications.length > 12 && visibleCount >= filteredPublications.length && (
              <div className="mt-12 text-center py-6 border-t border-gray-200/60">
                <p className="text-xs text-gray-500 font-medium inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full border border-emerald-200">
                  <FiCheckCircle className="w-4 h-4 text-emerald-600" />
                  You&apos;ve viewed all {filteredPublications.length} publications
                </p>
              </div>
            )}
          </>
        )}

        {/* Empty Search Results */}
        {!loading && !error && filteredPublications.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md mx-auto my-12 space-y-4 shadow-xs">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <FiSearch className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">No Publications Found</h3>
            <p className="text-xs text-gray-500">
              No publication matching &quot;{searchQuery || selectedLetter}&quot; was found.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedLetter("ALL");
              }}
              className="px-4 py-2 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-800 transition-colors"
            >
              Clear Search &amp; Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
