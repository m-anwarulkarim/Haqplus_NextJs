import { StoreLayout } from "@/components/layout/store-layout";
import { type ReactNode } from "react";

export default function StorefrontLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <StoreLayout>{children}</StoreLayout>;
}
