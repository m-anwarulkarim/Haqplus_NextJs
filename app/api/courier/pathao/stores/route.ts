import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPathaoStores, getPathaoCredentials } from "@/lib/courier/pathao";

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const creds = await getPathaoCredentials();
    if (!creds) {
      return NextResponse.json(
        { error: "Pathao credentials not configured in /admin/api" },
        { status: 400 }
      );
    }

    const storesRes = await getPathaoStores();
    return NextResponse.json({
      success: true,
      credentials: {
        username: creds.username,
        baseUrl: creds.baseUrl,
      },
      stores: storesRes.data?.data || storesRes.data || [],
      raw: storesRes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch Pathao stores" },
      { status: 500 }
    );
  }
}
