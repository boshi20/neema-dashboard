import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/patterns/PageHeader";
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
import { useAdminAuth } from "@/hooks/useAdminAuth";

const AdminSettingsPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentLanguage, changeLanguage } = useLanguage();
  const { admin, adminSignOut } = useAdminAuth();

  return (
    <AdminShell title={t("admin.settings")}>
      <div className="mx-auto max-w-xl space-y-8">
        <PageHeader
          title={t("admin.settings")}
          description={t("admin.settingsSubtitle")}
        />

        <section className="space-y-4 rounded-xl border border-border/70 bg-card p-5 shadow-xs">
          <h2 className="text-section text-foreground">{t("settings.account")}</h2>
          <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
            <p className="text-xs font-medium text-muted-foreground">{t("admin.name")}</p>
            <p className="mt-0.5 truncate text-sm font-medium text-foreground">
              {admin?.name || "—"}
            </p>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5">
            <p className="text-xs font-medium text-muted-foreground">{t("settings.email")}</p>
            <p className="mt-0.5 text-sm font-medium text-foreground" dir="ltr">
              {admin?.email || "—"}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5">
            <ShieldCheck className="h-4 w-4 shrink-0 text-primary" />
            <p className="text-sm font-medium text-primary">{t("admin.roles.admin")}</p>
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
            adminSignOut();
            navigate("/admin/login");
          }}
        >
          <LogOut className="h-4 w-4" />
          {t("settings.signOut")}
        </Button>
      </div>
    </AdminShell>
  );
};

export default AdminSettingsPage;
