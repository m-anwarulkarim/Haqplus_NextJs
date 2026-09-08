import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Access Denied — haqplus",
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-muted/20">
      <div className="flex size-20 items-center justify-center rounded-3xl bg-destructive/10 text-destructive mb-6 shadow-sm">
        <ShieldAlert className="size-10" />
      </div>

      <span className="rounded-full bg-destructive/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-destructive mb-3">
        403 Forbidden
      </span>

      <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mb-3">
        Administrator Access Required
      </h1>

      <p className="max-w-md text-sm text-muted-foreground leading-relaxed mb-8">
        Your current account does not have permission to view this section. This area
        is reserved strictly for users with the <strong className="text-foreground">ADMIN</strong> role.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button asChild className="rounded-xl h-11 px-6 gap-2 shadow-xs">
          <Link href="/">
            <Home className="size-4" />
            <span>Return to Storefront</span>
          </Link>
        </Button>

        <Button variant="outline" asChild className="rounded-xl h-11 px-6 gap-2">
          <Link href="/login">
            <ArrowLeft className="size-4" />
            <span>Switch Account</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
