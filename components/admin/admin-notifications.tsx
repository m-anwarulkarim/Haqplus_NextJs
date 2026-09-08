"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, ShoppingBag, Truck, AlertTriangle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { requestFCMToken, onForegroundMessage } from "@/lib/firebase";



export function AdminNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState<number>(0);

  function playNotificationChime() {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const currentTime = ctx.currentTime;

      // Note 1: D5 (587.33Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(587.33, currentTime);
      gain1.gain.setValueAtTime(0.4, currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.25);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(currentTime);
      osc1.stop(currentTime + 0.25);

      // Note 2: A5 (880Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(880, currentTime + 0.15);
      gain2.gain.setValueAtTime(0.5, currentTime + 0.15);
      gain2.gain.exponentialRampToValueAtTime(0.001, currentTime + 0.5);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(currentTime + 0.15);
      osc2.stop(currentTime + 0.5);
    } catch (err) {
      console.warn("Audio chime error:", err);
    }
  }

  useEffect(() => {
    setNow(Date.now());
  }, []);

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await fetch("/api/admin/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    }

    async function initFCM() {
      const token = await requestFCMToken();
      if (token) {
        try {
          await fetch("/api/users/fcm-token", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          });
        } catch (err) {
          console.error("Failed to save FCM token:", err);
        }
      }
    }

    fetchNotifications();
    initFCM();

    // Listen for foreground push notifications
    const unsubscribePromise = onForegroundMessage((payload: any) => {
      if (!payload) return;

      const title = payload.notification?.title || payload.data?.title || "New Order Received!";
      const body = payload.notification?.body || payload.data?.body || "";
      const link = payload.data?.link || "/admin/orders";

      const newNotif = {
        id: Date.now().toString(),
        title,
        description: body,
        time: "Just now",
        type: payload.data?.type || "order",
        link,
        unread: true,
      };
      setNotifications((prev) => [newNotif, ...prev]);

      // 1. Play audio chime sound
      playNotificationChime();

      // 2. Show native OS Desktop Sidebar Popup
      if ("Notification" in window && Notification.permission === "granted") {
        try {
          const desktopNotif = new Notification(title, {
            body,
            icon: "/logo.png",
            tag: `order-${Date.now()}`,
            requireInteraction: true,
          });
          desktopNotif.onclick = () => {
            window.focus();
            if (link) window.location.href = link;
          };
        } catch (e) {
          console.warn("Native Notification error:", e);
        }
      }
    });

    return () => {
      unsubscribePromise.then((unsub) => {
        if (typeof unsub === "function") unsub();
      });
    };
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  function formatTimeAgo(dateString: string) {
    if (!now) return dateString;
    const diff = now - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    return `${Math.floor(hours / 24)} days ago`;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={(props) => (
        <button
          {...props}
          title="Notifications & System Alerts"
          className="relative flex size-9 items-center justify-center rounded-full border border-border/80 bg-background text-foreground hover:bg-muted/80 hover:border-border transition-all outline-none cursor-pointer shadow-xs active:scale-95"
        >
          <Bell className="size-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 size-2 rounded-full bg-amber-500 ring-2 ring-background animate-pulse" />
          )}
        </button>
      )} />

      <DropdownMenuContent align="end" className="w-80 p-0 shadow-2xl border-border/80 rounded-2xl overflow-hidden">
        <div className="p-3.5 border-b border-border/80 flex items-center justify-between bg-card">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.2 text-[10px] font-bold rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                {unreadCount} new
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] font-semibold text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto divide-y divide-border/60 bg-card">
          {loading ? (
            <div className="p-4 text-center text-xs text-muted-foreground">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-xs text-muted-foreground">No new notifications</div>
          ) : (
            notifications.map((n) => {
              const content = (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      {n.type === "order" && <ShoppingBag className="size-3.5 text-blue-500 shrink-0" />}
                      {n.type === "courier" && <Truck className="size-3.5 text-emerald-500 shrink-0" />}
                      {n.type === "stock" && <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />}
                      <span>{n.title}</span>
                    </p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {n.time.includes("ago") ? n.time : formatTimeAgo(n.time)}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground pl-5">{n.description}</p>
                </>
              );

              return n.link ? (
                <Link
                  key={n.id}
                  href={n.link}
                  className={`block p-3 text-xs space-y-1 transition-colors ${
                    n.unread ? "bg-muted/40" : "hover:bg-muted/20"
                  }`}
                >
                  {content}
                </Link>
              ) : (
                <div
                  key={n.id}
                  className={`p-3 text-xs space-y-1 transition-colors ${
                    n.unread ? "bg-muted/40" : "hover:bg-muted/20"
                  }`}
                >
                  {content}
                </div>
              );
            })
          )}
        </div>

        <div className="p-2.5 border-t border-border/80 bg-muted/20 text-center">
          <Link
            href="/admin/orders"
            className="text-[11px] font-bold text-primary hover:underline"
          >
            View all orders & alerts &rarr;
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
