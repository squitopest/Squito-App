"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import { GlassButton } from "@/components/ui/GlassButton";
import { usePlacesAutocomplete } from "@/lib/usePlacesAutocomplete";

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

    await refreshProfile();
    setSaving(false);
  };

  // Don't show if user is not authenticated or onboarding is already done
  if (!user || !profile || profile.onboarding_complete) return null;

  const inputClasses =
    "w-full rounded-2xl border border-gray-200 bg-white px-4 py-3.5 text-[15px] text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-squito-green focus:ring-2 focus:ring-squito-green/20";

  const avatarDisplay = getAvatarDisplay();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[9999] flex flex-col bg-gray-50"
    >
      {/* Progress Bar */}
      <div className="relative px-6 pt-14 pb-2">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="h-1.5 flex-1 rounded-full overflow-hidden bg-gray-200"
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
        <p className="mt-3 text-center text-[11px] font-bold uppercase tracking-widest text-gray-400">
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
                <h1 className="font-display text-[24px] font-bold text-gray-900">
                  Let&apos;s set you up
                </h1>
                <p className="mt-1 text-[13px] text-gray-500 font-medium">
                  Tell us a bit about yourself so we can serve you better.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
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
                  <label className="mb-1.5 block pl-1 text-[13px] font-bold text-gray-900">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(631) 555-0123"
                    className={inputClasses}
                  />
                </div>

                <div className="mt-2">
                  <h2 className="mb-3 pl-1 text-[12px] font-bold uppercase tracking-wider text-gray-500">
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
                  className="w-full py-4 text-[15px] bg-squito-green/90 dark:bg-squito-green shadow-[0_8px_20px_rgba(107,158,17,0.25)] disabled:opacity-40"
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
                <h1 className="font-display text-[24px] font-bold text-gray-900">
                  Pick your avatar
                </h1>
                <p className="mt-1 text-[13px] text-gray-500 font-medium">
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
                      className={`relative flex flex-col items-center gap-1.5 rounded-2xl p-3 transition-all ${
                        isSelected
                          ? "bg-squito-green/10 border-2 border-squito-green shadow-[0_4px_12px_rgba(107,158,17,0.2)]"
                          : "border-2 border-transparent hover:bg-gray-100"
                      }`}
                    >
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-full ${bug.bg} shadow-sm`}
                      >
                        <span className="text-[28px]">{bug.emoji}</span>
                      </div>
                      <span className="text-[10px] font-bold text-gray-500">
                        {bug.label}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-squito-green text-white text-[12px] font-bold shadow-md"
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
                <div className="h-px flex-1 bg-gray-200" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">
                  or
                </span>
                <div className="h-px flex-1 bg-gray-200" />
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
                      className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-squito-green text-white text-[12px] font-bold shadow-md"
                    >
                      ✓
                    </motion.div>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[13px] font-semibold text-squito-green"
                  >
                    Change Photo
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 py-5 transition hover:border-squito-green hover:bg-squito-green/5 active:scale-[0.98]"
                >
                  <span className="text-2xl">📷</span>
                  <span className="text-[14px] font-semibold text-gray-600">
                    {uploadingPhoto ? "Uploading..." : "Upload Your Own Photo"}
                  </span>
                </button>
              )}

              {/* Navigation */}
              <div className="mt-8 flex gap-3">
                <GlassButton
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 text-[14px] text-gray-700 border border-gray-200"
                >
                  ← Back
                </GlassButton>
                <GlassButton
                  variant="primary"
                  onClick={() => setStep(3)}
                  disabled={!selectedAvatar && !customAvatarUrl}
                  className="flex-[2] py-4 text-[15px] bg-squito-green/90 dark:bg-squito-green shadow-[0_8px_20px_rgba(107,158,17,0.25)] disabled:opacity-40"
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
              className="flex flex-col items-center pt-12 text-center"
            >
              {/* Animated confetti-style celebration */}
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.1, stiffness: 150, damping: 12 }}
                className="relative"
              >
                {avatarDisplay.type === "image" ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={avatarDisplay.url}
                    alt="Your avatar"
                    className="h-28 w-28 rounded-full object-cover border-4 border-squito-green shadow-[0_8px_30px_rgba(107,158,17,0.3)]"
                  />
                ) : (
                  <div
                    className={`flex h-28 w-28 items-center justify-center rounded-full border-4 border-squito-green ${avatarDisplay.bg} shadow-[0_8px_30px_rgba(107,158,17,0.3)]`}
                  >
                    <span className="text-[52px]">{avatarDisplay.emoji}</span>
                  </div>
                )}
                {/* Sparkle decorations */}
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                  className="absolute -top-3 -right-2 text-2xl"
                >
                  ✨
                </motion.span>
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className="absolute -bottom-1 -left-3 text-xl"
                >
                  🎉
                </motion.span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 font-display text-[28px] font-bold text-gray-900"
              >
                You&apos;re all set!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-2 text-[14px] text-gray-500 font-medium max-w-[280px]"
              >
                Welcome to the Squito family, {fullName.split(" ")[0]}. Let&apos;s keep your home pest-free.
              </motion.p>

              {/* Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-sm text-left"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">👤</span>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        Name
                      </p>
                      <p className="text-[15px] font-semibold text-gray-900">
                        {fullName}
                      </p>
                    </div>
                  </div>
                  {phone && (
                    <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                      <span className="text-lg">📞</span>
                      <div>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                          Phone
                        </p>
                        <p className="text-[15px] font-semibold text-gray-900">
                          {phone}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                    <span className="text-lg">🏠</span>
                    <div>
                      <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                        Service Address
                      </p>
                      <p className="text-[15px] font-semibold text-gray-900">
                        {serviceAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* PestPoints Welcome */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-4 w-full rounded-2xl bg-[#f7fbe8] border border-squito-green/20 p-4 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎁</span>
                  <p className="text-[13px] font-bold text-squito-green">
                    50 PestPoints added to your account!
                  </p>
                </div>
              </motion.div>

              {/* Buttons */}
              <div className="mt-8 flex w-full gap-3">
                <GlassButton
                  variant="ghost"
                  onClick={() => setStep(2)}
                  className="flex-1 py-4 text-[14px] text-gray-700 border border-gray-200"
                >
                  ← Back
                </GlassButton>
                <GlassButton
                  variant="primary"
                  onClick={handleFinish}
                  disabled={saving}
                  className="flex-[2] py-4 text-[15px] bg-squito-green/90 dark:bg-squito-green shadow-[0_8px_20px_rgba(107,158,17,0.25)]"
                >
                  {saving ? "Saving..." : "Let's Go! 🚀"}
                </GlassButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
