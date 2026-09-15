import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

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

// Default email templates
export const DEFAULT_EMAIL_TEMPLATES = {
  ORDER_CONFIRMATION_SUBJECT: "অর্ডার নিশ্চিতকরণ - #{order_number} (haqplus)",
  ORDER_CONFIRMATION_BODY: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded-radius: 12px; background-color: #ffffff;">
  <div style="text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 15px;">
    <h1 style="color: #059669; margin: 0; font-size: 24px;">haqplus Pure Organic Tea</h1>
    <p style="color: #64748b; font-size: 13px; margin-top: 4px;">শ্রীমঙ্গলের ১০০% খাঁটি প্রিমিয়াম চা পাতা</p>
  </div>

  <div style="padding: 20px 0;">
    <h2 style="color: #1e293b; font-size: 18px;">প্রিয় {customer_name},</h2>
    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
      <strong>haqplus</strong> এ আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে! নিচে আপনার অর্ডারের বিস্তারিত তথ্য দেওয়া হলো:
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>ইনভয়েস/অর্ডার নম্বর:</strong> #{order_number}</p>
      <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>পেমেন্ট মেথড:</strong> {payment_method}</p>
      <p style="margin: 4px 0; font-size: 14px; color: #334155;"><strong>ডেলিভারি ঠিকানা:</strong> {address}, {district}</p>
      <p style="margin: 4px 0; font-size: 16px; color: #059669; font-weight: bold; margin-top: 10px;"><strong>সর্বমোট মূল্য:</strong> ৳{total_amount}</p>
    </div>

    <h3 style="color: #1e293b; font-size: 16px; margin-top: 20px;">অর্ডারকৃত আইটেমসমূহ:</h3>
    {items_table}

    <p style="color: #64748b; font-size: 13px; margin-top: 25px; border-t: 1px solid #f1f5f9; padding-top: 15px;">
      আমাদের প্রতিনিধি দ্রুততম সময়ে পার্সেল প্যাকিং করে আপনার কাছে পৌঁছে দেবেন। যেকোনো প্রয়োজনে কল করুন <strong>01712345678</strong>।
    </p>
  </div>

  <div style="text-align: center; background-color: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 12px; color: #64748b;">
    © haqplus Organic Tea Ltd. All rights reserved.
  </div>
</div>
`,
  ORDER_SHIPPED_SUBJECT: "আপনার অর্ডার কুরিয়ারে শিপ করা হয়েছে - #{order_number}",
  ORDER_SHIPPED_BODY: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; background-color: #ffffff;">
  <div style="text-align: center; border-bottom: 2px solid #3b82f6; padding-bottom: 15px;">
    <h1 style="color: #2563eb; margin: 0; font-size: 24px;">haqplus Courier Dispatch Notification</h1>
  </div>
  <div style="padding: 20px 0;">
    <h2 style="color: #1e293b;">প্রিয় {customer_name},</h2>
    <p style="color: #475569; font-size: 14px;">
      আপনার অর্ডার <strong>#{order_number}</strong> সফলভাবে কুরিয়ার সার্ভিস <strong>({courier_name})</strong> এ হ্যান্ডওভার করা হয়েছে।
    </p>

    <div style="background-color: #eff6ff; border: 1px solid #93c5fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <p style="margin: 4px 0; font-size: 14px;"><strong>কুরিয়ার সার্ভিস:</strong> {courier_name}</p>
      <p style="margin: 4px 0; font-size: 14px;"><strong>কুরিয়ার ট্র্যাকিং আইডি:</strong> {tracking_code}</p>
      {tracking_link_button}
    </div>

    <p style="color: #64748b; font-size: 13px;">আগামী ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি ম্যান আপনাকে কল করবেন।</p>
  </div>
</div>
`,
  ORDER_DELIVERED_SUBJECT: "আপনার অর্ডার সফলভাবে ডেলিভারি সম্পন্ন হয়েছে! (haqplus)",
  ORDER_DELIVERED_BODY: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0;">
  <div style="text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 15px;">
    <h1 style="color: #059669;">haqplus - ধন্যবাদ! 🎉</h1>
  </div>
  <div style="padding: 20px 0;">
    <h2 style="color: #1e293b;">প্রিয় {customer_name},</h2>
    <p style="color: #475569;">আপনার অর্ডার <strong>#{order_number}</strong> সফলভাবে আপনার হাতে পৌঁছে দেওয়া হয়েছে। আমাদের খাঁটি অর্গানিক চা উপভোগ করুন!</p>
    <p style="color: #475569; margin-top: 15px;">চায়ের স্বাদ কেমন লেগেছে তা জানাতে আমাদের ওয়েবসাইট রিভিউ সেকশনে আপনার মতামত জানান।</p>
  </div>
</div>
`,
  ORDER_CANCELLED_SUBJECT: "অর্ডার বাতিল সংক্রান্ত নোটিশ - #{order_number}",
  ORDER_CANCELLED_BODY: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fca5a5;">
  <div style="text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 15px;">
    <h1 style="color: #dc2626;">haqplus Order Cancellation Notice</h1>
  </div>
  <div style="padding: 20px 0;">
    <h2 style="color: #1e293b;">প্রিয় {customer_name},</h2>
    <p style="color: #475569;">আপনার অর্ডার <strong>#{order_number}</strong> কোনো বিশেষ কারণে বাতিল করা হয়েছে। যেকোনো তথ্যের জন্য আমাদের কাস্টমার কেয়ারে যোগাযোগ করুন।</p>
  </div>
</div>
`,
  ADMIN_ALERT_SUBJECT: "🚨 নতুন অর্ডার নোটিফিকেশন - #{order_number} (৳{total_amount})",
  ADMIN_ALERT_BODY: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #8b5cf6;">
  <h2 style="color: #7c3aed; margin-top: 0;">🚨 নতুন অর্ডার অ্যালার্ট (Admin Alert)</h2>
  <p><strong>অর্ডার #:</strong> #{order_number}</p>
  <p><strong>কাস্টমার:</strong> {customer_name} ({phone})</p>
  <p><strong>ঠিকানা:</strong> {address}, {district}</p>
  <p><strong>সর্বমোট মূল্য:</strong> ৳{total_amount}</p>
</div>
`,
};

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
