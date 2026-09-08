declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type TrackingEventType =
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "Purchase"
  | "Search";

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
        ViewContent: "view_item",
        AddToCart: "add_to_cart",
        InitiateCheckout: "begin_checkout",
        Purchase: "purchase",
        Search: "search",
      };

      const gaEventName = gaEventMap[event] || event;
      window.gtag("event", gaEventName, {
        value: normalizedPayload.value,
        currency: defaultCurrency,
        items: normalizedPayload.content_ids?.map((id) => ({
          item_id: id,
          item_name: normalizedPayload.content_name,
          item_category: normalizedPayload.content_category,
          price: normalizedPayload.value,
        })),
        search_term: normalizedPayload.search_string,
        transaction_id: normalizedPayload.order_id,
      });
    } catch (err) {
      console.warn("GA4 tracking error:", err);
    }
  }

  // 3. Google Tag Manager (DataLayer)
  if (Array.isArray(window.dataLayer)) {
    try {
      window.dataLayer.push({
        event: `custom_${event.toLowerCase()}`,
        event_id: eventId,
        ecommerce: normalizedPayload,
      });
    } catch (err) {
      console.warn("GTM DataLayer error:", err);
    }
  }

  // 4. Server-Side Meta Conversions API (CAPI)
  if (
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
