import Image from "next/image";
import config from "../config";
import { Metadata } from "next";
import { truncateDescription } from "@/helper/helperfun";
import Link from "next/link";

async function getTermsData() {
  try {
    const res = await fetch(`${config.apiUrl}api/cms-pages/terms-and-conditions`, {
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
  const data = await getTermsData();

  if (!data) {
    return {
      title: "Terms and Conditions | Bookwindow",
      description: "Terms and conditions for using Bookwindow website and services.",
    };
  }

  const title =
    data.meta_title?.trim() ||
    `${data.title || "Terms and Conditions"} | Bookwindow`;

  const description =
    data.meta_description?.trim() ||
    truncateDescription(data.short_description || data.content?.replace(/<[^>]*>?/gm, "")) ||
    "Please read our terms and conditions carefully before using our platform or services. By accessing Bookwindow, you agree to comply with these terms.";

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
      canonical: "/terms",
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: "https://bookwindow.in/terms",
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

export default async function Terms() {
  const termsData = await getTermsData();

  const title = termsData?.title || "Terms and Conditions";
  const desc = termsData?.short_description || "Terms and conditions for using Bookwindow website and services.";
  const webPageSchema = generateWebPageSchema(title, desc, "/terms");
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: title, url: "/terms" },
  ]);

  let formattedContent = termsData?.content || "<p>Terms and conditions content.</p>";
  if (termsData?.content) {
    formattedContent = termsData.content
      .replaceAll("<p><h2>", '<h2 class="text-xl font-bold mb-4 mt-6 text-gray-900">')
      .replaceAll("</h2></p>", "</h2>")
      .replaceAll("<p><h3>", '<h3 class="text-lg font-bold mb-3 mt-4 text-gray-900">')
      .replaceAll("</h3></p>", "</h3>")
      .replaceAll("<ol>", '<ol class="list-decimal list-inside space-y-2 mb-4 text-gray-650">')
      .replaceAll("<li>", '<li class="mb-2 pl-2">')
      .replaceAll("<p>", '<p class="mb-4 text-gray-600 leading-relaxed">')
      .replaceAll("<h2>", '<h2 class="text-xl font-bold mb-4 mt-6 text-gray-900">');
  }

  return (
    <>
      <JsonLd schema={[webPageSchema, breadcrumbSchema]} />
      {/* Banner Section */}
      <section className="relative w-full h-[50vh] lg:mt-0 mt-[75px] flex items-center justify-center bg-gray-900 overflow-hidden">

        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/image/privacy.jpg"
            alt="Terms & Conditions Background"
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
            {termsData?.title || "Terms & Conditions"}
          </h1>
          <p className="text-gray-300 text-sm md:text-base lg:text-lg max-w-3xl leading-relaxed mb-8 font-light">
            {termsData?.short_description ||
              "Please read our terms and conditions carefully before using our platform or services. By accessing Bookwindow, you agree to comply with these terms."}
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
            className="text-base text-gray-650 space-y-4 leading-relaxed dynamic-content"
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        </div>
      </section>
    </>
  );
}
