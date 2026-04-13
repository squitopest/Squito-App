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

# ── 1. Locate Node.js ────────────────────────────────────────────────────────
# Xcode Cloud agents ship with Node pre-installed. We do NOT use Homebrew —
# it is slow, unreliable, and often exits non-zero in CI.

NODE_BIN=""
for candidate in \
    "/usr/local/bin/node" \
    "/opt/homebrew/bin/node" \
    "/usr/bin/node"; do
  if [ -x "$candidate" ]; then
    NODE_BIN="$candidate"
    break
  fi
done

if [ -z "$NODE_BIN" ]; then
  echo "❌ ERROR: Node.js not found at any known path."
  exit 1
fi

NPM_BIN="$(dirname "$NODE_BIN")/npm"
NPX_BIN="$(dirname "$NODE_BIN")/npx"

echo "✅ Node: $("$NODE_BIN" --version)"
echo "✅ npm:  $("$NPM_BIN" --version)"

# ── 2. Move to the repository root ───────────────────────────────────────────
# $CI_WORKSPACE is the Xcode Cloud variable pointing to the cloned repo root.
cd "$CI_WORKSPACE"
echo "✅ Working directory: $(pwd)"

# ── 3. Install all npm dependencies ──────────────────────────────────────────
# --legacy-peer-deps prevents hard stops on minor peer version mismatches
# that are common across the Capacitor plugin ecosystem.
echo ""
echo "▶ Step 1/4 — Installing npm dependencies..."
"$NPM_BIN" install --legacy-peer-deps
echo "✅ npm install complete"

# ── 4. Inject environment variables for the Next.js build ────────────────────
# .env.local is gitignored. NEXT_PUBLIC_* vars must be present at build time
# because Next.js bakes them into the client-side JS bundle.
# Set these in Xcode Cloud → Environment Variables (mark as secret).
echo ""
echo "▶ Step 2/4 — Injecting build-time environment variables..."
cat > "$CI_WORKSPACE/.env.local" << EOF
NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
NEXT_PUBLIC_ONESIGNAL_APP_ID=${NEXT_PUBLIC_ONESIGNAL_APP_ID}
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=${NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
EOF
echo "✅ .env.local written for build"

# ── 5. Build the static Next.js web bundle ────────────────────────────────────
# We temporarily hide app/api/ (backend API routes) because Next.js cannot
# statically export routes that use server-only APIs (Stripe, Supabase, etc).
# The iOS app calls these APIs at runtime on https://squito-app.vercel.app.
echo ""
echo "▶ Step 3/4 — Building static web bundle..."

API_DIR="$CI_WORKSPACE/app/api"
API_HIDDEN="$CI_WORKSPACE/app/_api"
CONFIG="$CI_WORKSPACE/next.config.mjs"

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
