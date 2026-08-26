import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/checkout/",
          "/my-account/",
          "/view-orders/",
          "/wishlist/",
          "/sign-in",
          "/sign-up",
          "/reset-password",
        ],
      },
    ],
    sitemap: "https://bookwindow.in/sitemap.xml",
    host: "https://bookwindow.in",
  };
}
