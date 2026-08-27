export function truncateDescription(text: string, maxLength = 160) {
  const cleanText = text.replace(/<[^>]*>/g, "").trim();
  if (cleanText.length <= maxLength) {
    return cleanText;
  }
  return cleanText.substring(0, maxLength - 3).trimEnd() + "...";
}

const KNOWN_ACRONYMS = new Set([
  "CBSE", "RBSE", "NCERT", "UPSC", "SSC", "RRB", "NEET", "JEE", "IIT",
  "RAS", "RTS", "RPSC", "CTET", "REET", "GK", "GS", "PDF", "CET", "RSSB",
  "RSMSSB", "VDO", "LDC", "SI", "PTI", "BSTC", "NET", "JRF", "SLET",
  "IAS", "IPS", "IFS", "NDA", "CDS", "AFCAT", "NTPC", "IBPS", "SBI", "PO",
  "10+2", "10TH", "12TH", "1ST", "2ND", "3RD", "MCQ", "MCQS", "PYQ", "PYQS",
  "B.ED", "D.EL.ED", "BA", "B.SC", "B.COM", "MA", "M.SC", "M.COM"
]);

/**
 * Formats a text into proper Title Case while preserving standard uppercase acronyms
 */
export function formatTitleCase(str: string): string {
  if (!str) return "";
  return str
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      // Handle slash-separated terms e.g. "RAS/RTS" or "(Pre/Mains)"
      if (word.includes("/")) {
        return word
          .split("/")
          .map((sub) => formatTitleCase(sub))
          .join("/");
      }

      const cleanWord = word.replace(/^[(\[{'"]+/, "").replace(/[)\]}'",.:;?!]+$/, "");
      const upper = cleanWord.toUpperCase();

      if (KNOWN_ACRONYMS.has(upper)) {
        return word.replace(cleanWord, upper);
      }

      // Preserve patterns like 10+2
      if (/^\d+\+\d+$/.test(cleanWord)) {
        return word;
      }

      // Capitalize first letter, lowercase rest
      const capitalized = cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1).toLowerCase();
      return word.replace(cleanWord, capitalized);
    })
    .join(" ");
}

/**
 * Decodes and cleans URL slugs into human-readable formatted title
 */
export function cleanSlugToTitle(rawSlug?: string): string {
  if (!rawSlug) return "Category";

  let decoded = rawSlug;
  try {
    decoded = decodeURIComponent(decoded);
    if (decoded.includes("%")) {
      decoded = decodeURIComponent(decoded);
    }
  } catch {}

  // Replace + with space, except when in 10+2 pattern
  decoded = decoded
    .replace(/(?<!\d)\+(?!\d)/g, " ")
    .replace(/%20/gi, " ")
    .replace(/%2b/gi, "+")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return formatTitleCase(decoded);
}

/**
 * Normalizes string for fuzzy comparison
 */
function normalizeForComparison(str: string): string {
  return str
    .toLowerCase()
    .replace(/%20/gi, "")
    .replace(/%2b/gi, "+")
    .replace(/[^a-z0-9+]/g, "");
}

/**
 * Extracts and formats the exact category title from API response and slug
 */
export function extractCategoryTitle(categoryData: any, slug?: string): string {
  // 1. If explicit category title/name field exists
  if (categoryData?.name && typeof categoryData.name === "string" && categoryData.name.trim()) {
    return formatTitleCase(categoryData.name.trim());
  }
  if (categoryData?.title && typeof categoryData.title === "string" && categoryData.title.trim()) {
    return formatTitleCase(categoryData.title.trim());
  }
  if (categoryData?.category_name && typeof categoryData.category_name === "string" && categoryData.category_name.trim()) {
    return formatTitleCase(categoryData.category_name.trim());
  }

  // 2. Try to match from categoryData.category list using normalized comparison
  if (slug && Array.isArray(categoryData?.category) && categoryData.category.length > 0) {
    const normSlug = normalizeForComparison(slug).replace(/books?$/, "");

    const matched = categoryData.category.find((cat: any) => {
      if (!cat?.name || typeof cat.name !== "string") return false;
      const normCat = normalizeForComparison(cat.name).replace(/books?$/, "");
      return normSlug === normCat || (normSlug.length > 5 && normCat.includes(normSlug)) || (normCat.length > 5 && normSlug.includes(normCat));
    });

    if (matched?.name) {
      return formatTitleCase(matched.name.trim());
    }
  }

  // 3. From SEO meta_title if valid and specific
  if (categoryData?.seo?.meta_title && typeof categoryData.seo.meta_title === "string" && categoryData.seo.meta_title.trim()) {
    const cleanMeta = categoryData.seo.meta_title
      .replace(/\s*[-|–]\s*Bookwindow.*$/i, "")
      .replace(/^Bookwindow\s*[-|–]\s*/i, "")
      .trim();
    if (cleanMeta && cleanMeta.toLowerCase() !== "category" && cleanMeta.toLowerCase() !== "bookwindow") {
      return formatTitleCase(cleanMeta);
    }
  }

  // 4. Fallback to cleaned slug
  if (slug) {
    return cleanSlugToTitle(slug);
  }

  return "Category";
}