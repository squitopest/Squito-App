"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { GlassButton } from "@/components/ui/GlassButton";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";

// ── Bug Avatar Options (same as OnboardingWizard) ──
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

function getEmojiForAvatar(avatarUrl: string | null) {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith("emoji:")) {
    const bugId = avatarUrl.replace("emoji:", "");
    return BUG_AVATARS.find((b) => b.id === bugId) || null;
  }
  return null;
}

export default function PersonalInfoPage() {
  const { profile, user, refreshProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Form state ──
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [cityStateZip, setCityStateZip] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ── Avatar state ──
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // ── Populate from profile ──
  useEffect(() => {
    if (profile) {
      const nameParts = (profile.display_name || "").split(" ");
      setFirstName(nameParts[0] || "");
      setLastName(nameParts.slice(1).join(" ") || "");
      setPhone(profile.phone || "");
      setCurrentAvatarUrl(profile.avatar_url || null);

      // Parse service address
      if (profile.service_address) {
        const parts = profile.service_address.split(", ");
        if (parts.length >= 2) {
          setStreetAddress(parts[0]);
          setCityStateZip(parts.slice(1).join(", "));
        } else {
          setStreetAddress(profile.service_address);
        }
      } else if (profile.address) {
        setStreetAddress(profile.address);
      }
    }
  }, [profile]);

  // ── Photo Upload ──
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase || !user) return;

    setUploadingPhoto(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const filePath = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        console.error("[PersonalInfo] Upload error:", uploadError);
        alert("Failed to upload photo. Please try again.");
        setUploadingPhoto(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      setCurrentAvatarUrl(urlData.publicUrl);
      setShowAvatarPicker(false);
    } catch (err) {
      console.error("[PersonalInfo] Upload failed:", err);
    }
    setUploadingPhoto(false);
  };

  // ── Select Emoji Avatar ──
  const selectEmojiAvatar = (bugId: string) => {
    setCurrentAvatarUrl(`emoji:${bugId}`);
    setShowAvatarPicker(false);
  };

  // ── Save ──
  const handleSave = async () => {
    if (!supabase || !user) return;
    setSaving(true);
    setSaved(false);

    const displayName = [firstName.trim(), lastName.trim()]
      .filter(Boolean)
      .join(" ");
    const serviceAddress = [streetAddress.trim(), cityStateZip.trim()]
      .filter(Boolean)
      .join(", ");

    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName || null,
        phone: phone.trim() || null,
        address: streetAddress.trim() || null,
        service_address: serviceAddress || null,
        avatar_url: currentAvatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("[PersonalInfo] Save error:", error);
      alert("Something went wrong. Please try again.");
    } else {
      setSaved(true);
      await refreshProfile();
      setTimeout(() => setSaved(false), 2500);
    }
    setSaving(false);
  };

  // ── Render current avatar ──
  const renderAvatar = () => {
    const emojiBug = getEmojiForAvatar(currentAvatarUrl);
    if (emojiBug) {
      return (
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full ${emojiBug.bg} border-4 border-squito-green shadow-md`}
        >
          <span className="text-3xl">{emojiBug.emoji}</span>
        </div>
      );
    }
    if (currentAvatarUrl) {
      return (
        <img
          src={currentAvatarUrl}
          alt="Your avatar"
          className="h-20 w-20 rounded-full object-cover border-4 border-squito-green shadow-md"
        />
      );
    }
    return (
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 text-3xl shadow-inner border-4 border-gray-300">
        👤
      </div>
    );
  };

  const inputClasses =
    "mt-1 w-full border-none p-0 text-[16px] font-medium text-gray-900 focus:ring-0 bg-transparent outline-none";

  return (
    <div className="flex min-h-full flex-col bg-gray-50 pb-10">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white/70 px-5 py-4 backdrop-blur-2xl">
        <Link
          href="/me"
          className="flex items-center text-[15px] font-semibold text-squito-green"
        >
          <span className="mr-1 text-xl leading-none">‹</span> Profile
        </Link>
        <span className="absolute left-1/2 -translate-x-1/2 font-display text-[16px] font-bold text-gray-900">
          Personal Info
        </span>
        <div className="w-16" /> {/* spacer for center alignment */}
      </div>

      <div className="px-5 pt-8">
        {/* Avatar Section */}
        <div className="flex flex-col items-center pb-6">
          {renderAvatar()}
          <button
            onClick={() => setShowAvatarPicker(true)}
            className="mt-3 text-[13px] font-semibold text-squito-green"
          >
            Edit Picture
          </button>
        </div>

        {/* Contact Details */}
        <h2 className="mb-2 px-2 text-[12px] font-bold uppercase tracking-wider text-gray-500">
          Contact Details
        </h2>
        <div className="overflow-hidden rounded-[20px] bg-white border border-gray-200 shadow-sm">
          <div className="flex flex-col px-5 py-3 border-b border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              First Name
            </span>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Required"
              className={inputClasses}
            />
          </div>

          <div className="flex flex-col px-5 py-3 border-b border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Last Name
            </span>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Optional"
              className={inputClasses}
            />
          </div>

          <div className="flex flex-col px-5 py-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Phone Number
            </span>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(631) 555-0123"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Service Address */}
        <h2 className="mt-8 mb-2 px-2 text-[12px] font-bold uppercase tracking-wider text-gray-500">
          Service Address
        </h2>
        <div className="overflow-hidden rounded-[20px] bg-white border border-gray-200 shadow-sm">
          <div className="flex flex-col px-5 py-3 border-b border-gray-100">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              Street Address
            </span>
            <input
              type="text"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              placeholder="123 Main Street"
              className={inputClasses}
            />
          </div>
          <div className="flex flex-col px-5 py-3">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
              City, State, ZIP
            </span>
            <input
              type="text"
              value={cityStateZip}
              onChange={(e) => setCityStateZip(e.target.value)}
              placeholder="Hamptons, NY 11937"
              className={inputClasses}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-10">
          <GlassButton
            variant="primary"
            className="w-full py-4 text-[15px] bg-squito-green/90 dark:bg-squito-green shadow-[0_8px_20px_rgba(107,158,17,0.25)]"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : saved ? "✓ Saved!" : "Save Changes"}
          </GlassButton>
        </div>

        {/* Success Toast */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-4 rounded-2xl bg-[#f7fbe8] border border-squito-green/20 p-4 text-center"
            >
              <p className="text-[13px] font-bold text-squito-green">
                ✓ Profile updated successfully!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Avatar Picker Modal ── */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAvatarPicker(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-t-[28px] bg-white pb-10 pt-6 px-6 shadow-[0_-8px_40px_rgba(0,0,0,0.15)]"
            >
              {/* Handle bar */}
              <div className="mb-4 flex justify-center">
                <div className="h-1 w-10 rounded-full bg-gray-300" />
              </div>

              <h2 className="text-center font-display text-[20px] font-bold text-gray-900 mb-1">
                Choose Your Avatar
              </h2>
              <p className="text-center text-[13px] text-gray-500 font-medium mb-6">
                Pick a fun bug buddy or upload your own!
              </p>

              {/* Bug Grid */}
              <div className="grid grid-cols-5 gap-3 mb-5">
                {BUG_AVATARS.map((bug) => {
                  const isSelected = currentAvatarUrl === `emoji:${bug.id}`;
                  return (
                    <button
                      key={bug.id}
                      type="button"
                      onClick={() => selectEmojiAvatar(bug.id)}
                      className={`relative flex flex-col items-center gap-1 rounded-2xl p-2.5 transition-all ${
                        isSelected
                          ? "bg-squito-green/10 border-2 border-squito-green shadow-sm"
                          : "border-2 border-transparent hover:bg-gray-100"
                      }`}
                    >
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full ${bug.bg} shadow-sm`}
                      >
                        <span className="text-[24px]">{bug.emoji}</span>
                      </div>
                      <span className="text-[9px] font-bold text-gray-500">
                        {bug.label}
                      </span>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-squito-green text-white text-[10px] font-bold shadow-md"
                        >
                          ✓
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Upload Photo */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 py-4 transition hover:border-squito-green hover:bg-squito-green/5 active:scale-[0.98]"
              >
                <span className="text-xl">📷</span>
                <span className="text-[14px] font-semibold text-gray-600">
                  {uploadingPhoto ? "Uploading..." : "Upload Your Own Photo"}
                </span>
              </button>

              {/* Cancel */}
              <button
                type="button"
                onClick={() => setShowAvatarPicker(false)}
                className="mt-4 w-full py-3 text-[14px] font-semibold text-gray-500"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
