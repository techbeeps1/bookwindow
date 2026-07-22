import { Metadata } from "next";
import ProductDetail from "./ProductDetail";
import config from "@/app/config";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

async function getProduct(slug: string) {
  const res = await fetch(`${config.apiUrl}api/products/${slug}`);

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  return res.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await getProduct(slug);
    const product = data.product;
 
    return {
      title: product.meta_tag_title || product.name || "Bookwindow - Product",
      description:
        product.meta_tag_description ||
        product.description ||
        "Bookwindow - product details page",
      keywords: product.meta_tag_keywords
        ?.split(",")
        .map((k: string) => k.trim()),

      openGraph: {
        title: product.meta_tag_title || product.name || "Bookwindow - Product" ,
        description: product.meta_tag_description || product.description || "Bookwindow - product details page",
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

  return <ProductDetail data={data} />;
}
