/**
 * Data access for the restaurant-owner dashboard against the shared
 * NEMA Supabase schema (food_listings / reservations / restaurants).
 *
 * Maps DB rows to/from the dashboard's existing Meal UI shape so pages
 * keep their current form fields.
 */

import { supabase, type Tables, type Database } from "@/lib/supabase";
import type { Meal } from "@/types/meal";
import { MealStockConflictError, nextQuantityRemaining } from "@/lib/mealStock";

export { MealStockConflictError, nextQuantityRemaining } from "@/lib/mealStock";

export type FoodListingRow = Tables<"food_listings">;
export type ReservationRow = Tables<"reservations">;
export type RestaurantRow = Tables<"restaurants">;
export type ReservationStatus = Database["public"]["Enums"]["reservation_status"];

export interface OwnerOrder {
  id: string;
  customerRef: string;
  customerName: string;
  customerPhone: string;
  mealName: string;
  mealNameAr: string;
  total: number;
  status: ReservationStatus;
  createdAt: string;
  pickedUpAt: string | null;
}

// ---------------------------------------------------------------------------
// Meal mapping
// ---------------------------------------------------------------------------

function toLocalTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function toLocalDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function rowToMeal(row: FoodListingRow): Meal {
  return {
    id: row.id,
    name: row.title,
    nameAr: row.title_ar ?? "",
    description: row.description ?? "",
    descriptionAr: row.description_ar ?? "",
    originalPrice: Number(row.original_price),
    discountedPrice: Number(row.selling_price),
    quantity: row.quantity,
    availableQuantity: row.quantity_remaining,
    category: row.category ?? "mainCourse",
    image: row.images?.[0] ?? "",
    available: row.status === "active",
    pickupDate: toLocalDate(row.pickup_start),
    pickupFrom: toLocalTime(row.pickup_start),
    pickupTo: toLocalTime(row.pickup_end),
    createdAt: row.created_at.split("T")[0],
  };
}

export interface MealInput {
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  originalPrice: number;
  discountedPrice: number;
  quantity: number;
  category: string;
  image: string;
  pickupDate: string; // YYYY-MM-DD
  pickupFrom: string; // HH:mm
  pickupTo: string; // HH:mm
}

/** Combines a local date + time into an ISO string; rolls the end time to the
 *  next day when the window crosses midnight. */
export function pickupWindowToIso(
  pickupDate: string,
  pickupFrom: string,
  pickupTo: string
): { start: string; end: string } {
  const start = new Date(`${pickupDate}T${pickupFrom}:00`);
  const end = new Date(`${pickupDate}T${pickupTo}:00`);
  if (end <= start) {
    end.setDate(end.getDate() + 1);
  }
  return { start: start.toISOString(), end: end.toISOString() };
}

// ---------------------------------------------------------------------------
// Meals CRUD
// ---------------------------------------------------------------------------

export async function listMeals(restaurantId: string): Promise<Meal[]> {
  const { data, error } = await supabase
    .from("food_listings")
    .select("*")
    .eq("restaurant_id", restaurantId)
    .neq("status", "archived")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToMeal);
}

export async function createMeal(restaurantId: string, input: MealInput): Promise<Meal> {
  const { start, end } = pickupWindowToIso(input.pickupDate, input.pickupFrom, input.pickupTo);
  const { data, error } = await supabase
    .from("food_listings")
    .insert({
      restaurant_id: restaurantId,
      title: input.name,
      title_ar: input.nameAr || null,
      description: input.description || null,
      description_ar: input.descriptionAr || null,
      category: input.category,
      quantity: input.quantity,
      quantity_remaining: input.quantity,
      pickup_start: start,
      pickup_end: end,
      original_price: input.originalPrice,
      selling_price: input.discountedPrice,
      images: input.image ? [input.image] : [],
      status: "active",
    })
    .select("*")
    .single();
  if (error) throw error;
  return rowToMeal(data);
}

/**
 * Follow-up: move this write into a Postgres RPC that shares reserve_listing's
 * SELECT ... FOR UPDATE pattern so every quantity_remaining mutation goes
 * through one locked code path.
 */
const UPDATE_MEAL_MAX_ATTEMPTS = 3;

