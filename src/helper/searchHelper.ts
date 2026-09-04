/**
 * Smart Search Utility for Bookwindow (LIKE / OR token search with relevance ranking)
 *
 * Behavior:
 * - If user enters "reet buk", "reet" matches -> all REET books appear immediately.
 * - Whether "buk" or any other word matches or not, any book matching "reet" is included.
 * - Books matching MORE words appear higher in ranking (e.g. "reet sanskrit" puts the Sanskrit REET book on top, while still showing other REET books).
 */

export interface TokenizedQuery {
  raw: string;
  tokens: string[];
}

export function tokenizeQuery(query: string): TokenizedQuery {
  const normalized = (query || "").toLowerCase().trim();
  if (!normalized) {
    return { raw: "", tokens: [] };
  }

  // Split by whitespace and common punctuation, retaining letters, numbers, and hindi characters
  const tokens = normalized
    .split(/[\s,+/\\-]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  return {
    raw: normalized,
    tokens,
  };
}

export function calculateRelevanceScore(
  product: any,
  queryData: TokenizedQuery
): number {
  if (!product || queryData.tokens.length === 0) return 0;

  const rawQuery = queryData.raw;
  const tokens = queryData.tokens;

  const name = (product.name || "").toLowerCase();
  const author = (product.author || "").toLowerCase();
  const model = (product.model || "").toLowerCase();
  const sku = (product.sku || "").toLowerCase();
  const subTitle = (product.sub_title || "").toLowerCase();
  const desc = (product.description || "").toLowerCase();
  const language = (product.book_language || "").toLowerCase();

  const combinedSearchable = `${name} ${author} ${model} ${sku} ${subTitle} ${desc} ${language}`;

  // LIKE Query behavior: check which tokens match anywhere in the product
  const matchedTokens = tokens.filter((token) =>
    combinedSearchable.includes(token)
  );

  // If none of the words matched anywhere, exclude this product
  if (matchedTokens.length === 0) {
    return 0;
  }

  let score = 0;

  // 1. More words matched = much higher ranking
  score += matchedTokens.length * 60;

  // 2. Full exact phrase match in title (e.g. "reet level 1" in exact order)
  if (name.includes(rawQuery)) {
    score += 250;
  } else if (name.startsWith(rawQuery)) {
    score += 300;
  }

  if (author.includes(rawQuery)) {
    score += 100;
  }

  if (model.includes(rawQuery) || sku.includes(rawQuery)) {
    score += 100;
  }

  // 3. All tokens matched bonus
  if (matchedTokens.length === tokens.length) {
    score += 120;
    if (tokens.every((t) => name.includes(t))) {
      score += 80;
    }
  }

  // 4. Token-by-token scoring (Title matches are weighted higher than description)
  matchedTokens.forEach((token) => {
    const nameWords = name.split(/\s+/);
    if (nameWords.includes(token)) {
      score += 40;
    } else if (name.includes(token)) {
      score += 25;
    }

    if (nameWords.some((w: string) => w.startsWith(token))) {
      score += 20;
    }

    if (author.includes(token)) {
      score += 30;
    }

    if (model.includes(token) || sku.includes(token)) {
      score += 25;
    }

    if (subTitle.includes(token)) {
      score += 15;
    }

    if (desc.includes(token)) {
      score += 5;
    }
  });

  // Small visibility boost
  if (product.is_visible) {
    score += 1;
  }

  return score;
}

/**
 * Filter and rank products based on search query (LIKE query behavior)
 * @param products List of all products
 * @param query Search query string
 * @returns Sorted array of products matching any of the search words
 */
export function filterAndRankProducts(products: any[], query: string): any[] {
  if (!Array.isArray(products) || products.length === 0) return [];
  const trimmed = (query || "").trim();
  if (!trimmed) return products;

  const queryData = tokenizeQuery(trimmed);
  if (queryData.tokens.length === 0) return products;

  const scoredProducts: { product: any; score: number }[] = [];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const score = calculateRelevanceScore(p, queryData);
    if (score > 0) {
      scoredProducts.push({ product: p, score });
    }
  }

  // Sort descending by score (most relevant first)
  scoredProducts.sort((a, b) => b.score - a.score);

  return scoredProducts.map((item) => item.product);
}
