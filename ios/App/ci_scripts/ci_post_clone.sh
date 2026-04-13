#!/bin/sh
# =============================================================================
# Xcode Cloud — ci_post_clone.sh
#
# Runs ONCE after Xcode Cloud clones the repository.
# Goal: install npm dependencies and sync Capacitor native plugins so that
# the Xcode project can resolve all package references at build time.
#
# DO NOT run `next build` here. The compiled static web bundle is already
# committed inside ios/App/App/public/ and does not need to be rebuilt in CI.
# =============================================================================

set -e  # Exit immediately on any error so failures are loud and clear

echo "▶ [ci_post_clone] Starting post-clone setup..."

# ── 1. Locate Node.js ────────────────────────────────────────────────────────
# Xcode Cloud agents ship with Node pre-installed at one of these paths.
# We do NOT use Homebrew — it is slow, unreliable, and often exits non-zero.

NODE_PATH=""
for candidate in \
    "/usr/local/bin/node" \
    "/opt/homebrew/bin/node" \
    "/usr/bin/node"; do
  if [ -x "$candidate" ]; then
    NODE_PATH="$candidate"
    break
  fi
done

if [ -z "$NODE_PATH" ]; then
  echo "❌ Node.js not found. Xcode Cloud agents ship with Node — check agent image."
  exit 1
fi

NPM_PATH="$(dirname "$NODE_PATH")/npm"
NPX_PATH="$(dirname "$NODE_PATH")/npx"

echo "✅ Node: $("$NODE_PATH" --version)  at $NODE_PATH"
echo "✅ npm:  $("$NPM_PATH" --version)  at $NPM_PATH"

# ── 2. Move to the repository root ───────────────────────────────────────────
# $CI_WORKSPACE is set by Xcode Cloud to the cloned repo root.
cd "$CI_WORKSPACE"
echo "✅ Working directory: $(pwd)"

# ── 3. Install all npm dependencies ──────────────────────────────────────────
# --legacy-peer-deps prevents hard stops on minor peer version mismatches
# that are common across Capacitor's ecosystem.
echo "▶ Installing npm dependencies..."
"$NPM_PATH" install --legacy-peer-deps
echo "✅ npm install complete"

# ── 4. Sync Capacitor plugins into the Xcode project ─────────────────────────
# This resolves all @capacitor/* and @capgo/* native packages that SPM needs.
echo "▶ Running cap sync..."
"$NPX_PATH" cap sync ios
echo "✅ cap sync complete"

echo ""
echo "✅ [ci_post_clone] Setup finished successfully."
