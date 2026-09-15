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

  const placeholderData = {
    customer_name: order.customerName || "গ্রাহক",
    order_number: order.orderNumber || String(order.id),
    total_amount: String(order.total || 0),
    payment_method: order.paymentMethod || "COD",
    address: order.address || "",
    district: order.district || "",
  };

  const finalSubject = replacePlaceholders(subjectTemplate, placeholderData);
  const plainTextBody = replacePlaceholders(bodyTemplate, placeholderData);

  const htmlBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
  <div style="text-align: center; border-bottom: 2px solid #0f6848; padding-bottom: 16px; margin-bottom: 20px;">
    <h1 style="color: #0f6848; margin: 0; font-size: 24px; font-weight: bold;">haqplus Pure Organic Tea</h1>
    <p style="color: #64748b; font-size: 13px; margin-top: 4px;">শ্রীমঙ্গলের ১০০% খাঁটি প্রিমিয়াম চা পাতা</p>
  </div>
  <div style="color: #1e293b; font-size: 14px; line-height: 1.7; white-space: pre-line;">
    ${plainTextBody}
  </div>
  <div style="margin-top: 30px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 12px; color: #94a3b8;">
    © ${new Date().getFullYear()} haqplus Organic Tea Ltd. All rights reserved.
  </div>
</div>
  `;

  // Send to Customer
  const result = await sendEmail({ to: targetEmail, subject: finalSubject, html: htmlBody });

  // Send Admin Alert if configured
  const adminEmail = settings.ADMIN_NOTIFICATION_EMAIL || process.env.ADMIN_NOTIFICATION_EMAIL;
  if (adminEmail) {
    const adminSubjectTemplate = settings.EMAIL_ADMIN_ALERT_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ADMIN_ALERT_SUBJECT;
    const adminBodyTemplate = settings.EMAIL_ADMIN_ALERT_BODY || DEFAULT_EMAIL_TEMPLATES.ADMIN_ALERT_BODY;

    const adminPlaceholderData = {
      ...placeholderData,
      phone: order.phone || "",
    };

    const adminBodyText = replacePlaceholders(adminBodyTemplate, adminPlaceholderData);

    sendEmail({
      to: adminEmail,
      subject: replacePlaceholders(adminSubjectTemplate, adminPlaceholderData),
      html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #8b5cf6; border-radius: 8px; white-space: pre-line;">${adminBodyText}</div>`,
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
  const trackingUrl = courierName.toLowerCase().includes("pathao")
    ? `https://pathao.com/tracking`
    : `https://steadfast.com.bd/tl/${code}`;

  const placeholderData = {
    customer_name: order.customerName || "গ্রাহক",
    order_number: order.orderNumber || String(order.id),
    courier_name: courierName,
    tracking_code: code,
    tracking_link: trackingUrl,
  };

  const finalSubject = replacePlaceholders(subjectTemplate, placeholderData);
  const plainTextBody = replacePlaceholders(bodyTemplate, placeholderData);

  const htmlBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
  <div style="text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px;">
    <h1 style="color: #2563eb; margin: 0; font-size: 24px; font-weight: bold;">haqplus Courier Dispatch</h1>
    <p style="color: #64748b; font-size: 13px; margin-top: 4px;">পার্সেল কুরিয়ার ট্র্যাকিং নোটিফিকেশন</p>
  </div>
  <div style="color: #1e293b; font-size: 14px; line-height: 1.7; white-space: pre-line;">
    ${plainTextBody}
  </div>
  <div style="margin-top: 30px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 12px; color: #94a3b8;">
    © ${new Date().getFullYear()} haqplus Organic Tea Ltd. All rights reserved.
  </div>
