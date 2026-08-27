import config from "@/app/config";

const SITE_URL = "https://bookwindow.in";
const SITE_NAME = "Bookwindow";
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;

/**
 * Strips HTML tags and excessive whitespace from strings
 */
export function stripHtml(input?: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .replace(/<[^>]*>?/gm, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Ensures an image URL is absolute
 */
export function toAbsoluteImageUrl(imagePath?: string): string {
  if (!imagePath || typeof imagePath !== "string") return DEFAULT_IMAGE;
  const trimmed = imagePath.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("/")) {
    return `${SITE_URL}${trimmed}`;
  }
  return `${config.apiUrl}storage/app/public/${trimmed}`;
}

/**
 * Ensures a page URL is absolute
 */
export function toAbsoluteUrl(path?: string): string {
  if (!path || typeof path !== "string") return SITE_URL;
  const trimmed = path.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  const cleanPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return `${SITE_URL}${cleanPath}`;
}

/**
 * Organization Schema (Global Brand Entity)
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      url: DEFAULT_IMAGE,
      caption: SITE_NAME,
    },
    image: DEFAULT_IMAGE,
    sameAs: [
      "https://m.facebook.com/100064054598576/",
      "https://www.instagram.com/bookwindow_2.0?igsh=MXV5ZTVmcTIxcGRyNA==",
      "https://youtube.com",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+91-9784954823",
        contactType: "customer service",
        availableLanguage: ["English", "Hindi"],
        areaServed: "IN",
      },
    ],
  };
}

/**
 * WebSite Schema with Sitelinks Searchbox
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: SITE_NAME,
    url: SITE_URL,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/all-products?keyword={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface BreadcrumbItem {
  name: string;
  url?: string;
}

/**
 * BreadcrumbList Schema (Dynamic Hierarchy)
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  if (!items || items.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const position = index + 1;
      const element: any = {
        "@type": "ListItem",
        position,
        name: stripHtml(item.name) || `Step ${position}`,
      };
      if (item.url) {
        element.item = toAbsoluteUrl(item.url);
      }
      return element;
    }),
  };
}

/**
 * Product Schema (with Offer & Specifications)
 * Strictly includes ratings/reviews ONLY if actual real data exists in database
 */
export function generateProductSchema(product: any, slug?: string) {
  if (!product) return null;

  const productSlug = product.slug || slug || "";
  const productUrl = toAbsoluteUrl(`/product/${productSlug}`);
  const cleanName = stripHtml(product.name) || "Book";
  const cleanDesc =
    stripHtml(product.meta_tag_description) ||
    stripHtml(product.description) ||
    `Buy ${cleanName} online at best price on ${SITE_NAME}.`;

  // Collect images
  const images: string[] = [];
  if (product.image) {
    images.push(toAbsoluteImageUrl(product.image));
  }

  if (product.gallery) {
    if (typeof product.gallery === "string") {
      try {
        const parsed = JSON.parse(product.gallery);
        if (Array.isArray(parsed)) {
          parsed.forEach((img: any) => {
            const path = typeof img === "string" ? img : img?.image || img?.file || img?.url;
            if (path) images.push(toAbsoluteImageUrl(path));
          });
        }
      } catch {
        product.gallery
          .split(",")
          .map((img: string) => img.trim())
          .filter(Boolean)
          .forEach((path: string) => images.push(toAbsoluteImageUrl(path)));
      }
    } else if (Array.isArray(product.gallery)) {
      product.gallery.forEach((img: any) => {
        const path = typeof img === "string" ? img : img?.image || img?.file || img?.url;
        if (path) images.push(toAbsoluteImageUrl(path));
      });
    }
  }

  const finalImages = images.length > 0 ? Array.from(new Set(images)) : [DEFAULT_IMAGE];

  // Price & Offer calculation
  const rawPrice = product.price ?? product.mrp ?? 0;
  const numericPrice = typeof rawPrice === "number" ? rawPrice : parseFloat(String(rawPrice).replace(/[^\d.]/g, "")) || 0;

  // Availability check
  const isOutOfStock =
    product.is_stock === 0 ||
    product.stock === "out_of_stock" ||
    product.quantity === 0 ||
    product.status === 0;

  const availability = isOutOfStock
    ? "https://schema.org/OutOfStock"
    : "https://schema.org/InStock";

  const publisherName = product.production?.name || product.publisher || undefined;
  const authorName = product.author || undefined;
  const brandName = publisherName || authorName || SITE_NAME;

  const sku = String(product.sku || product.id || productSlug);
  const isbn = product.isbn || product.isbn13 || product.isbn10 || undefined;

  const offer: any = {
    "@type": "Offer",
    price: numericPrice,
    priceCurrency: "INR",
    priceValidUntil: "2027-12-31",
    itemCondition: "https://schema.org/NewCondition",
    availability,
    url: productUrl,
    seller: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  const schema: any = {
    "@context": "https://schema.org",
    "@type": ["Product", "Book"],
    "@id": `${productUrl}#product`,
    name: cleanName,
    description: cleanDesc,
    image: finalImages,
    url: productUrl,
    sku,
    mpn: String(product.id || sku),
    brand: {
      "@type": "Brand",
      name: brandName,
    },
    offers: offer,
  };

  if (isbn) {
    schema.isbn = String(isbn).trim();
  }

  if (authorName) {
    schema.author = [
      {
        "@type": "Person",
        name: stripHtml(authorName),
      },
    ];
  }

  if (publisherName) {
    schema.publisher = {
      "@type": "Organization",
      name: stripHtml(publisherName),
    };
  }

  if (product.book_language) {
    schema.inLanguage = stripHtml(product.book_language);
  }

  if (product.number_of_pages) {
    const pages = parseInt(String(product.number_of_pages), 10);
    if (!isNaN(pages) && pages > 0) {
      schema.numberOfPages = pages;
    }
  }

  // Aggregate Rating ONLY if genuine database rating values exist
  const ratingVal = parseFloat(product.reviews_avg_rating ?? product.rating ?? product.avg_rating);
  const reviewCount = parseInt(product.total_reviews ?? product.review_count ?? product.reviews_count, 10);

  if (!isNaN(ratingVal) && ratingVal > 0 && !isNaN(reviewCount) && reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: ratingVal,
      reviewCount: reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  // Reviews ONLY if actual review records exist
  if (Array.isArray(product.reviews) && product.reviews.length > 0) {
    const validReviews = product.reviews
      .filter((r: any) => r && (r.comment || r.review || r.description))
      .map((r: any) => ({
        "@type": "Review",
        author: {
          "@type": "Person",
          name: stripHtml(r.user_name || r.name || r.user?.name || "Verified Customer"),
        },
        datePublished: r.created_at ? new Date(r.created_at).toISOString().split("T")[0] : undefined,
        reviewBody: stripHtml(r.comment || r.review || r.description),
        reviewRating: r.rating
          ? {
              "@type": "Rating",
              ratingValue: parseFloat(r.rating) || 5,
              bestRating: 5,
              worstRating: 1,
            }
          : undefined,
      }));

    if (validReviews.length > 0) {
      schema.review = validReviews;
    }
  }

  return schema;
}

/**
 * ItemList Schema for Category & Publication product listings
 */
export function generateItemListSchema(
  listName: string,
  products: any[],
  pageUrl: string
) {
  if (!products || !Array.isArray(products) || products.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: stripHtml(listName),
    url: toAbsoluteUrl(pageUrl),
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((prod, index) => {
      const prodSlug = prod.slug || prod.id || "";
      const prodUrl = toAbsoluteUrl(`/product/${prodSlug}`);
      return {
        "@type": "ListItem",
        position: index + 1,
        name: stripHtml(prod.name) || `Product ${index + 1}`,
        url: prodUrl,
      };
    }),
  };
}

/**
 * Article Schema (BlogPosting & NewsArticle)
 */
export function generateArticleSchema(
  article: any,
  type: "BlogPosting" | "NewsArticle",
  slug: string
) {
  if (!article) return null;

  const url = toAbsoluteUrl(type === "BlogPosting" ? `/blogs/${slug}` : `/current-affairs/${slug}`);
  const headline = stripHtml(article.title || article.meta_title) || "Educational Article";
  const rawContent = article.content || article.short_description || "";
  const description =
    stripHtml(article.meta_description) ||
    stripHtml(rawContent).substring(0, 160) ||
    headline;

  const image = article.feature_image || article.image
    ? toAbsoluteImageUrl(article.feature_image || article.image)
    : DEFAULT_IMAGE;

  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#article`,
    headline,
    description,
    image: [image],
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    datePublished: article.created_at ? new Date(article.created_at).toISOString() : undefined,
    dateModified: article.updated_at
      ? new Date(article.updated_at).toISOString()
      : article.created_at
      ? new Date(article.created_at).toISOString()
      : undefined,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: DEFAULT_IMAGE,
      },
    },
  };
}