export async function updateMeal(mealId: string, input: MealInput): Promise<Meal> {
  const { start, end } = pickupWindowToIso(input.pickupDate, input.pickupFrom, input.pickupTo);

  // Absolute quantity from the merchant form. Read → compute remaining → write
  // with an optimistic check on (quantity, quantity_remaining). If reserve_listing
  // (or another editor) changes the row first, zero rows match and we retry with
  // a fresh snapshot so both operations compose instead of clobbering.
  for (let attempt = 0; attempt < UPDATE_MEAL_MAX_ATTEMPTS; attempt++) {
    const { data: existing, error: existingError } = await supabase
      .from("food_listings")
      .select("quantity, quantity_remaining")
      .eq("id", mealId)
      .single();
    if (existingError) throw existingError;

    const nextRemaining = nextQuantityRemaining(
      existing.quantity,
      existing.quantity_remaining,
      input.quantity
    );

    const { data, error } = await supabase
      .from("food_listings")
      .update({
        title: input.name,
        title_ar: input.nameAr || null,
        description: input.description || null,
        description_ar: input.descriptionAr || null,
        category: input.category,
        quantity: input.quantity,
        quantity_remaining: nextRemaining,
        pickup_start: start,
        pickup_end: end,
        original_price: input.originalPrice,
        selling_price: input.discountedPrice,
        images: input.image ? [input.image] : [],
      })
      .eq("id", mealId)
      .eq("quantity", existing.quantity)
      .eq("quantity_remaining", existing.quantity_remaining)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (data) return rowToMeal(data);
  }

  throw new MealStockConflictError();
}

export async function setMealAvailability(mealId: string, available: boolean): Promise<void> {
  const { error } = await supabase
    .from("food_listings")
    .update({ status: available ? "active" : "paused" })
    .eq("id", mealId);
  if (error) throw error;
}

export async function deleteMeal(mealId: string): Promise<void> {
  // Hard delete; falls back to archiving when reservations reference the row
  // (listing_id FK is `on delete restrict`).
  const { error } = await supabase.from("food_listings").delete().eq("id", mealId);
  if (error) {
    const { error: archiveError } = await supabase
      .from("food_listings")
      .update({ status: "archived" })
      .eq("id", mealId);
    if (archiveError) throw archiveError;
  }
}

// ---------------------------------------------------------------------------
// Orders (reservations on own listings)
// ---------------------------------------------------------------------------

export async function listOrders(restaurantId: string): Promise<OwnerOrder[]> {
  const { data, error } = await supabase
    .from("reservations")
    .select("*, food_listings!inner(*), users(full_name, phone)")
    .eq("food_listings.restaurant_id", restaurantId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data ?? []).map((row) => {
    const listing = (row as unknown as { food_listings: FoodListingRow }).food_listings;
    const customer = (
      row as unknown as {
        users: { full_name: string | null; phone: string | null } | null;
      }
    ).users;
    return {
      id: row.id,
      customerRef: row.user_id.slice(0, 8).toUpperCase(),
      customerName: customer?.full_name?.trim() || "—",
      customerPhone: customer?.phone?.trim() || "—",
      mealName: listing?.title ?? "",
      mealNameAr: listing?.title_ar ?? "",
      total: Number(row.amount_paid),
      status: row.status,
      createdAt: row.created_at,
      pickedUpAt: row.picked_up_at,
    };
  });
}

export async function updateOrderStatus(
  orderId: string,
  status: ReservationStatus
): Promise<void> {
  const payload: { status: ReservationStatus; picked_up_at?: string } = { status };
  if (status === "picked_up") {
    payload.picked_up_at = new Date().toISOString();
  }
  const { error } = await supabase.from("reservations").update(payload).eq("id", orderId);
  if (error) throw error;
}

/** Marks pickup after verifying the customer's 4-digit code (updates impact stats). */
export async function completePickupWithCode(
  orderId: string,
  pickupCode: string
): Promise<void> {
  const { error } = await supabase.rpc("complete_pickup", {
    p_reservation_id: orderId,
    p_pickup_code: pickupCode.trim(),
  });
  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Restaurant profile
// ---------------------------------------------------------------------------

export interface RestaurantUpdate {
  name: string;
  address: string;
  city: string;
  cuisine_type: string;
  phone: string | null;
  lat: number;
  lng: number;
  logo_url: string | null;
}

export async function updateRestaurant(
  restaurantId: string,
  updates: Partial<RestaurantUpdate>
): Promise<RestaurantRow> {
  const { data, error } = await supabase
    .from("restaurants")
    .update(updates)
    .eq("id", restaurantId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

const BUCKET = "listing-images";

export async function uploadImage(file: File, userId: string): Promise<string> {
  const extension = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
