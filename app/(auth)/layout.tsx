import Link from "next/link";
import { Leaf } from "lucide-react";
import { type ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-muted/40 via-background to-background p-4 sm:p-6 lg:p-8">
      {/* Top Header Logo */}
      <div className="w-full max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm">
            <Leaf className="size-4" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            haq<span className="text-emerald-600 font-black">plus</span>
          </span>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          ← ব্যাক টু হোম (Back to Store)
        </Link>
      </div>

      {/* Main Centered Auth Form */}
      <div className="w-full flex items-center justify-center py-8">
        {children}
      </div>

      {/* Auth Footer */}
      <div className="w-full text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} haqplus. নিরাপদ ও এনক্রিপ্টেড কেনাকাটা।
      </div>
    </div>
  );
}
