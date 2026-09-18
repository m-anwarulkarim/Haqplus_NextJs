declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type TrackingEventType =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase"
  | "Search";

export interface TrackingItem {
  item_id: string;
  item_name?: string;
  item_category?: string;
  price?: number;
  quantity?: number;
}

export interface TrackingPayload {
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  value?: number;
  currency?: string;
  search_string?: string;
  num_items?: number;
  order_id?: string;
  items?: TrackingItem[];
  [key: string]: unknown;
}

/**
 * Universal Event Tracker for Meta Pixel, Google Analytics 4, and GTM.
 */
export function trackEvent(event: TrackingEventType, payload: TrackingPayload = {}) {
  if (typeof window === "undefined") return;

  const defaultCurrency = payload.currency || "BDT";
  const normalizedPayload = {
    ...payload,
    currency: defaultCurrency,
  };

  const eventId =
    payload.order_id ||
    `evt_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

  // 1. Meta Pixel with eventID for server deduplication
  if (typeof window.fbq === "function") {
    try {
      window.fbq("track", event, normalizedPayload, { eventID: eventId });
    } catch (err) {
      console.warn("Meta Pixel tracking error:", err);
    }
  }

  // 2. Google Analytics 4 (gtag)
  if (typeof window.gtag === "function") {
    try {
      const gaEventMap: Record<TrackingEventType, string> = {
        PageView: "page_view",
        ViewContent: "view_item",
        AddToCart: "add_to_cart",
        InitiateCheckout: "begin_checkout",
        Purchase: "purchase",
        Search: "search",
      };

      const gaEventName = gaEventMap[event] || event;
      const gaItems =
        payload.items && payload.items.length > 0
          ? payload.items.map((it) => ({
              item_id: it.item_id,
              item_name: it.item_name,
              item_category: it.item_category,
              price: it.price,
              quantity: it.quantity || 1,
            }))
          : normalizedPayload.content_ids?.map((id) => ({
              item_id: id,
              item_name: normalizedPayload.content_name,
              item_category: normalizedPayload.content_category,
              price:
                normalizedPayload.value && normalizedPayload.num_items
                  ? normalizedPayload.value / normalizedPayload.num_items
                  : normalizedPayload.value,
              quantity: normalizedPayload.num_items || 1,
            }));

      window.gtag("event", gaEventName, {
        value: normalizedPayload.value,
        currency: defaultCurrency,
        items: gaItems,
        search_term: normalizedPayload.search_string,
        transaction_id: normalizedPayload.order_id,
      });
    } catch (err) {
      console.warn("GA4 tracking error:", err);
    }
  }

  // 3. Google Tag Manager (DataLayer)
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    try {
      // Clear previous ecommerce object to prevent parameter leaks (Google GTM recommendation)
      window.dataLayer.push({ ecommerce: null });

      const gtmEventMap: Record<TrackingEventType, string> = {
        PageView: "page_view",
        ViewContent: "view_item",
        AddToCart: "add_to_cart",
        InitiateCheckout: "begin_checkout",
        Purchase: "purchase",
        Search: "search",
      };

      const gtmEventName = gtmEventMap[event] || event.toLowerCase();

      const gtmItems =
        payload.items && payload.items.length > 0
          ? payload.items.map((it) => ({
              item_id: it.item_id,
              item_name: it.item_name,
              item_category: it.item_category,
              price: it.price,
              quantity: it.quantity || 1,
            }))
          : normalizedPayload.content_ids?.map((id) => ({
              item_id: id,
              item_name: normalizedPayload.content_name,
              item_category: normalizedPayload.content_category,
              price:
                normalizedPayload.value && normalizedPayload.num_items
                  ? normalizedPayload.value / normalizedPayload.num_items
                  : normalizedPayload.value,
              quantity: normalizedPayload.num_items || 1,
            }));

      const ecommerceObject: Record<string, unknown> = {
        currency: defaultCurrency,
        value: normalizedPayload.value,
        items: gtmItems,
      };

      if (normalizedPayload.order_id) {
        ecommerceObject.transaction_id = normalizedPayload.order_id;
      }
      if (normalizedPayload.search_string) {
        ecommerceObject.search_term = normalizedPayload.search_string;
      }

      window.dataLayer.push({
        event: gtmEventName,
        event_id: eventId,
        ecommerce: ecommerceObject,
        custom_event_name: `custom_${event.toLowerCase()}`,
      });
    } catch (err) {
      console.warn("GTM DataLayer error:", err);
    }
  }

  // 4. Server-Side Meta Conversions API (CAPI)
  if (
    event === "PageView" ||
    event === "Purchase" ||
    event === "InitiateCheckout" ||
    event === "AddToCart" ||
    event === "ViewContent"
  ) {
    fetch("/api/tracking/conversion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventName: event,
        eventId,
        eventSourceUrl: window.location.href,
        customData: normalizedPayload,
      }),
    }).catch(() => {
      // Fire and forget server tracking
    });
  }
}