</div>
  `;

  return sendEmail({ to: targetEmail, subject: finalSubject, html: htmlBody });
}

// Helper to send Status Update Email for any order status (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED, RETURNED)
export async function sendOrderStatusEmail(order: any, status: string) {
  if (!order.email && !order.customerEmail) return { success: false, error: "Customer email missing" };

  const statusUpper = (status || "").toUpperCase();
  if (statusUpper === "CONFIRMED") return sendOrderConfirmationEmail(order);
  if (statusUpper === "SHIPPED") return sendOrderShippedEmail(order, order.courierName || "Steadfast Courier", order.courierTrackingId || "");

  const settings = getSettings();
  const targetEmail = order.email || order.customerEmail;

  let subjectTemplate = "";
  let bodyTemplate = "";

  if (statusUpper === "PENDING") {
    subjectTemplate = settings.EMAIL_ORDER_PENDING_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ORDER_PENDING_SUBJECT;
    bodyTemplate = settings.EMAIL_ORDER_PENDING_BODY || DEFAULT_EMAIL_TEMPLATES.ORDER_PENDING_BODY;
  } else if (statusUpper === "PROCESSING") {
    subjectTemplate = settings.EMAIL_ORDER_PROCESSING_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ORDER_PROCESSING_SUBJECT;
    bodyTemplate = settings.EMAIL_ORDER_PROCESSING_BODY || DEFAULT_EMAIL_TEMPLATES.ORDER_PROCESSING_BODY;
  } else if (statusUpper === "DELIVERED") {
    subjectTemplate = settings.EMAIL_ORDER_DELIVERED_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ORDER_DELIVERED_SUBJECT;
    bodyTemplate = settings.EMAIL_ORDER_DELIVERED_BODY || DEFAULT_EMAIL_TEMPLATES.ORDER_DELIVERED_BODY;
  } else if (statusUpper === "CANCELLED") {
    subjectTemplate = settings.EMAIL_ORDER_CANCELLED_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ORDER_CANCELLED_SUBJECT;
    bodyTemplate = settings.EMAIL_ORDER_CANCELLED_BODY || DEFAULT_EMAIL_TEMPLATES.ORDER_CANCELLED_BODY;
  } else if (statusUpper === "RETURNED") {
    subjectTemplate = settings.EMAIL_ORDER_RETURNED_SUBJECT || DEFAULT_EMAIL_TEMPLATES.ORDER_RETURNED_SUBJECT;
    bodyTemplate = settings.EMAIL_ORDER_RETURNED_BODY || DEFAULT_EMAIL_TEMPLATES.ORDER_RETURNED_BODY;
  } else {
    return { success: false, error: "Status template not mapped" };
  }

  const placeholderData = {
    customer_name: order.customerName || "গ্রাহক",
    order_number: order.orderNumber || String(order.id),
    total_amount: String(order.total || 0),
    payment_method: order.paymentMethod || "COD",
    address: order.address || "",
    district: order.district || "",
    courier_name: order.courierName || "Steadfast Courier",
    tracking_code: order.courierTrackingId || "N/A",
    tracking_link: order.courierTrackingId ? `https://steadfast.com.bd/tl/${order.courierTrackingId}` : "#",
  };

  const finalSubject = replacePlaceholders(subjectTemplate, placeholderData);
  const plainTextBody = replacePlaceholders(bodyTemplate, placeholderData);

  const htmlBody = `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
  <div style="text-align: center; border-bottom: 2px solid #0f6848; padding-bottom: 16px; margin-bottom: 20px;">
    <h1 style="color: #0f6848; margin: 0; font-size: 24px; font-weight: bold;">haqplus Pure Organic Tea</h1>
    <p style="color: #64748b; font-size: 13px; margin-top: 4px;">শ্রীমঙ্গলের ১০০% খাঁটি প্রিমিয়াম চা পাতা</p>
  </div>
  <div style="color: #1e293b; font-size: 14px; line-height: 1.7; white-space: pre-line;">
    ${plainTextBody}
  </div>
  <div style="margin-top: 30px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px; font-size: 12px; color: #94a3b8;">
    © ${new Date().getFullYear()} haqplus Organic Tea Ltd. All rights reserved.
  </div>
</div>
  `;

  return sendEmail({ to: targetEmail, subject: finalSubject, html: htmlBody });
}
