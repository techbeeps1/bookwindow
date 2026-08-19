import type { MetadataRoute } from "next";
import config from "./config";

const BASE_URL = "https://bookwindow.in"; // Replace with your actual base URL

interface SitemapItem {
  url: string;
  updated_at: string;
}

interface SitemapResponse {
  pages?: SitemapItem[];
  products?: SitemapItem[];
  categories?: SitemapItem[];
}

async function getSitemapData(): Promise<SitemapResponse> {
   const response = await fetch(`${config.apiUrl}api/sitemap-data/`);

  if (!response.ok) {
    throw new Error(`Sitemap API failed: ${response.status}`);
  }

  return response.json();
}

function getPriority(url: string, type: string): number {
  const slug = url.toLowerCase().replace(/^\/+|\/+$/g, "");

  // Homepage
  if (slug === "" || slug === "home") {
    return 1.0;
  }

  // Important pages
  if (
    [
      "about-us",
      "contact-us",
      "books",
      "new-in",
    ].includes(slug)
  ) {
    return 0.8;
  }

  // Policy pages
  if (
    [
      "privacy-policy",
      "return-policy",
      "terms-and-conditions",
    ].includes(slug)
  ) {
    return 0.3;
  }

  // Categories
  if (type === "category") {
    return 0.7;
  }

  // Products
  if (type === "product") {
    return 0.6;
  }

  // Other pages
  return 0.5;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getSitemapData();

  const sitemap: MetadataRoute.Sitemap = [];

  // Pages
  for (const item of data.pages || []) {

      if (item.url === "" || item.url === "home") {
    sitemap.push({
      url: `${BASE_URL}/`,
      lastModified: new Date(item.updated_at),
      priority: getPriority(item.url, "page"),
    });
      }else {
    sitemap.push({
      url: `${BASE_URL}/${item.url}`,
      lastModified: new Date(item.updated_at),
      priority: getPriority(item.url, "page"),
    });

      }

  }

  // Categories
  for (const item of data.categories || []) {
    sitemap.push({
      url: `${BASE_URL}/${item.url}`,
      lastModified: new Date(item.updated_at),
      priority: getPriority(item.url, "category"),
    });
  }

  // Products
  for (const item of data.products || []) {
    sitemap.push({
      url: `${BASE_URL}/${item.url}`,
      lastModified: new Date(item.updated_at),
      priority: getPriority(item.url, "product"),
    });
  }

  return sitemap;
}