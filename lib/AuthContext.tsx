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
    displayName: string
  ) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string; success?: boolean }>;
}

const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

const GUEST_KEY = "squito_guest_mode";

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
    return data as UserProfile;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      const p = await fetchProfile(user.id);
      if (p) setProfile(p);
    }
  }, [user, fetchProfile]);

  // ── Bootstrap session on mount ──
  useEffect(() => {
    async function init() {
      // Check for guest mode first
      if (typeof window !== "undefined") {
        const guestStored = localStorage.getItem(GUEST_KEY);
        if (guestStored === "true") {
          setIsGuest(true);
          setIsLoading(false);
          setIsAuthReady(true);
          return;
        }
      }

      if (!supabase) {
        // No Supabase configured — treat as needing auth gate
        setIsLoading(false);
        setIsAuthReady(true);
        return;
      }

      // Restore existing session
      const {
        data: { session: existingSession },
      } = await supabase.auth.getSession();

      if (existingSession?.user) {
        setUser(existingSession.user);
        setSession(existingSession);
        const p = await fetchProfile(existingSession.user.id);
        if (p) setProfile(p);
      }

      setIsLoading(false);
      setIsAuthReady(true);

      // Listen for auth changes
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (event === "PASSWORD_RECOVERY") {
          // Force route to the security page explicitly if recovery hash is processed
          router.push("/me/security#type=recovery");
        }

        if (newSession?.user) {
          setUser(newSession.user);
          setSession(newSession);
          setIsGuest(false);
          localStorage.removeItem(GUEST_KEY);
          const p = await fetchProfile(newSession.user.id);
          if (p) setProfile(p);
        } else {
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      });

      return () => subscription.unsubscribe();
    }

    init();
  }, [fetchProfile]);

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
    displayName: string
  ) => {
    if (!supabase) return { error: "Supabase not configured. Add your keys to .env.local" };
    setIsLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    setIsLoading(false);
    if (error) return { error: error.message };

    // Fire welcome email (non-blocking — don't hold up the UI)
    fetch("/api/welcome-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, displayName }),
    }).catch((err) => console.warn("[Auth] Welcome email failed:", err));

    return {};
  };

  const resetPassword = async (email: string) => {
    if (!supabase) return { error: "Supabase not configured." };
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://squito-app.vercel.app/me/security",
    });
    setIsLoading(false);
    if (error) return { error: error.message };
    return { success: true };
  };

  const signOutAction = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsGuest(false);
    localStorage.removeItem(GUEST_KEY);
    router.push("/");
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
