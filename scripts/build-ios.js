#!/usr/bin/env node
/**
 * scripts/build-ios.js
 * 
 * Proper static export builder for Capacitor iOS.
 * 
 * Architecture:
 *   - The Next.js API routes live in app/api/ and run on Vercel servers.
 *   - Capacitor only bundles the static frontend (HTML/JS/CSS).
 *   - The iOS app calls https://squito-app.vercel.app/api/... at runtime.
 * 
 * This script temporarily renames app/api → app/_api so that
 * `next build` with `output: export` can produce a clean static SPA
 * into the out/ folder without touching the backend code.
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const apiDir = path.join(root, "app", "api");
const apiHidden = path.join(root, "app", "_api");
const configPath = path.join(root, "next.config.mjs");

function run(cmd) {
  console.log(`\n▶ ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: root });
}

let configBackup = "";
let didRename = false;

try {
  // 1. Backup the Next.js config and inject output: export
  configBackup = fs.readFileSync(configPath, "utf8");
  const exportConfig = configBackup.replace(
    "const nextConfig = {",
    'const nextConfig = {\n  output: "export",'
  );
  fs.writeFileSync(configPath, exportConfig);
  console.log("✅ Enabled output: export in next.config.mjs");

  // 2. Temporarily hide app/api so the static build ignores it
  if (fs.existsSync(apiDir)) {
    fs.renameSync(apiDir, apiHidden);
    didRename = true;
    console.log("✅ Temporarily hidden app/api → app/_api");
  }

  // 3. Clean previous build artifacts
  run("rm -rf .next out");

  // 4. Build the static SPA
  run("npx next build");

  // 5. Sync the out/ directory into the iOS Xcode project
  run("npx cap sync");

  console.log("\n✅ iOS build complete. out/ → ios/App/App/public/ synced.");

} catch (err) {
  console.error("\n❌ Build failed:", err.message);
  process.exit(1);

} finally {
  // 6. Always restore no matter what
  if (didRename && fs.existsSync(apiHidden)) {
    fs.renameSync(apiHidden, apiDir);
    console.log("✅ Restored app/api from app/_api");
  }
  if (configBackup) {
    fs.writeFileSync(configPath, configBackup);
    console.log("✅ Restored next.config.mjs");
  }
}
