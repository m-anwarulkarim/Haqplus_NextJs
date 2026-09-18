<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Guidelines & Architecture Notes

## 1. Cloudflare & OpenNext Build Rules (CRITICAL)

- **Middleware Runtime:** Always maintain root middleware as `middleware.ts` using Edge-compatible logic.
- **DO NOT rename `middleware.ts` to `proxy.ts`:** In Next.js 16, `proxy.ts` forces Node.js middleware runtime (`functionsConfigManifest`), which triggers OpenNext Cloudflare's experimental `bundleNodeMiddleware` step and breaks with `@opentelemetry/api` esbuild resolution errors during Cloudflare Pages/Workers deployments.

## 2. UI & Component Preferences

- **Prefer shadcn/ui:** When building UI elements or components, try to use `shadcn/ui` components whenever appropriate, provided it produces a clean, maintainable, and high-quality implementation.
