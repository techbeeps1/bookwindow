"use client";

import config from "@/app/config";
import axios from "axios";
import React, { useEffect, useState } from "react";

export default function CategoryPublicationSidebar({
  category_id,
  childCategory,
  products,
  onCategorySelect,
  selectedCategoryIds,
  selectedPublicationIds,
  onPublicationSelect,
}: any) {
  const [publications, setPublications] = useState([] as any);
  const [filteredPublicationData, setFilteredPublications] = useState([] as any);
  const [loading, setLoading] = useState(true);
  const [catSearch, setCatSearch] = useState("");
  const [pubSearch, setPubSearch] = useState("");

  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isPublicationsOpen, setIsPublicationsOpen] = useState(true);
  const [categoryLimit, setCategoryLimit] = useState(8);
  const [publicationLimit, setPublicationLimit] = useState(8);

  useEffect(() => {
    const fetchProductsByCategoryAndPublication = async () => {
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/publications`,
          responseType: "json",
        });
        setLoading(false);
        setPublications(response.data?.data?.production || []);
      } catch (error) {
        console.log("error", error);
        setLoading(false);
      }
    };

    fetchProductsByCategoryAndPublication();
  }, []);

  useEffect(() => {
    const publicationIds = products?.map((p: any) => p.production_id);
    const filteredPublications = publications.filter((pub: any) =>
      publicationIds?.includes(pub.id)
    );
    setFilteredPublications(filteredPublications);
  }, [publications, products]);

  const displayedCategories = childCategory || [];
  const displayedPublications =
    filteredPublicationData?.length > 0
      ? filteredPublicationData
      : publications;

  const filteredCategories = displayedCategories.filter((cat: any) =>
    cat.name?.toLowerCase().includes(catSearch.toLowerCase())
  );

  const filteredPubs = displayedPublications.filter((pub: any) =>
    pub.name?.toLowerCase().includes(pubSearch.toLowerCase())
  );

  const visibleCategories = filteredCategories.slice(0, categoryLimit);
  const visiblePubs = filteredPubs.slice(0, publicationLimit);

  const CheckedIcon = () => (
    <div className="w-[18px] h-[18px] border border-black flex items-center justify-center bg-white flex-shrink-0 transition-all duration-200">
      <svg
        className="w-2.5 h-2.5 text-black"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  );

  const UncheckedIcon = () => (
    <div className="w-[18px] h-[18px] border border-neutral-300 bg-white flex-shrink-0 hover:border-purple-350 transition-all duration-200" />
  );

  return (
    <div className="w-full md:w-[300px] flex-shrink-0 md:p-6 p-0 py-6 flex flex-col gap-8 bg-white md:border-r md:border-neutral-100 border-0">
      
      {/* ================= Categories Section ================= */}
      <div className="flex flex-col gap-3">
        {/* Accordion Header */}
        <div 
          onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
          className="flex items-center justify-between cursor-pointer pb-2 border-b border-neutral-100 hover:border-neutral-200 transition-colors"
        >
          <h3 className="text-sm font-bold text-neutral-900 tracking-wide select-none">
            Categories
          </h3>
          <div className="flex items-center gap-2">
            {selectedCategoryIds.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCategorySelect("clear");
                }}
                className="text-xs text-neutral-500 font-semibold transition-colors"
              >
                Clear
              </button>
            )}
            <svg
              className={`w-4 h-4 text-black transition-transform duration-200 ${
                isCategoriesOpen ? "rotate-0" : "-rotate-90"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {isCategoriesOpen && (
          <div className="flex flex-col gap-3 mt-1">
            {/* Search Input */}
            <div className="relative">
              <svg
                className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-450"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search categories..."
                value={catSearch}
                onChange={(e) => setCatSearch(e.target.value)}
                className="w-full text-xs bg-neutral-50/70 border border-neutral-200/60 rounded-xl py-2 pl-9 pr-3 outline-none  transition-all text-neutral-850"
              />
            </div>

            {/* List Content */}
            <div className="flex flex-col gap-1 max-h-[350px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-350">
              
              {/* Show All / All Categories Option */}
              <div
                onClick={() => onCategorySelect("clear")}
                className={`flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedCategoryIds.length === 0
                    ? " font-semibold"
                    : "text-neutral-600 hover:bg-neutral-50/60"
                }`}
              >
                {selectedCategoryIds.length === 0 ? <CheckedIcon /> : <UncheckedIcon />}
                <span className="text-xs select-none">All Categories</span>
              </div>

              {loading ? (
                <div className="flex flex-col gap-3 p-2">
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 animate-pulse">
                      <div className="h-4 w-4 bg-neutral-200 rounded-full"></div>
                      <div className="h-3 bg-neutral-200 rounded flex-1"></div>
                      <div className="h-4 w-6 bg-neutral-200 rounded-full"></div>
                    </div>
                  ))}
                </div>
              ) : visibleCategories?.length > 0 ? (
                visibleCategories.map((category: any) => {
                  const isChecked = selectedCategoryIds.includes(category.id);

                  return (
                    <div
                      key={category.id}
                      className={`flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        isChecked
                          ? "text-purple-655 font-semibold"
                          : "text-neutral-600  hover:bg-neutral-50/60"
                      }`}
                      onClick={() => onCategorySelect(category.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {isChecked ? <CheckedIcon /> : <UncheckedIcon />}
                        <span className="text-xs truncate select-none">{category.name}</span>
                      </div>

                      {category?.subproducts?.length > 0 && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border scale-90 ${
                          isChecked 
                            ? "text-purple-655 bg-purple-50/50 border-purple-100" 
                            : "text-neutral-450 bg-neutral-50 border-neutral-150"
                        }`}>
                          {category.subproducts.length}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-neutral-400">
                  No categories found
                </div>
              )}

              {/* Load More Button */}
              {filteredCategories.length > 8 && (
                <button
                  onClick={() => setCategoryLimit(categoryLimit === 8 ? filteredCategories.length : 8)}
                  className="text-xs text-purple-600 font-bold hover:text-purple-800 transition-colors mt-2 px-2 py-1 flex items-center gap-1 self-start select-none"
                >
                  {categoryLimit === 8 ? "+ Load More" : "- Show Less"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= Publications Section ================= */}
      <div className="flex flex-col gap-3">
        {/* Accordion Header */}
        <div 
          onClick={() => setIsPublicationsOpen(!isPublicationsOpen)}
          className="flex items-center justify-between cursor-pointer pb-2 border-b border-neutral-100 hover:border-neutral-200 transition-colors"
        >
          <h3 className="text-sm font-bold text-neutral-900 tracking-wide select-none">
            Publications
          </h3>
          <div className="flex items-center gap-2">
            {selectedPublicationIds.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPublicationSelect("clear");
                }}
                className="text-xs text-neutral-500  font-semibold transition-colors"
              >
                Clear
              </button>
            )}
            <svg
              className={`w-4 h-4 text-black transition-transform duration-200 ${
                isPublicationsOpen ? "rotate-0" : "-rotate-90"
              }`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {isPublicationsOpen && (
          <div className="flex flex-col gap-3 mt-1">
            {/* Search Input */}
            <div className="relative">
              <svg
                className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-450"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search publications..."
                value={pubSearch}
                onChange={(e) => setPubSearch(e.target.value)}
                className="w-full text-xs bg-neutral-50/70 border border-neutral-200/60 rounded-xl py-2 pl-9 pr-3 outline-none   transition-all text-neutral-850"
              />
            </div>

            {/* List Content */}
            <div className="flex flex-col gap-1 max-h-[350px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-350">
              
              {/* Show All / All Publications Option */}
              <div
                onClick={() => onPublicationSelect("clear")}
                className={`flex items-center gap-3 px-2 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedPublicationIds.length === 0
                    ? "text-purple-655 font-semibold"
                    : "text-neutral-600  hover:bg-neutral-50/60"
                }`}
              >
                {selectedPublicationIds.length === 0 ? <CheckedIcon /> : <UncheckedIcon />}
                <span className="text-xs select-none">All Publications</span>
              </div>

              {loading ? (
                <div className="flex flex-col gap-3 p-2">
                  {[...Array(4)].map((_, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 animate-pulse">
                      <div className="h-4 w-4 bg-neutral-200 rounded-full"></div>
                      <div className="h-3 bg-neutral-200 rounded flex-1"></div>
                      <div className="h-4 w-6 bg-neutral-200 rounded-full"></div>
                    </div>
                  ))}
                </div>
              ) : visiblePubs?.length > 0 ? (
                visiblePubs.map((publication: any) => {
                  const filteredCount = category_id
                    ? (publication?.products || []).filter(
                        (product: any) =>
                          String(product?.category_id) === String(category_id)
                      ).length
                    : 0;

                  const isChecked = selectedPublicationIds.includes(publication.id);

                  return (
                    <div
                      key={publication.id}
                      className={`flex items-center justify-between px-2 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        isChecked
                          ? "text-purple-655 font-semibold"
                          : "text-neutral-600  hover:bg-neutral-50/60"
                      }`}
                      onClick={() => onPublicationSelect(publication.id)}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {isChecked ? <CheckedIcon /> : <UncheckedIcon />}
                        <span className="text-xs truncate select-none">{publication.name}</span>
                      </div>

                      {filteredCount > 0 && (
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border scale-90 ${
                          isChecked 
                            ? "text-purple-655 bg-purple-50/50 border-purple-100" 
                            : "text-neutral-455 bg-neutral-50 border-neutral-150"
                        }`}>
                          {filteredCount}
                        </span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-neutral-400">
                  No publications found
                </div>
              )}

              {/* Load More Button */}
              {filteredPubs.length > 8 && (
                <button
                  onClick={() => setPublicationLimit(publicationLimit === 8 ? filteredPubs.length : 8)}
                  className="text-xs text-purple-600 font-bold hover:text-purple-800 transition-colors mt-2 px-2 py-1 flex items-center gap-1 self-start select-none"
                >
                  {publicationLimit === 8 ? "+ Load More" : "- Show Less"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
