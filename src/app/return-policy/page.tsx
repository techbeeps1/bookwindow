import Image from "next/image";
import config from "../config";
import { Metadata } from "next";
import { truncateDescription } from "@/helper/helperfun";
import Link from "next/link";

async function getReturnPolicyData() {
  try {
    const res = await fetch(`${config.apiUrl}api/cms-pages/return-policy`, {
      next: {
        revalidate: 600,
      },
    });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getReturnPolicyData();

  if (!data) {
    return {
      title: "Return & Refund Policy | Bookwindow",
      description: "Read about Bookwindow's return, replacement, and cancellation policy.",
    };
  }

  const title =
    data.meta_title?.trim() ||
    `${data.title || "Return & Refund Policy"} | Bookwindow`;

  const description =
    data.meta_description?.trim() ||
    truncateDescription(data.short_description || data.content?.replace(/<[^>]*>?/gm, "")) ||
    "Understand our guidelines for book returns, refunds, and replacements so you can shop with complete peace of mind.";

  const keywords = data.meta_keywords
    ? data.meta_keywords.split(",").map((item: string) => item.trim())
    : undefined;

  const imageUrl = data.banner_images
    ? `${config.apiUrl}storage/app/public/${data.banner_images}`
    : "/image/privacy.jpg";

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: "/return-policy",
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: "https://bookwindow.in/return-policy",
      images: [imageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

import JsonLd from "@/components/seo/JsonLd";
import { generateBreadcrumbSchema, generateWebPageSchema } from "@/helper/schemaHelper";

export default async function ReturnPolicy() {
  const returnPolicyData = await getReturnPolicyData();

  const title = returnPolicyData?.title || "Return & Refund Policy";
  const desc = returnPolicyData?.short_description || "Return, exchange, and refund policies for Bookwindow orders.";
  const webPageSchema = generateWebPageSchema(title, desc, "/return-policy");
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: title, url: "/return-policy" },
  ]);

  return (
    <>
      <JsonLd schema={[webPageSchema, breadcrumbSchema]} />
      {/* Banner Section */}
      <section className="relative w-full h-[50vh] lg:mt-0 mt-[75px] flex items-center justify-center bg-gray-900 overflow-hidden">

        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/image/privacy.jpg"
            alt="Return Policy Background"
            fill
            priority
            className="object-cover w-full h-full opacity-35 select-none pointer-events-none"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Banner Content */}
        <div className="relative z-10 text-center max-w-4xl px-6 flex flex-col items-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 uppercase">
            {returnPolicyData?.title || "Return & Refund Policy"}
          </h1>
          <p className="text-gray-300 text-sm md:text-base lg:text-lg max-w-3xl leading-relaxed mb-8 font-light">
            {returnPolicyData?.short_description ||
              "Understand our guidelines for book returns, refunds, and replacements so you can shop with complete peace of mind."}
          </p>
          <Link
            href="/contact-us"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-semibold rounded-md transition-all duration-300 hover:shadow-lg focus:outline-none uppercase tracking-wider"
          >
            Contact Us
          </Link>
        </div>
      </section>

      {/* CMS Content Section */}
      <section className="container mx-auto px-4 max-w-5xl my-16 md:my-24">
        <div className="bg-white p-6 md:p-10 rounded-2xl border border-gray-100 shadow-sm">
          <div
            className="text-base text-gray-600 space-y-4 leading-relaxed dynamic-content"
            dangerouslySetInnerHTML={{
              __html: returnPolicyData?.content || "<p>Return Policy content.</p>",
            }}
          />
        </div>
      </section>
    </>
  );
}
