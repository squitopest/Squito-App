"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { GlassButton } from "@/components/ui/GlassButton";
import { usePlacesAutocomplete } from "@/lib/usePlacesAutocomplete";
import {
  DEFAULT_CUSTOMER_PREFERENCES,
  DEFAULT_NOTIFICATION_PREFERENCES,
  PEST_WATCHLIST_OPTIONS,
  PRIORITY_OPTIONS,
  type CustomerPriority,
  type PestWatchlistOption,
  loadCustomerPreferences,
  loadNotificationPreferences,
  saveCustomerPreferences,
  saveNotificationPreferences,
} from "@/lib/personalization";

// ── Bug Avatar Options ──
const BUG_AVATARS = [
  { id: "caterpillar", emoji: "🐛", label: "Caterpillar", bg: "bg-lime-100" },
  { id: "ant", emoji: "🐜", label: "Ant", bg: "bg-amber-100" },
  { id: "mosquito", emoji: "🦟", label: "Mosquito", bg: "bg-sky-100" },
  { id: "spider", emoji: "🕷️", label: "Spider", bg: "bg-purple-100" },
  { id: "bee", emoji: "🐝", label: "Bee", bg: "bg-yellow-100" },
  { id: "cricket", emoji: "🦗", label: "Cricket", bg: "bg-emerald-100" },
  { id: "ladybug", emoji: "🐞", label: "Ladybug", bg: "bg-red-100" },
  { id: "butterfly", emoji: "🦋", label: "Butterfly", bg: "bg-indigo-100" },
  { id: "beetle", emoji: "🪲", label: "Beetle", bg: "bg-orange-100" },
  { id: "tick", emoji: "🦠", label: "Tick", bg: "bg-teal-100" },
];

type Step = 1 | 2 | 3;

