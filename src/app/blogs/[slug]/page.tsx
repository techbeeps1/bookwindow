import { Metadata } from "next";
import config from "@/app/config";
import BlogDetailClient from "./BlogDetailClient";
import { notFound } from "next/navigation";
import { truncateDescription } from "@/helper/helperfun";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

async function getBlog(slug: string) {
  try {
    const res = await fetch(`${config.apiUrl}api/blog/${slug}`, {
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    return {
      title: "Blog Details | Bookwindow",
      description: "Read the latest educational articles and exam preparation tips on Bookwindow.",
    };
  }

  const title =
    blog.meta_title?.trim() ||
    `${blog.title || "Blog Post"} | Bookwindow`;

  const description =
    blog.meta_description?.trim() ||
    truncateDescription(blog.content?.replace(/<[^>]*>?/gm, "")) ||
    "Read the latest articles and exam preparation guides on Bookwindow.";

  const keywords = blog.meta_keywords
    ? blog.meta_keywords.split(",").map((k: string) => k.trim())
    : undefined;

  const imageUrl = blog.image
    ? `${config.apiUrl}storage/app/public/${blog.image}`
    : "/logo.png";

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `/blogs/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: `https://bookwindow.in/blogs/${slug}`,
      type: "article",
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
import { generateArticleSchema, generateBreadcrumbSchema } from "@/helper/schemaHelper";

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    notFound();
  }

  const articleSchema = generateArticleSchema(blog, "BlogPosting", slug);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blogs", url: "/blogs" },
    { name: blog.title || "Blog Post", url: `/blogs/${slug}` },
  ]);

  return (
    <>
      <JsonLd schema={[articleSchema, breadcrumbSchema]} />
      <BlogDetailClient blogData={blog} />
    </>
  );
}

