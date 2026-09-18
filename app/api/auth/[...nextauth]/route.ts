import { NextRequest } from "next/server";
import { handlers } from "@/lib/auth";
import { getResilientSetting } from "@/lib/settings-store";

async function ensureGoogleCredentials() {
  const googleId = await getResilientSetting("GOOGLE_CLIENT_ID");
  const googleSecret = await getResilientSetting("GOOGLE_CLIENT_SECRET");
  if (googleId) process.env.GOOGLE_CLIENT_ID = googleId;
  if (googleSecret) process.env.GOOGLE_CLIENT_SECRET = googleSecret;
}

export async function GET(req: NextRequest) {
  await ensureGoogleCredentials();
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  await ensureGoogleCredentials();
  return handlers.POST(req);
}
