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

  return (
    <div className="w-full md:w-[300px] flex-shrink-0 p-5 flex flex-col gap-6 bg-white border-r border-neutral-200">
      
      {/* ================= Categories Section ================= */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
          <h3 className="text-xs font-bold tracking-wider text-neutral-800 uppercase">
            Categories
          </h3>
          {selectedCategoryIds.length > 0 && (
            <button
              onClick={() => onCategorySelect("clear")}
              className="text-xs text-neutral-500 hover:text-black font-semibold transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <svg
            className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400"
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
            className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-neutral-400 focus:bg-white transition-all text-neutral-800"
          />
        </div>

        {/* List Content */}
        <div className="flex flex-col gap-0.5 max-h-[250px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-350">
          
          {/* Show All Option */}
          <button
            onClick={() => {
              onCategorySelect("clear");
              onPublicationSelect("clear");
            }}
            className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
              selectedCategoryIds.length === 0 && selectedPublicationIds.length === 0
                ? "bg-neutral-100 text-black border-l-2 border-black pl-2"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-black"
            }`}
          >
            Show All
          </button>

          {loading ? (
            <div className="flex flex-col gap-3 p-2">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 animate-pulse">
                  <div className="h-4 w-4 bg-neutral-200 rounded"></div>
                  <div className="h-3 bg-neutral-200 rounded flex-1"></div>
                  <div className="h-4 w-6 bg-neutral-200 rounded-full"></div>
                </div>
              ))}
            </div>
          ) : filteredCategories?.length > 0 ? (
            filteredCategories.map((category: any) => {
              const isChecked = selectedCategoryIds.includes(category.id);

              return (
                <div
                  key={category.id}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                    isChecked
                      ? "bg-neutral-50/70 border-l-2 border-black pl-2 font-medium"
                      : "hover:bg-neutral-50/60"
                  }`}
                  onClick={() => onCategorySelect(category.id)}
                >
                  <div className="flex items-center gap-3">
                    {/* Custom Checkbox */}
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="peer appearance-none w-4 h-4 rounded border border-neutral-400 checked:bg-black checked:border-black focus:outline-none transition-all duration-200 cursor-pointer"
                      />
                      <svg
                        className="absolute w-2.5 h-2.5 text-white pointer-events-none hidden peer-checked:block"
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

                    <span className={`text-xs ${isChecked ? "text-black font-semibold" : "text-neutral-600"}`}>
                      {category.name}
                    </span>
                  </div>

                  {category?.subproducts?.length > 0 && (
                    <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-full border border-neutral-200/30">
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
        </div>
      </div>

      {/* ================= Publications Section ================= */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
          <h3 className="text-xs font-bold tracking-wider text-neutral-850 uppercase">
            Publications
          </h3>
          {selectedPublicationIds.length > 0 && (
            <button
              onClick={() => onPublicationSelect("clear")}
              className="text-xs text-neutral-500 hover:text-black font-semibold transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <svg
            className="absolute left-3 top-2.5 w-3.5 h-3.5 text-neutral-400"
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
            className="w-full text-xs bg-neutral-50 border border-neutral-200 rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-neutral-400 focus:bg-white transition-all text-neutral-800"
          />
        </div>

        {/* List Content */}
        <div className="flex flex-col gap-0.5 max-h-[250px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-200 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-neutral-350">
          
          {/* Show All Option */}
          <button
            onClick={() => {
              onPublicationSelect("clear");
              onCategorySelect("clear");
            }}
            className={`w-full text-left px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
              selectedCategoryIds.length === 0 && selectedPublicationIds.length === 0
                ? "bg-neutral-100 text-black border-l-2 border-black pl-2"
                : "text-neutral-600 hover:bg-neutral-50 hover:text-black"
            }`}
          >
            Show All
          </button>

          {loading ? (
            <div className="flex flex-col gap-3 p-2">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 animate-pulse">
                  <div className="h-4 w-4 bg-neutral-200 rounded"></div>
                  <div className="h-3 bg-neutral-200 rounded flex-1"></div>
                  <div className="h-4 w-6 bg-neutral-200 rounded-full"></div>
                </div>
              ))}
            </div>
          ) : filteredPubs?.length > 0 ? (
            filteredPubs.map((publication: any) => {
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
                  className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all ${
                    isChecked
                      ? "bg-neutral-50/70 border-l-2 border-black pl-2 font-medium"
                      : "hover:bg-neutral-50/60"
                  }`}
                  onClick={() => onPublicationSelect(publication.id)}
                >
                  <div className="flex items-center gap-3">
                    {/* Custom Checkbox */}
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="peer appearance-none w-4 h-4 rounded border border-neutral-400 checked:bg-black checked:border-black focus:outline-none transition-all duration-200 cursor-pointer"
                      />
                      <svg
                        className="absolute w-2.5 h-2.5 text-white pointer-events-none hidden peer-checked:block"
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

                    <span className={`text-xs ${isChecked ? "text-black font-semibold" : "text-neutral-600"}`}>
                      {publication.name}
                    </span>
                  </div>

                  {filteredCount > 0 && (
                    <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded-full border border-neutral-200/30">
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
        </div>
      </div>

    </div>
  );
}
