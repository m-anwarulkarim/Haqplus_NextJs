import { NextResponse } from "next/server";
import { DEFAULT_EMAIL_TEMPLATES } from "@/lib/email/email-templates-default";
import { getAllResilientSettings, setBulkResilientSettings } from "@/lib/settings-store";

function cleanPlainText(val: string | undefined, defaultVal: string): string {
  if (!val || typeof val !== "string") return defaultVal;
  // If old setting contains HTML tags, return clean default plain text
  if (val.includes("<div") || val.includes("<html") || val.includes("<p style=") || val.includes("<h1")) {
    return defaultVal;
  }
  return val;
}

export async function GET() {
  try {
    const settings = await getAllResilientSettings();

    const templates = {
      GMAIL_USER: settings.GMAIL_USER || process.env.GMAIL_USER || "",
      GMAIL_APP_PASSWORD: settings.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD || "",
      ADMIN_NOTIFICATION_EMAIL: settings.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || "",

      EMAIL_ORDER_PENDING_SUBJECT:
        cleanPlainText(settings.EMAIL_ORDER_PENDING_SUBJECT, DEFAULT_EMAIL_TEMPLATES.ORDER_PENDING_SUBJECT),
      EMAIL_ORDER_PENDING_BODY:
        cleanPlainText(settings.EMAIL_ORDER_PENDING_BODY, DEFAULT_EMAIL_TEMPLATES.ORDER_PENDING_BODY),

      EMAIL_ORDER_CONFIRMATION_SUBJECT:
        cleanPlainText(settings.EMAIL_ORDER_CONFIRMATION_SUBJECT, DEFAULT_EMAIL_TEMPLATES.ORDER_CONFIRMATION_SUBJECT),
      EMAIL_ORDER_CONFIRMATION_BODY:
        cleanPlainText(settings.EMAIL_ORDER_CONFIRMATION_BODY, DEFAULT_EMAIL_TEMPLATES.ORDER_CONFIRMATION_BODY),

      EMAIL_ORDER_PROCESSING_SUBJECT:
        cleanPlainText(settings.EMAIL_ORDER_PROCESSING_SUBJECT, DEFAULT_EMAIL_TEMPLATES.ORDER_PROCESSING_SUBJECT),
      EMAIL_ORDER_PROCESSING_BODY:
        cleanPlainText(settings.EMAIL_ORDER_PROCESSING_BODY, DEFAULT_EMAIL_TEMPLATES.ORDER_PROCESSING_BODY),

      EMAIL_ORDER_SHIPPED_SUBJECT:
        cleanPlainText(settings.EMAIL_ORDER_SHIPPED_SUBJECT, DEFAULT_EMAIL_TEMPLATES.ORDER_SHIPPED_SUBJECT),
      EMAIL_ORDER_SHIPPED_BODY:
        cleanPlainText(settings.EMAIL_ORDER_SHIPPED_BODY, DEFAULT_EMAIL_TEMPLATES.ORDER_SHIPPED_BODY),

      EMAIL_ORDER_DELIVERED_SUBJECT:
        cleanPlainText(settings.EMAIL_ORDER_DELIVERED_SUBJECT, DEFAULT_EMAIL_TEMPLATES.ORDER_DELIVERED_SUBJECT),
      EMAIL_ORDER_DELIVERED_BODY:
        cleanPlainText(settings.EMAIL_ORDER_DELIVERED_BODY, DEFAULT_EMAIL_TEMPLATES.ORDER_DELIVERED_BODY),

      EMAIL_ORDER_CANCELLED_SUBJECT:
        cleanPlainText(settings.EMAIL_ORDER_CANCELLED_SUBJECT, DEFAULT_EMAIL_TEMPLATES.ORDER_CANCELLED_SUBJECT),
      EMAIL_ORDER_CANCELLED_BODY:
        cleanPlainText(settings.EMAIL_ORDER_CANCELLED_BODY, DEFAULT_EMAIL_TEMPLATES.ORDER_CANCELLED_BODY),

      EMAIL_ORDER_RETURNED_SUBJECT:
        cleanPlainText(settings.EMAIL_ORDER_RETURNED_SUBJECT, DEFAULT_EMAIL_TEMPLATES.ORDER_RETURNED_SUBJECT),
      EMAIL_ORDER_RETURNED_BODY:
        cleanPlainText(settings.EMAIL_ORDER_RETURNED_BODY, DEFAULT_EMAIL_TEMPLATES.ORDER_RETURNED_BODY),
    };

    return NextResponse.json({ success: true, data: templates });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await setBulkResilientSettings(body);
    const updated = await getAllResilientSettings();
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
