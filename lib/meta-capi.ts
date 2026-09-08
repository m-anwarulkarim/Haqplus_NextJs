import crypto from "node:crypto";
import { prisma } from "@/lib/prisma";

export interface MetaUserData {
  email?: string | null;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  country?: string | null;
  clientIp?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null; // _fbp cookie
  fbc?: string | null; // _fbc cookie
}

export interface MetaCustomData {
  value?: number;
  currency?: string;
  content_name?: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
  num_items?: number;
  order_id?: string;
  [key: string]: unknown;
}

export interface MetaCapiPayload {
  eventName: string;
  eventId?: string;
  eventSourceUrl?: string;
  userData?: MetaUserData;
  customData?: MetaCustomData;
  testEventCode?: string;
}

/**
 * Normalizes and hashes strings according to Meta Graph API specifications (SHA-256).
 */
export function hashSha256(val: string | null | undefined): string | undefined {
  if (!val) return undefined;
  const cleaned = val.trim().toLowerCase();
  if (!cleaned) return undefined;
  return crypto.createHash("sha256").update(cleaned).digest("hex");
}

/**
 * Normalizes phone numbers (handles BD numbers +880 or 01X...) to E.164 digits without + or spaces
 */
export function normalizePhone(phone: string | null | undefined): string | undefined {
  if (!phone) return undefined;
  let cleaned = phone.replace(/[^0-9]/g, "");
  // If local BD format starting with 01X (11 digits), prefix 88
  if (cleaned.startsWith("01") && cleaned.length === 11) {
    cleaned = `88${cleaned}`;
  }
  return hashSha256(cleaned);
}

/**
 * Retrieves Meta Pixel ID, Access Token, and Test Event Code from database or environment.
 */
export async function getMetaCapiCredentials() {
  try {
    const settings = await prisma.setting.findMany({
      where: {
        key: { in: ["metaPixelId", "metaAccessToken", "metaTestEventCode"] },
      },
    });

    const config: Record<string, string> = {};
    for (const s of settings) {
      config[s.key] = s.value;
    }

    const pixelId =
      config.metaPixelId ||
      process.env.META_PIXEL_ID ||
      process.env.NEXT_PUBLIC_META_PIXEL_ID ||
      "";

    const accessToken =
      config.metaAccessToken ||
      process.env.META_ACCESS_TOKEN ||
      "";

    const testEventCode =
      config.metaTestEventCode ||
      process.env.META_TEST_EVENT_CODE ||
      "";

    return { pixelId, accessToken, testEventCode };
  } catch (err) {
    console.warn("Could not query Meta CAPI credentials from DB:", err);
    return {
      pixelId: process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID || "",
      accessToken: process.env.META_ACCESS_TOKEN || "",
      testEventCode: process.env.META_TEST_EVENT_CODE || "",
    };
  }
}

/**
 * Sends a server-side conversion event to Meta Conversions API (Graph API v19.0).
 */
export async function sendMetaCapiEvent(payload: MetaCapiPayload) {
  const creds = await getMetaCapiCredentials();

  if (!creds.pixelId || !creds.accessToken) {
    console.info("Meta Conversions API: Credentials not configured, skipping.");
    return {
      success: false,
      skipped: true,
      message: "Meta Pixel ID or Access Token not configured in Admin > Marketing Settings",
    };
  }

  const { userData, customData } = payload;

  // Split name if first/last not explicitly separated
  let fn = userData?.firstName;
  let ln = userData?.lastName;
  if (!fn && !ln && (userData as any)?.name) {
    const parts = (userData as any).name.trim().split(" ");
    fn = parts[0];
    ln = parts.slice(1).join(" ") || undefined;
  }

  const user_data: Record<string, unknown> = {
    client_ip_address: userData?.clientIp || undefined,
    client_user_agent: userData?.clientUserAgent || undefined,
    fbp: userData?.fbp || undefined,
    fbc: userData?.fbc || undefined,
  };

  if (userData?.email) user_data.em = [hashSha256(userData.email)];
  if (userData?.phone) user_data.ph = [normalizePhone(userData.phone)];
  if (fn) user_data.fn = [hashSha256(fn)];
  if (ln) user_data.ln = [hashSha256(ln)];
  if (userData?.city) user_data.ct = [hashSha256(userData.city)];
  if (userData?.country) user_data.country = [hashSha256(userData.country || "bd")];

  const eventPayload: Record<string, unknown> = {
    event_name: payload.eventName,
    event_time: Math.floor(Date.now() / 1000),
    action_source: "website",
    event_source_url: payload.eventSourceUrl || "https://apexstore.com",
    user_data,
  };

  if (payload.eventId) {
    eventPayload.event_id = payload.eventId;
  }

  if (customData) {
    eventPayload.custom_data = {
      ...customData,
      currency: customData.currency || "BDT",
    };
  }

  const requestBody: Record<string, unknown> = {
    data: [eventPayload],
  };

  const testCode = payload.testEventCode || creds.testEventCode;
  if (testCode) {
    requestBody.test_event_code = testCode;
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${creds.pixelId}/events?access_token=${creds.accessToken}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Meta CAPI Error Response:", data);
      return {
        success: false,
        status: response.status,
        error: data.error?.message || "Failed to dispatch event to Meta Conversions API",
        details: data,
      };
    }

    return {
      success: true,
      eventsReceived: data.events_received,
      fbtraceId: data.fbtrace_id,
      messages: data.messages,
    };
  } catch (error: any) {
    console.error("Meta CAPI Network Error:", error);
    return {
      success: false,
      error: error.message || "Network error dispatching Meta CAPI event",
    };
  }
}
