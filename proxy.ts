import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * Next.js 16 Proxy / Middleware for route protection.
 * Protects /admin routes ensuring only users with ADMIN role have access.
 */
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Protect all /admin routes
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", encodeURI(pathname));
      return NextResponse.redirect(loginUrl);
    }

    // Role-based authorization: reject if not ADMIN
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
});

export default proxy;

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