export function OnboardingWizard() {
  const { user, profile, refreshProfile } = useAuth();
  const [step, setStep] = useState<Step>(1);
  const [saving, setSaving] = useState(false);

  // ── Step 1 fields ──
  const [fullName, setFullName] = useState(profile?.display_name || "");
  const [phone, setPhone] = useState(profile?.phone || "");
  const [serviceAddress, setServiceAddress] = useState("");

  const addressInputRef = usePlacesAutocomplete({
    onSelect: (address) => setServiceAddress(address),
  });

  // ── Step 1 validation ──
  const step1Valid = fullName.trim().length > 0 && serviceAddress.trim().length > 0;

  // ── Step 2 fields ──
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Step 3 personalization ──
  const [priority, setPriority] = useState<CustomerPriority>(DEFAULT_CUSTOMER_PREFERENCES.priority);
  const [watchlist, setWatchlist] = useState<PestWatchlistOption[]>(DEFAULT_CUSTOMER_PREFERENCES.watchlist);
  const [seasonalReminders, setSeasonalReminders] = useState(DEFAULT_CUSTOMER_PREFERENCES.seasonalReminders);
  const [skipSaving, setSkipSaving] = useState(false);

  useEffect(() => {
    const preferences = loadCustomerPreferences();
    setPriority(preferences.priority);
    setWatchlist(preferences.watchlist);
    setSeasonalReminders(preferences.seasonalReminders);
  }, []);

  // ── Step 2: get display avatar ──
  const getAvatarDisplay = () => {
    if (customAvatarUrl) {
      return { type: "image" as const, url: customAvatarUrl };
    }
    if (selectedAvatar) {
      const bug = BUG_AVATARS.find((b) => b.id === selectedAvatar);
      if (bug) return { type: "emoji" as const, emoji: bug.emoji, bg: bug.bg };
    }
    return { type: "emoji" as const, emoji: "🏡", bg: "bg-gray-100" };
  };

  // ── Photo Upload ──
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || !user) return;

    setUploadingPhoto(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/avatar.${ext}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("[Onboarding] Upload error:", uploadError);
        alert("Failed to upload photo. Please try again.");
        setUploadingPhoto(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setCustomAvatarUrl(urlData.publicUrl);
      setSelectedAvatar(null); // clear emoji selection
    } catch (err) {
      console.error("[Onboarding] Upload failed:", err);
    }
    setUploadingPhoto(false);
  };

  const toggleWatchlistPest = (pest: PestWatchlistOption) => {
    setWatchlist((current) => {
      if (current.includes(pest)) {
        return current.filter((item) => item !== pest);
      }

      if (current.length >= 3) {
        return [...current.slice(1), pest];
      }

      return [...current, pest];
    });
  };

  // ── Save Profile ──
  const handleFinish = async () => {
    if (!supabase || !user) return;
    setSaving(true);

    // Determine avatar_url to save
    let avatarUrl = customAvatarUrl || null;
    if (!avatarUrl && selectedAvatar) {
      // Store the emoji avatar ID as a special marker
      avatarUrl = `emoji:${selectedAvatar}`;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: fullName.trim(),
        phone: phone.trim() || null,
        address: serviceAddress.trim(),
        service_address: serviceAddress.trim(),
        avatar_url: avatarUrl,
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("[Onboarding] Save error:", error);
      alert("Something went wrong. Please try again.");
      setSaving(false);
      return;
    }

    const existingNotifications = loadNotificationPreferences();
    saveCustomerPreferences({
      priority,
      watchlist,
      seasonalReminders,
    });
    saveNotificationPreferences({
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...existingNotifications,
      push: seasonalReminders ? true : existingNotifications.push,
    });

    await refreshProfile();
    setSaving(false);
  };

  const handleSkip = async () => {
    if (!supabase || !user) return;
    setSkipSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        onboarding_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("[Onboarding] Skip error:", error);
      alert("We couldn’t skip setup right now. Please try again.");
      setSkipSaving(false);
      return;
    }

    await refreshProfile();
    setSkipSaving(false);
  };

  // Don't show if user is not authenticated or onboarding is already done
  if (!user || !profile || profile.onboarding_complete) return null;

  const inputClasses =
    "w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3.5 text-lg text-white/90 shadow-sm outline-none transition placeholder:text-white/30 focus:border-squito-green focus:ring-2 focus:ring-squito-green/20";

  const avatarDisplay = getAvatarDisplay();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] flex flex-col bg-[#09090b]"
    >
      {/* Progress Bar */}
      <div className="relative px-6 pt-14 pb-2">
        <div className="mb-5 flex items-center justify-end">
          <button
            type="button"
            onClick={handleSkip}
            disabled={skipSaving}
            className="text-sm font-bold uppercase tracking-widest text-white/35 transition hover:text-white/60 disabled:opacity-40"
          >
            {skipSaving ? "Skipping..." : "Skip for now"}
          </button>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="h-1.5 flex-1 rounded-full overflow-hidden bg-white/10"
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: step >= s ? "100%" : "0%",
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full rounded-full bg-squito-green"
              />
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs font-bold uppercase tracking-widest text-white/40">
          Step {step} of 3
        </p>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <AnimatePresence mode="wait">
          {/* ── STEP 1: Profile Info ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col pt-4"
            >
              <div className="text-center mb-8">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1, stiffness: 200, damping: 15 }}
                  className="inline-block text-5xl mb-3"
                >
                  👋
                </motion.span>
                <h1 className="font-display text-[24px] font-bold text-white/90">
                  Let&apos;s set you up
                </h1>
                <p className="mt-1 text-base text-white/50 font-medium">
                  Tell us a bit about yourself so we can serve you better.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block pl-1 text-base font-bold text-white/90">
                    Full Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Smith"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block pl-1 text-base font-bold text-white/90">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(631) 555-0123"
                    inputMode="tel"
                    className={inputClasses}
                  />
                </div>

                <div className="mt-2">
                  <h2 className="mb-3 pl-1 text-sm font-bold uppercase tracking-wider text-white/50">
                    Service Address <span className="text-red-400">*</span>
                  </h2>
                  <input
                    ref={addressInputRef}
                    type="text"
                    autoComplete="off"
                    value={serviceAddress}
                    onChange={(e) => setServiceAddress(e.target.value)}
                    placeholder="Start typing your address…"
                    className={inputClasses}
                  />
                </div>
              </div>

              <div className="mt-8">
                <GlassButton
                  variant="primary"
                  disabled={!step1Valid}
                  onClick={() => setStep(2)}
                  className="w-full py-4 text-lg bg-squito-green/90 dark:bg-squito-green shadow-[0_8px_20px_rgba(107,158,17,0.25)] disabled:opacity-40"
                >
                  Continue
                </GlassButton>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2: Avatar Picker ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="flex flex-col pt-4"
            >
              <div className="text-center mb-6">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1, stiffness: 200, damping: 15 }}
                  className="inline-block text-5xl mb-3"
                >
                  🎨
                </motion.span>
                <h1 className="font-display text-[24px] font-bold text-white/90">
                  Pick your avatar
                </h1>
                <p className="mt-1 text-base text-white/50 font-medium">
                  Choose a fun bug buddy or upload your own photo.
                </p>
              </div>

              {/* Bug Avatar Grid */}
              <div className="grid grid-cols-5 gap-3">
                {BUG_AVATARS.map((bug, idx) => {
                  const isSelected =
                    selectedAvatar === bug.id && !customAvatarUrl;
                  return (
                    <motion.button
                      key={bug.id}
                      type="button"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: idx * 0.04,
                        type: "spring",
                        stiffness: 300,
                        damping: 20,
                      }}
                      onClick={() => {
                        setSelectedAvatar(bug.id);
                        setCustomAvatarUrl(null);
                      }}
                      className={`relative flex flex-col items-center gap-1.5 rounded-2xl p-3 border-2 transition-all ${
                        isSelected
                          ? "border-squito-green bg-white/10 scale-105"
                          : "border-transparent bg-[#1a1a1a] hover:bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-full ${bug.bg} shadow-sm`}
                      >
                        <span className="text-[28px]">{bug.emoji}</span>
                      </div>
                      <span className={`mt-2 text-xs font-bold ${
                        isSelected ? "text-squito-green" : "text-white/50"
                      }`}>
                        {bug.label}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-squito-green text-white text-sm font-bold shadow-md"
                        >
                          ✓
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="my-5 flex items-center gap-4">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">
                  or
                </span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              {/* Upload Custom Photo */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />

              {customAvatarUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={customAvatarUrl}
                      alt="Your avatar"
                      className="h-20 w-20 rounded-full object-cover border-4 border-squito-green shadow-lg"
                    />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-squito-green text-white text-sm font-bold shadow-md"
                    >
                      ✓
                    </motion.div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-base font-semibold text-squito-green"
                  >
                    Change Photo
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/10 py-5 transition hover:border-squito-green hover:bg-squito-green/5 active:scale-[0.98]"
                >
                  <span className="text-2xl">📷</span>
                  <span className="text-md font-semibold text-white/60">
                    {uploadingPhoto ? "Uploading..." : "Upload Your Own Photo"}
                  </span>
                </button>
              )}

              {/* Navigation */}
              <div className="mt-8 flex gap-3">
                <GlassButton
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 text-md text-white/70 border border-white/10"
                >
                  ← Back
                </GlassButton>
                <GlassButton
                  variant="primary"
                  onClick={() => setStep(3)}
                  disabled={!selectedAvatar && !customAvatarUrl}
                  className="flex-[2] py-4 text-lg bg-squito-green/90 dark:bg-squito-green shadow-[0_8px_20px_rgba(107,158,17,0.25)] disabled:opacity-40"
                >
                  Continue
                </GlassButton>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Confirmation ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex flex-col pt-6"
            >
              <div className="text-center">
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1, stiffness: 200, damping: 15 }}
                  className="inline-block text-5xl mb-3"
                >
                  ✨
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-display text-[28px] font-bold text-white"
                >
                  Make Squito smarter
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-1 text-base text-white/50 font-medium max-w-[320px] mx-auto"
                >
                  Tell us what matters most at your home so we can surface the right reminders and quick actions.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mt-8 rounded-3xl border border-white/10 bg-[#1a1a1a] p-5 shadow-sm"
              >
                <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                  Priority
                </p>
                <div className="mt-4 grid gap-3">
                  {PRIORITY_OPTIONS.map((option) => {
                    const isActive = priority === option.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPriority(option.id)}
                        className={`rounded-2xl border p-4 text-left transition ${
                          isActive
                            ? "border-squito-green bg-squito-green/10"
                            : "border-white/10 bg-white/5 hover:bg-white/10"
                        }`}
                      >
                        <p className={`font-bold ${isActive ? "text-squito-green" : "text-white"}`}>
                          {option.label}
                        </p>
                        <p className="mt-1 text-sm text-white/50">
                          {option.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mt-4 rounded-3xl border border-white/10 bg-[#1a1a1a] p-5 shadow-sm"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                      Pest Watchlist
                    </p>
                    <p className="mt-1 text-sm text-white/50">
                      Pick up to 3 pests you care about most.
                    </p>
                  </div>
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold text-white/40">
                    {watchlist.length}/3
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {PEST_WATCHLIST_OPTIONS.map((pest) => {
                    const isActive = watchlist.includes(pest);
                    return (
                      <button
                        key={pest}
                        type="button"
                        onClick={() => toggleWatchlistPest(pest)}
                        className={`rounded-full border px-3 py-2 text-sm font-bold transition ${
                          isActive
                            ? "border-squito-green bg-squito-green/10 text-squito-green"
                            : "border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        {pest}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setSeasonalReminders((current) => !current)}
                  className={`mt-5 flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                    seasonalReminders
                      ? "border-squito-green/30 bg-squito-green/10"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div>
                    <p className="font-bold text-white">Seasonal reminders</p>
                    <p className="mt-1 text-sm text-white/50">
                      Get proactive prompts when your watchlist pests are entering peak season.
                    </p>
                  </div>
                  <div className={`flex h-7 w-12 items-center rounded-full p-1 ${seasonalReminders ? "bg-squito-green" : "bg-white/15"}`}>
                    <div className={`h-5 w-5 rounded-full bg-white shadow-md transition-transform ${seasonalReminders ? "translate-x-5" : "translate-x-0"}`} />
                  </div>
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="mt-4 w-full rounded-3xl border border-white/10 bg-[#1a1a1a] p-6 shadow-sm text-left"
              >
                <div className="flex items-center gap-4">
                  {avatarDisplay.type === "image" ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={avatarDisplay.url}
                      alt="Your avatar"
                      className="h-16 w-16 rounded-full object-cover border-4 border-squito-green"
                    />
                  ) : (
                    <div className={`flex h-16 w-16 items-center justify-center rounded-full border-4 border-squito-green ${avatarDisplay.bg}`}>
                      <span className="text-3xl">{avatarDisplay.emoji}</span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-display text-xl font-bold text-white">
                      {fullName}
                    </p>
                    <p className="text-sm text-white/45">
                      {serviceAddress}
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-[#f7fbe8] border border-squito-green/20 p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎁</span>
                    <div>
                      <p className="text-base font-bold text-squito-green">
                        50 PestPoints are waiting for you
                      </p>
                      <p className="text-sm text-squito-green/70">
                        We&apos;ll use your setup to personalize reminders, pest alerts, and quick actions.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <div className="mt-8 flex w-full gap-3">
                <GlassButton
                  variant="ghost"
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 text-md text-gray-700 border border-gray-200"
                >
                  ← Back
                </GlassButton>
                <GlassButton
                  variant="primary"
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex-[2] py-4 text-lg bg-squito-green/90 dark:bg-squito-green shadow-[0_8px_20px_rgba(107,158,17,0.25)]"
                >
                  {saving ? "Saving..." : "Finish Setup"}
                </GlassButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
