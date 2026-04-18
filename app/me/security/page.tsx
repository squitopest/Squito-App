"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { GlassButton } from "@/components/ui/GlassButton";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { NativeBiometric } from "@capgo/capacitor-native-biometric";
import { getApiBase } from "@/lib/runtimeConfig";

function Toggle({
  active,
  onChange,
}: {
  active: boolean;
  onChange: () => void;
}) {
  return (
    <div
      onClick={onChange}
      className={`flex h-7 w-12 cursor-pointer items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${active ? "bg-squito-green" : "bg-white/15"}`}
    >
      <div
        className={`h-5 w-5 rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${active ? "translate-x-5" : "translate-x-0"}`}
      />
    </div>
  );
}

export default function SecurityPage() {
  const { user, session, signOut } = useAuth();
  const [biometrics, setBiometrics] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // Initialize Biometric State
  useEffect(() => {
    if (typeof window === "undefined") return;
    async function initBiometrics() {
      try {
        const { isAvailable } = await NativeBiometric.isAvailable();
        setBiometricAvailable(isAvailable);
        if (isAvailable) {
          const creds = await NativeBiometric.getCredentials({ server: "squito.app" });
          if (creds && creds.username) {
            setBiometrics(true);
          }
        }
      } catch(e) {}
    }
    initBiometrics();
  }, []);

  const toggleBiometrics = async () => {
    if (!biometricAvailable) {
      alert("Face ID / Biometrics is not available on this device.");
      return;
    }

    if (biometrics) {
      // Turn OFF
      try {
        await NativeBiometric.deleteCredentials({ server: "squito.app" });
        setBiometrics(false);
      } catch(e) {
        console.error("Failed to delete biometric credentials", e);
      }
    } else {
      // Turn ON
      // By default, we need their current password to save it. But since they are logged in, 
      // we can ask them to verify via face ID to trigger system permission, then alert them 
      // that it will save automatically on next manual login.
      alert("Face ID enabled! It will activate the next time you log in to Squito.");
      setBiometrics(true);
    }
  };

  // ── Delete Account State ──
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ── Change Password State ──
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");

  // Automatically open password form if arriving via email recovery link
  useEffect(() => {
    // Check initial hash string (if Supabase hasn't eaten it yet)
    if (typeof window !== "undefined" && window.location.hash.includes("type=recovery")) {
      setShowPasswordForm(true);
      // Clean up the URL so it doesn't trigger again on refresh
      window.history.replaceState(null, "", window.location.pathname);
    }
    
    // Listen directly to Supabase engine for the recovery event, bypassing URL race conditions!
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange(
        (event) => {
          if (event === "PASSWORD_RECOVERY") {
            setShowPasswordForm(true);
          }
        }
      );
      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, []);

  const handleChangePassword = async () => {
    if (!supabase) return;
    if (newPassword.length < 6) {
      setPasswordMessage("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMessage("Passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    setPasswordMessage("");

    let error = null;
    let retries = 3;

    // Supabase known issue: session locks can be stolen by background refreshes during recovery.
    // Implement a backoff-retry loop to allow the background lock to release.
    for (let i = 0; i < retries; i++) {
        const result = await supabase.auth.updateUser({
            password: newPassword,
        });
        error = result.error;
        if (!error) break; // Success!
        if (error.message && error.message.includes("Lock")) {
            await new Promise(resolve => setTimeout(resolve, 500)); // wait and retry
        } else {
            break; // actual auth error, do not retry
        }
    }

    if (error) {
      setPasswordMessage(error.message);
    } else {
      setPasswordMessage("✓ Password updated successfully!");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordMessage("");
      }, 2000);
    }
    setPasswordSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") return;
    if (!session?.access_token) return;

    setDeleting(true);
    setDeleteError("");

    try {
      const { Capacitor } = await import("@capacitor/core");
      const API_BASE = getApiBase(Capacitor.isNativePlatform());
      const res = await fetch(`${API_BASE}/api/delete-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setDeleteError(data.error || "Failed to delete account. Please contact support.");
        setDeleting(false);
        return;
      }

      // Account deleted — sign out and redirect
      await signOut();
    } catch (err) {
      setDeleteError("Something went wrong. Please try again or contact support.");
      setDeleting(false);
    }
  };

  const inputClasses =
    "w-full rounded-2xl border border-white/10 bg-[#1a1a1a] px-4 py-3.5 text-lg text-white shadow-sm outline-none transition placeholder:text-white/20 focus:border-squito-green focus:ring-2 focus:ring-squito-green/20";

  return (
    <div className="flex min-h-full flex-col bg-[#0a0a0a] pb-10">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-white/10 bg-[#1a1a1a]/80 px-5 py-4 backdrop-blur-2xl">
        <Link
          href="/me"
          className="flex items-center text-lg font-semibold text-squito-green"
        >
          <span className="mr-1 text-xl leading-none">‹</span> Profile
        </Link>
        <span className="absolute left-1/2 -translate-x-1/2 font-display text-[16px] font-bold text-white">
          Security
        </span>
        <div className="w-16" />
      </div>

      <div className="px-5 pt-8">
        {/* Sign In Access */}
        <h2 className="mb-2 px-2 text-sm font-bold uppercase tracking-wider text-white/30">
          Sign In Access
        </h2>
        <div className="overflow-hidden rounded-[20px] bg-[#1a1a1a] border border-white/10 shadow-sm mb-8">
          {/* Change Password */}
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex w-full items-center justify-between px-5 py-4 border-b border-white/10 text-left active:bg-white/5"
          >
            <div>
              <span className="block text-lg font-bold text-white">
                Change Password
              </span>
              <span className="block text-sm font-medium text-white/40 mt-0.5">
                Update your login credentials
              </span>
            </div>
            <span className={`text-white/30 font-bold text-lg leading-none transition-transform ${showPasswordForm ? "rotate-90" : ""}`}>
              ›
            </span>
          </button>

          <AnimatePresence>
            {showPasswordForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-b border-white/10"
              >
                <div className="px-5 py-4 flex flex-col gap-3">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (min. 6 chars)"
                    className={inputClasses}
                  />
                  <input
                    type="password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className={inputClasses}
                  />
                  {passwordMessage && (
                    <p className={`text-base font-medium px-1 ${passwordMessage.startsWith("✓") ? "text-squito-green" : "text-red-500"}`}>
                      {passwordMessage}
                    </p>
                  )}
                  <GlassButton
                    variant="primary"
                    onClick={handleChangePassword}
                    disabled={passwordSaving || !newPassword}
                    className="w-full py-3 text-md bg-squito-green/90 dark:bg-squito-green disabled:opacity-40"
                  >
                    {passwordSaving ? "Updating..." : "Update Password"}
                  </GlassButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Biometrics */}
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <span className="block text-lg font-bold text-white">
                Face ID & Biometrics
              </span>
              <span className="block text-sm font-medium text-white/40 mt-0.5">
                Allow login without passwords
              </span>
            </div>
            <Toggle
              active={biometrics}
              onChange={toggleBiometrics}
            />
          </div>
        </div>

        {/* Data & Privacy */}
        <h2 className="mb-2 px-2 text-sm font-bold uppercase tracking-wider text-white/30">
          Data & Privacy
        </h2>
        <div className="overflow-hidden rounded-[20px] bg-[#1a1a1a] border border-white/10 shadow-sm mb-10">
          <a
            href="https://www.squitopestcontrol.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-between px-5 py-4 border-b border-white/10 text-left active:bg-white/5"
          >
            <div>
              <span className="block text-lg font-bold text-white">
                Privacy Policy
              </span>
              <span className="block text-sm font-medium text-white/40 mt-0.5">
                How we handle your data
              </span>
            </div>
            <span className="text-white/30 font-bold text-lg leading-none">
              ›
            </span>
          </a>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex w-full items-center justify-between px-5 py-4 text-left active:bg-white/5"
          >
            <div>
              <span className="block text-lg font-bold text-red-500">
                Delete Account
              </span>
              <span className="block text-sm font-medium text-white/40 mt-0.5">
                Permanently remove your account and data
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* ── Delete Account Confirmation Modal ── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-6"
            onClick={() => !deleting && setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-3xl bg-[#1a1a1a] border border-white/10 p-6 shadow-2xl"
            >
              <div className="text-center mb-5">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-4">
                  <span className="text-3xl">⚠️</span>
                </div>
                <h2 className="font-display text-2xl font-bold text-white">
                  Delete Your Account?
                </h2>
                <p className="mt-2 text-base text-white/50 font-medium leading-relaxed">
                  This will permanently delete your account, all PestPoints, service history, and personal data. This action{" "}
                  <strong className="text-red-500">cannot be undone</strong>.
                </p>
              </div>

              <div className="mb-4">
                <label className="mb-1.5 block pl-1 text-sm font-bold text-white/30">
                  Type <span className="text-red-500 font-mono">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value.toUpperCase())}
                  placeholder="DELETE"
                  disabled={deleting}
                  className={`${inputClasses} text-center font-mono tracking-widest ${
                    deleteConfirmText === "DELETE"
                      ? "border-red-400 focus:border-red-500 focus:ring-red-500/20 bg-white/5"
                      : "bg-[#0a0a0a]"
                  }`}
                />
              </div>

              {deleteError && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 rounded-xl bg-red-500/10 px-4 py-2.5 text-base font-medium text-red-500 text-center"
                >
                  {deleteError}
                </motion.p>
              )}

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== "DELETE" || deleting}
                  className={`w-full rounded-2xl py-3.5 text-lg font-bold transition-all ${
                    deleteConfirmText === "DELETE" && !deleting
                      ? "bg-red-500 text-white shadow-[0_8px_20px_rgba(239,68,68,0.3)] active:scale-[0.98]"
                      : "bg-white/5 text-white/20 cursor-not-allowed"
                  }`}
                >
                  {deleting ? "Deleting..." : "Permanently Delete Account"}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText("");
                    setDeleteError("");
                  }}
                  disabled={deleting}
                  className="w-full py-3 text-md font-semibold text-white/30"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
