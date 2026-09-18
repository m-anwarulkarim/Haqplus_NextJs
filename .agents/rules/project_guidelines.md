---
trigger: always_on
---

# Project Architecture & Deployment Rules

## 1. Cloudflare & OpenNext Build Rules (CRITICAL)

- **Middleware Runtime:** Always maintain root middleware as `middleware.ts` using Edge-compatible logic.
- **DO NOT rename `middleware.ts` to `proxy.ts`:** In Next.js 16, `proxy.ts` forces Node.js middleware runtime (`functionsConfigManifest`), which triggers OpenNext Cloudflare's experimental `bundleNodeMiddleware` step and breaks with `@opentelemetry/api` esbuild resolution errors during Cloudflare Pages/Workers deployments.

## 2. UI & Component Preferences

- **Prefer shadcn/ui:** When building UI elements or components, prioritize using `shadcn/ui` components whenever appropriate, provided it results in clean, modern, and maintainable code.
