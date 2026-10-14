/**
 * Admin auth derived from the real Supabase session.
 *
 * Frontend gating is convenience only — actual enforcement lives in the
 * database: admin RLS policies and RPCs all validate `is_admin()` server-side,
 * so a non-admin session cannot read or mutate admin data regardless of what
 * the client renders.
 */

import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "./useAuth";

export class NotAdminError extends Error {
  constructor() {
    super("NOT_ADMIN");
    this.name = "NotAdminError";
  }
}

export function useAdminAuth() {
  const { session, profile, isAdmin, loading, syncing, logout } = useAuth();

  /**
   * Signs in and verifies the account is an admin. Non-admin accounts are
   * signed out again and rejected so the admin login page can show a clear
   * access-denied message.
   */
  const adminSignIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const userId = data.session?.user.id;
    const { data: row, error: roleError } = await supabase
      .from("users")
      .select("role")
      .eq("id", userId ?? "")
      .maybeSingle();

    if (roleError || row?.role !== "admin") {
      await supabase.auth.signOut();
      throw new NotAdminError();
    }
  }, []);

  return {
    admin:
      isAdmin && profile
        ? { id: profile.id, email: profile.email, name: profile.full_name }
        : null,
    isAdminAuthenticated: Boolean(session) && isAdmin,
    isAuthenticated: Boolean(session),
    /** True while we cannot yet tell whether the session belongs to an admin. */
    loading: loading || (Boolean(session) && syncing),
    adminSignIn,
    adminSignOut: logout,
  };
}
