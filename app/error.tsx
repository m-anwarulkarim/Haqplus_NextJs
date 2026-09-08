"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4">
      <div className="size-20 rounded-3xl bg-destructive/10 text-destructive flex items-center justify-center mb-6 shadow-sm">
        <AlertTriangle className="size-10" />
      </div>

      <span className="text-sm font-bold uppercase tracking-widest text-destructive mb-2">
        Something Went Wrong
      </span>

      <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground max-w-md">
        An unexpected error occurred.
      </h1>

      <p className="text-sm text-muted-foreground max-w-md mt-3 mb-8">
        We encountered a hiccup processing your request. Please try again or return to the homepage.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button onClick={() => reset()} className="rounded-xl shadow-xs gap-2">
          <RefreshCw className="size-4" />
          <span>Try Again</span>
        </Button>

        <Button variant="outline" asChild className="rounded-xl gap-2">
          <Link href="/">
            <Home className="size-4" />
            <span>Go to Homepage</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
