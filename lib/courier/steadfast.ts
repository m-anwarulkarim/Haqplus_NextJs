import { getResilientSetting } from "@/lib/settings-store";

const STEADFAST_BASE_URL = "https://portal.packzy.com/api/v1";

interface SteadfastCredentials {
  apiKey: string;
  secretKey: string;
}

export async function getSteadfastCredentials(): Promise<SteadfastCredentials | null> {
  const apiKey = await getResilientSetting("STEADFAST_API_KEY");
  const secretKey = await getResilientSetting("STEADFAST_SECRET_KEY");

  if (apiKey && secretKey && apiKey.trim() !== "" && secretKey.trim() !== "") {
    return { apiKey: apiKey.trim(), secretKey: secretKey.trim() };
  }
  return null;
}

export interface SteadfastCreateOrderPayload {
  invoice: string;
  recipient_name: string;
  recipient_phone: string;
  alternative_phone?: string;
  recipient_email?: string;
  recipient_address: string;
  cod_amount: number;
  note?: string;
  item_description?: string;
  total_lot?: number;
  delivery_type?: number; // 0 = Home Delivery, 1 = Hub Pick Up
}

export interface SteadfastOrderResponse {
  status: number;
  message?: string;
  isSimulated?: boolean;
  consignment?: {
    consignment_id: number | string;
    invoice: string;
    tracking_code: string;
    recipient_name: string;
    recipient_phone: string;
    recipient_address: string;
    cod_amount: number;
    status: string;
    note?: string;
    created_at?: string;
    updated_at?: string;
  };
  errors?: Record<string, string[]>;
}

