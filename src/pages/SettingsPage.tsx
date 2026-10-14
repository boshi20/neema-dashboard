import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import { PageHeader } from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";

const SettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { user, logout } = useAuth();

  return (
    <AppShell title={t("settings.title")}>
      <div className="mx-auto max-w-xl space-y-8">
        <PageHeader
          title={t("settings.title")}
          description={t("settings.preferences")}
        />

        <section className="space-y-4 rounded-xl border border-border/70 bg-card p-5 shadow-xs">
          <h2 className="text-section text-foreground">{t("settings.account")}</h2>
          <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
            <p className="text-xs font-medium text-muted-foreground">
              {t("settings.email")}
            </p>
            <p className="mt-0.5 text-sm font-medium text-foreground" dir="ltr">
              {user?.email || "—"}
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
            <p className="text-xs font-medium text-muted-foreground">
              {t("common.restaurant")}
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-foreground">
              {user?.restaurantName || "—"}
            </p>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border/70 bg-card p-5 shadow-xs">
          <h2 className="text-section text-foreground">{t("settings.language")}</h2>
          <div className="grid gap-1.5">
            <Label>{t("settings.language")}</Label>
            <Select value={currentLanguage} onValueChange={changeLanguage}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t("common.english")}</SelectItem>
                <SelectItem value="ar">{t("common.arabic")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>

        <Button
          variant="outline"
          className="gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <LogOut className="h-4 w-4" />
          {t("settings.signOut")}
        </Button>
      </div>
    </AppShell>
  );
};

export default SettingsPage;
