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
  coupon?: string;
  discount?: number | string;
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
    coupon?: string;
    discount?: number | string;
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

export interface ApplyCouponPayload {
  coupon: string;
  discount?: number | string;
  value?: number | string;
  currency?: string;
  items?: any[];
}

export interface RemoveCouponPayload {
  coupon: string;
  currency?: string;
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
  const discountNum = Number(payload.discount) || 0;
  const currency = payload.currency || "INR";
  const couponCode = payload.coupon ? String(payload.coupon).trim().toUpperCase() : undefined;

  const formattedItems = (payload.items || []).map((item) => ({
    item_id: String(item.product_id || item.id || ""),
    item_name: String(item.product_name || item.name || "Book").replace(/#COMMA#/g, ","),
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    item_category: item.category_name || item.category || undefined,
    coupon: item.coupon ? String(item.coupon).trim().toUpperCase() : couponCode,
    discount: Number(item.discount || 0) || undefined,
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
        coupon: couponCode,
        discount: discountNum > 0 ? discountNum : undefined,
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
        coupon: couponCode,
        discount: discountNum > 0 ? discountNum : undefined,
        items: formattedItems,
      });
    }

    console.log(
      `[Analytics] GA4 Purchase Event Fired: #${orderNumStr}, Total: ₹${totalNum}, Coupon: ${couponCode || "None"}${
        discountNum > 0 ? `, Discount: ₹${discountNum}` : ""
      }`
    );
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
        coupon: couponCode,
      });
      console.log(`[Analytics] Meta Pixel Purchase Event Fired: #${orderNumStr} (Coupon: ${couponCode || "None"})`);
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
export function trackBeginCheckout(items: any[], totalValue: number | string, coupon?: string) {
  if (typeof window === "undefined" || !Array.isArray(items) || items.length === 0) return;
  ensureGtag();

  const value = Number(totalValue) || 0;
  const couponCode = coupon ? String(coupon).trim().toUpperCase() : undefined;
  const formattedItems = items.map((it) => ({
    item_id: String(it.product_id || it.id || ""),
    item_name: String(it.product_name || it.name || "Book").replace(/#COMMA#/g, ","),
    price: Number(it.product_price || it.price || 0),
    quantity: Number(it.quantity || 1),
    coupon: couponCode,
  }));

  try {
    window.dataLayer?.push({ ecommerce: null });
    window.dataLayer?.push({
      event: "begin_checkout",
      ecommerce: {
        currency: "INR",
        value: value,
        coupon: couponCode,
        items: formattedItems,
      },
    });

    if (typeof window.gtag === "function") {
      window.gtag("event", "begin_checkout", {
        currency: "INR",
        value: value,
        coupon: couponCode,
        items: formattedItems,
      });
    }
    console.log(
      `[Analytics] GA4 Begin Checkout: ₹${value}, Items: ${formattedItems.length}${
        couponCode ? `, Coupon: ${couponCode}` : ""
      }`
    );
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
        coupon: couponCode,
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

/**
 * 6. Track Apply Coupon
 * Triggered when a coupon is successfully applied in Cart / Checkout
 */
export function trackApplyCoupon(payload: ApplyCouponPayload) {
  if (typeof window === "undefined" || !payload || !payload.coupon) return;
  ensureGtag();

  const couponCode = String(payload.coupon).trim().toUpperCase();
  const discountNum = Number(payload.discount) || 0;
  const valueNum = Number(payload.value) || 0;
  const currency = payload.currency || "INR";

  const formattedItems = (payload.items || []).map((it) => ({
    item_id: String(it.product_id || it.id || ""),
    item_name: String(it.product_name || it.name || "Book").replace(/#COMMA#/g, ","),
    price: Number(it.product_price || it.price || 0),
    quantity: Number(it.quantity || 1),
    coupon: couponCode,
    discount: discountNum > 0 ? discountNum : undefined,
  }));

  // A. Push to GA4 via dataLayer & gtag
  try {
    window.dataLayer?.push({ ecommerce: null });
    window.dataLayer?.push({
      event: "apply_coupon",
      ecommerce: {
        currency: currency,
        coupon: couponCode,
        discount: discountNum > 0 ? discountNum : undefined,
        value: valueNum > 0 ? valueNum : undefined,
        items: formattedItems.length > 0 ? formattedItems : undefined,
      },
    });

    if (typeof window.gtag === "function") {
      window.gtag("event", "apply_coupon", {
        currency: currency,
        coupon: couponCode,
        discount: discountNum > 0 ? discountNum : undefined,
        value: valueNum > 0 ? valueNum : undefined,
        items: formattedItems.length > 0 ? formattedItems : undefined,
      });

      // Also trigger select_promotion for GA4 promotion analytics
      window.gtag("event", "select_promotion", {
        promotion_id: couponCode,
        promotion_name: couponCode,
        creative_name: "checkout_coupon",
        currency: currency,
        items: formattedItems.length > 0 ? formattedItems : undefined,
      });
    }

    console.log(
      `[Analytics] GA4 Coupon Applied: ${couponCode}${
        discountNum > 0 ? ` (Discount: ₹${discountNum})` : ""
      }${valueNum > 0 ? ` (Cart Value: ₹${valueNum})` : ""}`
    );
  } catch (err) {
    console.error("[Analytics] Error tracking apply_coupon:", err);
  }

  // B. Push to Meta Pixel
  try {
    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", "ApplyCoupon", {
        coupon: couponCode,
        discount: discountNum,
        value: valueNum,
        currency: currency,
      });
      console.log(`[Analytics] Meta Pixel ApplyCoupon Fired: ${couponCode}`);
    }
  } catch (err) {
    console.error("[Analytics] Error tracking Meta ApplyCoupon:", err);
  }
}

/**
 * 7. Track Remove Coupon
 * Triggered when an applied coupon is removed by the user
 */
export function trackRemoveCoupon(payload: RemoveCouponPayload) {
  if (typeof window === "undefined" || !payload || !payload.coupon) return;
  ensureGtag();

  const couponCode = String(payload.coupon).trim().toUpperCase();
  const currency = payload.currency || "INR";

  try {
    window.dataLayer?.push({ ecommerce: null });
    window.dataLayer?.push({
      event: "remove_coupon",
      ecommerce: {
        currency: currency,
        coupon: couponCode,
      },
    });

    if (typeof window.gtag === "function") {
      window.gtag("event", "remove_coupon", {
        currency: currency,
        coupon: couponCode,
      });
    }

    console.log(`[Analytics] GA4 Coupon Removed: ${couponCode}`);
  } catch (err) {
    console.error("[Analytics] Error tracking remove_coupon:", err);
  }

  try {
    if (typeof window.fbq === "function") {
      window.fbq("trackCustom", "RemoveCoupon", {
        coupon: couponCode,
        currency: currency,
      });
      console.log(`[Analytics] Meta Pixel RemoveCoupon Fired: ${couponCode}`);
    }
  } catch (err) {
    console.error("[Analytics] Error tracking Meta RemoveCoupon:", err);
  }
}

/**
 * 8. Track Promotion Views (e.g. available coupons list viewed in drawer)
 */
export function trackViewPromotions(promotions: Array<{ id?: string | number; name?: string; code?: string }>) {
  if (typeof window === "undefined" || !Array.isArray(promotions) || promotions.length === 0) return;
  ensureGtag();

  const formattedPromos = promotions.map((p) => ({
    promotion_id: String(p.code || p.id || ""),
    promotion_name: String(p.name || p.code || "Coupon Offer"),
    creative_name: "coupon_drawer",
  }));

  try {
    window.dataLayer?.push({ ecommerce: null });
    window.dataLayer?.push({
      event: "view_promotion",
      ecommerce: {
        items: formattedPromos,
      },
    });

    if (typeof window.gtag === "function") {
      window.gtag("event", "view_promotion", {
        items: formattedPromos,
      });
    }

    console.log(`[Analytics] GA4 View Promotion: ${formattedPromos.length} offers shown`);
  } catch (err) {
    console.error("[Analytics] Error tracking view_promotion:", err);
  }
}
