import type { Tables } from "@/lib/supabase";

export type RestaurantRow = Tables<"restaurants">;

const PLACEHOLDER_ADDRESS = "not set";

/** True when the owner has filled every field needed to operate the dashboard. */
export function isRestaurantProfileComplete(restaurant: RestaurantRow | null | undefined): boolean {
  if (!restaurant) return false;

  const name = restaurant.name.trim();
  const address = restaurant.address.trim();
  const city = restaurant.city.trim();
  const cuisine = restaurant.cuisine_type.trim();
  const phone = (restaurant.phone ?? "").trim();
  const logo = (restaurant.logo_url ?? "").trim();
  const lat = Number(restaurant.lat);
  const lng = Number(restaurant.lng);

  return (
    logo.length > 0 &&
    name.length >= 2 &&
    address.length >= 3 &&
    address.toLowerCase() !== PLACEHOLDER_ADDRESS &&
    city.length >= 2 &&
    cuisine.length >= 2 &&
    phone.length >= 5 &&
    Number.isFinite(lat) &&
    Number.isFinite(lng)
  );
}

export type ProfileFormState = {
  logo: string;
  restaurantName: string;
  address: string;
  city: string;
  cuisineType: string;
  phone: string;
  lat: number;
  lng: number;
  locationConfirmed: boolean;
};

export function isProfileFormComplete(form: ProfileFormState): boolean {
  const name = form.restaurantName.trim();
  const address = form.address.trim();
  const city = form.city.trim();
  const cuisine = form.cuisineType.trim();
  const phone = form.phone.trim();
  const logo = form.logo.trim();

  return (
    logo.length > 0 &&
    name.length >= 2 &&
    address.length >= 3 &&
    address.toLowerCase() !== PLACEHOLDER_ADDRESS &&
    city.length >= 2 &&
    cuisine.length >= 2 &&
    phone.length >= 5 &&
    form.locationConfirmed &&
    Number.isFinite(form.lat) &&
    Number.isFinite(form.lng)
  );
}

export type ProfileMissingKey =
  | "logo"
  | "name"
  | "address"
  | "city"
  | "cuisine"
  | "phone"
  | "location";

export type ProfileCompletion = {
  percent: number;
  missing: ProfileMissingKey[];
  complete: boolean;
};

/** Same field rules as isRestaurantProfileComplete — used for progress UI only. */
export function getProfileCompletion(
  restaurant: RestaurantRow | null | undefined
): ProfileCompletion {
  if (!restaurant) {
    return {
      percent: 0,
      missing: ["logo", "name", "address", "city", "cuisine", "phone", "location"],
      complete: false,
    };
  }

  const name = restaurant.name.trim();
  const address = restaurant.address.trim();
  const city = restaurant.city.trim();
  const cuisine = restaurant.cuisine_type.trim();
  const phone = (restaurant.phone ?? "").trim();
  const logo = (restaurant.logo_url ?? "").trim();
  const lat = Number(restaurant.lat);
  const lng = Number(restaurant.lng);
  const locationOk = Number.isFinite(lat) && Number.isFinite(lng);

  const checks: { key: ProfileMissingKey; ok: boolean }[] = [
    { key: "logo", ok: logo.length > 0 },
    { key: "name", ok: name.length >= 2 },
    {
      key: "address",
      ok: address.length >= 3 && address.toLowerCase() !== PLACEHOLDER_ADDRESS,
    },
    { key: "city", ok: city.length >= 2 },
    { key: "cuisine", ok: cuisine.length >= 2 },
    { key: "phone", ok: phone.length >= 5 },
    { key: "location", ok: locationOk },
  ];

  const missing = checks.filter((c) => !c.ok).map((c) => c.key);
  const done = checks.length - missing.length;
  const percent = Math.round((done / checks.length) * 100);

  return {
    percent,
    missing,
    complete: missing.length === 0,
  };
}
