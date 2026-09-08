import { NextResponse } from "next/server";
import { getResilientOrders } from "@/lib/orders-store";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("query") || "").trim();

    if (!query || query.length < 4) {
      return NextResponse.json(
        { error: "অনুগ্রহ করে সঠিক অর্ডার নম্বর বা মোবাইল নম্বর লিখুন (কমপক্ষে ৪ অক্ষর)" },
        { status: 400 }
      );
    }

    const allOrders = await getResilientOrders();
    const qLower = query.toLowerCase();

    // Match orderNumber or phone (clean non-digits for phone)
    const qDigits = query.replace(/\D/g, "");

    const matched = allOrders.filter((o) => {
      if (o.orderNumber.toLowerCase().includes(qLower)) return true;
      if (o.id.toLowerCase() === qLower) return true;
      if (qDigits.length >= 6) {
        const orderPhoneDigits = (o.phone || "").replace(/\D/g, "");
        if (orderPhoneDigits.includes(qDigits) || qDigits.includes(orderPhoneDigits)) {
          return true;
        }
      }
      return false;
    });

    if (matched.length === 0) {
      return NextResponse.json(
        { error: "এই নম্বর দিয়ে কোনো অর্ডার খুঁজে পাওয়া যায়নি। সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।" },
        { status: 404 }
      );
    }

    // Sanitize and return order tracking details
    const formatted = matched.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.customerName,
      phone: o.phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"), // Mask middle digits for privacy
      address: o.address,
      district: o.district,
      division: o.division,
      total: o.total,
      paymentMethod: o.paymentMethod,
      orderStatus: o.orderStatus,
      courierTrackingId: o.courierTrackingId,
      courierStatus: o.courierStatus,
      createdAt: o.createdAt,
      items: o.items.map((it) => ({
        productName: it.productName,
        quantity: it.quantity,
        price: it.price,
      })),
    }));

    return NextResponse.json({ orders: formatted });
  } catch (error) {
    console.error("Order tracking API error:", error);
    return NextResponse.json({ error: "ট্র্যাকিং তথ্য লোড করতে সমস্যা হয়েছে" }, { status: 500 });
  }
}