/** 1. Create Single Order */
export async function createSteadfastOrder(
  payload: SteadfastCreateOrderPayload
): Promise<SteadfastOrderResponse> {
  const creds = await getSteadfastCredentials();

  if (!creds) {
    return {
      status: 400,
      message: "Steadfast Courier API Key & Secret Key strictly required. Please set up Steadfast API credentials in Admin -> API Integration first.",
    };
  }

  try {
    const body: Record<string, any> = {
      invoice: payload.invoice,
      recipient_name: payload.recipient_name,
      recipient_phone: payload.recipient_phone,
      recipient_address: payload.recipient_address,
      cod_amount: payload.cod_amount,
      note: payload.note || "",
    };

    if (payload.alternative_phone) body.alternative_phone = payload.alternative_phone;
    if (payload.recipient_email) body.recipient_email = payload.recipient_email;
    if (payload.item_description) body.item_description = payload.item_description;
    if (payload.total_lot !== undefined) body.total_lot = payload.total_lot;
    if (payload.delivery_type !== undefined) body.delivery_type = payload.delivery_type;

    const res = await fetch(`${STEADFAST_BASE_URL}/create_order`, {
      method: "POST",
      headers: {
        "Api-Key": creds.apiKey,
        "Secret-Key": creds.secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Steadfast API request error:", error);
    throw new Error("Failed to dispatch consignment to Steadfast Courier");
  }
}

/** 2. Bulk Order Create (max 500 items) */
export async function createSteadfastBulkOrders(
  ordersPayload: SteadfastCreateOrderPayload[]
) {
  const creds = await getSteadfastCredentials();

  if (!creds) {
    throw new Error("Steadfast Courier API Key & Secret Key strictly required. Configure API Keys in Admin -> API Integration first.");
  }

  try {
    const formattedData = ordersPayload.map((item) => ({
      invoice: item.invoice,
      recipient_name: item.recipient_name,
      recipient_address: item.recipient_address,
      recipient_phone: item.recipient_phone,
      cod_amount: item.cod_amount,
      note: item.note || "",
    }));

    const res = await fetch(`${STEADFAST_BASE_URL}/create_order/bulk-order`, {
      method: "POST",
      headers: {
        "Api-Key": creds.apiKey,
        "Secret-Key": creds.secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: JSON.stringify(formattedData) }),
    });

    return await res.json();
  } catch (error) {
    console.error("Steadfast Bulk Create error:", error);
    throw new Error("Failed to bulk create orders with Steadfast");
  }
}

/** 3. Check Delivery Status by Tracking Code */
export async function getSteadfastStatusByTrackingCode(trackingCode: string) {
  const creds = await getSteadfastCredentials();
  if (!creds) {
    return {
      status: 400,
      error: "Steadfast API Key not configured. Please add API credentials in Admin -> API.",
    };
  }

  try {
    const res = await fetch(
      `${STEADFAST_BASE_URL}/status_by_trackingcode/${encodeURIComponent(trackingCode)}`,
      {
        headers: {
          "Api-Key": creds.apiKey,
          "Secret-Key": creds.secretKey,
        },
      }
    );
    return await res.json();
  } catch (error) {
    console.error("Steadfast tracking check error:", error);
    return { status: 500, delivery_status: "unknown" };
  }
}

/** 4. Check Delivery Status by Consignment ID */
export async function getSteadfastStatusByCid(cid: string | number) {
  const creds = await getSteadfastCredentials();
  if (!creds) {
    return {
      status: 400,
      error: "Steadfast API Key not configured.",
    };
  }

  try {
    const res = await fetch(
      `${STEADFAST_BASE_URL}/status_by_cid/${encodeURIComponent(cid)}`,
      {
        headers: {
          "Api-Key": creds.apiKey,
          "Secret-Key": creds.secretKey,
        },
      }
    );
    return await res.json();
  } catch (error) {
    console.error("Steadfast status by CID error:", error);
    return { status: 500, delivery_status: "unknown" };
  }
}

/** 5. Check Delivery Status by Invoice ID */
export async function getSteadfastStatusByInvoice(invoice: string) {
  const creds = await getSteadfastCredentials();
  if (!creds) {
    return {
      status: 400,
      error: "Steadfast API Key not configured.",
    };
  }

  try {
    const res = await fetch(
      `${STEADFAST_BASE_URL}/status_by_invoice/${encodeURIComponent(invoice)}`,
      {
        headers: {
          "Api-Key": creds.apiKey,
          "Secret-Key": creds.secretKey,
        },
      }
    );
    return await res.json();
  } catch (error) {
    console.error("Steadfast status by invoice error:", error);
    return { status: 500, delivery_status: "unknown" };
  }
}

/** 6. Checking Current Balance */
export async function getSteadfastBalance() {
  const creds = await getSteadfastCredentials();
  if (!creds) {
    return {
      status: 400,
      current_balance: 0,
      error: "Steadfast API Key missing. Please configure credentials in Admin -> API Integration.",
    };
  }

  try {
    const res = await fetch(`${STEADFAST_BASE_URL}/get_balance`, {
      headers: {
        "Api-Key": creds.apiKey,
        "Secret-Key": creds.secretKey,
      },
    });
    return await res.json();
  } catch (error) {
    console.error("Steadfast balance check error:", error);
    return { status: 500, current_balance: 0, error: "Failed to connect to Steadfast" };
  }
}

/** 7. Create Return Request */
export async function createSteadfastReturnRequest(payload: {
  consignment_id?: string | number;
  invoice?: string;
  tracking_code?: string;
  reason?: string;
}) {
  const creds = await getSteadfastCredentials();
  if (!creds) {
    throw new Error("Steadfast API credentials missing");
  }

  try {
    const res = await fetch(`${STEADFAST_BASE_URL}/create_return_request`, {
      method: "POST",
      headers: {
        "Api-Key": creds.apiKey,
        "Secret-Key": creds.secretKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (error) {
    console.error("Steadfast return request error:", error);
    throw new Error("Failed to create return request");
  }
}

/** 8. Get Single Return Request View */
export async function getSteadfastReturnRequest(id: string | number) {
  const creds = await getSteadfastCredentials();
  if (!creds) {
    return { status: 400, error: "Steadfast credentials missing" };
  }

  try {
    const res = await fetch(`${STEADFAST_BASE_URL}/get_return_request/${id}`, {
      headers: {
        "Api-Key": creds.apiKey,
        "Secret-Key": creds.secretKey,
      },
    });
    return await res.json();
  } catch (error) {
    console.error("Steadfast single return request error:", error);
    return { status: 500, error: "Failed to fetch return request" };
  }
}

/** 9. Get Return Requests */
export async function getSteadfastReturnRequests() {
  const creds = await getSteadfastCredentials();
  if (!creds) {
    return { status: 400, error: "Steadfast credentials missing" };
  }

  try {
    const res = await fetch(`${STEADFAST_BASE_URL}/get_return_requests`, {
      headers: {
        "Api-Key": creds.apiKey,
        "Secret-Key": creds.secretKey,
      },
    });
    return await res.json();
  } catch (error) {
    console.error("Steadfast return requests error:", error);
    return { status: 500, error: "Failed to fetch return requests" };
  }
}

/** 10. Get Payments */
export async function getSteadfastPayments() {
  const creds = await getSteadfastCredentials();
  if (!creds) {
    return { status: 400, error: "Steadfast credentials missing" };
  }

  try {
    const res = await fetch(`${STEADFAST_BASE_URL}/payments`, {
      headers: {
        "Api-Key": creds.apiKey,
        "Secret-Key": creds.secretKey,
      },
    });
    return await res.json();
  } catch (error) {
    console.error("Steadfast payments error:", error);
    return { status: 500, error: "Failed to fetch payments" };
  }
}

/** 11. Get Police Stations */
export async function getSteadfastPoliceStations() {
  const creds = await getSteadfastCredentials();
  if (!creds) {
    return { status: 400, error: "Steadfast credentials missing" };
  }

  try {
    const res = await fetch(`${STEADFAST_BASE_URL}/police_stations`, {
      headers: {
        "Api-Key": creds.apiKey,
        "Secret-Key": creds.secretKey,
      },
    });
    return await res.json();
  } catch (error) {
    console.error("Steadfast police stations error:", error);
    return { status: 500, error: "Failed to fetch police stations" };
  }
}


