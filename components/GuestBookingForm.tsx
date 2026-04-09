"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassButton } from "@/components/ui/GlassButton";

type Status = "idle" | "submitting" | "success" | "error";

const services = [
  { value: "general", label: "General inspection & treatment" },
  { value: "ants", label: "Ants" },
  { value: "rodents", label: "Rodents" },
  { value: "termites", label: "Termites / WDO" },
  { value: "mosquitoes", label: "Mosquitoes & ticks" },
  { value: "wildlife", label: "Wildlife exclusion" },
  { value: "commercial", label: "Commercial program" },
  { value: "other", label: "Other / not sure" },
];

export function GuestBookingForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMessage("");
    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
      const endpoint = baseUrl ? `${baseUrl}/api/book` : "/api/book";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          phone: data.get("phone"),
          address: data.get("address"),
          cityZip: data.get("cityZip"),
          service: data.get("service"),
          preferredDate: data.get("preferredDate"),
          notes: data.get("notes"),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setMessage(
          typeof json.error === "string" ? json.error : "Something went wrong.",
        );
        return;
      }
      setStatus("success");
      form.reset();
      setMessage(
        "Request received. We will confirm by phone or email shortly.",
      );
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again or call us.");
    }
  }

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[32px] border border-squito-neon/20 bg-squito-neon/5 p-8 text-center backdrop-blur-xl"
        role="status"
      >
        <p className="font-display text-2xl font-semibold text-squito-neon">
          You remain protected.
        </p>
        <p className="mt-3 text-squito-mist/80">{message}</p>
        <GlassButton
          variant="ghost"
          type="button"
          onClick={() => {
            setStatus("idle");
            setMessage("");
          }}
          className="mt-8 text-sm font-semibold text-squito-neon underline-offset-4 hover:underline py-2 px-6"
        >
          Submit another request
        </GlassButton>
      </motion.div>
    );
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      onSubmit={handleSubmit}
      className="space-y-6 rounded-[32px] border border-squito-cardBorder bg-squito-card p-6 shadow-2xl backdrop-blur-2xl sm:p-10"
    >
      <div className="mb-8">
        <h2 className="font-display text-3xl font-semibold text-white">
          Guest Booking
        </h2>
        <p className="mt-2 text-sm text-squito-muted">
          Fast routing. No account required.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-white/90"
          >
            Full name
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white shadow-inner outline-none transition placeholder:text-white/30 focus:border-squito-neon focus:bg-white/10 focus:ring-1 focus:ring-squito-neon"
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-white/90"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white shadow-inner outline-none transition placeholder:text-white/30 focus:border-squito-neon focus:bg-white/10 focus:ring-1 focus:ring-squito-neon"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-white/90"
          >
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white shadow-inner outline-none transition placeholder:text-white/30 focus:border-squito-neon focus:bg-white/10 focus:ring-1 focus:ring-squito-neon"
            placeholder="(555) 555-5555"
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="address"
            className="block text-sm font-medium text-white/90"
          >
            Street address
          </label>
          <input
            id="address"
            name="address"
            required
            autoComplete="street-address"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white shadow-inner outline-none transition placeholder:text-white/30 focus:border-squito-neon focus:bg-white/10 focus:ring-1 focus:ring-squito-neon"
            placeholder="123 Main St"
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="cityZip"
            className="block text-sm font-medium text-white/90"
          >
            City & ZIP (Long Island)
          </label>
          <input
            id="cityZip"
            name="cityZip"
            required
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white shadow-inner outline-none transition placeholder:text-white/30 focus:border-squito-neon focus:bg-white/10 focus:ring-1 focus:ring-squito-neon"
            placeholder="Huntington, NY 11743"
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="service"
            className="block text-sm font-medium text-white/90"
          >
            What do you need?
          </label>
          <select
            id="service"
            name="service"
            required
            className="mt-2 w-full rounded-2xl border border-white/10 bg-[#18181b] px-4 py-3.5 text-white shadow-inner outline-none transition focus:border-squito-neon focus:ring-1 focus:ring-squito-neon"
          >
            {services.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="preferredDate"
            className="block text-sm font-medium text-white/90"
          >
            Preferred date or window
          </label>
          <input
            id="preferredDate"
            name="preferredDate"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white shadow-inner outline-none transition placeholder:text-white/30 focus:border-squito-neon focus:bg-white/10 focus:ring-1 focus:ring-squito-neon"
            placeholder="e.g. Next week mornings, or 4/15"
          />
        </div>
        <div className="sm:col-span-2">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-white/90"
          >
            Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white shadow-inner outline-none transition placeholder:text-white/30 focus:border-squito-neon focus:bg-white/10 focus:ring-1 focus:ring-squito-neon"
            placeholder="Pets, access codes, problem areas…"
          />
        </div>
      </div>

      {status === "error" && message && (
        <p className="text-sm text-red-400" role="alert">
          {message}
        </p>
      )}

      <div className="mt-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-squito-muted max-w-[250px]">
          By submitting this request, you agree to our contact terms.
        </p>
        <GlassButton
          variant="primary"
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex w-full justify-center !rounded-full bg-squito-neon/90 hover:bg-squito-neon dark:bg-squito-neon px-8 py-4 text-[15px] font-bold tracking-wide text-[#09090b] shadow-[0_0_20px_rgba(192,255,0,0.2)] disabled:opacity-60 sm:w-auto"
        >
          {status === "submitting" ? "Sending…" : "Request booking"}
        </GlassButton>
      </div>
    </motion.form>
  );
}
