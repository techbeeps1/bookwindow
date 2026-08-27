import { Metadata } from "next";
import config from "@/app/config";
import PublisherPage from "./PublisherPage";
import { truncateDescription } from "@/helper/helperfun";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

async function getPublication(slug: string) {
  try {
    const res = await fetch(`${config.apiUrl}api/publication/${slug}`, {
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

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await getPublication(slug);

    if (!data) {
      return {
        title: "Publication | Bookwindow",
        description: "Explore books by publication on Bookwindow.",
      };
    }

    const publisherName =
      data.publication?.name ||
      slug
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

    const title =
      data.seo?.meta_title?.trim() ||
      `${publisherName} Books Store | Bookwindow`;

    const description =
      data.seo?.meta_description?.trim() ||
      `Buy authentic books from ${publisherName} online at best prices on Bookwindow.`;

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
        canonical: `/publication/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title,
        description,
        url: `https://bookwindow.in/publication/${slug}`,
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
      title: "Publication | Bookwindow",
      description: "Explore books by publication on Bookwindow.",
    };
  }
}

export default async function Page({ params }: Props) {
  const { slug } = await params;

  const data = await getPublication(slug);
  if (!data) {
    notFound();
  }

  return <PublisherPage categoryData={data} />;
}