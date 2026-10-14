/**
 * Admin dashboard data layer.
 *
 * Reads rely on the admin RLS policies (`*_select_admin`, gated by the
 * server-side is_admin() check); every mutation goes through an audited
 * security-definer RPC. Nothing here trusts the client with authorization.
 */

import { supabase, type Tables } from "@/lib/supabase";
import type { Database } from "@/types/database.types";
import type {
  AnalyticsRange,
  AnalyticsPrevious,
  AnalyticsSeriesPoint,
  AnalyticsTotals,
} from "@/lib/analytics";
import { DEFAULT_TIME_ZONE } from "@/lib/analytics";

export type RestaurantStatus = Database["public"]["Enums"]["restaurant_status"];
export type ListingStatus = Database["public"]["Enums"]["listing_status"];
export type UserRole = Database["public"]["Enums"]["user_role"];
export type ReservationStatus = Database["public"]["Enums"]["reservation_status"];

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord {
  return value && typeof value === "object" ? (value as RawRecord) : {};
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toNullableNumber(value: unknown): number | null {
  if (value == null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function resolveTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
}

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

export interface AdminOverviewTotals {
  totalRestaurants: number;
  pendingRestaurants: number;
  totalUsers: number;
  customers: number;
  restaurantOwners: number;
  activeListings: number;
  reservationsToday: number;
  pickedUpToday: number;
}

export interface AdminPendingApproval {
  id: string;
  name: string;
  city: string;
  cuisineType: string;
  logoUrl: string | null;
  submittedAt: string;
}

export type AdminActivityType =
  | "restaurant_submitted"
  | "user_joined"
  | "listing_created"
  | "reservation_completed";

export interface AdminActivityItem {
  type: AdminActivityType;
  ts: string;
  title: string;
  subtitle: string;
  entityId: string;
}

export interface AdminOverview {
  totals: AdminOverviewTotals;
  pendingApprovals: AdminPendingApproval[];
  recentActivity: AdminActivityItem[];
}

export async function fetchAdminOverview(): Promise<AdminOverview> {
  const { data, error } = await supabase.rpc("admin_overview");
  if (error) {
    console.error("admin_overview failed", error);
    throw new Error("ADMIN_DATA_UNAVAILABLE");
  }

  const payload = asRecord(data);
  const totals = asRecord(payload.totals);

  const pendingApprovals: AdminPendingApproval[] = Array.isArray(payload.pendingApprovals)
    ? payload.pendingApprovals.map((entry) => {
        const p = asRecord(entry);
        return {
          id: String(p.id ?? ""),
          name: String(p.name ?? ""),
          city: String(p.city ?? ""),
          cuisineType: String(p.cuisineType ?? ""),
          logoUrl: p.logoUrl == null ? null : String(p.logoUrl),
          submittedAt: String(p.submittedAt ?? ""),
        };
      })
    : [];

  const recentActivity: AdminActivityItem[] = Array.isArray(payload.recentActivity)
    ? payload.recentActivity.map((entry) => {
        const a = asRecord(entry);
        return {
          type: (a.type as AdminActivityType) ?? "user_joined",
          ts: String(a.ts ?? ""),
          title: String(a.title ?? ""),
          subtitle: String(a.subtitle ?? ""),
          entityId: String(a.entityId ?? ""),
        };
      })
    : [];

  return {
    totals: {
      totalRestaurants: toNumber(totals.totalRestaurants),
      pendingRestaurants: toNumber(totals.pendingRestaurants),
      totalUsers: toNumber(totals.totalUsers),
      customers: toNumber(totals.customers),
      restaurantOwners: toNumber(totals.restaurantOwners),
      activeListings: toNumber(totals.activeListings),
      reservationsToday: toNumber(totals.reservationsToday),
      pickedUpToday: toNumber(totals.pickedUpToday),
    },
    pendingApprovals,
    recentActivity,
  };
}

// ---------------------------------------------------------------------------
// Restaurants
// ---------------------------------------------------------------------------

export interface AdminRestaurant extends Tables<"restaurants"> {
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
}

export async function listAdminRestaurants(): Promise<AdminRestaurant[]> {
  const { data, error } = await supabase
    .from("restaurants")
    .select("*, users(full_name, email, phone)")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const owner = (
      row as unknown as {
        users: { full_name: string | null; email: string | null; phone: string | null } | null;
      }
    ).users;
    return {
      ...(row as Tables<"restaurants">),
      ownerName: owner?.full_name?.trim() || "—",
      ownerEmail: owner?.email?.trim() || "—",
      ownerPhone: owner?.phone?.trim() || "—",
    };
  });
}

