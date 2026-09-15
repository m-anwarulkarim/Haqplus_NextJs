import { NextResponse } from "next/server";
import { getAllResilientSettings } from "@/lib/settings-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawPhone = searchParams.get("phone");

    if (!rawPhone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Clean phone number (keep last 11 digits for BD format: 01XXXXXXXXX)
    let cleanPhone = rawPhone.replace(/\D/g, "");
    if (cleanPhone.length > 11) {
      cleanPhone = cleanPhone.slice(-11);
    }

    if (cleanPhone.length < 11) {
      return NextResponse.json(
        { error: "Invalid Bangladeshi mobile number" },
        { status: 400 }
      );
    }

    // Read settings from dashboard store first, fallback to process.env
    const dbSettings = await getAllResilientSettings();

    const clientId = dbSettings.PATHAO_CLIENT_ID || process.env.PATHAO_CLIENT_ID || "MvbmODneYA";
    const clientSecret = dbSettings.PATHAO_CLIENT_SECRET || process.env.PATHAO_CLIENT_SECRET || "IOVoc6Idv9dfRcPO9OK9uC9gvAhUmlkF";
    const username = dbSettings.PATHAO_USERNAME || process.env.PATHAO_USERNAME || "";
    const password = dbSettings.PATHAO_PASSWORD || process.env.PATHAO_PASSWORD || "";
    const baseUrl = dbSettings.PATHAO_BASE_URL || process.env.PATHAO_BASE_URL || "https://api-hermes.pathao.com";

    let total = 0;
    let success = 0;
    let cancelled = 0;
    let fetchedFromLivePathao = false;
    let dataSource = "Nationwide Courier Network";

    // 1. If merchant username/password provided, issue Pathao production OAuth token
    if (username && password) {
      try {
        const authRes = await fetch(`${baseUrl}/aladdin/api/v1/issue-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: clientId,
            client_secret: clientSecret,
            username,
            password,
            grant_type: "password",
          }),
        });

        if (authRes.ok) {
          const authData = await authRes.json();
          const token = authData.access_token;

          if (token) {
            const fraudRes = await fetch(`${baseUrl}/aladdin/api/v1/user/fraud-check`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ phone: cleanPhone }),
            });

            if (fraudRes.ok) {
              const fraudData = await fraudRes.json();
              const pData = fraudData.data || fraudData;
              total = Number(pData.total_parcel || pData.total_parcels || pData.total_orders || 0);
              success = Number(pData.success_parcel || pData.success_parcels || pData.successful_orders || 0);
              cancelled = Number(pData.cancelled_parcel || pData.cancelled_parcels || pData.returned_orders || 0);
              fetchedFromLivePathao = true;
              dataSource = "Direct Pathao Merchant Network";
            }
          }
        }
      } catch (e) {
        // Silent catch for OAuth
      }
    }

    // 2. Fallback: Pathao has no open public endpoint without merchant auth.
    // If Pathao merchant credentials are not configured, do NOT fetch from Steadfast API (portal.packzy.com) to avoid presenting Steadfast data under Pathao.
    if (!fetchedFromLivePathao) {
      dataSource = "Pathao API (Not Connected)";
    }

    // Ensure total_parcel is accurate (total = success + cancelled if total was lower)
    if (total === 0 || total < (success + cancelled)) {
      total = success + cancelled;
    }

    const successRate = total > 0 ? Number(((success / total) * 100).toFixed(1)) : 100;

    let riskLevel: "SAFE" | "MODERATE" | "HIGH_RISK" | "NO_RECORD" = "SAFE";
    if (total === 0) {
      riskLevel = "NO_RECORD";
    } else if (successRate < 50 || cancelled > success) {
      riskLevel = "HIGH_RISK";
    } else if (successRate < 80) {
      riskLevel = "MODERATE";
    }

    let statusCode = "PATHAO_NOT_CONNECTED";
    let note = "Pathao Merchant API is not connected. Go to /admin/api to enter your Pathao Merchant Email & Password.";

    if (fetchedFromLivePathao) {
      statusCode = total > 0 ? "PATHAO_RECORD_FOUND" : "PATHAO_CONNECTED_PRIVACY_RESTRICTED";
      note = total > 0
        ? "Connected to Pathao Merchant Live API."
        : "Pathao Merchant API is connected! Note: Pathao official API protects customer privacy and only tracks orders dispatched through your merchant account.";
    } else if (username && password) {
      statusCode = "PATHAO_AUTH_FAILED";
      note = "Failed to authenticate with Pathao API. Please check your Pathao Username and Password in /admin/api.";
    }

    return NextResponse.json({
      success: true,
      courier: "Pathao Courier",
      phone: cleanPhone,
      total_parcel: total,
      success_parcel: success,
      cancelled_parcel: cancelled,
      success_rate: successRate,
      risk_level: riskLevel,
      data_source: dataSource,
      status_code: statusCode,
      is_pathao_connected: fetchedFromLivePathao,
      note,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to query Pathao fraud check service" },
      { status: 500 }
    );
  }
}
