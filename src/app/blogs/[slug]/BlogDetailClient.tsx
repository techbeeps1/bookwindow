"use client";

import { Typography } from "@material-tailwind/react";
import React from "react";
import config from "@/app/config";
import Link from "next/link";
import Image from "next/image";

export default function BlogDetailClient({ blogData }: { blogData: any }) {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen lg:mt-0 mt-[100px] bg-slate-50/50 pb-16">
      {/* Breadcrumb section */}
      <div className="container mx-auto px-4 pt-8 max-w-4xl">
        <Link
          href="/blogs"
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-black transition-colors mb-6 group"
        >
          <span className="mr-2 transform transition-transform group-hover:-translate-x-1 duration-200">
            &larr;
          </span>
          Back to Blogs
        </Link>
      </div>

      <article className="container mx-auto px-4 max-w-4xl bg-white rounded-3xl border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] p-6 md:p-12 mb-16">
        <div className="flex items-center gap-2 mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span>Article</span>
          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
          <span>Published Post</span>
        </div>

        <Typography
          as="h1"
          className="mb-6 text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight"
          {...({} as React.ComponentProps<typeof Typography>)}
        >
          {blogData?.title}
        </Typography>

        <div className="w-20 h-1 bg-black rounded mb-8" />

        {blogData?.image && (
          <div className="relative w-full overflow-hidden rounded-2xl mb-8 bg-slate-100 ">
            <Image
              width={738}
              height={530}
              src={`${config.apiUrl}storage/app/public/${blogData?.image}`}
              alt={blogData?.title || "Blog cover image"}
              className="w-full h-full rounded-2xl object-cover"
            />
          </div>
        )}

        <div
          className="w-full text-slate-700 text-base md:text-lg leading-relaxed space-y-6 
            [&_p]:mb-4 [&_p]:leading-relaxed
            [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-4
            [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-6 [&_h3]:mb-3
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
            [&_li]:mb-2
            [&_strong]:font-semibold [&_strong]:text-slate-900
            [&_a]:text-black [&_a]:underline hover:[&_a]:text-slate-700"
          dangerouslySetInnerHTML={{ __html: blogData?.content }}
        />
      </article>
    </div>
  );
}
