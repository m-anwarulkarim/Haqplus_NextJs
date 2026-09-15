// Pure browser-safe default email templates constants (no Node fs dependencies)

export const DEFAULT_EMAIL_TEMPLATES = {
  ORDER_CONFIRMATION_SUBJECT: "অর্ডার নিশ্চিতকরণ - #{order_number} (haqplus)",
  ORDER_CONFIRMATION_BODY: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
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
    <h2 style="color: #1e293b; font-size: 18px;">প্রিয় {customer_name},</h2>
    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
      আপনার অর্ডার <strong>#{order_number}</strong> কুরিয়ার সার্ভিসে হ্যান্ডওভার করা হয়েছে!
    </p>

    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <p style="margin: 4px 0; font-size: 14px; color: #1e40af;"><strong>কুরিয়ার সার্ভিস:</strong> {courier_name}</p>
      <p style="margin: 4px 0; font-size: 14px; color: #1e40af;"><strong>ট্র্যাকিং নম্বর:</strong> {tracking_code}</p>
      <p style="margin: 12px 0 4px 0;">
        <a href="{tracking_link}" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; padding: 10px 18px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 13px;">পার্সেল ট্র্যাক করুন</a>
      </p>
    </div>
  </div>
</div>
`,
  ORDER_DELIVERED_SUBJECT: "আপনার অর্ডার সফলভাবে ডেলিভারি হয়েছে - #{order_number}",
  ORDER_DELIVERED_BODY: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; background-color: #ffffff;">
  <div style="text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 15px;">
    <h1 style="color: #059669; margin: 0; font-size: 24px;">অর্ডার ডেলিভারি নিশ্চিতকরণ</h1>
  </div>

  <div style="padding: 20px 0;">
    <h2 style="color: #1e293b; font-size: 18px;">প্রিয় {customer_name},</h2>
    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
      আপনার অর্ডার <strong>#{order_number}</strong> সফলভাবে ডেলিভারি করা হয়েছে! আমাদের থেকে কেনাকাটা করার জন্য ধন্যবাদ।
    </p>
  </div>
</div>
`,
  ORDER_CANCELLED_SUBJECT: "আপনার অর্ডার বাতিল সংক্রান্ত নোটিশ - #{order_number}",
  ORDER_CANCELLED_BODY: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; background-color: #ffffff;">
  <div style="text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 15px;">
    <h1 style="color: #dc2626; margin: 0; font-size: 24px;">অর্ডার ক্যানসেলেশন আপডেট</h1>
  </div>

  <div style="padding: 20px 0;">
    <h2 style="color: #1e293b; font-size: 18px;">প্রিয় {customer_name},</h2>
    <p style="color: #475569; font-size: 14px; line-height: 1.6;">
      আপনার অর্ডার <strong>#{order_number}</strong> টি বাতিল করা হয়েছে। যেকোনো তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন।
    </p>
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
