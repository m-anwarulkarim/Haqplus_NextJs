# Project Architecture & Deployment Rules

## 1. Cloudflare & OpenNext Build Rules (CRITICAL)
- **Middleware Runtime:** Always maintain root middleware as `middleware.ts` using Edge-compatible logic.
- **DO NOT rename `middleware.ts` to `proxy.ts`:** In Next.js 16, `proxy.ts` forces Node.js middleware runtime (`functionsConfigManifest`), which triggers OpenNext Cloudflare's experimental `bundleNodeMiddleware` step and breaks with `@opentelemetry/api` esbuild resolution errors during Cloudflare Pages/Workers deployments.

## 2. Courier & Fraud Checker Rules
- **Supported Couriers:** Steadfast & Pathao.
- **Steadfast Fraud Check:** Endpoint `/api/courier/steadfast/fraud-check` queries Steadfast nationwide parcel record database + uses 7-day persistent cache (`.data/fraud_cache.json`).
- **Pathao Fraud Check:** Endpoint `/api/courier/pathao/fraud-check` queries Pathao merchant API.
- **UI Integration:** Keep both Steadfast and Pathao fraud check options in Admin Courier Manager (`/admin/courier`) and Order Details page (`/admin/orders/[id]`).

## 3. Database & Image Storage Rules
- **Database:** PostgreSQL on Supabase Cloud (Prisma ORM).
- **Image Upload & Storage:** UploadThing (`app/api/uploadthing`) is the primary service for image uploads. Store image CDN URLs in PostgreSQL database tables (`Product.images`, `Category.image`, `User.image`, `Review.images`).
