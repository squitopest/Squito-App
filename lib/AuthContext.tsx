"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import { useRouter } from "next/navigation";
import type { User, Session } from "@supabase/supabase-js";
import {
  NATIVE_APP_SCHEME,
  WEB_APP_ORIGIN,
  getApiBase,
  getAppleAuthRedirectUri,
  getClientOrigin,
  getNativeAuthRedirectUrl,
  getNativeRouteUrl,
} from "./runtimeConfig";

export interface UserProfile {
  id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  service_address: string | null;
  avatar_url: string | null;
  tier: string;
  total_points: number;
  redeemable_points: number;
  onboarding_complete: boolean;
  created_at: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isGuest: boolean;
  isLoading: boolean;
  isAuthReady: boolean; // true once we've determined login state
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (
    email: string,
    password: string,
    displayName: string,
    referralEmail?: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; success?: boolean }>;
  signInWithGoogle: () => Promise<{ error?: string }>;
  signInWithApple: () => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

const GUEST_KEY = "squito_guest_mode";

function getAuthCallbackData(url: string) {
  try {
    const parsed = new URL(url);
    const isNativeScheme = parsed.protocol === `${NATIVE_APP_SCHEME}:`;
    const isWebOrigin = parsed.origin === WEB_APP_ORIGIN;

    if (!isNativeScheme && !isWebOrigin) {
      return null;
    }

    const path = isNativeScheme
      ? `/${parsed.hostname}${parsed.pathname}`.replace(/\/+/g, "/")
      : parsed.pathname;
    const queryParams = parsed.searchParams;
    const hashParams = new URLSearchParams(parsed.hash.startsWith("#") ? parsed.hash.slice(1) : parsed.hash);

    const accessToken = hashParams.get("access_token") ?? queryParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token") ?? queryParams.get("refresh_token");
    const authCode = queryParams.get("code");
    const authError =
      hashParams.get("error_description") ??
      queryParams.get("error_description") ??
      hashParams.get("error") ??
      queryParams.get("error");
    const type = hashParams.get("type") ?? queryParams.get("type");

    if (!accessToken && !refreshToken && !authCode && !authError) {
      return null;
    }

    return {
      path,
      accessToken,
      refreshToken,
      authCode,
      authError,
      type,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const router = useRouter();

  // ── Fetch profile from Supabase ──
  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return null;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error || !data) return null;
    return {
      id: data.id,
      display_name: data.display_name,
      email: data.email,
      address: data.address,
      service_address: data.service_address,
      avatar_url: data.avatar_url,
      phone: data.phone,
      created_at: data.created_at,
      total_points: data.total_points,
      redeemable_points: data.redeemable_points,
      tier: data.tier,
      onboarding_complete: data.onboarding_complete,
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await fetchProfile(user.id);
      if (p) setProfile(p);
    }
  }, [user, fetchProfile]);

  // ── Bootstrap session on mount ──
  useEffect(() => {
    let isMounted = true;
    let authCleanup: (() => void) | undefined;
    const pushListenerRemovers: Array<() => void> = [];
    let removeNativeAuthListener: (() => void) | undefined;

    const handleNativeAuthUrl = async (url?: string | null) => {
      if (!url || !supabase) return false;

      const callback = getAuthCallbackData(url);
      if (!callback) return false;

      try {
        const { Browser } = await import("@capacitor/browser");
        await Browser.close();
      } catch {}

      if (callback.authError) {
        console.warn("[Auth] Native auth callback failed:", callback.authError);
        router.push("/");
        return true;
      }

      if (callback.authCode) {
        const { error } = await supabase.auth.exchangeCodeForSession(callback.authCode);
        if (error) {
          console.warn("[Auth] Failed to exchange native auth code:", error.message);
          router.push("/");
          return true;
        }
      } else if (callback.accessToken && callback.refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: callback.accessToken,
          refresh_token: callback.refreshToken,
        });
        if (error) {
          console.warn("[Auth] Failed to restore native auth session:", error.message);
          router.push("/");
          return true;
        }
      } else {
        return false;
      }

      if (callback.type === "recovery" || callback.path === "/me/security") {
        router.push("/me/security#type=recovery");
      } else {
        router.push("/");
      }

      return true;
    };

