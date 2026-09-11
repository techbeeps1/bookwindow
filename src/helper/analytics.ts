/**
 * Central Google Analytics 4 (GA4) & Meta Pixel (Facebook) E-commerce Tracker
 * BookWindow.in
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: (...args: any[]) => void;
  }
}

export interface AnalyticsItem {
  item_id: string | number;
  item_name: string;
  price: number | string;
  quantity?: number;
  item_category?: string;
  item_brand?: string;
}

export interface PurchaseEventPayload {
  orderNumber: string | number;
  total: number | string;
  subtotal?: number | string;
  shipping?: number | string;
  tax?: number | string;
  discount?: number | string;
  coupon?: string;
  currency?: string;
  items: Array<{
    id?: number | string;
    product_id?: number | string;
    product_name?: string;
    name?: string;
    price: number | string;
    quantity?: number;
    category?: string;
    category_name?: string;
  }>;
}

export interface AddToCartPayload {
  product_id: string | number;
  product_name: string;
  price: number | string;
  quantity?: number;
  category?: string;
}

export interface ViewItemPayload {
  product_id: string | number;
  product_name: string;
  price: number | string;
  category?: string;
}

/**
 * Helper to ensure dataLayer and gtag are initialized safely on window
 */
function ensureGtag() {
  if (typeof window === "undefined") return false;
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== "function") {
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };
  }
  return true;
}

/**
 * 1. Track Purchase (Conversion & Revenue in GA4 & Meta Pixel)
 * Triggered when order is confirmed (e.g. on view-orders / thank you page)
 */
