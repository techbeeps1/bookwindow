import { Metadata } from "next";
import config from "@/app/config";
import CategoryPage from "./CategoryPage";
import { truncateDescription, extractCategoryTitle } from "@/helper/helperfun";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

async function getCategory(slug: string) {
  const res = await fetch(`${config.apiUrl}api/category/${slug}`, {
    next: {
      revalidate: 600,
    },
  });

  if (!res.ok) {
    return {
      success: false,
      error: "Failed to fetch category data",
    };
  }

  return res.json();
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await getCategory(slug);
    if (data.success === false) {
      return {
        title: "Category Not Found | Bookwindow",
        description: "Explore book categories on Bookwindow.",
      };
    }

    const categoryName = extractCategoryTitle(data, slug);

    const title =
      data.seo?.meta_title?.trim() ||
      `${categoryName} Books | Bookwindow`;

    const description =
      data.seo?.meta_description?.trim() ||
      `Buy ${categoryName} competitive exam and academic books online at Bookwindow. Fast shipping across India.`;

    const keywords = data.seo?.meta_keywords
      ? data.seo.meta_keywords.split(",").map((k: string) => k.trim())
      : undefined;

    const imageUrl = data.seo?.image
      ? `${config.apiUrl}storage/app/public/${data.seo.image}`
      : "/logo.png";

    return {
      title,
      description,
      keywords,
      alternates: {
        canonical: `/category/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title,
        description,
        url: `https://bookwindow.in/category/${slug}`,
        type: "website",
        images: [imageUrl],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: "Book Categories | Bookwindow",
      description: "Explore books by category on Bookwindow.",
    };
  }
}

import JsonLd from "@/components/seo/JsonLd";
import { generateCategoryGraphSchema } from "@/helper/schemaHelper";

export default async function Page({ params }: Props) {
  const { slug } = await params;

  const data = await getCategory(slug);
  if (data.success === false) {
    notFound();
  }

  const categoryName = extractCategoryTitle(data, slug);

  const categoryDescription =
    data?.seo?.meta_description?.trim() ||
    `Buy ${categoryName} competitive exam and academic books online at Bookwindow. Fast shipping across India.`;

  const categoryGraphSchema = generateCategoryGraphSchema({
    categoryName,
    categoryUrl: `/category/${slug}`,
    categoryDescription,
    products: data?.products || [],
    breadcrumbs: [
      { name: "Home", url: "/" },
      { name: "Categories", url: "/all-products" },
      { name: categoryName, url: `/category/${slug}` },
    ],
  });

  return (
    <>
      <JsonLd schema={categoryGraphSchema} />
      <CategoryPage categoryData={data} slug={slug} />
    </>
  );
}

