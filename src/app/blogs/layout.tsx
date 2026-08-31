import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blogs, Articles & Exam Preparation Guides | Bookwindow",
  description:
    "Read comprehensive blogs, study strategies, book reviews, and exam preparation tips for competitive tests at Bookwindow.",
  alternates: {
    canonical: "/blogs",
  },
  openGraph: {
    title: "Blogs, Articles & Exam Preparation Guides | Bookwindow",
    description:
      "Read comprehensive blogs, study strategies, book reviews, and exam preparation tips for competitive tests at Bookwindow.",
    url: "https://bookwindow.in/blogs",
  },
};

import JsonLd from "@/components/seo/JsonLd";
import { generateBreadcrumbSchema } from "@/helper/schemaHelper";

export default function BlogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blogs", url: "/blogs" },
  ]);

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      {children}
    </>
  );
}

