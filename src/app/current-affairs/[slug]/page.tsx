import { Metadata } from "next";
import config from "@/app/config";
import CurrentAffairsDetailClient from "./CurrentAffairsDetailClient";
import { notFound } from "next/navigation";
import { truncateDescription } from "@/helper/helperfun";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

async function getNewsItem(slug: string) {
  try {
    const res = await fetch(`${config.apiUrl}api/news/${slug}`, {
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

async function getAllNews() {
  try {
    const res = await fetch(`${config.apiUrl}api/news`, {
      next: {
        revalidate: 600,
      },
    });

    if (!res.ok) {
      return [];
    }

    return res.json();
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNewsItem(slug);

  if (!news) {
    return {
      title: "Current Affairs Update | Bookwindow",
      description: "Read the latest current affairs and exam updates on Bookwindow.",
    };
  }

  const title = `${news.title || "Current Affairs"} | Bookwindow`;
  const rawText = news.content?.replace(/<[^>]*>?/gm, "") || "";
  const description =
    truncateDescription(rawText) ||
    "Stay informed with daily and monthly current affairs updates at Bookwindow.";

  const imageUrl = news.feature_image
    ? `${config.apiUrl}storage/app/public/${news.feature_image}`
    : "/logo.png";

  return {
    title,
    description,
    alternates: {
      canonical: `/current-affairs/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: `https://bookwindow.in/current-affairs/${slug}`,
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

export default async function CurrentAffairsDetailPage({ params }: Props) {
  const { slug } = await params;
  const [newsData, newsList] = await Promise.all([
    getNewsItem(slug),
    getAllNews(),
  ]);

  if (!newsData) {
    notFound();
  }

  const articleSchema = generateArticleSchema(newsData, "NewsArticle", slug);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Current Affairs", url: "/current-affairs" },
    { name: newsData.title || "News Update", url: `/current-affairs/${slug}` },
  ]);

  return (
    <>
      <JsonLd schema={[articleSchema, breadcrumbSchema]} />
      <CurrentAffairsDetailClient
        currentAffairsData={newsData}
        currentAffairsList={newsList}
      />
    </>
  );
}

