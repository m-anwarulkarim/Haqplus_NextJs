"use client";

import { type ReactNode } from "react";
import { SessionProvider } from "./session-provider";
import { Toaster } from "@/components/ui/toast";

interface RootProviderProps {
  children: ReactNode;
}

export function RootProvider({ children }: RootProviderProps) {
  return (
    <SessionProvider>
      {children}
      <Toaster />
    </SessionProvider>
  );
}
