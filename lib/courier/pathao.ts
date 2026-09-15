import { getResilientSetting, getAllResilientSettings } from "@/lib/settings-store";

const PATHAO_DEFAULT_BASE_URL = "https://api-hermes.pathao.com";

export interface PathaoCredentials {
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  baseUrl: string;
}

/** 1. Fetch Pathao Resilient Credentials */
export async function getPathaoCredentials(): Promise<PathaoCredentials | null> {
  const dbSettings = await getAllResilientSettings();
  const clientId = dbSettings.PATHAO_CLIENT_ID || process.env.PATHAO_CLIENT_ID || "MvbmODneYA";
  const clientSecret = dbSettings.PATHAO_CLIENT_SECRET || process.env.PATHAO_CLIENT_SECRET || "IOVoc6Idv9dfRcPO9OK9uC9gvAhUmlkF";
  const username = dbSettings.PATHAO_USERNAME || process.env.PATHAO_USERNAME || "";
  const password = dbSettings.PATHAO_PASSWORD || process.env.PATHAO_PASSWORD || "";
  const baseUrl = dbSettings.PATHAO_BASE_URL || process.env.PATHAO_BASE_URL || PATHAO_DEFAULT_BASE_URL;

  if (username && password) {
    return { clientId, clientSecret, username, password, baseUrl };
  }
  return null;
}

/** 2. Issue Pathao OAuth Bearer Token */
export async function getPathaoAccessToken(): Promise<string | null> {
  const creds = await getPathaoCredentials();
  if (!creds) return null;

  try {
    const res = await fetch(`${creds.baseUrl}/aladdin/api/v1/issue-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: creds.clientId,
        client_secret: creds.clientSecret,
        username: creds.username,
        password: creds.password,
        grant_type: "password",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.access_token || null;
    }
  } catch (error) {
    console.error("Pathao access token error:", error);
  }
  return null;
}

/** 3. Fetch Pathao Merchant Store List */
export async function getPathaoStores() {
  const token = await getPathaoAccessToken();
  const creds = await getPathaoCredentials();
  if (!token || !creds) return { status: 400, error: "Pathao API credentials required" };

  try {
    const res = await fetch(`${creds.baseUrl}/aladdin/api/v1/stores`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      return await res.json();
    }
    return { status: res.status, error: "Failed to fetch Pathao store list" };
  } catch (error: any) {
    console.error("Pathao stores error:", error);
    return { status: 500, error: error.message };
  }
}

/** 4. Fetch Pathao Cities */
export async function getPathaoCities() {
  const token = await getPathaoAccessToken();
  const creds = await getPathaoCredentials();
  if (!token || !creds) return { status: 400, error: "Pathao API credentials required" };

  try {
    const res = await fetch(`${creds.baseUrl}/aladdin/api/v1/countries/1/city-list`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (res.ok) {
      return await res.json();
    }
    return { status: res.status, error: "Failed to fetch Pathao city list" };
  } catch (error: any) {
    console.error("Pathao cities error:", error);
    return { status: 500, error: error.message };
  }
}

/** 5. Create Single Pathao Order Consignment */
export interface PathaoCreateOrderPayload {
  store_id: number | string;
  merchant_order_id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_address: string;
  recipient_city: number | string;
  recipient_zone: number | string;
  recipient_area?: number | string;
  delivery_type: number; // 48 = Normal Delivery, 12 = On Demand
  item_type: number; // 1 = Document, 2 = Parcel
  special_instruction?: string;
  item_quantity: number;
  item_weight: number;
  amount_to_collect: number;
  item_description?: string;
}

export async function createPathaoOrder(payload: PathaoCreateOrderPayload) {
  const token = await getPathaoAccessToken();
  const creds = await getPathaoCredentials();
  if (!token || !creds) {
    return {
      status: 400,
      message: "Pathao API credentials required. Please configure Pathao credentials in Admin -> API Integration.",
    };
  }

  try {
    const res = await fetch(`${creds.baseUrl}/aladdin/api/v1/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data;
  } catch (error: any) {
    console.error("Pathao create order error:", error);
    return { status: 500, message: error.message || "Failed to dispatch order to Pathao Courier" };
  }
}

/** 6. Track Pathao Order Status by Consignment ID */
export async function getPathaoOrderStatus(consignmentId: string) {
  const token = await getPathaoAccessToken();
  const creds = await getPathaoCredentials();
  if (!token || !creds) {
    return { status: 400, error: "Pathao credentials missing" };
  }

  try {
    const res = await fetch(`${creds.baseUrl}/aladdin/api/v1/orders/${encodeURIComponent(consignmentId)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
    return { status: res.status, error: "Order consignment not found in Pathao" };
  } catch (error: any) {
    console.error("Pathao status check error:", error);
    return { status: 500, error: error.message || "Failed to query Pathao order status" };
  }
}
