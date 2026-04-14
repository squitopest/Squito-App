#!/usr/bin/env node

/**
 * patch-apple-sign-in.js
 *
 * The @capacitor-community/apple-sign-in plugin (v7.1.0) ships a Package.swift
 * that restricts capacitor-swift-pm to 7.x  (from: "7.0.0").
 * Our project uses Capacitor 8, which causes an SPM version conflict.
 *
 * This script rewrites that constraint to  from: "7.0.0"  →  "7.0.0"..."9.0.0"
 * so SPM can resolve both apple-sign-in AND the other Capacitor 8 plugins.
 *
 * It is safe to run repeatedly (idempotent).
 */

const fs = require("fs");
const path = require("path");

const TARGET = path.join(
  __dirname,
  "..",
  "node_modules",
  "@capacitor-community",
  "apple-sign-in",
  "Package.swift"
);

if (!fs.existsSync(TARGET)) {
  console.log("[patch] @capacitor-community/apple-sign-in not installed – skipping.");
  process.exit(0);
}

let content = fs.readFileSync(TARGET, "utf8");

// Already patched?
if (content.includes('"7.0.0"..."9.0.0"')) {
  console.log("[patch] Package.swift already patched – nothing to do.");
  process.exit(0);
}

// Replace  from: "7.0.0"  with  "7.0.0"..."9.0.0"
const OLD = '.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", from: "7.0.0")';
const NEW = '.package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", "7.0.0"..."9.0.0")';

if (!content.includes(OLD)) {
  console.error("[patch] Could not find expected dependency line in Package.swift.");
  console.error("[patch] The plugin may have been updated. Manual review required.");
  process.exit(1);
}

content = content.replace(OLD, NEW);
fs.writeFileSync(TARGET, content, "utf8");
console.log("[patch] ✅ Patched apple-sign-in Package.swift → capacitor-swift-pm \"7.0.0\"...\"9.0.0\"");
