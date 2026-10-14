import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

/**
 * Shown to authenticated non-admin users who navigate to /admin URLs.
 * The database enforces authorization regardless; this is just honest UX.
 */
const AdminAccessDenied = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-xl border border-border/70 bg-card p-8 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-destructive/10">
          <ShieldAlert className="h-7 w-7 text-destructive" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            {t("admin.accessDeniedTitle")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("admin.accessDeniedBody")}</p>
        </div>
        <div className="mt-2 flex w-full flex-col gap-2">
          <Button className="gradient-primary shadow-glow hover:opacity-90" onClick={() => navigate("/")}>
            {t("admin.goToRestaurantDashboard")}
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => {
              logout();
              navigate("/admin/login");
            }}
          >
            {t("common.logout")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminAccessDenied;
