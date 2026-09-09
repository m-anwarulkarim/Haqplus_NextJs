const { execSync } = require('child_process');

process.env.NPM_CONFIG_LEGACY_PEER_DEPS = 'true';

// Check if this process was spawned by Vercel CLI (to avoid recursion)
if (process.env.__NEXT_ON_PAGES_BUILD) {
  console.log('Running standard next build for next-on-pages adapter...');
  execSync('npx next build', { stdio: 'inherit', env: process.env });
} else {
  console.log('Starting Cloudflare next-on-pages build process...');
  process.env.__NEXT_ON_PAGES_BUILD = '1';
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
  execSync('npx @cloudflare/next-on-pages', { stdio: 'inherit', env: process.env });
}
