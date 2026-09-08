import Link from "next/link";
import { ShoppingBag, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center text-center px-4">
      <div className="size-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-6 shadow-sm">
        <ShoppingBag className="size-10" />
      </div>

      <span className="text-sm font-bold uppercase tracking-widest text-primary mb-2">
        404 Page Not Found
      </span>

      <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground max-w-md">
        Looks like you're a bit lost.
      </h1>

      <p className="text-sm sm:text-base text-muted-foreground max-w-md mt-3 mb-8">
        The product or page you are looking for might have been moved, renamed, or is temporarily
        unavailable.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button asChild className="rounded-xl shadow-xs gap-2">
          <Link href="/">
            <Home className="size-4" />
            <span>Back to Storefront</span>
          </Link>
        </Button>

        <Button variant="outline" asChild className="rounded-xl gap-2">
          <Link href="/products">
            <Search className="size-4" />
            <span>Explore All Products</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
