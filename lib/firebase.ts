import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, isSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase Client App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export { app };

export const requestFCMToken = async () => {
  try {
    if (typeof window === "undefined") return null;

    const supported = await isSupported();
    if (!supported) {
      console.warn("FCM Messaging is not supported in this browser environment.");
      return null;
    }

    const messaging = getMessaging(app);

    // Register service worker if available
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        const token = await getToken(messaging, {
          serviceWorkerRegistration: registration,
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || undefined,
        });
        return token;
      } else {
        console.warn("Notification permission denied by user.");
      }
    }
  } catch (error) {
    console.error("Error getting FCM Token:", error);
  }
  return null;
};

export const onForegroundMessage = async (callback: (payload: unknown) => void) => {
  try {
    if (typeof window === "undefined") return;
    const supported = await isSupported();
    if (!supported) return;

    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      callback(payload);
    });
  } catch (error) {
    console.error("Error setting foreground message listener:", error);
  }
};
