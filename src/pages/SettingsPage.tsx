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
import ImageUpload from "@/components/ImageUpload";
import LocationPicker from "@/components/LocationPicker";

const SettingsPage = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { user, updateUser } = useAuth();
  const [logo, setLogo] = useState(user?.logo || "");
  const [lat, setLat] = useState(24.7136); // Riyadh default
  const [lng, setLng] = useState(46.6753);

  const handleLogoChange = (url: string) => {
    setLogo(url);
    updateUser({ logo: url });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">{t("settings.title")}</h1>

        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.restaurantLogo")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              value={logo}
              onChange={handleLogoChange}
              aspectRatio="square"
            />
          </CardContent>
        </Card>

        {/* Restaurant Info */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>{t("settings.restaurantName")}</Label>
              <Input defaultValue={user?.restaurantName || "SavePlate Restaurant"} />
            </div>
            <div className="grid gap-2">
              <Label>{t("settings.address")}</Label>
              <Input defaultValue="123 Main Street, Riyadh" />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label>{t("settings.phone")}</Label>
                <Input defaultValue="+966 50 123 4567" />
              </div>
              <div className="grid gap-2">
                <Label>{t("settings.email")}</Label>
                <Input defaultValue={user?.email || "info@saveplate.com"} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.location")}</CardTitle>
          </CardHeader>
          <CardContent>
            <LocationPicker
              lat={lat}
              lng={lng}
              onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }}
            />
          </CardContent>
        </Card>

        {/* Language */}
        <Card>
          <CardHeader>
            <CardTitle>{t("settings.language")}</CardTitle>
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

        <div className="flex justify-end">
          <Button>{t("common.save")}</Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
