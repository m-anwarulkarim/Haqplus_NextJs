import { adminMessaging } from "@/lib/firebase-admin";

export interface GsmCallPayload {
  orderId: string;
  customerPhone: string;
  customerName?: string;
  totalAmount?: string | number;
  forwardPhoneNumber?: string;
}

/**
 * Triggers an automated GSM IVR call by sending a high-priority FCM push notification
 * to the Android GSM Gateway phone registered via ANDROID_GSM_DEVICE_FCM_TOKEN in .env.
 */
export async function triggerGsmAutoCall(payload: GsmCallPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const deviceToken = process.env.ANDROID_GSM_DEVICE_FCM_TOKEN;

    if (!deviceToken) {
      console.warn("[GSM Telephony] ANDROID_GSM_DEVICE_FCM_TOKEN is not set in environment variables.");
      return { success: false, error: "ANDROID_GSM_DEVICE_FCM_TOKEN missing in .env" };
    }

    if (!adminMessaging) {
      console.warn("[GSM Telephony] Firebase Admin Messaging is not initialized.");
      return { success: false, error: "Firebase Admin Messaging not initialized" };
    }

    const forwardPhone = payload.forwardPhoneNumber || process.env.AGENT_FORWARD_PHONE_NUMBER || "";

    const message = {
      token: deviceToken,
      data: {
        orderId: String(payload.orderId),
        customerPhone: String(payload.customerPhone),
        customerName: String(payload.customerName || "Customer"),
        totalAmount: String(payload.totalAmount || "0"),
        forwardPhoneNumber: String(forwardPhone),
        timestamp: String(Date.now()),
      },
      android: {
        priority: "high" as const,
      },
    };

    const response = await adminMessaging.send(message);
    console.log(`[GSM Telephony] Auto-call FCM sent successfully for Order #${payload.orderId}. MessageID: ${response}`);
    return { success: true, messageId: response };
  } catch (error: any) {
    console.error("[GSM Telephony] Error sending FCM Auto-Call notification:", error);
    return { success: false, error: error.message || "Failed to send FCM notification" };
  }
}
