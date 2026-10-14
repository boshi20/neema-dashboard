import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/components/shell/AppShell";
import { StatusBadge, PageHeader } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import ImageUpload from "@/components/ImageUpload";
import LocationPicker from "@/components/LocationPicker";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { updateRestaurant, uploadImage } from "@/lib/api";
import {
  getProfileCompletion,
  isProfileFormComplete,
  isRestaurantProfileComplete,
} from "@/lib/restaurantProfile";

const DEFAULT_LAT = 23.588;
const DEFAULT_LNG = 58.3829;

const RestaurantPage = () => {
  const { t } = useTranslation();
  const { restaurant, session, refreshRestaurant } = useAuth();
  const { toast } = useToast();

  const [editing, setEditing] = useState(false);
  const [logo, setLogo] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [phone, setPhone] = useState("");
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showErrors, setShowErrors] = useState(false);

  const profileComplete = isRestaurantProfileComplete(restaurant);
  const completion = getProfileCompletion(restaurant);

  useEffect(() => {
    if (!restaurant) return;
    setLogo(restaurant.logo_url ?? "");
    setRestaurantName(restaurant.name);
    setAddress(restaurant.address);
    setCity(restaurant.city);
    setCuisineType(restaurant.cuisine_type);
    setPhone(restaurant.phone ?? "");
    setLat(Number(restaurant.lat));
    setLng(Number(restaurant.lng));
    setLocationConfirmed(isRestaurantProfileComplete(restaurant));
    if (!isRestaurantProfileComplete(restaurant)) {
      setEditing(true);
    }
  }, [restaurant]);

  const formComplete = useMemo(
    () =>
      isProfileFormComplete({
        logo,
        restaurantName,
        address,
        city,
        cuisineType,
        phone,
        lat,
        lng,
        locationConfirmed,
      }),
    [logo, restaurantName, address, city, cuisineType, phone, lat, lng, locationConfirmed]
  );

  const handleLocationChange = (newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    setLocationConfirmed(true);
  };

  const handleSave = async () => {
    if (!restaurant) return;
    if (!formComplete) {
      setShowErrors(true);
      toast({
        title: t("settings.fieldsIncomplete"),
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      await updateRestaurant(restaurant.id, {
        name: restaurantName.trim(),
        address: address.trim(),
        city: city.trim(),
        cuisine_type: cuisineType.trim(),
        phone: phone.trim(),
        lat,
        lng,
        logo_url: logo.trim(),
      });
      await refreshRestaurant();
      toast({ title: t("settings.saved") });
      setShowErrors(false);
      setEditing(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast({
        title: t("login.error"),
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const status = restaurant?.status ?? "pending_review";

  return (
    <AppShell title={t("restaurant.title")}>
      <div className="mx-auto max-w-3xl space-y-8">
        <PageHeader
          title={t("restaurant.title")}
          actions={
            !editing ? (
              <Button variant="outline" onClick={() => setEditing(true)}>
                {t("restaurant.editProfile")}
              </Button>
            ) : null
          }
        />

        {!profileComplete ? (
          <div className="space-y-2 rounded-xl border border-amber-200/80 bg-amber-50/80 p-4">
            <p className="font-semibold text-amber-950">
              {t("settings.completeProfileTitle")}
            </p>
            <p className="text-sm text-amber-900/80">
              {t("dashboard.profileIncompleteBody", { percent: completion.percent })}
            </p>
            <Progress value={completion.percent} className="h-2" />
            <p className="text-sm text-amber-900/80">
              {t("settings.completeProfileBody")}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-start">
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border/70 bg-muted shadow-xs">
            {restaurant?.logo_url ? (
              <img
                src={restaurant.logo_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-primary">
                {(restaurant?.name || "N").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 space-y-1.5">
            <h2 className="truncate text-2xl font-semibold tracking-tight text-foreground">
              {restaurant?.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              {restaurant?.cuisine_type}
              {restaurant?.city ? ` · ${restaurant.city}` : ""}
            </p>
            <StatusBadge status={status} />
          </div>
        </div>

        {editing ? (
          <div className="space-y-6 rounded-xl border border-border/70 bg-card p-5 shadow-xs">
            <div className="space-y-2">
              <Label>
                {t("settings.restaurantLogo")}{" "}
                <span className="text-destructive text-xs">
                  ({t("settings.requiredHint")})
                </span>
              </Label>
              <ImageUpload
                value={logo}
                onChange={setLogo}
                onUpload={
                  session ? (file) => uploadImage(file, session.user.id) : undefined
                }
                aspectRatio="square"
              />
              {showErrors && !logo.trim() ? (
                <p className="text-xs text-destructive">{t("settings.logoRequired")}</p>
              ) : null}
            </div>

            <section className="space-y-4">
              <h3 className="text-section text-foreground">
                {t("restaurant.restaurantInfo")}
              </h3>
              <div className="grid gap-1.5">
                <Label>
                  {t("settings.restaurantName")}{" "}
                  <span className="text-destructive text-xs">
                    ({t("settings.requiredHint")})
                  </span>
                </Label>
                <Input
                  value={restaurantName}
                  onChange={(e) => setRestaurantName(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label>
                  {t("settings.address")}{" "}
                  <span className="text-destructive text-xs">
                    ({t("settings.requiredHint")})
                  </span>
                </Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
                {showErrors &&
                (address.trim().length < 3 ||
                  address.trim().toLowerCase() === "not set") ? (
                  <p className="text-xs text-destructive">
                    {t("settings.addressRequired")}
                  </p>
                ) : null}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label>
                    {t("settings.city")}{" "}
                    <span className="text-destructive text-xs">
                      ({t("settings.requiredHint")})
                    </span>
                  </Label>
                  <Input value={city} onChange={(e) => setCity(e.target.value)} />
                </div>
                <div className="grid gap-1.5">
                  <Label>
                    {t("settings.cuisineType")}{" "}
                    <span className="text-destructive text-xs">
                      ({t("settings.requiredHint")})
                    </span>
                  </Label>
                  <Input
                    value={cuisineType}
                    onChange={(e) => setCuisineType(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label>
                  {t("settings.phone")}{" "}
                  <span className="text-destructive text-xs">
                    ({t("settings.requiredHint")})
                  </span>
                </Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  dir="ltr"
                />
                {showErrors && phone.trim().length < 5 ? (
                  <p className="text-xs text-destructive">
                    {t("settings.phoneRequired")}
                  </p>
                ) : null}
              </div>
            </section>

            <section className="space-y-3 border-t border-border/60 pt-5">
              <h3 className="text-section text-foreground">
                {t("restaurant.location")}
              </h3>
              <LocationPicker lat={lat} lng={lng} onChange={handleLocationChange} />
              {showErrors && !locationConfirmed ? (
                <p className="text-xs text-destructive">
                  {t("settings.locationRequired")}
                </p>
              ) : null}
            </section>

            <div className="flex flex-wrap gap-2 pt-2">
              {profileComplete ? (
                <Button variant="outline" onClick={() => setEditing(false)}>
                  {t("common.cancel")}
                </Button>
              ) : null}
              <Button
                onClick={() => void handleSave()}
                disabled={saving || !restaurant}
                className="gradient-primary shadow-glow hover:opacity-90"
              >
                {saving ? t("common.loading") : t("restaurant.saveProfile")}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="space-y-3">
              <h3 className="text-section text-foreground">
                {t("restaurant.restaurantInfo")}
              </h3>
              <dl className="grid gap-3 sm:grid-cols-2">
                <InfoItem label={t("settings.address")} value={restaurant?.address} />
                <InfoItem label={t("settings.city")} value={restaurant?.city} />
                <InfoItem
                  label={t("settings.cuisineType")}
                  value={restaurant?.cuisine_type}
                />
                <InfoItem
                  label={t("settings.phone")}
                  value={restaurant?.phone || t("restaurant.notProvided")}
                  ltr
                />
              </dl>
            </section>

            <section className="space-y-3 border-t border-border/60 pt-5">
              <h3 className="text-section text-foreground">
                {t("restaurant.businessInfo")}
              </h3>
              <dl className="grid gap-3 sm:grid-cols-2">
                <InfoItem
                  label={t("restaurant.crNumber")}
                  value={restaurant?.cr_number || t("restaurant.notProvided")}
                />
                <InfoItem
                  label={t("settings.email")}
                  value={session?.user.email || t("restaurant.notProvided")}
                  ltr
                />
              </dl>
            </section>

            <section className="space-y-3 border-t border-border/60 pt-5">
              <h3 className="text-section text-foreground">
                {t("restaurant.location")}
              </h3>
              <p className="text-sm text-muted-foreground tabular-nums" dir="ltr">
                {Number(restaurant?.lat).toFixed(5)}, {Number(restaurant?.lng).toFixed(5)}
              </p>
              <p className="text-xs text-muted-foreground">{restaurant?.address}</p>
            </section>

            <section className="space-y-3 border-t border-border/60 pt-5">
              <h3 className="text-section text-foreground">
                {t("restaurant.verification")}
              </h3>
              <StatusBadge status={status} />
            </section>
          </div>
        )}
      </div>
    </AppShell>
  );
};

function InfoItem({
  label,
  value,
  ltr,
}: {
  label: string;
  value?: string | null;
  ltr?: boolean;
}) {
  return (
    <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd
        className="mt-0.5 truncate text-sm font-medium text-foreground"
        dir={ltr ? "ltr" : undefined}
      >
        {value || "—"}
      </dd>
    </div>
  );
}

export default RestaurantPage;
