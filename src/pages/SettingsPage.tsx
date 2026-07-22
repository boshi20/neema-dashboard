import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ImageUpload from "@/components/ImageUpload";
import LocationPicker from "@/components/LocationPicker";
import { updateRestaurant, uploadImage } from "@/lib/api";

const DEFAULT_LAT = 23.588;
const DEFAULT_LNG = 58.3829;

const SettingsPage = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { restaurant, session, refreshRestaurant } = useAuth();
  const { toast } = useToast();

  const [logo, setLogo] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [phone, setPhone] = useState("");
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [saving, setSaving] = useState(false);

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
  }, [restaurant]);

  const handleSave = async () => {
    if (!restaurant) return;
    setSaving(true);
    try {
      await updateRestaurant(restaurant.id, {
        name: restaurantName.trim(),
        address: address.trim(),
        city: city.trim(),
        cuisine_type: cuisineType.trim(),
        phone: phone.trim() || null,
        lat,
        lng,
        logo_url: logo || null,
      });
      await refreshRestaurant();
      toast({ title: t("settings.saved") });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: t("login.error"), description: message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <h1 className="text-3xl font-bold text-foreground animate-slide-up">{t("settings.title")}</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("settings.restaurantLogo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={logo}
              onChange={setLogo}
              onUpload={session ? (file) => uploadImage(file, session.user.id) : undefined}
              aspectRatio="square"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("settings.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>{t("settings.restaurantName")}</Label>
              <Input value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>{t("settings.address")}</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>{t("settings.city")}</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>{t("settings.cuisineType")}</Label>
                <Input value={cuisineType} onChange={(e) => setCuisineType(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>{t("settings.phone")}</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("settings.location")}</CardTitle>
          </CardHeader>
          <CardContent>
            <LocationPicker lat={lat} lng={lng} onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t("settings.language")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={currentLanguage} onValueChange={changeLanguage}>
              <SelectTrigger className="w-full sm:w-64"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">🇺🇸 {t("common.english")}</SelectItem>
                <SelectItem value="ar">🇸🇦 {t("common.arabic")}</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Button
          onClick={() => void handleSave()}
          disabled={saving || !restaurant || restaurantName.trim().length < 2}
          className="gradient-primary shadow-glow hover:opacity-90 transition-opacity"
        >
          {saving ? t("common.loading") : t("common.save")}
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
