# 🍎 Squito — App Store Submission Guide

> Reference this file when uploading to App Store Connect / TestFlight.

---

## App Store Connect — Required Fields

| Field | Value |
|---|---|
| **App Name** | Squito AI |
| **Bundle ID** | `com.squito.app` |
| **Privacy Policy URL** | `https://squito-app.vercel.app/privacy` |
| **Account Deletion URL** | `https://squito-app.vercel.app/me/security` |
| **Support URL** | `https://squitopestcontrol.com` |
| **Marketing URL** | `https://squitopestcontrol.com` *(optional)* |
| **Category** | **Lifestyle** or **Utilities** |
| **Age Rating** | **4+** (no mature content, violence, or gambling) |

---

## App Review Notes (Copy/Paste This)

Paste this into the **"Notes for Review"** field in App Store Connect:

```
Squito is a pest control service booking app for Long Island, NY homeowners.

DEMO ACCOUNT:
Email: [YOUR_DEMO_EMAIL]
Password: [YOUR_DEMO_PASSWORD]

KEY FEATURES:
1. Browse pest control services and book appointments
2. AI-powered pest identification via camera/photo upload
3. Secure payments via Stripe (real-world pest control services)
4. PestPoints loyalty rewards system (earned free, never purchased)
5. Face ID / biometric login
6. Account creation, management, and deletion

PAYMENT CLARIFICATION:
All payments are for physical, real-world pest control services consumed
outside of the app (technician visits to the customer's property).
This qualifies under Guideline 3.1.3(e) — "Goods and Services Outside
of the App" — and uses Stripe for traditional credit card payment
collection, not in-app purchase.

PestPoints are a free loyalty rewards program. Points are earned through
bookings and referrals, never purchased with real money. No in-app
purchases are offered.

ACCOUNT DELETION:
Users can delete their account from Profile → Security → Delete Account.
This permanently removes all user data, points, and service history.
```

> ⚠️ **IMPORTANT:** Replace `[YOUR_DEMO_EMAIL]` and `[YOUR_DEMO_PASSWORD]` with
> a real test account Apple reviewers can log into. Create one before submitting.

---

## Screenshots Checklist

Apple requires screenshots showing the app **in use** (not splash screens or login pages).

Recommended screens to capture:

- [ ] **Home feed** — Video feed with Book Now button
- [ ] **Services page** (`/plans`) — Service cards with pricing
- [ ] **Booking form** (`/book`) — Filled-in form with service selected
- [ ] **Pest library** (`/pests`) — Pest cards grid with categories
- [ ] **Pest Identifier** — AI identification result
- [ ] **Profile** (`/me`) — PestPoints dashboard, tier badge

### Required screenshot sizes:
- **iPhone 6.7"** (iPhone 15 Pro Max): 1290 × 2796 px
- **iPhone 6.5"** (iPhone 14 Plus): 1284 × 2778 px
- **iPad 12.9"** *(if supporting iPad)*: 2048 × 2732 px

---

## iOS Info.plist — Privacy Permissions (Already Configured ✅)

These are already in `ios/App/App/Info.plist`:

| Key | Purpose String |
|---|---|
| `NSFaceIDUsageDescription` | Used to quickly and securely log you into your Squito account. |
| `NSLocationWhenInUseUsageDescription` | Squito uses your location to auto-fill your service address for faster booking. |
| `NSCameraUsageDescription` | Squito uses your camera to identify pests and recommend the right treatment. |
| `NSPhotoLibraryUsageDescription` | Squito needs access to your photo library so you can upload pest images for identification. |

---

## App Privacy Details (Data Collection Questionnaire)

When Apple asks "What data does your app collect?" in App Store Connect, answer:

### Contact Info
- **Name** — Used for account creation and booking
- **Email Address** — Used for account, booking confirmations, and communication
- **Phone Number** — Collected during booking for service coordination

### Location
- **Precise Location** — Used to auto-fill service address (only when user taps "Use My Location")

### Identifiers
- **User ID** — Supabase user ID for account management

### Purchases
- **Purchase History** — Service booking history stored for user reference

### Usage Data
- **Product Interaction** — Points earned, rewards redeemed, services booked

### Data NOT Collected
- ❌ No tracking data
- ❌ No advertising identifiers (IDFA)
- ❌ No third-party advertising
- ❌ No health or fitness data
- ❌ No financial info stored (Stripe handles payments)

---

## Environment Variables (Production — Vercel)

Ensure these are set in Vercel before submission:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) |
| `RESEND_API_KEY` | Transactional email delivery |
| `STRIPE_SECRET_KEY` | Stripe payment processing |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe client-side key |
| `ZAPIER_WEBHOOK_URL` | GorillaDesk CRM sync |
| `OPENAI_API_KEY` | AI pest identification |

---

## Pre-Submission Checklist

- [ ] Demo account created and credentials added to Review Notes
- [ ] All Vercel environment variables confirmed live
- [ ] Backend services running (Supabase, Stripe, Resend, Zapier)
- [ ] Full end-to-end test: signup → book → pay → receive email
- [ ] Free estimate test: signup → book free estimate → receive email
- [ ] Pest identifier test: upload photo → get AI result
- [ ] Account deletion test: delete account → confirm data removed
- [ ] Privacy Policy accessible at `/privacy`
- [ ] Screenshots captured on device (not simulator)
- [ ] Xcode Archive built and uploaded to App Store Connect
- [ ] TestFlight build processed and tested on physical device

---

## Xcode Build & Upload Steps

1. Open `ios/App/App.xcodeproj` in Xcode
2. Select **Product → Archive**
3. Once archived, click **Distribute App**
4. Select **App Store Connect** → **Upload**
5. Wait for processing in App Store Connect (10-30 min)
6. Go to App Store Connect → TestFlight → Select build
7. Add testers or submit for External Testing review

---

*Generated: April 11, 2026*
*App Version: 0.1.0*
*Bundle ID: com.squito.app*
