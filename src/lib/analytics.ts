/**
 * Restaurant analytics data layer.
 *
 * Everything comes from a single secure RPC (`restaurant_analytics`) which
 * resolves the caller's restaurant from auth.uid() server-side — the client
 * never sends a restaurant id, so one owner can't read another's numbers.
 */

import { supabase } from "@/lib/supabase";

export const DEFAULT_TIME_ZONE = "Asia/Muscat";

export type DateRangePreset =
  | "today"
  | "last7"
  | "last30"
  | "thisMonth"
  | "lastMonth"
  | "custom";

export interface AnalyticsRange {
  /** Inclusive start. */
  from: Date;
  /** Exclusive end. */
  to: Date;
}

export interface AnalyticsTotals {
  reservations: number;
  foodRescued: number;
  revenue: number;
  customerSavings: number;
  co2Avoided: number;
  settledReservations: number;
  /** Null when no reservation has settled yet (no meaningful rate). */
  pickupRate: number | null;
  completed: number;
  pending: number;
  cancelled: number;
  expired: number;
}

export interface AnalyticsPrevious {
  reservations: number;
  foodRescued: number;
  revenue: number;
  customerSavings: number;
  pickupRate: number | null;
  cancelled: number;
}

export interface AnalyticsSeriesPoint {
  /** Bucket start as YYYY-MM-DD in the restaurant's time zone. */
  bucket: string;
  reservations: number;
  foodRescued: number;
  revenue: number;
}

export interface AnalyticsTopListing {
  id: string;
  title: string;
  titleAr: string | null;
  image: string | null;
  reservations: number;
  foodRescued: number;
  revenue: number;
  pickupRate: number | null;
}

export interface RestaurantAnalytics {
  restaurantId: string;
  timeZone: string;
  bucket: "day" | "week";
  from: string;
  to: string;
  co2PerMeal: number;
  hasListings: boolean;
  hasAnyData: boolean;
  totals: AnalyticsTotals;
  /** Null when the previous equivalent period has no reservations. */
  previous: AnalyticsPrevious | null;
  series: AnalyticsSeriesPoint[];
  topListings: AnalyticsTopListing[];
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

/** Resolves a preset into an inclusive-start / exclusive-end local range. */
export function resolveRange(preset: DateRangePreset, custom?: AnalyticsRange): AnalyticsRange {
  const today = startOfDay(new Date());

  switch (preset) {
    case "today":
      return { from: today, to: addDays(today, 1) };
    case "last7":
      return { from: addDays(today, -6), to: addDays(today, 1) };
    case "thisMonth":
      return {
        from: new Date(today.getFullYear(), today.getMonth(), 1),
        to: addDays(today, 1),
      };
    case "lastMonth":
      return {
        from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
        to: new Date(today.getFullYear(), today.getMonth(), 1),
      };
    case "custom":
      if (custom) {
        const from = startOfDay(custom.from);
        const to = addDays(startOfDay(custom.to), 1);
        return { from, to: to > from ? to : addDays(from, 1) };
      }
      return { from: addDays(today, -29), to: addDays(today, 1) };
    case "last30":
    default:
      return { from: addDays(today, -29), to: addDays(today, 1) };
  }
}

/** YYYY-MM-DD for date inputs, using local time (not UTC). */
export function toDateInputValue(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${m}-${d}`;
}

export function parseDateInputValue(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function resolveTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TIME_ZONE;
  } catch {
    return DEFAULT_TIME_ZONE;
  }
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

type RawRecord = Record<string, unknown>;

function asRecord(value: unknown): RawRecord {
  return value && typeof value === "object" ? (value as RawRecord) : {};
}

function parseTotals(raw: unknown): AnalyticsTotals {
  const t = asRecord(raw);
  return {
    reservations: toNumber(t.reservations),
    foodRescued: toNumber(t.foodRescued),
    revenue: toNumber(t.revenue),
    customerSavings: toNumber(t.customerSavings),
    co2Avoided: toNumber(t.co2Avoided),
    settledReservations: toNumber(t.settledReservations),
    pickupRate: toNullableNumber(t.pickupRate),
    completed: toNumber(t.completed),
    pending: toNumber(t.pending),
    cancelled: toNumber(t.cancelled),
    expired: toNumber(t.expired),
  };
}

function parsePrevious(raw: unknown): AnalyticsPrevious | null {
  if (raw == null) return null;
  const p = asRecord(raw);
  return {
    reservations: toNumber(p.reservations),
    foodRescued: toNumber(p.foodRescued),
    revenue: toNumber(p.revenue),
    customerSavings: toNumber(p.customerSavings),
    pickupRate: toNullableNumber(p.pickupRate),
    cancelled: toNumber(p.cancelled),
  };
}

function parseSeries(raw: unknown): AnalyticsSeriesPoint[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => {
    const point = asRecord(entry);
    return {
      bucket: String(point.bucket ?? ""),
      reservations: toNumber(point.reservations),
      foodRescued: toNumber(point.foodRescued),
      revenue: toNumber(point.revenue),
    };
  });
}

function parseTopListings(raw: unknown): AnalyticsTopListing[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => {
    const listing = asRecord(entry);
    return {
      id: String(listing.id ?? ""),
      title: String(listing.title ?? ""),
      titleAr: listing.titleAr == null ? null : String(listing.titleAr),
      image: listing.image == null ? null : String(listing.image),
      reservations: toNumber(listing.reservations),
      foodRescued: toNumber(listing.foodRescued),
      revenue: toNumber(listing.revenue),
      pickupRate: toNullableNumber(listing.pickupRate),
    };
  });
}

export async function fetchRestaurantAnalytics(
  range: AnalyticsRange
): Promise<RestaurantAnalytics> {
  const { data, error } = await supabase.rpc("restaurant_analytics", {
    p_from: range.from.toISOString(),
    p_to: range.to.toISOString(),
    p_time_zone: resolveTimeZone(),
  });

  if (error) {
    // Surface a stable message; the raw DB error stays in the console only.
    console.error("restaurant_analytics failed", error);
    throw new Error("ANALYTICS_UNAVAILABLE");
  }

  const payload = asRecord(data);
  const bucket = payload.bucket === "week" ? "week" : "day";

  return {
    restaurantId: String(payload.restaurantId ?? ""),
    timeZone: String(payload.timeZone ?? DEFAULT_TIME_ZONE),
    bucket,
    from: String(payload.from ?? range.from.toISOString()),
    to: String(payload.to ?? range.to.toISOString()),
    co2PerMeal: toNumber(payload.co2PerMeal),
    hasListings: Boolean(payload.hasListings),
    hasAnyData: Boolean(payload.hasAnyData),
    totals: parseTotals(payload.totals),
    previous: parsePrevious(payload.previous),
    series: parseSeries(payload.series),
    topListings: parseTopListings(payload.topListings),
  };
}

/** Percentage change vs the previous period, or null when not comparable. */
export function percentChange(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

/** Latin digits in both languages, matching the rest of the dashboard. */
function numberLocale(locale: string): string {
  return locale === "ar" ? "ar-OM-u-nu-latn" : "en-OM";
}

/** OMR is a 3-decimal currency; never round to whole numbers. */
export function formatOmr(value: number, locale: string): string {
  return new Intl.NumberFormat(numberLocale(locale), {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(Number.isFinite(value) ? value : 0);
}

export function formatCount(value: number, locale: string): string {
  return new Intl.NumberFormat(numberLocale(locale)).format(
    Number.isFinite(value) ? value : 0
  );
}

export function formatKg(value: number, locale: string): string {
  return new Intl.NumberFormat(numberLocale(locale), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}