    async function init() {
      // Check for guest mode first
      if (typeof window !== "undefined") {
        const guestStored = localStorage.getItem(GUEST_KEY);
        if (guestStored === "true") {
          if (!isMounted) return;
          setIsGuest(true);
          setIsLoading(false);
          setIsAuthReady(true);
          return;
        }
      }

      if (!supabase) {
        // No Supabase configured — treat as needing auth gate
        if (!isMounted) return;
        setIsLoading(false);
        setIsAuthReady(true);
        return;
      }

      // Restore existing session
      const {
        data: { session: existingSession },
      } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (existingSession?.user) {
        setUser(existingSession.user);
        setSession(existingSession);
        const p = await fetchProfile(existingSession.user.id);
        if (isMounted && p) setProfile(p);
      }

      // Initialize APNs Hardware Hook (Native Only)
      if (typeof window !== "undefined") {
        import("@capacitor/core").then(({ Capacitor }) => {
          if (Capacitor.isNativePlatform()) {
            import("@capacitor/push-notifications").then(({ PushNotifications }) => {
              PushNotifications.requestPermissions().then((result) => {
                if (result.receive === "granted") {
                  PushNotifications.register();
                }
              }).catch(console.warn);

              // Webhook raw APNs tokens directly into OneSignal CRM
              PushNotifications.addListener("registration", async (token) => {
                const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
                if (!appId || !supabase) return;
                try {
                  const { data: { session: currentSession } } = await supabase.auth.getSession();
                  await fetch("https://onesignal.com/api/v1/players", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      app_id: appId,
                      device_type: 0, // 0 = iOS (Apple APNs)
                      identifier: token.value,
                      external_user_id: currentSession?.user?.id || undefined,
                    }),
                  });
                } catch (err) {
                  console.warn("OneSignal Registration failed", err);
                }
              }).then((handle) => {
                pushListenerRemovers.push(() => {
                  void handle.remove();
                });
              }).catch(console.warn);
            }).catch(console.warn);
          }
        }).catch(console.warn);
      }

      if (typeof window !== "undefined") {
        import("@capacitor/core").then(async ({ Capacitor }) => {
          if (!Capacitor.isNativePlatform()) return;

          try {
            const { App } = await import("@capacitor/app");
            const launch = await App.getLaunchUrl();
            await handleNativeAuthUrl(launch?.url);

            const listener = await App.addListener("appUrlOpen", async ({ url }) => {
              await handleNativeAuthUrl(url);
            });

            removeNativeAuthListener = () => {
              void listener.remove();
            };
          } catch (err) {
            console.warn("[Auth] Native auth listener setup failed", err);
          }
        }).catch(console.warn);
      }

      if (!isMounted) return;
      setIsLoading(false);
      setIsAuthReady(true);

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (event === "PASSWORD_RECOVERY") {
          router.push("/me/security#type=recovery");
        }

        if (newSession?.user) {
          setUser(newSession.user);
          setSession(newSession);
          setIsGuest(false);
          if (typeof window !== "undefined") {
            localStorage.removeItem(GUEST_KEY);
          }
          const p = await fetchProfile(newSession.user.id);
          if (p) setProfile(p);
        } else {
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      });

      authCleanup = () => subscription.unsubscribe();
    }

    void init();

    return () => {
      isMounted = false;
      authCleanup?.();
      removeNativeAuthListener?.();
      pushListenerRemovers.forEach((remove) => remove());
    };
  }, [fetchProfile, router]);

  // ── Auth actions ──

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: "Supabase not configured. Add your keys to .env.local" };
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (error) return { error: error.message };
    return {};
  };

  const signUp = async (
    email: string,
    password: string,
    displayName: string,
    referralEmail?: string
  ) => {
    if (!supabase) return { error: "Supabase not configured. Add your keys to .env.local" };
    setIsLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { 
          display_name: displayName,
          ...(referralEmail ? { referer_email: referralEmail } : {})
        },
      },
    });
    setIsLoading(false);
    if (error) return { error: error.message };

    // Fire welcome email only when Supabase returns a live session token.
    // This keeps the email endpoint private instead of publicly callable.
    if (data.session?.access_token) {
      let isNative = false;
      try {
        const { Capacitor } = await import("@capacitor/core");
        isNative = Capacitor.isNativePlatform();
      } catch {}

      const apiBase = getApiBase(isNative);
      fetch(`${apiBase}/api/welcome-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({ email, displayName }),
      }).catch((err) => console.warn("[Auth] Welcome email failed:", err));
    }

    return {};
  };

  const resetPassword = async (email: string) => {
    if (!supabase) return { error: "Supabase not configured." };
    let isNative = false;
    try {
      const { Capacitor } = await import("@capacitor/core");
      isNative = Capacitor.isNativePlatform();
    } catch {}

    setIsLoading(true);
    const origin = getClientOrigin();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: isNative ? getNativeRouteUrl("me/security") : `${origin}/me/security`,
    });
    setIsLoading(false);
    if (error) return { error: error.message };
    return { success: true };
  };

  const signInWithGoogle = async () => {
    if (!supabase) return { error: "Supabase not configured." };
    
    let isNative = false;
    try {
      const { Capacitor } = await import("@capacitor/core");
      isNative = Capacitor.isNativePlatform();
    } catch (e) {}

    const origin = getClientOrigin();
    // Send users back to root page/localhost natively or on the web
    const redirectUrl = isNative ? getNativeAuthRedirectUrl() : origin;

    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
        ...(isNative ? { skipBrowserRedirect: true } : {}),
      },
    });

    if (!error && isNative && data?.url) {
      try {
        const { Browser } = await import("@capacitor/browser");
        await Browser.open({ url: data.url });
      } catch (browserError) {
        setIsLoading(false);
        return {
          error: browserError instanceof Error ? browserError.message : "Could not open Google sign-in.",
        };
      }
    }

    setIsLoading(false);
    if (error) return { error: error.message };
    return {};
  };

  const signInWithApple = async () => {
    if (!supabase) return { error: "Supabase not configured." };
    
    let isNative = false;
    try {
      const { Capacitor } = await import("@capacitor/core");
      isNative = Capacitor.isNativePlatform();
    } catch (e) {}

    if (isNative) {
      try {
        const { SignInWithApple } = await import("@capacitor-community/apple-sign-in");
        const result = await SignInWithApple.authorize({
          clientId: NATIVE_APP_SCHEME, // Fallback, Supabase/Apple native ignores this on iOS but requires it for web
          redirectURI: getAppleAuthRedirectUri(),
          scopes: "email name",
        });
        
        if (result.response && result.response.identityToken) {
          setIsLoading(true);
          const { error } = await supabase.auth.signInWithIdToken({
            provider: "apple",
            token: result.response.identityToken,
          });
          setIsLoading(false);
          if (error) return { error: error.message };
          return {};
        } else {
          return { error: "Apple login cancelled." };
        }
      } catch (err: unknown) {
        return {
          error: err instanceof Error ? err.message : "Apple login failed natively.",
        };
      }
    } else {
      // Web fallback
      const origin = getClientOrigin();
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "apple",
        options: {
          redirectTo: origin,
        },
      });
      setIsLoading(false);
      if (error) return { error: error.message };
      return {};
    }
  };

  const signOutAction = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsGuest(false);
    localStorage.removeItem(GUEST_KEY);
    // Use hard navigation so Capacitor's WebView fully remounts AuthGate
    if (typeof window !== "undefined") {
      window.location.replace("/");
    } else {
      router.push("/");
    }
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem(GUEST_KEY, "true");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isGuest,
        isLoading,
        isAuthReady,
        signIn,
        signUp,
        signOut: signOutAction,
        continueAsGuest,
        refreshProfile,
        resetPassword,
        signInWithGoogle,
        signInWithApple,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
