import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";

const SettingsPage = () => {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">{t("settings.title")}</h1>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>{t("settings.restaurantName")}</Label>
              <Input defaultValue="SavePlate Restaurant" />
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
                <Input defaultValue="info@saveplate.com" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("settings.language")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={currentLanguage} onValueChange={changeLanguage}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
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