export function trackPurchase(payload: PurchaseEventPayload) {
  if (typeof window === "undefined" || !payload || !payload.orderNumber) return;

  const orderNumStr = String(payload.orderNumber).trim();
  const sessionKey = `bw_tracked_order_${orderNumStr}`;

  // Deduplication: Prevent double-tracking on page refresh
  try {
    if (sessionStorage.getItem(sessionKey)) {
      console.log(`[Analytics] Purchase #${orderNumStr} already tracked in this session.`);
      return;
    }
  } catch (e) {
    // Ignore storage errors in private browsing
  }

  ensureGtag();

  const totalNum = Number(payload.total) || 0;
  const shippingNum = Number(payload.shipping) || 0;
  const taxNum = Number(payload.tax) || 0;
  const currency = payload.currency || "INR";

  const formattedItems = (payload.items || []).map((item) => ({
    item_id: String(item.product_id || item.id || ""),
    item_name: String(item.product_name || item.name || "Book").replace(/#COMMA#/g, ","),
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    item_category: item.category_name || item.category || undefined,
  }));

  // A. Clear previous ecommerce object & Push to GA4 via dataLayer & gtag
  try {
    window.dataLayer?.push({ ecommerce: null });
    window.dataLayer?.push({
      event: "purchase",
      ecommerce: {
        transaction_id: orderNumStr,
        value: totalNum,
        tax: taxNum,
        shipping: shippingNum,
        currency: currency,
        coupon: payload.coupon || undefined,
        items: formattedItems,
      },
    });

    if (typeof window.gtag === "function") {
      window.gtag("event", "purchase", {
        transaction_id: orderNumStr,
        value: totalNum,
        tax: taxNum,
        shipping: shippingNum,
        currency: currency,
        coupon: payload.coupon || undefined,
        items: formattedItems,
      });
    }

    console.log(`[Analytics] GA4 Purchase Event Fired: #${orderNumStr}, Total: ₹${totalNum}`);
  } catch (err) {
    console.error("[Analytics] Error tracking GA4 purchase:", err);
  }

  // B. Push to Meta Pixel (Facebook fbq)
  try {
    if (typeof window.fbq === "function") {
      window.fbq("track", "Purchase", {
        value: totalNum,
        currency: currency,
        content_type: "product",
        content_ids: formattedItems.map((i) => i.item_id),
        contents: formattedItems.map((i) => ({
          id: i.item_id,
          quantity: i.quantity,
          item_price: i.price,
        })),
        num_items: formattedItems.reduce((acc, curr) => acc + curr.quantity, 0),
      });
      console.log(`[Analytics] Meta Pixel Purchase Event Fired: #${orderNumStr}`);
    }
  } catch (err) {
    console.error("[Analytics] Error tracking Meta Pixel purchase:", err);
  }

  // Mark as tracked
  try {
    sessionStorage.setItem(sessionKey, "true");
  } catch (e) {}
}

/**
 * 2. Track Add To Cart
 */
export function trackAddToCart(payload: AddToCartPayload) {
  if (typeof window === "undefined" || !payload) return;
  ensureGtag();

  const price = Number(payload.price) || 0;
  const quantity = Number(payload.quantity) || 1;
  const itemId = String(payload.product_id);
  const itemName = String(payload.product_name).replace(/#COMMA#/g, ",");

  const itemObj = {
    item_id: itemId,
    item_name: itemName,
    price: price,
    quantity: quantity,
    item_category: payload.category || undefined,
  };

  try {
    window.dataLayer?.push({ ecommerce: null });
    window.dataLayer?.push({
      event: "add_to_cart",
      ecommerce: {
        currency: "INR",
        value: price * quantity,
        items: [itemObj],
      },
    });

    if (typeof window.gtag === "function") {
      window.gtag("event", "add_to_cart", {
        currency: "INR",
        value: price * quantity,
        items: [itemObj],
      });
    }

    console.log(`[Analytics] GA4 Add To Cart: ${itemName} (Qty: ${quantity}, ₹${price})`);
  } catch (err) {
    console.error("[Analytics] Error tracking add_to_cart:", err);
  }

  // Meta Pixel
  try {
    if (typeof window.fbq === "function") {
      window.fbq("track", "AddToCart", {
        value: price * quantity,
        currency: "INR",
        content_ids: [itemId],
        content_name: itemName,
        content_type: "product",
      });
    }
  } catch (err) {
    console.error("[Analytics] Error tracking Meta AddToCart:", err);
  }
}

/**
 * 3. Track Remove From Cart
 */
export function trackRemoveFromCart(payload: AddToCartPayload) {
  if (typeof window === "undefined" || !payload) return;
  ensureGtag();

  const price = Number(payload.price) || 0;
  const quantity = Number(payload.quantity) || 1;
  const itemId = String(payload.product_id);
  const itemName = String(payload.product_name).replace(/#COMMA#/g, ",");

  const itemObj = {
    item_id: itemId,
    item_name: itemName,
    price: price,
    quantity: quantity,
  };

  try {
    window.dataLayer?.push({ ecommerce: null });
    window.dataLayer?.push({
      event: "remove_from_cart",
      ecommerce: {
        currency: "INR",
        value: price * quantity,
        items: [itemObj],
      },
    });

    if (typeof window.gtag === "function") {
      window.gtag("event", "remove_from_cart", {
        currency: "INR",
        value: price * quantity,
        items: [itemObj],
      });
    }
    console.log(`[Analytics] GA4 Remove From Cart: ${itemName}`);
  } catch (err) {
    console.error("[Analytics] Error tracking remove_from_cart:", err);
  }
}

/**
 * 4. Track Begin Checkout
 */
export function trackBeginCheckout(items: any[], totalValue: number | string) {
  if (typeof window === "undefined" || !Array.isArray(items) || items.length === 0) return;
  ensureGtag();

  const value = Number(totalValue) || 0;
  const formattedItems = items.map((it) => ({
    item_id: String(it.product_id || it.id || ""),
    item_name: String(it.product_name || it.name || "Book").replace(/#COMMA#/g, ","),
    price: Number(it.product_price || it.price || 0),
    quantity: Number(it.quantity || 1),
  }));

  try {
    window.dataLayer?.push({ ecommerce: null });
    window.dataLayer?.push({
      event: "begin_checkout",
      ecommerce: {
        currency: "INR",
        value: value,
        items: formattedItems,
      },
    });

    if (typeof window.gtag === "function") {
      window.gtag("event", "begin_checkout", {
        currency: "INR",
        value: value,
        items: formattedItems,
      });
    }
    console.log(`[Analytics] GA4 Begin Checkout: ₹${value}, Items: ${formattedItems.length}`);
  } catch (err) {
    console.error("[Analytics] Error tracking begin_checkout:", err);
  }

  // Meta Pixel
  try {
    if (typeof window.fbq === "function") {
      window.fbq("track", "InitiateCheckout", {
        value: value,
        currency: "INR",
        content_ids: formattedItems.map((i) => i.item_id),
        num_items: formattedItems.reduce((acc, curr) => acc + curr.quantity, 0),
      });
    }
  } catch (err) {
    console.error("[Analytics] Error tracking Meta InitiateCheckout:", err);
  }
}

/**
 * 5. Track Product Detail View
 */
export function trackViewItem(payload: ViewItemPayload) {
  if (typeof window === "undefined" || !payload || !payload.product_id) return;
  ensureGtag();

  const price = Number(payload.price) || 0;
  const itemId = String(payload.product_id);
  const itemName = String(payload.product_name).replace(/#COMMA#/g, ",");

  const itemObj = {
    item_id: itemId,
    item_name: itemName,
    price: price,
    item_category: payload.category || undefined,
  };

  try {
    window.dataLayer?.push({ ecommerce: null });
    window.dataLayer?.push({
      event: "view_item",
      ecommerce: {
        currency: "INR",
        value: price,
        items: [itemObj],
      },
    });

    if (typeof window.gtag === "function") {
      window.gtag("event", "view_item", {
        currency: "INR",
        value: price,
        items: [itemObj],
      });
    }
    console.log(`[Analytics] GA4 View Item: ${itemName} (₹${price})`);
  } catch (err) {
    console.error("[Analytics] Error tracking view_item:", err);
  }

  // Meta Pixel
  try {
    if (typeof window.fbq === "function") {
      window.fbq("track", "ViewContent", {
        value: price,
        currency: "INR",
        content_name: itemName,
        content_ids: [itemId],
        content_type: "product",
      });
    }
  } catch (err) {
    console.error("[Analytics] Error tracking Meta ViewContent:", err);
  }
}
