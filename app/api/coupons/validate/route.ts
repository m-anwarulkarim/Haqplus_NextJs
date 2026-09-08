import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json({ valid: false, error: "Please provide a coupon code" }, { status: 400 });
    }

    const currentSubtotal = Number(subtotal) || 0;
    const normalizedCode = code.toUpperCase().trim();

    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json({ valid: false, error: "Invalid or expired coupon code" }, { status: 404 });
    }

    // Check expiry
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ valid: false, error: "This coupon code has expired" }, { status: 400 });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ valid: false, error: "This coupon usage limit has been reached" }, { status: 400 });
    }

    // Check minimum purchase
    const minPurchase = Number(coupon.minPurchase);
    if (currentSubtotal < minPurchase) {
      return NextResponse.json(
        {
          valid: false,
          error: `Minimum order amount for this coupon is $${minPurchase.toFixed(2)}`,
        },
        { status: 400 }
      );
    }

    // Calculate discount amount
    const couponVal = Number(coupon.value);
    let discountAmount = 0;
    if (coupon.type === "PERCENTAGE") {
      discountAmount = Number(((currentSubtotal * couponVal) / 100).toFixed(2));
    } else {
      discountAmount = Math.min(couponVal, currentSubtotal);
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: couponVal,
        discountAmount,
        minPurchase,
      },
    });
  } catch (error) {
    console.error("Coupon validation error:", error);
    return NextResponse.json({ valid: false, error: "Failed to validate coupon" }, { status: 500 });
  }
}
