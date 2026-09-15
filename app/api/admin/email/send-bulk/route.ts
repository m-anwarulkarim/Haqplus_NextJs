import { NextResponse } from "next/server";
import { sendEmail, replacePlaceholders } from "@/lib/email/email-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { recipients, subject, bodyHtml } = body;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: "No recipients provided" },
        { status: 400 }
      );
    }

    if (!subject || !bodyHtml) {
      return NextResponse.json(
        { success: false, error: "Subject and body are required" },
        { status: 400 }
      );
    }

    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    // Send emails in controlled batches to prevent Gmail rate limits
    for (const item of recipients) {
      const email = typeof item === "string" ? item : item.email;
      const name = typeof item === "object" ? item.name || "Customer" : "Customer";

      if (!email || !email.includes("@")) {
        failCount++;
        continue;
      }

      const personalizedBody = replacePlaceholders(bodyHtml, {
        customer_name: name,
        email: email,
      });

      const res = await sendEmail({
        to: email,
        subject,
        html: personalizedBody,
      });

      if (res.success) {
        successCount++;
      } else {
        failCount++;
        if (res.error) errors.push(`${email}: ${res.error}`);
      }

      // Small delay between sends (150ms) to ensure smooth delivery
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    return NextResponse.json({
      success: true,
      total: recipients.length,
      sentCount: successCount,
      failedCount: failCount,
      errors: errors.slice(0, 5), // Only return top 5 errors if any
    });
  } catch (err: any) {
    console.error("Bulk email error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process bulk emails" },
      { status: 500 }
    );
  }
}
