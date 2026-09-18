import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { getResilientSetting } from "@/lib/settings-store";

export async function getAdminMessaging() {
  if (getApps().length > 0) {
    return getMessaging();
  }

  const projectId = (await getResilientSetting("FIREBASE_PROJECT_ID")) || process.env.FIREBASE_PROJECT_ID;
  const clientEmail = (await getResilientSetting("FIREBASE_CLIENT_EMAIL")) || process.env.FIREBASE_CLIENT_EMAIL;
  let rawPrivateKey = (await getResilientSetting("FIREBASE_PRIVATE_KEY")) || process.env.FIREBASE_PRIVATE_KEY;

  if (projectId && clientEmail && rawPrivateKey) {
    const privateKey = rawPrivateKey.replace(/\\n/g, "\n");
    try {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      return getMessaging();
    } catch (e) {
      console.error("Firebase Admin initialization error:", e);
    }
  }

  return null;
}

if (getApps().length === 0) {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  if (projectId && clientEmail && privateKey) {
    try {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (e) {}
  }
}

export const adminMessaging = getApps().length > 0 ? getMessaging() : null;
