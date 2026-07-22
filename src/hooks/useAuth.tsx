/**
 * Restaurant-owner auth backed by Supabase.
 *
 * Session is restored on boot and kept in sync via onAuthStateChange.
 * On first sign-in the owner's `users` profile row (role restaurant_owner)
 * and `restaurants` row are created if missing, so both email-confirmation
 * and instant-session signup flows converge here.
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

interface DisplayUser {
  id: string;
  email: string;
  restaurantName: string;
  logo: string;
}

interface AuthContextType {
  user: DisplayUser | null;
  restaurant: RestaurantRow | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, restaurantName: string) => Promise<{ needsConfirmation: boolean }>;
  logout: () => void;
  refreshRestaurant: () => Promise<void>;
  updateUser: (updates: Partial<DisplayUser>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  restaurant: null,
  session: null,
  isAuthenticated: false,
  loading: true,
  signIn: async () => {},
  signUp: async () => ({ needsConfirmation: false }),
  logout: () => {},
  refreshRestaurant: async () => {},
  updateUser: () => {},
});

const DEFAULT_LAT = 23.588;
const DEFAULT_LNG = 58.3829;

async function ensureOwnerSetup(session: Session): Promise<RestaurantRow | null> {
  const authUser = session.user;
  const metadataName =
    typeof authUser.user_metadata?.restaurant_name === "string"
      ? authUser.user_metadata.restaurant_name.trim()
      : "";
  const restaurantName = metadataName.length >= 2 ? metadataName : "My Restaurant";

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();
  if (profileError) throw profileError;

  if (!profile) {
    const { error: insertError } = await supabase.from("users").insert({
      id: authUser.id,
      full_name: `${restaurantName} Owner`,
      email: authUser.email ?? `${authUser.id}@owner.nema.app`,
      role: "restaurant_owner",
      language: "en",
    });
    if (insertError && insertError.code !== "23505") throw insertError;
  }

  const { data: restaurant, error: restaurantError } = await supabase
    .from("restaurants")
    .select("*")
    .eq("owner_id", authUser.id)
    .maybeSingle();
  if (restaurantError) throw restaurantError;
  if (restaurant) return restaurant;

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
  return created;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [restaurant, setRestaurant] = useState<RestaurantRow | null>(null);
  const [loading, setLoading] = useState(true);

  const syncOwner = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);
    if (!nextSession) {
      setRestaurant(null);
      return;
    }
    try {
      const row = await ensureOwnerSetup(nextSession);
      setRestaurant(row);
    } catch (error) {
      console.error("Failed to load owner data", error);
      setRestaurant(null);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!mounted) return;
        await syncOwner(data.session);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      void syncOwner(nextSession);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncOwner]);

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
        restaurant,
        session,
        isAuthenticated: Boolean(session),
        loading,
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
