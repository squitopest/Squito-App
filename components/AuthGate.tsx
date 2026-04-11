"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import { GlassButton } from "@/components/ui/GlassButton";
import { NativeBiometric } from "@capgo/capacitor-native-biometric";

type AuthView = "login" | "signup";

export function AuthGate() {
  const { user, isGuest, isLoading, isAuthReady, signIn, signUp, continueAsGuest, resetPassword } = useAuth();
  const [view, setView] = useState<AuthView>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [referralEmail, setReferralEmail] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [hasBiometricCreds, setHasBiometricCreds] = useState(false);

  // Auto-fill referral logic from Share URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get("ref");
      if (ref) {
        setReferralEmail(decodeURIComponent(ref));
        setView("signup");
      }
    }
  }, []);

  // Check for biometrics
  useEffect(() => {
    if (typeof window === "undefined") return;
    async function check() {
      try {
        const { isAvailable } = await NativeBiometric.isAvailable();
        if (isAvailable) {
          setBiometricAvailable(true);
          // Check if we have credentials saved
          try {
            const creds = await NativeBiometric.getCredentials({ server: "squito.app" });
            if (creds && creds.username) {
              setHasBiometricCreds(true);
            }
          } catch(e) {}
        }
      } catch(e) {}
    }
    check();
  }, []);

  // Don't show auth gate if user is logged in, guest, or still loading
  if (!isAuthReady || isLoading || user || isGuest) return null;

  const handleBiometricLogin = async () => {
    try {
      await NativeBiometric.verifyIdentity({
        title: "Log in",
        reason: "For secure, quick access to Squito",
      });
      const creds = await NativeBiometric.getCredentials({ server: "squito.app" });
      if (creds && creds.username && creds.password) {
        setSubmitting(true);
        const result = await signIn(creds.username, creds.password);
        setSubmitting(false);
        if (result.error) setError(result.error);
      }
    } catch(e) {
      // User cancelled or failed
      console.warn("Biometric failed", e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMsg("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setSubmitting(true);
    const result = await signIn(email, password);
    setSubmitting(false);
    
    if (result.error) {
      setError(result.error);
    } else {
      // Save credentials for future Face ID logins
      if (biometricAvailable) {
        try {
          await NativeBiometric.setCredentials({ username: email, password, server: "squito.app" });
        } catch(e) {}
      }
    }
  };

  const handleForgotPassword = async () => {
    setError("");
    setMsg("");
    if (!email) {
      setError("Please enter your email above to reset password.");
      return;
    }
    setSubmitting(true);
    const result = await resetPassword(email);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setMsg("Password reset email sent! Please check your inbox.");
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password || !displayName) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    const result = await signUp(email, password, displayName, referralEmail);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setError("");
      
      // Save credentials early for Face ID
      if (biometricAvailable) {
        try {
          await NativeBiometric.setCredentials({ username: email, password, server: "squito.app" });
        } catch(e) {}
      }

      // Auto-switch to login after successful signup
      setView("login");
      setPassword("");
      setConfirmPassword("");
    }
  };

  const inputClasses =
    "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-squito-green focus:ring-2 focus:ring-squito-green/20";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9998] flex flex-col bg-gray-50"
    >
      {/* Top Section — Logo + Branding */}
      <div className="flex flex-col items-center pt-16 pb-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="relative h-[6rem] w-[60vw] max-w-[180px]"
        >
          <Image
            src="/squito_logo_v2.png"
            alt="Squito Logo"
            fill
            className="object-contain"
            priority
            unoptimized
          />
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-3 font-display text-sm font-bold tracking-wider text-gray-400"
        >
          Smart. Safe. <span className="text-squito-green">Pest Control.</span>
        </motion.p>
      </div>

      {/* Tab Switcher */}
      <div className="mx-6 flex overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
        {(["login", "signup"] as AuthView[]).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setView(tab);
              setError("");
              setMsg("");
            }}
            className={`flex-1 py-3 text-[13px] font-bold uppercase tracking-wider transition-all ${
              view === tab
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab === "login" ? "Log In" : "Sign Up"}
          </button>
        ))}
      </div>

      {/* Form Area */}
      <div className="flex-1 overflow-y-auto px-6 pt-6 pb-6">
        <AnimatePresence mode="wait">
          {view === "login" ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onSubmit={handleLogin}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className={inputClasses}
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-600"
                >
                  {error}
                </motion.p>
              )}
              {msg && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-squito-green/10 px-4 py-2.5 text-[13px] font-medium text-[#4c730a]"
                >
                  {msg}
                </motion.p>
              )}

              <GlassButton
                variant="primary"
                type="submit"
                disabled={submitting}
                className="mt-2 w-full py-4 text-[15px] bg-squito-green/90 dark:bg-squito-green shadow-[0_8px_20px_rgba(107,158,17,0.25)] disabled:opacity-50"
              >
                {submitting ? "Signing in..." : "Log In"}
              </GlassButton>

              <button
                type="button"
                onClick={handleForgotPassword}
                className="mt-1 text-[12px] font-semibold text-squito-green hover:underline"
              >
                Forgot password?
              </button>
            </motion.form>
          ) : (
            <motion.form
              key="signup"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onSubmit={handleSignUp}
              className="flex flex-col gap-4"
            >
              <div>
                <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
                  Display Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
                  Referral Email <span className="font-medium text-gray-400">(Optional)</span>
                </label>
                <input
                  type="email"
                  value={referralEmail}
                  onChange={(e) => setReferralEmail(e.target.value)}
                  placeholder="Friend's email"
                  autoComplete="email"
                  className={inputClasses}
                />
              </div>

              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-600"
                >
                  {error}
                </motion.p>
              )}

              <GlassButton
                variant="primary"
                type="submit"
                disabled={submitting}
                className="mt-2 w-full py-4 text-[15px] bg-squito-green/90 dark:bg-squito-green shadow-[0_8px_20px_rgba(107,158,17,0.25)] disabled:opacity-50"
              >
                {submitting ? "Creating account..." : "Create Account"}
              </GlassButton>

              {/* Signup incentive */}
              <div className="mt-1 flex items-center gap-2 rounded-2xl bg-[#f7fbe8] border border-squito-green/10 px-4 py-3">
                <span className="text-lg">🎁</span>
                <p className="text-[12px] font-medium text-squito-green">
                  Sign up now and earn <strong>50 bonus PestPoints</strong> instantly!
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
            or
          </span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Face ID Login (if credentials exist) */}
        {biometricAvailable && hasBiometricCreds && view === "login" && (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-squito-green/30 bg-[#f4fae6] py-3.5 text-[15px] font-bold text-squito-green shadow-sm transition hover:bg-[#ebf8d2] active:scale-[0.98] mt-2"
            onClick={handleBiometricLogin}
            disabled={submitting}
          >
            <span className="text-xl leading-none">🧑‍💻</span>
            Log In with Face ID
          </button>
        )}

        {/* Apple Sign-In (scaffolded for future) */}
        {(!biometricAvailable || !hasBiometricCreds || view === "signup") && (
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2.5 rounded-2xl border border-gray-200 bg-white py-3.5 text-[15px] font-semibold text-gray-900 shadow-sm transition hover:bg-gray-50 active:scale-[0.98]"
            onClick={() => alert("Apple Sign-In coming soon! Configure in Supabase dashboard.")}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continue with Apple
          </button>
        )}

        {/* Continue as Guest */}
        <div className="mt-4">
          <button
            type="button"
            onClick={continueAsGuest}
            className="w-full rounded-2xl border border-dashed border-gray-300 py-3.5 text-[14px] font-semibold text-gray-500 transition hover:border-gray-400 hover:text-gray-700 active:scale-[0.98]"
          >
            Continue as Guest
          </button>
          <p className="mt-2 text-center text-[11px] font-medium text-gray-400">
            No PestPoints, no promotions, no saved preferences.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
