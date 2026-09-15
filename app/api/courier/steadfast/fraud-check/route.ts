import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { auth } from "@/lib/auth";
import { checkSteadfastFraud } from "@/lib/courier/steadfast";

const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 Days in Milliseconds

function getCacheFilePath() {
  const dirPath = path.join(process.cwd(), ".data");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return path.join(dirPath, "fraud_cache.json");
}

function readFraudCache(): Record<string, { data: any; timestamp: number }> {
  try {
    const filePath = getCacheFilePath();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(content) || {};
    }
  } catch (err) {
    console.warn("Could not read fraud cache file:", err);
  }
  return {};
}

function writeFraudCache(cache: Record<string, { data: any; timestamp: number }>) {
  try {
    const filePath = getCacheFilePath();
    fs.writeFileSync(filePath, JSON.stringify(cache, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write fraud cache file:", err);
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const phone = searchParams.get("phone");
    const forceRefresh = searchParams.get("force") === "true" || searchParams.get("refresh") === "true";

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim().replace(/\D/g, "");
    const cache = readFraudCache();
    const now = Date.now();
    const cachedEntry = cache[cleanPhone];

    // Check if valid cache exists (< 7 days old) and forceRefresh is false
    if (!forceRefresh && cachedEntry && now - cachedEntry.timestamp < CACHE_TTL_MS) {
      const ageDays = Math.floor((now - cachedEntry.timestamp) / (24 * 60 * 60 * 1000));
      return NextResponse.json({
        ...cachedEntry.data,
        cached: true,
        cachedAt: new Date(cachedEntry.timestamp).toISOString(),
        cacheAgeDays: ageDays,
      });
    }

    // Otherwise, fetch live data from Steadfast API
    const rawData = await checkSteadfastFraud(phone);

    // Normalize Steadfast Fraud API Response
    const d = rawData?.data || rawData || {};

    const success_parcel = Number(
      d.total_delivred ??
      d.total_delivered ??
      d.success_parcel ??
      d.success_parcels ??
      d.successful_delivery ??
      d.delivered ??
      d.successful ??
      0
    );

    const cancelled_parcel = Number(
      d.total_cancelled ??
      d.total_canceled ??
      d.cancelled_parcel ??
      d.cancelled_parcels ??
      d.returned ??
      d.cancelled ??
      d.cancellation ??
      0
    );

    let total_parcel = Number(
      d.total_parcels ??
      d.total_parcel ??
      d.total_delivery ??
      d.total ??
      d.total_orders ??
      0
    );

    if (total_parcel < success_parcel + cancelled_parcel) {
      total_parcel = success_parcel + cancelled_parcel;
    }

    let success_rate = 100;
    if (total_parcel > 0) {
      success_rate = Number(((success_parcel / total_parcel) * 100).toFixed(1));
    }

    let risk_level: "SAFE" | "MODERATE" | "HIGH_RISK" | "NO_DATA" = "SAFE";
    if (total_parcel === 0) {
      risk_level = "NO_DATA";
    } else if (cancelled_parcel > 2 || success_rate < 60) {
      risk_level = "HIGH_RISK";
    } else if (cancelled_parcel > 0 || success_rate < 85) {
      risk_level = "MODERATE";
    }

    const responsePayload = {
      success: true,
      phone: cleanPhone,
      total_parcel,
      success_parcel,
      cancelled_parcel,
      success_rate,
      risk_level,
      message: rawData.message || null,
      raw: rawData,
      cached: false,
      cachedAt: new Date(now).toISOString(),
      cacheAgeDays: 0,
    };

    // Save to 7-day persistent cache
    cache[cleanPhone] = {
      data: responsePayload,
      timestamp: now,
    };
    writeFraudCache(cache);

    return NextResponse.json(responsePayload);
  } catch (error: any) {
    console.error("Fraud check route error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to perform fraud check" },
      { status: 500 }
    );
  }
}