export async function setRestaurantStatus(
  restaurantId: string,
  status: RestaurantStatus,
  reason?: string
): Promise<Tables<"restaurants">> {
  const { data, error } = await supabase.rpc("admin_set_restaurant_status", {
    p_restaurant_id: restaurantId,
    p_status: status,
    p_reason: reason ?? null,
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export type AdminUser = Tables<"users">;

export async function listAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function setUserRole(
  userId: string,
  role: UserRole
): Promise<Tables<"users">> {
  const { data, error } = await supabase.rpc("admin_set_user_role", {
    p_user_id: userId,
    p_role: role,
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

export interface AdminListing extends Tables<"food_listings"> {
  restaurantName: string;
  restaurantLogo: string | null;
}

export async function listAdminListings(): Promise<AdminListing[]> {
  const { data, error } = await supabase
    .from("food_listings")
    .select("*, restaurants(name, logo_url)")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const restaurant = (
      row as unknown as { restaurants: { name: string | null; logo_url: string | null } | null }
    ).restaurants;
    return {
      ...(row as Tables<"food_listings">),
      restaurantName: restaurant?.name?.trim() || "—",
      restaurantLogo: restaurant?.logo_url ?? null,
    };
  });
}

export async function setListingStatusAdmin(
  listingId: string,
  status: Extract<ListingStatus, "active" | "paused" | "archived">
): Promise<Tables<"food_listings">> {
  const { data, error } = await supabase.rpc("admin_set_listing_status", {
    p_listing_id: listingId,
    p_status: status,
  });
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Orders (reservations)
// ---------------------------------------------------------------------------

export interface AdminOrder {
  id: string;
  status: ReservationStatus;
  paymentStatus: Database["public"]["Enums"]["payment_status"];
  amountPaid: number;
  createdAt: string;
  pickedUpAt: string | null;
  customerName: string;
  customerPhone: string;
  listingTitle: string;
  listingTitleAr: string | null;
  restaurantName: string;
}

export async function listAdminOrders(): Promise<AdminOrder[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select(
      "*, users(full_name, phone), food_listings(title, title_ar, restaurants(name))"
    )
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as unknown as Tables<"reservations"> & {
      users: { full_name: string | null; phone: string | null } | null;
      food_listings: {
        title: string | null;
        title_ar: string | null;
        restaurants: { name: string | null } | null;
      } | null;
    };
    return {
      id: r.id,
      status: r.status,
      paymentStatus: r.payment_status,
      amountPaid: Number(r.amount_paid) || 0,
      createdAt: r.created_at,
      pickedUpAt: r.picked_up_at,
      customerName: r.users?.full_name?.trim() || "—",
      customerPhone: r.users?.phone?.trim() || "—",
      listingTitle: r.food_listings?.title?.trim() || "—",
      listingTitleAr: r.food_listings?.title_ar ?? null,
      restaurantName: r.food_listings?.restaurants?.name?.trim() || "—",
    };
  });
}

// ---------------------------------------------------------------------------
// Platform analytics
// ---------------------------------------------------------------------------

export interface PlatformTotals extends AnalyticsTotals {
  newUsers: number;
  newRestaurants: number;
}

export interface PlatformTopRestaurant {
  id: string;
  name: string;
  logoUrl: string | null;
  city: string;
  reservations: number;
  foodRescued: number;
  revenue: number;
  pickupRate: number | null;
}

export interface PlatformAnalytics {
  timeZone: string;
  bucket: "day" | "week";
  from: string;
  to: string;
  co2PerMeal: number;
  hasAnyData: boolean;
  totals: PlatformTotals;
  previous: AnalyticsPrevious | null;
  series: AnalyticsSeriesPoint[];
  topRestaurants: PlatformTopRestaurant[];
}

export async function fetchPlatformAnalytics(
  range: AnalyticsRange
): Promise<PlatformAnalytics> {
  const { data, error } = await supabase.rpc("admin_platform_analytics", {
    p_from: range.from.toISOString(),
    p_to: range.to.toISOString(),
    p_time_zone: resolveTimeZone(),
  });
  if (error) {
    console.error("admin_platform_analytics failed", error);
    throw new Error("ANALYTICS_UNAVAILABLE");
  }

  const payload = asRecord(data);
  const totals = asRecord(payload.totals);
  const previousRaw = payload.previous;

  const series: AnalyticsSeriesPoint[] = Array.isArray(payload.series)
    ? payload.series.map((entry) => {
        const p = asRecord(entry);
        return {
          bucket: String(p.bucket ?? ""),
          reservations: toNumber(p.reservations),
          foodRescued: toNumber(p.foodRescued),
          revenue: toNumber(p.revenue),
        };
      })
    : [];

  const topRestaurants: PlatformTopRestaurant[] = Array.isArray(payload.topRestaurants)
    ? payload.topRestaurants.map((entry) => {
        const r = asRecord(entry);
        return {
          id: String(r.id ?? ""),
          name: String(r.name ?? ""),
          logoUrl: r.logoUrl == null ? null : String(r.logoUrl),
          city: String(r.city ?? ""),
          reservations: toNumber(r.reservations),
          foodRescued: toNumber(r.foodRescued),
          revenue: toNumber(r.revenue),
          pickupRate: toNullableNumber(r.pickupRate),
        };
      })
    : [];

  const previous: AnalyticsPrevious | null =
    previousRaw == null
      ? null
      : (() => {
          const p = asRecord(previousRaw);
          return {
            reservations: toNumber(p.reservations),
            foodRescued: toNumber(p.foodRescued),
            revenue: toNumber(p.revenue),
            customerSavings: toNumber(p.customerSavings),
            pickupRate: toNullableNumber(p.pickupRate),
            cancelled: toNumber(p.cancelled),
          };
        })();

  return {
    timeZone: String(payload.timeZone ?? DEFAULT_TIME_ZONE),
    bucket: payload.bucket === "week" ? "week" : "day",
    from: String(payload.from ?? range.from.toISOString()),
    to: String(payload.to ?? range.to.toISOString()),
    co2PerMeal: toNumber(payload.co2PerMeal),
    hasAnyData: Boolean(payload.hasAnyData),
    totals: {
      reservations: toNumber(totals.reservations),
      foodRescued: toNumber(totals.foodRescued),
      revenue: toNumber(totals.revenue),
      customerSavings: toNumber(totals.customerSavings),
      co2Avoided: toNumber(totals.co2Avoided),
      settledReservations: toNumber(totals.settledReservations),
      pickupRate: toNullableNumber(totals.pickupRate),
      completed: toNumber(totals.completed),
      pending: toNumber(totals.pending),
      cancelled: toNumber(totals.cancelled),
      expired: toNumber(totals.expired),
      newUsers: toNumber(totals.newUsers),
      newRestaurants: toNumber(totals.newRestaurants),
    },
    previous,
    series,
    topRestaurants,
  };
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------

export interface AdminAuditEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  entityLabel: string | null;
  details: Record<string, unknown>;
  createdAt: string;
  adminName: string;
  adminEmail: string;
}

export async function listAuditLogs(): Promise<AdminAuditEntry[]> {
  const { data, error } = await supabase
    .from("admin_audit_logs")
    .select("*, users(full_name, email)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;

  return (data ?? []).map((row) => {
    const r = row as unknown as Tables<"admin_audit_logs"> & {
      users: { full_name: string | null; email: string | null } | null;
    };
    return {
      id: r.id,
      action: r.action,
      entityType: r.entity_type,
      entityId: r.entity_id,
      entityLabel: r.entity_label,
      details: asRecord(r.details),
      createdAt: r.created_at,
      adminName: r.users?.full_name?.trim() || "—",
      adminEmail: r.users?.email?.trim() || "—",
    };
  });
}
