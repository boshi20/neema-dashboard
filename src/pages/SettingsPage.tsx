import { useState } from "react";
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

const SettingsPage = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();

  const [logo, setLogo] = useState(user?.logo || "");
  const [restaurantName, setRestaurantName] = useState(user?.restaurantName || "Neema Restaurant");
  const [address, setAddress] = useState("123 Main Street, Riyadh");
  const [phone, setPhone] = useState("+966 50 123 4567");
  const [email, setEmail] = useState(user?.email || "info@neema.com");
  const [lat, setLat] = useState(24.7136);
  const [lng, setLng] = useState(46.6753);

  const handleLogoChange = (url: string) => {
    setLogo(url);
    updateUser({ logo: url });
  };

  const handleSave = () => {
    updateUser({ restaurantName, email });
    toast({ title: t("settings.saved") });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-foreground animate-slide-up">{t("settings.title")}</h1>

        <Card>
          <CardHeader><CardTitle>{t("settings.restaurantLogo")}</CardTitle></CardHeader>
          <CardContent>
            <ImageUpload value={logo} onChange={handleLogoChange} aspectRatio="square" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("settings.title")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>{t("settings.restaurantName")}</Label>
              <Input value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>{t("settings.address")}</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>{t("settings.phone")}</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>{t("settings.email")}</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("settings.location")}</CardTitle></CardHeader>
          <CardContent>
            <LocationPicker lat={lat} lng={lng} onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t("settings.language")}</CardTitle></CardHeader>
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

        <div className="flex justify-end">
          <Button onClick={handleSave}>{t("common.save")}</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
