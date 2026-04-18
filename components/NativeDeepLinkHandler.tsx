"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Capacitor } from "@capacitor/core";
import { NATIVE_APP_SCHEME, WEB_APP_ORIGIN } from "@/lib/runtimeConfig";

function mapIncomingUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const isNativeScheme = parsed.protocol === `${NATIVE_APP_SCHEME}:`;
    const isWebOrigin = parsed.origin === WEB_APP_ORIGIN;
    const hashParams = new URLSearchParams(parsed.hash.startsWith("#") ? parsed.hash.slice(1) : parsed.hash);

    if (!isNativeScheme && !isWebOrigin) {
      return null;
    }

    const path = isNativeScheme
      ? `/${parsed.hostname}${parsed.pathname}`.replace(/\/+/g, "/")
      : parsed.pathname;

    const isAuthCallback =
      path === "/auth/callback" ||
      hashParams.has("access_token") ||
      hashParams.has("refresh_token") ||
      hashParams.has("error_description") ||
      parsed.searchParams.has("code");

    if (isAuthCallback) {
      return null;
    }

    return `${path}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export function NativeDeepLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    let removeListener: (() => void) | undefined;

    const init = async () => {
      const { App } = await import("@capacitor/app");
      const { Browser } = await import("@capacitor/browser");

      const navigateFromUrl = async (url?: string | null) => {
        if (!url) return;
        const target = mapIncomingUrl(url);
        if (!target) return;

        try {
          await Browser.close();
        } catch {}

        router.push(target);
      };

      const launch = await App.getLaunchUrl();
      await navigateFromUrl(launch?.url);

      const listener = await App.addListener("appUrlOpen", async ({ url }) => {
        await navigateFromUrl(url);
      });

      removeListener = () => {
        void listener.remove();
      };
    };

    void init();

    return () => {
      removeListener?.();
    };
  }, [router]);

  return null;
}
