const fs = require("fs");
const path = require("path");

const rootDir = process.cwd();
const standaloneDir = path.join(rootDir, ".next", "standalone");

if (!fs.existsSync(standaloneDir)) {
  fs.mkdirSync(standaloneDir, { recursive: true });
}

// 1. Copy server.js
const serverJsSrc = path.join(rootDir, "server.js");
const serverJsDest = path.join(standaloneDir, "server.js");
if (fs.existsSync(serverJsSrc)) {
  fs.copyFileSync(serverJsSrc, serverJsDest);
  console.log("✓ Copied server.js to .next/standalone/server.js");
}

// 2. Copy package.json
const pkgSrc = path.join(rootDir, "package.json");
const pkgDest = path.join(standaloneDir, "package.json");
if (fs.existsSync(pkgSrc)) {
  fs.copyFileSync(pkgSrc, pkgDest);
  console.log("✓ Copied package.json to .next/standalone/package.json");
}

// 2b. Copy prisma directory
const prismaSrc = path.join(rootDir, "prisma");
const prismaDest = path.join(standaloneDir, "prisma");
if (fs.existsSync(prismaSrc)) {
  fs.cpSync(prismaSrc, prismaDest, { recursive: true });
  console.log("✓ Copied prisma/ to .next/standalone/prisma");
}

// 3. Copy public directory into .next/standalone/public
const publicSrc = path.join(rootDir, "public");
const publicDest = path.join(standaloneDir, "public");
if (fs.existsSync(publicSrc)) {
  fs.cpSync(publicSrc, publicDest, { recursive: true });
  console.log("✓ Copied public/ to .next/standalone/public");
}

// 4. Prepare cPanel .env inside .next/standalone/.env
const envSrc = path.join(rootDir, ".env");
const envDest = path.join(standaloneDir, ".env");
if (fs.existsSync(envSrc)) {
  let envContent = fs.readFileSync(envSrc, "utf-8");
  
  envContent = envContent.replace(
    /DATABASE_URL="postgresql:\/\/postgres\.yzuxwzcysucbzedecizt:[^"]+"/g,
    '# DATABASE_URL="postgresql://postgres.yzuxwzcysucbzedecizt:..."'
  );
  envContent = envContent.replace(
    /DIRECT_URL="postgresql:\/\/postgres\.yzuxwzcysucbzedecizt:[^"]+"/g,
    '# DIRECT_URL="postgresql://postgres.yzuxwzcysucbzedecizt:..."'
  );
  envContent = envContent.replace(
    /NEXTAUTH_URL="http:\/\/localhost:3000"/g,
    'NEXTAUTH_URL="https://test.jessoreseed.com"'
  );

  if (!envContent.includes('DATABASE_URL="postgresql://modernve_haqplus_user')) {
    envContent = `DATABASE_URL="postgresql://modernve_haqplus_user:ohrhe%2BH8mvDz0E-.@127.0.0.1:5432/modernve_haqplus_db"\nDIRECT_URL="postgresql://modernve_haqplus_user:ohrhe%2BH8mvDz0E-.@127.0.0.1:5432/modernve_haqplus_db"\nAUTH_TRUST_HOST=true\n` + envContent;
  } else {
    envContent = `AUTH_TRUST_HOST=true\n` + envContent;
  }

  fs.writeFileSync(envDest, envContent, "utf-8");
  console.log("✓ Generated cPanel .env in .next/standalone/.env");
}

// 5. Copy .next build output into .next/standalone/.next
const nextBuildSrc = path.join(rootDir, ".next");
const nextBuildDest = path.join(standaloneDir, ".next");
fs.mkdirSync(nextBuildDest, { recursive: true });

const nextItems = fs.readdirSync(nextBuildSrc);
for (const item of nextItems) {
  if (
    item === "standalone" ||
    item === "cache" ||
    item === "node_modules" ||
    item === "dev" ||
    item === "turbopack" ||
    item === "lock"
  ) {
    continue;
  }
  const itemSrc = path.join(nextBuildSrc, item);
  const itemDest = path.join(nextBuildDest, item);
  try {
    if (fs.lstatSync(itemSrc).isDirectory()) {
      fs.cpSync(itemSrc, itemDest, { recursive: true });
    } else {
      fs.copyFileSync(itemSrc, itemDest);
    }
  } catch (err) {
    console.warn(`Skipped copying ${item}:`, err.message);
  }
}
console.log("✓ Copied .next build assets to .next/standalone/.next");

console.log("\n🎉 cPanel Deployment Package Ready in .next/standalone!");
