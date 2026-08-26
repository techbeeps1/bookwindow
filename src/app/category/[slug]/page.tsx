import { Metadata } from "next";

import config from "@/app/config";
import CategoryPage from "./CategoryPage";
import { truncateDescription } from "@/helper/helperfun";
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
    error:"Failed to fetch category data",
    }
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
        notFound();
      }
    return {
      title: data.seo.meta_title || "Bookwindow - Category",
      description:
        truncateDescription(data.seo.meta_description) || "Bookwindow Category page .",
      keywords: data.seo.meta_keywords
        ?.split(",")
        .map((k: string) => k.trim()),
         alternates: {
        canonical: `/category/${slug}`,
      },

      robots: {
        index: true,
        follow: true,
      },

      openGraph: {
        title: data.seo.meta_title || "Bookwindow - Category",
        description:
          truncateDescription(data.seo.meta_description) || "Bookwindow Category page .",
        images: [
          `${config.apiUrl}storage/app/public/${data.seo.image}`,
        ],
      },

     
    };
  } catch {
    return {
      title: "Bookwindow - Category",
      description: "Bookwindow category page .",
    };
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  const data = await getCategory(slug);
   if (data.success === false) {
        notFound();
      }
  return <CategoryPage categoryData={data} slug={slug} />;
}