import { Metadata } from "next";
import ProductDetail from "./ProductDetail";
import config from "@/app/config";
import { truncateDescription } from "@/helper/helperfun";
import Link from "next/link";
import { BiSearch } from "react-icons/bi";

import { notFound } from "next/navigation";
type Props = {
  params: Promise<{
    slug: string;
  }>;
};

async function getProduct(slug: string) {

  console.log("Fetching product with slug:", slug); // Debugging line
  const res = await fetch(`${config.apiUrl}api/products/${slug}`,
 {   next: {
  revalidate: 600
}
}
);

  if (!res.ok) {
    return {
      error: `Failed to fetch product with slug: ${slug}, status: ${res.status}`,
      success: false,
    };
  }

  return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await getProduct(slug);
    const product = data.product;
     if (data.success === false) {
    notFound();
  }
    return {
      title: product.meta_tag_title || product.name || "Bookwindow - Product",
      description: truncateDescription(product.meta_tag_description) ||
        truncateDescription(product.description) ||
        "Bookwindow - product details page",
      keywords: product.meta_tag_keywords
        ?.split(",")
        .map((k: string) => k.trim()),
alternates: {
  canonical: `/product-detail/${slug}`,
},
    robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title: product.meta_tag_title || product.name || "Bookwindow - Product" ,
        description: truncateDescription(product.meta_tag_description) || truncateDescription(product.description) || "Bookwindow - product details page",
        images: [`${config.apiUrl}storage/app/public/${product.image}`],
      },
    };
  } catch {
    return {
      title: "Bookwindow - Product Details",
      description: "Bookwindow - product details page",
    };
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  const data = await getProduct(slug);
    if (data.success === false) {
    notFound();
  }

  return <ProductDetail data={data} />;
}
