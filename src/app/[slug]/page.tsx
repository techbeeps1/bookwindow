import Image from "next/image";
import config from "../config";
import { Metadata } from "next";
interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getPageData(slug: string) {
  const res = await fetch(
    `${config.apiUrl}api/cms-pages/${slug}`,
    {
      cache: "no-store", // SSR
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch page");
  }
  return res.json();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageData(slug);

  return {
    title: page.meta_title || page.title,
    description: page.meta_description || page.short_description,

    openGraph: {
      title: page.meta_title || page.title,
      description: page.meta_description || page.short_description,
      images: page.banner_images
        ? [
            `${config.apiUrl}storage/app/public/${page.banner_images}`,
          ]
        : [],
    },


  };
}

export default async function AboutUs({ params }: PageProps) {
  const { slug } = await params;
  const PageData = await getPageData(slug);

  return (
    <>
      {/* Banner Section */}
      <section className="relative w-full h-[50vh] flex items-center justify-center bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src={`${config.apiUrl}storage/app/public/${PageData?.banner_images}`}
            alt="About Us Background"
            fill
            priority
            className="object-cover opacity-35"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 text-center max-w-4xl px-6">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-5 uppercase">
            {PageData?.title}
          </h1>

          {PageData?.short_description && (
            <p className="text-gray-300 text-sm md:text-base lg:text-lg max-w-3xl mx-auto">
              {PageData.short_description}
            </p>
          )}
        </div>
      </section>

      <section className="container mx-auto px-4 max-w-5xl my-16 md:my-24">
        <div className="bg-white p-6 md:p-10 rounded-2xl border border-gray-100 shadow-sm">
          <div
            className="dynamic-content text-base text-gray-600 leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: PageData?.content,
            }}
          />
        </div>
      </section>
    </>
  );
}