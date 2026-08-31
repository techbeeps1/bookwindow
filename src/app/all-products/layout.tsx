import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products - Buy Competitive & Academic Books Online | Bookwindow",
  description:
    "Explore our complete catalog of competitive exam books, school textbooks, mock tests, and publication store collections on Bookwindow.",
  alternates: {
    canonical: "/all-products",
  },
  openGraph: {
    title: "All Products - Buy Competitive & Academic Books Online | Bookwindow",
    description:
      "Explore our complete catalog of competitive exam books, school textbooks, mock tests, and publication store collections on Bookwindow.",
    url: "https://bookwindow.in/all-products",
  },
};

import JsonLd from "@/components/seo/JsonLd";
import { generateBreadcrumbSchema } from "@/helper/schemaHelper";

export default function AllProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "All Books", url: "/all-products" },
  ]);

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      {children}
    </>
  );
}

