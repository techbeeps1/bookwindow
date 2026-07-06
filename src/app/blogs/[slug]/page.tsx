"use client";
import { Typography } from "@material-tailwind/react";
import { Navbar, Footer } from "@/components";
import React from "react";
import config from "@/app/config";
import axios from "axios";
import { use } from "react";
import Link from "next/link";

export default function BlogDetail({ params }:  {
  params: Promise<{ slug: string }>;
}) {
   const { slug } = use(params);
  const [blogData, setBlogData] = React.useState([] as any);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  React.useEffect(() => {
    const fetchBlogDetail = async () => {
      setLoading(true);
      try {
        const response = await axios({
          method: "get",
          url: `${config.apiUrl}api/blog/${slug}`,
          responseType: "json",
        });
        setBlogData(response.data);
      } catch (error) {
        console.log("error", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetail();
  }, [slug]);

  React.useEffect(() => {
    // console.log("blogData", blogData);
  }, [blogData]);

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-slate-50/50 pb-16">
        {/* Breadcrumb section */}
        <div className="container mx-auto px-4 pt-8 max-w-4xl">
          <Link
            href="/blogs"
            className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-black transition-colors mb-6 group"
          >
            <span className="mr-2 transform transition-transform group-hover:-translate-x-1 duration-200">&larr;</span>
            Back to Blogs
          </Link>
        </div>

        {loading ? (
          <div className="container mx-auto px-4 max-w-4xl bg-white rounded-3xl border border-gray-100 p-6 md:p-12 shadow-[0_4px_30px_rgba(0,0,0,0.02)] animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-24 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-5/6 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="w-full h-[250px] md:h-[450px] bg-gray-200 rounded-2xl mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-[95%]"></div>
              <div className="h-4 bg-gray-200 rounded w-[98%]"></div>
              <div className="h-4 bg-gray-200 rounded w-[90%]"></div>
              <div className="h-4 bg-gray-200 rounded w-[93%]"></div>
            </div>
            <span className="sr-only">Loading...</span>
          </div>
        ) : (
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
              <div className="relative w-full h-[250px] md:h-[450px] overflow-hidden rounded-2xl mb-8 bg-slate-100 shadow-sm">
                <img
                  src={`${config.apiUrl}storage/app/public/${blogData?.image}`}
                  alt={blogData?.title}
                  className="w-full h-full object-cover"
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
        )}
      </div>

      <Footer />
    </>
  );
}
