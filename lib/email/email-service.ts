import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { DEFAULT_EMAIL_TEMPLATES } from "./email-templates-default";

export { DEFAULT_EMAIL_TEMPLATES };

// Function to read settings from .data/settings.json
function getSettings() {
  try {
    const filePath = path.join(process.cwd(), ".data", "settings.json");
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(fileData);
    }
  } catch (err) {
    console.error("Error reading settings.json for email service:", err);
  }
  return {};
}

// Create Nodemailer Transporter using Gmail Credentials
export function createMailTransporter() {
  const settings = getSettings();
  const gmailUser = settings.GMAIL_USER || process.env.GMAIL_USER;
  const gmailPass = settings.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });
}

// Function to replace placeholders in email text
export function replacePlaceholders(template: string, data: Record<string, string>): string {
  let result = template;
  for (const key in data) {
    const regex = new RegExp(`\\{${key}\\}`, "g");
    result = result.replace(regex, data[key] || "");
  }
  return result;
}

// Generic Send Email Function
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const settings = getSettings();
    const gmailUser = settings.GMAIL_USER || process.env.GMAIL_USER;
    const transporter = createMailTransporter();

    if (!transporter || !gmailUser) {
      console.warn("Gmail credentials not configured. Skipping email send to:", to);
      return { success: false, error: "Gmail credentials not configured in settings/env." };
    }

    const info = await transporter.sendMail({
      from: `"haqplus Tea" <${gmailUser}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}

// Helper to send Order Confirmation Email
export async function sendOrderConfirmationEmail(order: any) {
  if (!order.email && !order.customerEmail) {
    console.log("No customer email provided for order:", order.orderNumber);
    return { success: false, error: "Customer email missing" };
  }

  const settings = getSettings();
  const targetEmail = order.email || order.customerEmail;
  const subjectTemplate = settings.EMAIL_ORDER_CONFIRMATION_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ORDER_CONFIRMATION_SUBJECT;
  const bodyTemplate = settings.EMAIL_ORDER_CONFIRMATION_BODY || DEFAULT_EMAIL_TEMPLATES.ORDER_CONFIRMATION_BODY;

  // Build items HTML table
  const items = order.items || [];
  let itemsTableHtml = `
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr style="background-color: #f1f5f9; text-align: left;">
          <th style="padding: 8px; border: 1px solid #cbd5e1; font-size: 13px;">পণ্য</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; font-size: 13px; text-align: center;">পরিমাণ</th>
          <th style="padding: 8px; border: 1px solid #cbd5e1; font-size: 13px; text-align: right;">মূল্য</th>
        </tr>
      </thead>
      <tbody>
  `;

  items.forEach((it: any) => {
    const itemName = it.productName || it.name || it.product?.name || "Tea Product";
    const qty = it.quantity || 1;
    const price = it.price || 0;
    itemsTableHtml += `
      <tr>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 13px;">${itemName}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 13px; text-align: center;">${qty}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-size: 13px; text-align: right;">৳${price * qty}</td>
      </tr>
    `;
  });

  itemsTableHtml += `</tbody></table>`;

  const placeholderData = {
    customer_name: order.customerName || "গ্রাহক",
    order_number: order.orderNumber || String(order.id),
    total_amount: String(order.total || 0),
    payment_method: order.paymentMethod || "CASH_ON_DELIVERY",
    address: order.address || "",
    district: order.district || "",
    items_table: itemsTableHtml,
  };

  const finalSubject = replacePlaceholders(subjectTemplate, placeholderData);
  const finalBody = replacePlaceholders(bodyTemplate, placeholderData);

  // Send to Customer
  const result = await sendEmail({ to: targetEmail, subject: finalSubject, html: finalBody });

  // Send Admin Alert if configured
  const adminEmail = settings.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail) {
    const adminSubjectTemplate = settings.EMAIL_ADMIN_ALERT_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ADMIN_ALERT_SUBJECT;
    const adminBodyTemplate = settings.EMAIL_ADMIN_ALERT_BODY || DEFAULT_EMAIL_TEMPLATES.ADMIN_ALERT_BODY;

    const adminPlaceholderData = {
      ...placeholderData,
      phone: order.phone || "",
    };

    sendEmail({
      to: adminEmail,
      subject: replacePlaceholders(adminSubjectTemplate, adminPlaceholderData),
      html: replacePlaceholders(adminBodyTemplate, adminPlaceholderData),
    }).catch((err) => console.error("Admin notification email error:", err));
  }

  return result;
}

// Helper to send Order Shipped Email
export async function sendOrderShippedEmail(order: any, courierName = "Steadfast", trackingCode = "") {
  if (!order.email && !order.customerEmail) return { success: false, error: "Email missing" };

  const settings = getSettings();
  const targetEmail = order.email || order.customerEmail;
  const subjectTemplate = settings.EMAIL_ORDER_SHIPPED_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ORDER_SHIPPED_SUBJECT;
  const bodyTemplate = settings.EMAIL_ORDER_SHIPPED_BODY || DEFAULT_EMAIL_TEMPLATES.ORDER_SHIPPED_BODY;

  const code = trackingCode || order.courierTrackingId || "Pending";
  let trackingLinkBtn = "";
  if (code && code !== "Pending") {
    const trackingUrl = courierName.toLowerCase().includes("pathao")
      ? `https://pathao.com/tracking`
      : `https://steadfast.com.bd/tl/${code}`;

    trackingLinkBtn = `
      <div style="margin-top: 15px; text-align: center;">
        <a href="${trackingUrl}" target="_blank" style="background-color: #2563eb; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
          পার্সেল লাইভ ট্র্যাক করুন
        </a>
      </div>
    `;
  }

  const placeholderData = {
    customer_name: order.customerName || "গ্রাহক",
    order_number: order.orderNumber || String(order.id),
    courier_name: courierName,
    tracking_code: code,
    tracking_link_button: trackingLinkBtn,
  };

  const finalSubject = replacePlaceholders(subjectTemplate, placeholderData);
  const finalBody = replacePlaceholders(bodyTemplate, placeholderData);

  return sendEmail({ to: targetEmail, subject: finalSubject, html: finalBody });
}
