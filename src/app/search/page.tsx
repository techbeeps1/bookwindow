import { Suspense } from "react";
import { Metadata } from "next";
import SearchResultsClient from "./SearchResultsClient";

export const metadata: Metadata = {
  title: "Search Books | Bookwindow",
  description:
    "Search and buy competitive exam and academic books online at Bookwindow. Fast shipping across India.",
  robots: {
    index: false,
    follow: true,
  },
};

function SearchLoadingSkeleton() {
  return (
    <div className="bg-neutral-50/50 min-h-screen pb-16">
      <div className="bg-white border-b border-neutral-200/80 pt-6 pb-6 mb-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-4 bg-neutral-200 rounded w-32 mb-4 animate-pulse" />
          <div className="h-8 bg-neutral-200 rounded w-64 mb-2 animate-pulse" />
          <div className="h-4 bg-neutral-100 rounded w-48 animate-pulse" />
        </div>
      </div>

      <div className="container mx-auto flex flex-col md:flex-row px-3 sm:px-5 lg:px-8 gap-6">
        <div className="w-full md:w-64 h-96 bg-white rounded-2xl border border-neutral-200 animate-pulse hidden md:block" />
        <div className="flex-1">
          <div className="h-14 bg-white rounded-2xl border border-neutral-200 animate-pulse mb-6" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-neutral-200 p-4 animate-pulse h-80"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoadingSkeleton />}>
      <SearchResultsClient />
    </Suspense>
  );
}
