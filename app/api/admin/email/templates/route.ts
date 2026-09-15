import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { DEFAULT_EMAIL_TEMPLATES } from "@/lib/email/email-service";

function getSettingsPath() {
  const dirPath = path.join(process.cwd(), ".data");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return path.join(dirPath, "settings.json");
}

function readSettings() {
  try {
    const filePath = getSettingsPath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading settings.json:", err);
  }
  return {};
}

function writeSettings(newSettings: Record<string, any>) {
  const filePath = getSettingsPath();
  const current = readSettings();
  const updated = { ...current, ...newSettings };
  fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), "utf-8");
  return updated;
}

export async function GET() {
  try {
    const settings = readSettings();

    const templates = {
      GMAIL_USER: settings.GMAIL_USER || process.env.GMAIL_USER || "",
      GMAIL_APP_PASSWORD: settings.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD || "",
      ADMIN_NOTIFICATION_EMAIL: settings.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL || "",

      EMAIL_ORDER_CONFIRMATION_SUBJECT:
        settings.EMAIL_ORDER_CONFIRMATION_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ORDER_CONFIRMATION_SUBJECT,
      EMAIL_ORDER_CONFIRMATION_BODY:
        settings.EMAIL_ORDER_CONFIRMATION_BODY || DEFAULT_EMAIL_TEMPLATES.ORDER_CONFIRMATION_BODY,

      EMAIL_ORDER_SHIPPED_SUBJECT:
        settings.EMAIL_ORDER_SHIPPED_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ORDER_SHIPPED_SUBJECT,
      EMAIL_ORDER_SHIPPED_BODY:
        settings.EMAIL_ORDER_SHIPPED_BODY || DEFAULT_EMAIL_TEMPLATES.ORDER_SHIPPED_BODY,

      EMAIL_ORDER_DELIVERED_SUBJECT:
        settings.EMAIL_ORDER_DELIVERED_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ORDER_DELIVERED_SUBJECT,
      EMAIL_ORDER_DELIVERED_BODY:
        settings.EMAIL_ORDER_DELIVERED_BODY || DEFAULT_EMAIL_TEMPLATES.ORDER_DELIVERED_BODY,

      EMAIL_ORDER_CANCELLED_SUBJECT:
        settings.EMAIL_ORDER_CANCELLED_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ORDER_CANCELLED_SUBJECT,
      EMAIL_ORDER_CANCELLED_BODY:
        settings.EMAIL_ORDER_CANCELLED_BODY || DEFAULT_EMAIL_TEMPLATES.ORDER_CANCELLED_BODY,
    };

    return NextResponse.json({ success: true, data: templates });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = writeSettings(body);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
