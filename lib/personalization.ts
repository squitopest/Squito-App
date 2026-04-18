export const CUSTOMER_PREFERENCES_KEY = "squito_customer_preferences";
export const NOTIFICATION_PREFERENCES_KEY = "squito_notification_prefs";

export const PEST_WATCHLIST_OPTIONS = [
  "Mosquitoes",
  "Ticks",
  "Ants",
  "Termites",
  "Hornets",
  "Rodents",
  "Spiders",
] as const;

export const PRIORITY_OPTIONS = [
  {
    id: "family",
    label: "Protect family & pets",
    description: "Focus on safe coverage around the people and pets you care about most.",
  },
  {
    id: "yard",
    label: "Enjoy the yard again",
    description: "Prioritize outdoor comfort, mosquito defense, and fewer ruined evenings.",
  },
  {
    id: "fast",
    label: "Handle a problem fast",
    description: "Move quickly on active pest issues and get the right service booked.",
  },
  {
    id: "prevention",
    label: "Stay ahead all season",
    description: "Build a prevention-first routine so pests never get comfortable.",
  },
] as const;

export type PestWatchlistOption = (typeof PEST_WATCHLIST_OPTIONS)[number];
export type CustomerPriority = (typeof PRIORITY_OPTIONS)[number]["id"];

export interface CustomerPreferences {
  priority: CustomerPriority;
  watchlist: PestWatchlistOption[];
  seasonalReminders: boolean;
}

export interface NotificationPreferences {
  push: boolean;
  sms: boolean;
  email: boolean;
  marketing: boolean;
}

export const DEFAULT_CUSTOMER_PREFERENCES: CustomerPreferences = {
  priority: "prevention",
  watchlist: ["Mosquitoes", "Ticks"],
  seasonalReminders: true,
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  push: true,
  sms: true,
  email: false,
  marketing: false,
};

export function loadCustomerPreferences(): CustomerPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_CUSTOMER_PREFERENCES;
  }

  const saved = window.localStorage.getItem(CUSTOMER_PREFERENCES_KEY);
  if (!saved) return DEFAULT_CUSTOMER_PREFERENCES;

  try {
    const parsed = JSON.parse(saved) as Partial<CustomerPreferences>;
    return {
      ...DEFAULT_CUSTOMER_PREFERENCES,
      ...parsed,
      watchlist: Array.isArray(parsed.watchlist) && parsed.watchlist.length > 0
        ? parsed.watchlist.filter((item): item is PestWatchlistOption =>
            PEST_WATCHLIST_OPTIONS.includes(item as PestWatchlistOption),
          ).slice(0, 3)
        : DEFAULT_CUSTOMER_PREFERENCES.watchlist,
    };
  } catch {
    return DEFAULT_CUSTOMER_PREFERENCES;
  }
}

export function saveCustomerPreferences(preferences: CustomerPreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    CUSTOMER_PREFERENCES_KEY,
    JSON.stringify({
      ...preferences,
      watchlist: preferences.watchlist.slice(0, 3),
    }),
  );
}

export function loadNotificationPreferences(): NotificationPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  const saved = window.localStorage.getItem(NOTIFICATION_PREFERENCES_KEY);
  if (!saved) return DEFAULT_NOTIFICATION_PREFERENCES;

  try {
    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...(JSON.parse(saved) as Partial<NotificationPreferences>),
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

export function saveNotificationPreferences(preferences: NotificationPreferences) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(NOTIFICATION_PREFERENCES_KEY, JSON.stringify(preferences));
}

function getSeasonLabel(month: number) {
  if (month >= 2 && month <= 4) return "Spring";
  if (month >= 5 && month <= 7) return "Summer";
  if (month >= 8 && month <= 10) return "Fall";
  return "Winter";
}

export function getRecommendedBookingPath(preferences: CustomerPreferences) {
  const watchlist = preferences.watchlist;

  if (watchlist.includes("Mosquitoes") && watchlist.includes("Ticks")) {
    return {
      href: "/book?service=organic-treatment",
      label: "Book Mosquito & Tick Coverage",
    };
  }

  if (watchlist.includes("Mosquitoes")) {
    return {
      href: "/book?service=mosquito-barrier",
      label: "Book Mosquito Defense",
    };
  }

  if (watchlist.includes("Ticks")) {
    return {
      href: "/book?service=tick-treatment",
      label: "Book Tick Treatment",
    };
  }

  if (watchlist.includes("Hornets")) {
    return {
      href: "/book?service=hornet-wasp",
      label: "Book Nest Removal",
    };
  }

  if (watchlist.includes("Termites")) {
    return {
      href: "/book?service=termite-inspection",
      label: "Schedule Termite Inspection",
    };
  }

  return {
    href: "/book?service=general-pest",
    label: "Book General Protection",
  };
}

export function getPersonalizedPrompt(preferences: CustomerPreferences, hasCart: boolean, cartCount: number) {
  const month = new Date().getMonth();
  const season = getSeasonLabel(month);
  const recommendation = getRecommendedBookingPath(preferences);
  const topWatch = preferences.watchlist.slice(0, 2).join(" + ");

  if (hasCart) {
    return {
      eyebrow: "Ready To Finish",
      title: `${cartCount} ${cartCount === 1 ? "service" : "services"} waiting in your cart`,
      body: "Pick up where you left off and lock in your visit while your details are still fresh.",
      primaryHref: "/book",
      primaryLabel: "Resume Booking",
      secondaryHref: "/plans",
      secondaryLabel: "Add Another Service",
    };
  }

  if (preferences.priority === "fast") {
    return {
      eyebrow: "Quick Action",
      title: `Need help with ${topWatch || "a pest issue"}?`,
      body: "We can move you toward the right treatment fast, even if you just need a same-day game plan.",
      primaryHref: "/pests",
      primaryLabel: "Use Pest Identifier",
      secondaryHref: recommendation.href,
      secondaryLabel: recommendation.label,
    };
  }

  return {
    eyebrow: `${season} Focus`,
    title: topWatch ? `${topWatch} season is here` : "Stay ahead of seasonal pest pressure",
    body: preferences.seasonalReminders
      ? "Your preferences say you want prevention first, so we’re surfacing the best next move before pests ramp up."
      : "Based on your setup, this is the smartest next service to keep your home ahead of the season.",
    primaryHref: recommendation.href,
    primaryLabel: recommendation.label,
    secondaryHref: "/pests",
    secondaryLabel: "Check a Pest Photo",
  };
}
