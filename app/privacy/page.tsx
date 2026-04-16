"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-full flex-col px-5 pb-32 pt-12 sm:px-8 bg-[#0a0a0a]">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          href="/me"
          className="inline-flex items-center gap-1 text-base font-semibold text-squito-green mb-6 hover:opacity-80"
        >
          ← Back
        </Link>

        <h1 className="font-display text-[2rem] font-bold leading-tight text-white">
          Privacy Policy
        </h1>
        <p className="mt-2 text-base font-medium text-white/40">
          Last updated: April 11, 2026
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 space-y-8 text-md leading-relaxed text-white/70"
      >
        <section>
          <h2 className="font-display text-lg font-bold text-white mb-2">
            1. Information We Collect
          </h2>
          <p>
            When you use Squito, we collect information you provide directly, including:
          </p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5 text-white/50">
            <li><strong className="text-white/90">Account information:</strong> Name, email address, and password when you create an account.</li>
            <li><strong className="text-white/90">Booking details:</strong> Service address, phone number, preferred dates, and service type when you book a service.</li>
            <li><strong className="text-white/90">Location data:</strong> When you choose to auto-fill your address, we access your device&apos;s location to determine your service address. This is only done when you explicitly tap &ldquo;Use My Location.&rdquo;</li>
            <li><strong className="text-white/90">Camera and photos:</strong> When you use the Pest Identifier feature, we access your camera or photo library to capture images. These images are sent to our AI service for identification only and are not stored permanently.</li>
            <li><strong className="text-white/90">Payment information:</strong> Payment processing is handled securely by Stripe. We do not store your full credit card number.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-white mb-2">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-white/50">
            <li>To process and fulfill your pest control service bookings.</li>
            <li>To send booking confirmations and service updates via email.</li>
            <li>To manage your PestPoints loyalty rewards.</li>
            <li>To identify pests through our AI-powered identification feature.</li>
            <li>To improve our services and your experience with the app.</li>
            <li>To communicate with you about your account or services.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-white mb-2">
            3. Data Sharing
          </h2>
          <p>We share your information only with:</p>
          <ul className="mt-3 list-disc pl-5 space-y-1.5 text-white/50">
            <li><strong className="text-white/90">Stripe:</strong> For secure payment processing.</li>
            <li><strong className="text-white/90">Supabase:</strong> For secure data storage and authentication.</li>
            <li><strong className="text-white/90">GorillaDesk:</strong> Our field service management system, to schedule and dispatch technicians.</li>
            <li><strong className="text-white/90">Resend:</strong> For transactional email delivery (booking confirmations).</li>
            <li><strong className="text-white/90">OpenAI:</strong> Pest images submitted for identification are processed by OpenAI&apos;s API. Images are not retained by OpenAI after processing.</li>
          </ul>
          <p className="mt-3">
            We do <strong className="text-white/90">not</strong> sell, rent, or trade your personal information to third parties for marketing purposes.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-white mb-2">
            4. Data Security
          </h2>
          <p className="text-white/50">
            We implement industry-standard security measures to protect your data, including encrypted data transmission (TLS/HTTPS), secure authentication via Supabase, and biometric login support (Face ID / Touch ID) through Apple&apos;s LocalAuthentication framework. Payment data is handled exclusively by Stripe&apos;s PCI-compliant infrastructure.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-white mb-2">
            5. Your Rights
          </h2>
          <ul className="list-disc pl-5 space-y-1.5 text-white/50">
            <li><strong className="text-white/90">Access:</strong> You can view your account data at any time in the Profile section.</li>
            <li><strong className="text-white/90">Correction:</strong> You can update your profile information in the app.</li>
            <li><strong className="text-white/90">Deletion:</strong> You can permanently delete your account and all associated data from Profile → Security → Delete Account. This action is irreversible.</li>
            <li><strong className="text-white/90">Data portability:</strong> Contact us at service@getsquito.com to request a copy of your data.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-white mb-2">
            6. Children&apos;s Privacy
          </h2>
          <p className="text-white/50">
            Squito is not intended for use by children under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child under 13 has provided us with personal data, we will take steps to delete that information.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-white mb-2">
            7. Changes to This Policy
          </h2>
          <p className="text-white/50">
            We may update this Privacy Policy from time to time. We will notify you of material changes by updating the &ldquo;Last updated&rdquo; date at the top of this page.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-white mb-2">
            8. Contact Us
          </h2>
          <p className="mb-3 text-white/50">
            If you have questions about this Privacy Policy or your data, contact us at:
          </p>
          <div className="rounded-2xl bg-[#1a1a1a] p-4 border border-white/10">
            <p className="font-semibold text-white">Squito Pest Control</p>
            <p className="text-white/50">Email: service@getsquito.com</p>
            <p className="text-white/50">Phone: (631) 203-1000</p>
            <p className="text-white/50">Website: squitopestcontrol.com</p>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
