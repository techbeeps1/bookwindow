import { Metadata } from "next";

import config from "@/app/config";
import PublisherPage from "./PublisherPage";
import { truncateDescription } from "@/helper/helperfun";


type Props = {
  params: Promise<{
    slug: string;
  }>;
};

async function getPublication(slug: string) {
  const res = await fetch(`${config.apiUrl}api/publication/${slug}`, {
    next: {
      revalidate: 0,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch publication");
  }

  return res.json();
}


export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await getPublication(slug);

    return {
      title: data.seo.meta_title || "Bookwindow - Publication",
      description: truncateDescription(data.seo.meta_description) || "Bookwindow Publication page .",
      keywords: data.seo.meta_keywords
        ?.split(",")
        .map((k: string) => k.trim()),

      openGraph: {
        title: data.seo.meta_title || "Bookwindow - Publication",
        description: truncateDescription(data.seo.meta_description) || "Bookwindow Publication page .",
        images: [
          `${config.apiUrl}storage/app/public/${data.seo.image}`,
        ],
      },

      alternates: {
        canonical: `/publication/${slug}`,
      },

      robots: {
        index: true,
        follow: true,
      },
    };
  } catch {
    return {
      title: "Bookwindow - Publication",
      description: "Bookwindow Publication page .",
    };
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  const data = await getPublication(slug);

  return <PublisherPage categoryData={data} />;
}