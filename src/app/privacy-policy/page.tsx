import Image from "next/image";
import config from "../config";
import { Metadata } from "next";
import { truncateDescription } from "@/helper/helperfun";
import Link from "next/link";

async function getPrivacyPolicyData() {
  try {
    const res = await fetch(`${config.apiUrl}api/cms-pages/privacy-policy`, {
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
  const data = await getPrivacyPolicyData();

  if (!data) {
    return {
      title: "Privacy Policy | Bookwindow",
      description: "Privacy Policy and user data protection terms of Bookwindow.",
    };
  }

  const title =
    data.meta_title?.trim() ||
    `${data.title || "Privacy Policy"} | Bookwindow`;

  const description =
    data.meta_description?.trim() ||
    truncateDescription(data.short_description || data.content?.replace(/<[^>]*>?/gm, "")) ||
    "Your privacy is highly important to us. Understand how we collect, use, manage, and secure your personal information on Bookwindow.";

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
      canonical: "/privacy-policy",
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: "https://bookwindow.in/privacy-policy",
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

export default async function PrivacyPolicy() {
  const privacyPolicyData = await getPrivacyPolicyData();

  const title = privacyPolicyData?.title || "Privacy Policy";
  const desc = privacyPolicyData?.short_description || "Privacy policy and data protection practices at Bookwindow.";
  const webPageSchema = generateWebPageSchema(title, desc, "/privacy-policy");
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: title, url: "/privacy-policy" },
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
            alt="Privacy Policy Background"
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
            {privacyPolicyData?.title || "Privacy Policy"}
          </h1>
          <p className="text-gray-300 text-sm md:text-base lg:text-lg max-w-3xl leading-relaxed mb-8 font-light">
            {privacyPolicyData?.short_description ||
              "Your privacy is highly important to us. Understand how we collect, use, manage, and secure your personal information on Bookwindow."}
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
              __html: privacyPolicyData?.content || "<p>Privacy Policy content.</p>",
            }}
          />
        </div>
      </section>
    </>
  );
}
