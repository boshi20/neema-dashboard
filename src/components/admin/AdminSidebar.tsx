import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Store,
  Users,
  UtensilsCrossed,
  ShoppingBag,
  BarChart3,
  ScrollText,
  Settings,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface AdminSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function AdminSidebar({ className, onNavigate }: AdminSidebarProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { admin } = useAdminAuth();

  const primary = [
    { path: "/admin", icon: LayoutDashboard, label: t("admin.overview"), end: true },
    { path: "/admin/restaurants", icon: Store, label: t("admin.restaurants") },
    { path: "/admin/users", icon: Users, label: t("admin.users") },
    { path: "/admin/listings", icon: UtensilsCrossed, label: t("admin.listings") },
    { path: "/admin/orders", icon: ShoppingBag, label: t("admin.orders") },
    { path: "/admin/analytics", icon: BarChart3, label: t("admin.analytics") },
  ];

  const secondary = [
    { path: "/admin/audit", icon: ScrollText, label: t("admin.auditLog") },
    { path: "/admin/settings", icon: Settings, label: t("admin.settings") },
  ];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  return (
    <aside
      className={cn(
        "flex h-full w-[260px] shrink-0 flex-col border-border/80 bg-card",
        isRTL ? "border-s" : "border-e",
        className
      )}
    >
      <div className="flex items-center gap-3 px-5 py-5">
        <img src="/logo.png" alt="NEMA" className="h-9 w-auto" />
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-semibold tracking-tight text-foreground">NEMA</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {t("admin.wordmark")}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        <div className="space-y-0.5">
          {primary.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              onClick={onNavigate}
              className={linkClass}
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div>
          <div className="mx-3 mb-2 border-t border-border/70" />
          <div className="space-y-0.5">
            {secondary.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onNavigate}
                className={linkClass}
              >
                <item.icon className="h-[18px] w-[18px]" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t border-border/70 p-3">
        <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 p-2.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
            {(admin?.name || "A").slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {admin?.name || "—"}
            </p>
            <p className="truncate text-xs text-muted-foreground">{admin?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
