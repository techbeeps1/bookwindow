import { Metadata } from "next";
import config from "./config";
import HomePage from "@/components/HomePage";

async function fetchHomePageData() {
  const res = await fetch(`${config.apiUrl}api/home-page`, {
    next: {
      revalidate: 600,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch home page");
  }

  return res.json();
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const data = await fetchHomePageData();

    const seo = data?.seo || {};

    return {
      title: seo.meta_title || "Bookwindow",
      description:
        seo.meta_description || "Buy books online at Bookwindow.",
      keywords: seo.meta_keywords
        ?.split(",")
        .map((item: string) => item.trim()),

      alternates: {
        canonical: "https://bookwindow.in",
      },

      robots: {
        index: true,
        follow: true,
      },

      openGraph: {
        title: seo.meta_title || "Bookwindow",
        description:
          seo.meta_description || "Buy books online at Bookwindow.",
        url: "https://yourdomain.com",
        type: "website",
        images: [
          seo.meta_image
            ? `${config.apiUrl}storage/app/public/${seo.meta_image}`
            : "/logo.png",
        ],
      },


    };
  } catch {
    return {
      title: "Bookwindow",
      description: "Buy books online at Bookwindow.",
    };
  }
}

export default async function Home() {
  const homePageData = await fetchHomePageData();

  return <HomePage homePageData={homePageData} />;
}