/**
 * ContactPage Schema
 */
export function generateContactPageSchema() {
  const url = toAbsoluteUrl("/contact-us");
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "@id": `${url}#webpage`,
    url,
    name: `Contact Us | ${SITE_NAME}`,
    description: "Get in touch with Bookwindow for book inquiries, order support, and assistance.",
    mainEntity: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+91-9784954823",
          contactType: "customer service",
          availableLanguage: ["English", "Hindi"],
          areaServed: "IN",
        },
      ],
    },
  };
}

/**
 * AboutPage Schema
 */
export function generateAboutPageSchema() {
  const url = toAbsoluteUrl("/about-us");
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "@id": `${url}#webpage`,
    url,
    name: `About Us | ${SITE_NAME}`,
    description: "Learn about Bookwindow, India's trusted online platform for competitive exams and educational books.",
    mainEntity: {
      "@id": `${SITE_URL}/#organization`,
    },
  };
}

/**
 * CollectionPage Schema for Category and Publication listing pages
 */
export function generateCollectionPageSchema(
  name: string,
  url: string,
  description?: string
) {
  const fullUrl = toAbsoluteUrl(url);
  return {
    "@type": "CollectionPage",
    "@id": `${fullUrl}#webpage`,
    name: stripHtml(name),
    url: fullUrl,
    description:
      stripHtml(description) ||
      `Explore and buy ${stripHtml(name)} books online at ${SITE_NAME}.`,
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
  };
}

