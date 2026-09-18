const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = process.cwd();
const zipDest = path.join(rootDir, "cpanel_source_deploy.zip");

if (fs.existsSync(zipDest)) {
  try {
    fs.unlinkSync(zipDest);
  } catch (e) {}
}

// Ensure .htaccess exists with proper cPanel Passenger settings
const htaccessContent = `# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION BEGIN
PassengerAppType node
PassengerStartupFile server.js
# DO NOT REMOVE. CLOUDLINUX PASSENGER CONFIGURATION END

Options -Indexes

<Files ".env">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order allow,deny
    Deny from all
  </IfModule>
</Files>`;

fs.writeFileSync(path.join(rootDir, ".htaccess"), htaccessContent.trim(), "utf-8");

console.log("📦 Creating cpanel_source_deploy.zip WITHOUT node_modules...");

const psCommand = `powershell -Command "Get-ChildItem -Path '${rootDir}' -Exclude 'node_modules','.next','.git','*.zip','*.lock' -Force | Compress-Archive -DestinationPath '${zipDest}' -Force"`;

try {
  execSync(psCommand, { stdio: "inherit" });
  console.log("✅ cpanel_source_deploy.zip created successfully!");
} catch (err) {
  console.error("❌ Failed to create zip:", err.message);
}
