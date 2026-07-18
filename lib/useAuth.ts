"use client";

import { useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "./supabase";

/**
 * Minimal auth: are we signed in? Editing is gated on this.
 * With no Supabase configured (local mode) this is inert — there is
 * nobody to lock out on your own machine.
 */
export function useAuth() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(!isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const sb = getSupabase();
    sb.auth.getSession().then(({ data }) => {
      setEmail(data.session?.user.email ?? null);
      setReady(true);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return {
    email,
    ready,
    signedIn: !!email,
    signIn: async (to: string) => {
      if (!isSupabaseConfigured) return;
      return getSupabase().auth.signInWithOtp({
        email: to,
        options: { emailRedirectTo: window.location.href },
      });
    },
    signOut: async () => {
      if (!isSupabaseConfigured) return;
      return getSupabase().auth.signOut();
    },
  };
}
