// Pure browser-safe default email templates constants (no Node fs dependencies)

export const DEFAULT_EMAIL_TEMPLATES = {
  // Pending Order
  ORDER_PENDING_SUBJECT: "আপনার অর্ডারটি গ্রহণ করা হয়েছে - #{order_number} (haqplus)",
  ORDER_PENDING_BODY: `প্রিয় {customer_name},

haqplus-এ আপনার অর্ডার #{order_number} সফলভাবে গ্রহণ করা হয়েছে! 

পেমেন্ট মেথড: {payment_method}
ডেলিভারি ঠিকানা: {address}, {district}
সর্বমোট মূল্য: ৳{total_amount}

আমাদের প্রতিনিধি শীঘ্রই পার্সেলটি কনফার্ম করার জন্য আপনার সাথে ফোনে কথা বলবেন। যেকোনো তথ্যের জন্য আমাদের হেল্পলাইনে যোগাযোগ করুন।

ধন্যবাদ,
haqplus Organic Tea`,

  // Confirmed Order
  ORDER_CONFIRMATION_SUBJECT: "অর্ডার নিশ্চিতকরণ নোটিশ - #{order_number} (haqplus)",
  ORDER_CONFIRMATION_BODY: `প্রিয় {customer_name},

আপনার অর্ডার #{order_number} সফলভাবে কনফার্ম করা হয়েছে!

পেমেন্ট মেথড: {payment_method}
ডেলিভারি ঠিকানা: {address}, {district}
সর্বমোট মূল্য: ৳{total_amount}

আমাদের প্যাকেজিং টিম আপনার পার্সেলটি প্রস্তুত করছে। দ্রুততম সময়ে কুরিয়ার সার্ভিসে হ্যান্ডওভার করা হবে।

ধন্যবাদ,
haqplus Organic Tea`,

  // Processing Order
  ORDER_PROCESSING_SUBJECT: "আপনার অর্ডার প্রসেসিং হচ্ছে - #{order_number} (haqplus)",
  ORDER_PROCESSING_BODY: `প্রিয় {customer_name},

আপনার অর্ডার #{order_number} বর্তমানে প্যাকিং ও কোয়ালিটি চেকের কাজ চলছে।

সর্বমোট মূল্য: ৳{total_amount}
ডেলিভারি ঠিকানা: {address}, {district}

খুব শীঘ্রই পার্সেলটি কুরিয়ারে ট্রান্সফার করা হবে এবং আপনাকে ট্র্যাকিং লিঙ্ক জানিয়ে দেওয়া হবে।

ধন্যবাদ,
haqplus Organic Tea`,

  // Shipped / Courier Order
  ORDER_SHIPPED_SUBJECT: "আপনার অর্ডার কুরিয়ারে শিপ করা হয়েছে - #{order_number}",
  ORDER_SHIPPED_BODY: `প্রিয় {customer_name},

আপনার অর্ডার #{order_number} কুরিয়ার সার্ভিসে ({courier_name}) হ্যান্ডওভার করা হয়েছে!

কুরিয়ার নাম: {courier_name}
ট্র্যাকিং আইডি: {tracking_code}
লাইভ পার্সেল ট্র্যাক করুন: {tracking_link}

আগামী ২৪ থেকে ৪৮ ঘণ্টার মধ্যে কুরিয়ারের ডেলিভারিম্যান পার্সেলটি নিয়ে আপনার ঠিকানায় পৌঁছাবেন।

ধন্যবাদ,
haqplus Organic Tea`,

  // Delivered Order
  ORDER_DELIVERED_SUBJECT: "আপনার অর্ডার সফলভাবে ডেলিভারি সম্পন্ন হয়েছে! (haqplus)",
  ORDER_DELIVERED_BODY: `প্রিয় {customer_name},

আপনার অর্ডার #{order_number} সফলভাবে আপনার হাতে পৌঁছে দেওয়া হয়েছে!

আমাদের শ্রীমঙ্গলের ১০০% খাঁটি অর্গানিক চা পাতা উপভোগ করুন। চায়ের স্বাদ কেমন লেগেছে তা আমাদের পেজে রিভিউ দিয়ে জানাতে ভুলবেন না।

ধন্যবাদ,
haqplus Organic Tea`,

  // Cancelled Order
  ORDER_CANCELLED_SUBJECT: "অর্ডার বাতিল সংক্রান্ত নোটিশ - #{order_number}",
  ORDER_CANCELLED_BODY: `প্রিয় {customer_name},

আপনার অর্ডার #{order_number} টি অনিবার্য কারণে বাতিল করা হয়েছে। 

যদি কোনো ভুল বোঝাবুঝি হয়ে থাকে অথবা পুনরায় অর্ডারটি সচল করতে চান, তবে অনুগ্রহ করে আমাদের হটলাইনে যোগাযোগ করুন।

ধন্যবাদ,
haqplus Organic Tea`,

  // Returned Order
  ORDER_RETURNED_SUBJECT: "পার্সেল রিটার্ন সংক্রান্ত তথ্য - #{order_number}",
  ORDER_RETURNED_BODY: `প্রিয় {customer_name},

আপনার অর্ডার #{order_number} টি কুরিয়ার মারফত আমাদের গুদামে ফেরত এসেছে।

পুনরায় ডেলিভারি গ্রহণ করার জন্য অথবা বিস্তারিত জানতে আমাদের কাস্টমার কেয়ারে কল করুন।

ধন্যবাদ,
haqplus Organic Tea`,

  // Admin Alert
  ADMIN_ALERT_SUBJECT: "🚨 নতুন অর্ডার নোটিফিকেশন - #{order_number} (৳{total_amount})",
  ADMIN_ALERT_BODY: `🚨 নতুন অর্ডার অ্যালার্ট (Admin Notification)

অর্ডার নম্বর: #{order_number}
কাস্টমার: {customer_name} ({phone})
ঠিকানা: {address}, {district}
সর্বমোট মূল্য: ৳{total_amount}`,
};
