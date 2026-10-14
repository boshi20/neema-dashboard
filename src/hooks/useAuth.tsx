/**
 * Supabase auth shared by the restaurant dashboard and the admin dashboard.
 *
 * Session is restored on boot and kept in sync via onAuthStateChange.
 * On first sign-in the `users` profile row and (for non-admins) the
 * `restaurants` row are created if missing, so both email-confirmation and
 * instant-session signup flows converge here.
 *
 * Admin accounts (users.role = 'admin') never get an auto-created restaurant;
 * they are routed to /admin instead.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, type Tables } from "@/lib/supabase";

export type RestaurantRow = Tables<"restaurants">;
export type UserProfileRow = Tables<"users">;

interface DisplayUser {
  id: string;
  email: string;
  restaurantName: string;
  logo: string;
}

interface AuthContextType {
  user: DisplayUser | null;
  profile: UserProfileRow | null;
  isAdmin: boolean;
  restaurant: RestaurantRow | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  /** True while the profile/restaurant rows for the current session are being loaded. */
  syncing: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, restaurantName: string) => Promise<{ needsConfirmation: boolean }>;
  logout: () => void;
  refreshRestaurant: () => Promise<void>;
  updateUser: (updates: Partial<DisplayUser>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  isAdmin: false,
  restaurant: null,
  session: null,
  isAuthenticated: false,
  loading: true,
  syncing: false,
  signIn: async () => {},
  signUp: async () => ({ needsConfirmation: false }),
  logout: () => {},
  refreshRestaurant: async () => {},
  updateUser: () => {},
});

const DEFAULT_LAT = 23.588;
const DEFAULT_LNG = 58.3829;

interface AccountData {
  profile: UserProfileRow | null;
  restaurant: RestaurantRow | null;
}

async function loadAccount(session: Session): Promise<AccountData> {
  const authUser = session.user;
  const metadataName =
    typeof authUser.user_metadata?.restaurant_name === "string"
      ? authUser.user_metadata.restaurant_name.trim()
      : "";
  const restaurantName = metadataName.length >= 2 ? metadataName : "My Restaurant";

  const { data: initialProfile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();
  if (profileError) throw profileError;

  let profile = initialProfile;

  if (!profile) {
    const { error: insertError } = await supabase.from("users").insert({
      id: authUser.id,
      full_name: `${restaurantName} Owner`,
      email: authUser.email ?? `${authUser.id}@owner.nema.app`,
      role: "restaurant_owner",
      language: "en",
    });
    if (insertError && insertError.code !== "23505") throw insertError;

    const refetch = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();
    if (refetch.error) throw refetch.error;
    profile = refetch.data;
  }

  // Admins operate the platform, not a restaurant — never auto-create one.
  if (profile?.role === "admin") {
    return { profile, restaurant: null };
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", authUser.id)
    .maybeSingle();
  if (restaurantError) throw restaurantError;
  if (restaurant) return { profile, restaurant };

  // TEMPORARY: insert as approved because there is no admin approval flow yet
  // and the mobile app only surfaces approved restaurants.
  const { data: created, error: createError } = await supabase
    .from("restaurants")
    .insert({
      owner_id: authUser.id,
      name: restaurantName,
      address: "Not set",
      city: "Muscat",
      lat: DEFAULT_LAT,
      lng: DEFAULT_LNG,
      cuisine_type: "General",
      status: "approved",
      submitted_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
    })
    .select("*")
    .single();
  if (createError) throw createError;
  return { profile, restaurant: created };
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfileRow | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const syncAccount = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    if (!nextSession) {
      setProfile(null);
      setRestaurant(null);
      return;
    }
    setSyncing(true);
    try {
      const { profile: profileRow, restaurant: restaurantRow } =
        await loadAccount(nextSession);
      setProfile(profileRow);
      setRestaurant(restaurantRow);
    } catch (error) {
      console.error("Failed to load account data", error);
      setProfile(null);
      setRestaurant(null);
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!mounted) return;
        await syncAccount(data.session);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncAccount(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncAccount]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, restaurantName: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { restaurant_name: restaurantName } },
      });
      if (error) throw error;
      return { needsConfirmation: !data.session };
    },
    []
  );

  const logout = useCallback(() => {
    void supabase.auth.signOut();
  }, []);

  const refreshRestaurant = useCallback(async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from("restaurants")
      .select("*")
      .eq("owner_id", session.user.id)
      .maybeSingle();
    if (!error && data) setRestaurant(data);
  }, [session]);

  const user: DisplayUser | null = session
    ? {
        id: session.user.id,
        email: session.user.email ?? "",
        restaurantName: restaurant?.name ?? "",
        logo: restaurant?.logo_url ?? "",
      }
    : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin: profile?.role === "admin",
        restaurant,
        session,
        isAuthenticated: Boolean(session),
        loading,
        syncing,
        signIn,
        signUp,
        logout,
        refreshRestaurant,
        updateUser: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
