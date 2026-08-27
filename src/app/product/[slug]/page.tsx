import { Metadata } from "next";
import ProductDetail from "./ProductDetail";
import config from "@/app/config";
import { truncateDescription } from "@/helper/helperfun";
import { redirect, RedirectType, permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

async function getProduct(slug: string) {
  const encodedSlug = encodeURIComponent(slug);
  const res = await fetch(`${config.apiUrl}api/products/${encodedSlug}`, {
    next: {
      revalidate: 600,
    },
  });

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
    const product = data?.product;

    if (data.success === false || !product) {
      return {
        title: "Product Not Found | Bookwindow",
        description: "Buy books online at Bookwindow.",
      };
    }

    const title =
      product.meta_tag_title?.trim() ||
      `${product.name || "Book Details"} | Bookwindow`;

    const description =
      product.meta_tag_description?.trim() ||
      truncateDescription(product.description?.replace(/<[^>]*>?/gm, "")) ||
      `Buy ${product.name} online at best price on Bookwindow.`;

    const keywords = product.meta_tag_keywords
      ? product.meta_tag_keywords.split(",").map((k: string) => k.trim())
      : undefined;

    const imageUrl = product.image
      ? `${config.apiUrl}storage/app/public/${product.image}`
      : "/logo.png";

    return {
      title,
      description,
      keywords,
      alternates: {
        canonical: `/product/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title,
        description,
        url: `https://bookwindow.in/product/${slug}`,
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
      title: "Book Details | Bookwindow",
      description: "Buy books online at Bookwindow.",
    };
  }
}

import JsonLd from "@/components/seo/JsonLd";
import { generateProductSchema, generateBreadcrumbSchema } from "@/helper/schemaHelper";

export default async function Page({ params }: Props) {
  const { slug } = await params;

  const data = await getProduct(slug);
  if (data.success === false || !data?.product) {
    redirect("/", RedirectType.replace);
  }

  if (
    data.product.slug &&
    data.product.slug !== slug &&
    decodeURIComponent(data.product.slug) !== decodeURIComponent(slug)
  ) {
    permanentRedirect(`/product/${data.product.slug}`);
  }

  const product = data.product;
  const productSchema = generateProductSchema(product, slug);

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: "Books", url: "/all-products" },
  ];

  if (product.production?.name) {
    breadcrumbs.push({
      name: product.production.name,
      url: `/publication/${product.production.slug}`,
    });
  }

  breadcrumbs.push({
    name: product.name || "Book Details",
    url: `/product/${product.slug || slug}`,
  });

  const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbs);

  return (
    <>
      <JsonLd schema={[productSchema, breadcrumbSchema]} />
      <ProductDetail data={data} />
    </>
  );
}

