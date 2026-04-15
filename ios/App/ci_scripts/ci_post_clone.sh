#!/bin/sh
# =============================================================================
# Xcode Cloud — ci_post_clone.sh
#
# Runs ONCE after Xcode Cloud clones the repository.
#
# Why we do all of this here:
#   1. node_modules are gitignored → must be installed fresh in CI
#   2. The compiled web bundle (out/) is gitignored → must be built in CI
#   3. `cap sync` copies the built bundle into ios/App/App/public/ and
#      registers all native Capacitor plugins with Xcode
#
# The four-step pipeline: npm install → inject env vars → next build → cap sync
# =============================================================================

set -e  # Exit immediately on any error so failures are loud and clear

echo "============================================================"
echo "  Squito — Xcode Cloud post-clone setup"
echo "============================================================"

# ── 1. Install / Locate Node.js ──────────────────────────────────────────────
# Xcode Cloud agents have Homebrew pre-installed but NOT Node.js.
# We check the PATH first (fast). If missing, we install via Homebrew (reliable).

if command -v node > /dev/null 2>&1; then
  echo "✅ Node already available: $(node --version)"
else
  echo "▶ Node.js not found — installing via Homebrew..."
  brew install node
  echo "✅ Node installed: $(node --version)"
fi

NODE_BIN=$(command -v node)
NPM_BIN=$(command -v npm)
NPX_BIN=$(command -v npx)

echo "✅ Node: $(node --version)  at $NODE_BIN"
echo "✅ npm:  $(npm --version)   at $NPM_BIN"

# ── 2. Move to the repository root ───────────────────────────────────────────
# $CI_WORKSPACE is unreliable — it may be empty on Xcode Cloud.
# Instead, compute the repo root from this script's own location.
# Script lives at: ios/App/ci_scripts/ci_post_clone.sh → 3 dirs up = repo root.
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$REPO_ROOT"
echo "✅ Working directory: $(pwd)"

# ── 3. Install all npm dependencies ──────────────────────────────────────────
# --legacy-peer-deps prevents hard stops on minor peer version mismatches
# that are common across the Capacitor plugin ecosystem.
echo ""
echo "▶ Step 1/4 — Installing npm dependencies..."
"$NPM_BIN" install --legacy-peer-deps
echo "✅ npm install complete"

# ── 4. Write build-time environment variables ────────────────────────────────
# .env.local is gitignored so it must be created here before next build runs.
#
# WHY HARDCODED — NOT Xcode Cloud environment variables:
# Xcode Cloud rejects URLs and JWT tokens as env var values (invalid value
# error). This is fine because ALL NEXT_PUBLIC_* variables are intentionally
# public — Next.js bakes them verbatim into the client JS bundle that any
# user can read. They are not secrets. The real secrets (Stripe secret key,
# Supabase service role key, etc.) live only in Vercel and are never needed
# during this static iOS build.
echo ""
echo "▶ Step 2/4 — Writing build-time environment variables..."
cat > "$REPO_ROOT/.env.local" << 'ENVEOF'
NEXT_PUBLIC_SUPABASE_URL=https://nwvvjnqjdpzwlzhvksse.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53dnZqbnFqZHB6d2x6aHZrc3NlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2ODY1MTQsImV4cCI6MjA5MTI2MjUxNH0.hH7JseYsOqL2W8mefATD6n3qgTOMHgv7LXZGouPpuXQ
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51RIGNbRv4Y2X5bnMgMhX8iNzqBGcuMu6ayI93BBPZROLLWL13AjgOLFnojlzyt3Ahtbvlm9VOjrJSkHiNLH5QnoH00hKYFii9z
NEXT_PUBLIC_ONESIGNAL_APP_ID=4512d5e3-d8cc-487d-88e5-eeac22698d0d
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDRF0_NM0eAneG1ANWEKX9Lr-oCHEyw3uQ
ENVEOF
echo "✅ .env.local written for build"

# ── 5. Build the static Next.js web bundle ────────────────────────────────────
# We temporarily hide app/api/ (backend API routes) because Next.js cannot
# statically export routes that use server-only APIs (Stripe, Supabase, etc).
# The iOS app calls these APIs at runtime on https://squito-app.vercel.app.
echo ""
echo "▶ Step 3/4 — Building static web bundle..."

API_DIR="$REPO_ROOT/app/api"
API_HIDDEN="$REPO_ROOT/app/_api"
CONFIG="$REPO_ROOT/next.config.mjs"

# Backup the Next.js config and enable static export mode
CONFIG_BACKUP=$(cat "$CONFIG")
printf '%s' "$CONFIG_BACKUP" | sed 's/const nextConfig = {/const nextConfig = {\n  output: "export",/' > "$CONFIG"
echo "  → Enabled output: export in next.config.mjs"

# Hide API routes from the static build
if [ -d "$API_DIR" ]; then
  mv "$API_DIR" "$API_HIDDEN"
  echo "  → Temporarily hidden app/api → app/_api"
fi

# Run the build (restore config and API dir no matter what)
"$NPM_BIN" run build || {
  # Restore on failure
  [ -d "$API_HIDDEN" ] && mv "$API_HIDDEN" "$API_DIR"
  printf '%s' "$CONFIG_BACKUP" > "$CONFIG"
  echo "❌ next build failed"
  exit 1
}

# Restore
[ -d "$API_HIDDEN" ] && mv "$API_HIDDEN" "$API_DIR" && echo "  → Restored app/api"
printf '%s' "$CONFIG_BACKUP" > "$CONFIG" && echo "  → Restored next.config.mjs"
echo "✅ Static build complete (out/ generated)"

# ── 6. Sync Capacitor — copies web bundle + registers native plugins ──────────
echo ""
echo "▶ Step 4/4 — Running cap sync..."
"$NPX_BIN" cap sync ios
echo "✅ cap sync complete — web bundle and plugins registered with Xcode"

echo ""
echo "============================================================"
echo "  ✅ Post-clone setup complete. Xcode build can proceed."
echo "============================================================"
