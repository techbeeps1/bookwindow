import type { MetadataRoute } from "next";
import config from "./config";

const BASE_URL = "https://bookwindow.in";

interface SitemapItem {
  url: string;
  updated_at?: string;
}

interface SitemapResponse {
  pages?: SitemapItem[];
  products?: SitemapItem[];
  product_categories?: SitemapItem[];
  categories?: SitemapItem[];
  publications?: SitemapItem[];
  posts?: SitemapItem[];
  post_categories?: SitemapItem[];
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getSitemapData(): Promise<SitemapResponse | null> {
  try {
    const response = await fetch(`${config.apiUrl}api/sitemap-data/`, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      console.error(`Sitemap API failed with status: ${response.status}`);
      return null;
    }

    return response.json();
  } catch (error) {
    console.error("Failed to fetch sitemap data:", error);
    return null;
  }
}

function parseDate(dateStr?: string): Date {
  if (!dateStr) return new Date();
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? new Date() : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getSitemapData();
  const urlMap = new Map<string, MetadataRoute.Sitemap[number]>();

  const addEntry = (
    path: string,
    lastModified?: string | Date,
    priority: number = 0.7,
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly"
  ) => {
    const cleanPath = path.replace(/^\/+/, "");
    const fullUrl = cleanPath ? `${BASE_URL}/${cleanPath}` : `${BASE_URL}/`;

    if (!urlMap.has(fullUrl)) {
      urlMap.set(fullUrl, {
        url: fullUrl,
        lastModified:
          lastModified instanceof Date
            ? lastModified
            : parseDate(lastModified),
        priority,
        changeFrequency,
      });
    }
  };

  // 1. Core / Static Pages
  addEntry("", new Date(), 1.0, "daily");
  addEntry("all-products", new Date(), 0.8, "daily");
  addEntry("publications", new Date(), 0.8, "daily");
  addEntry("blogs", new Date(), 0.8, "daily");
  addEntry("current-affairs", new Date(), 0.8, "daily");
  addEntry("contact-us", new Date(), 0.8, "monthly");

  if (data) {
    // 2. CMS Pages (about-us, privacy-policy, etc.)
    for (const item of data.pages || []) {
      const slug = (item.url || "").toLowerCase().replace(/^\/+|\/+$/g, "");
      if (!slug || slug === "home") continue;

      const isPolicy = [
        "privacy-policy",
        "return-policy",
        "terms-and-conditions",
      ].includes(slug);

      addEntry(
        slug,
        item.updated_at,
        isPolicy ? 0.3 : 0.8,
        isPolicy ? "monthly" : "weekly"
      );
    }

    // 3. Product Categories
    const categories = data.product_categories || data.categories || [];
    for (const item of categories) {
      const slug = (item.url || "")
        .replace(/^category\//, "")
        .replace(/^\/+|\/+$/g, "");
      if (slug) {
        addEntry(`category/${slug}`, item.updated_at, 0.8, "daily");
      }
    }

    // 4. Products
    for (const item of data.products || []) {
      const slug = (item.url || "")
        .replace(/^(product|product-detail)\//, "")
        .replace(/^\/+|\/+$/g, "");
      if (slug) {
        addEntry(`product/${slug}`, item.updated_at, 0.7, "weekly");
      }
    }

    // 5. Publications
    for (const item of data.publications || []) {
      const slug = (item.url || "")
        .replace(/^publication\//, "")
        .replace(/^\/+|\/+$/g, "");
      if (slug) {
        addEntry(`publication/${slug}`, item.updated_at, 0.7, "weekly");
      }
    }

    // 6. Blog Posts
    for (const item of data.posts || []) {
      const slug = (item.url || "")
        .replace(/^blogs?\//, "")
        .replace(/^\/+|\/+$/g, "");
      if (slug) {
        addEntry(`blogs/${slug}`, item.updated_at, 0.7, "weekly");
      }
    }
  }

  return Array.from(urlMap.values());
}