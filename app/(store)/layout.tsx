import { StoreLayout } from "@/components/layout/store-layout";
import { type ReactNode } from "react";
import { LiveChatWidget } from "@/components/ui/live-chat-widget";

export default function StorefrontLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <StoreLayout>{children}</StoreLayout>
      <LiveChatWidget />
    </>
  );
}