/**
 * Unified @graph Schema for Category Pages
 * Contains CollectionPage, BreadcrumbList, and ItemList (Organization & WebSite are loaded globally in layout)
 */
export function generateCategoryGraphSchema({
  categoryName,
  categoryUrl,
  categoryDescription,
  products = [],
  breadcrumbs = [],
}: {
  categoryName: string;
  categoryUrl: string;
  categoryDescription?: string;
  products?: any[];
  breadcrumbs?: BreadcrumbItem[];
}) {
  const collectionPageSchema = generateCollectionPageSchema(
    categoryName,
    categoryUrl,
    categoryDescription
  );

  const cleanBreadcrumbs =
    breadcrumbs.length > 0
      ? breadcrumbs
      : [
          { name: "Home", url: "/" },
          { name: "Categories", url: "/all-products" },
          { name: categoryName, url: categoryUrl },
        ];

  const breadcrumbSchema = generateBreadcrumbSchema(cleanBreadcrumbs);
  const itemListSchema = generateItemListSchema(
    `${categoryName} Books`,
    products,
    categoryUrl
  );

  // Strip @context from individual nodes inside @graph
  const cleanNode = (node: any) => {
    if (!node) return null;
    const { "@context": _, ...rest } = node;
    return rest;
  };

  const graphNodes = [
    cleanNode(collectionPageSchema),
    cleanNode(breadcrumbSchema),
    cleanNode(itemListSchema),
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@graph": graphNodes,
  };
}

/**
 * Unified @graph Schema for Publication Pages
 * Contains CollectionPage, BreadcrumbList, and ItemList (Organization & WebSite are loaded globally in layout)
 */
export function generatePublicationGraphSchema({
  publisherName,
  publisherUrl,
  publisherDescription,
  products = [],
}: {
  publisherName: string;
  publisherUrl: string;
  publisherDescription?: string;
  products?: any[];
}) {
  const collectionPageSchema = generateCollectionPageSchema(
    publisherName,
    publisherUrl,
    publisherDescription
  );

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Publications", url: "/publications" },
    { name: publisherName, url: publisherUrl },
  ]);

  const itemListSchema = generateItemListSchema(
    `${publisherName} Books`,
    products,
    publisherUrl
  );

  const cleanNode = (node: any) => {
    if (!node) return null;
    const { "@context": _, ...rest } = node;
    return rest;
  };

  const graphNodes = [
    cleanNode(collectionPageSchema),
    cleanNode(breadcrumbSchema),
    cleanNode(itemListSchema),
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@graph": graphNodes,
  };
}


/**
 * Generic WebPage Schema
 */
export function generateWebPageSchema(title: string, description: string, path: string) {
  const url = toAbsoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: `${stripHtml(title)} | ${SITE_NAME}`,
    description: stripHtml(description),
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
  };
}

