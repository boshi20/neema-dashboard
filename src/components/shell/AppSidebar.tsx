import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  BarChart3,
  Store,
  Settings,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge } from "@/components/patterns/StatusBadge";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface AppSidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function AppSidebar({ className, onNavigate }: AppSidebarProps) {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { user, restaurant } = useAuth();

  const primary = [
    { path: "/", icon: LayoutDashboard, label: t("common.overview"), end: true },
    { path: "/listings", icon: UtensilsCrossed, label: t("common.listings") },
    { path: "/orders", icon: ShoppingBag, label: t("common.orders") },
    { path: "/analytics", icon: BarChart3, label: t("common.analytics") },
  ];

  const secondary = [
    { path: "/restaurant", icon: Store, label: t("common.restaurant") },
    { path: "/settings", icon: Settings, label: t("common.settings") },
  ];

  const status = restaurant?.status ?? "pending_review";

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
            {t("common.forBusiness")}
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
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
              }
            >
              <item.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
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
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )
                }
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
          {user?.logo ? (
            <img
              src={user.logo}
              alt=""
              className="h-10 w-10 shrink-0 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
              {(user?.restaurantName || "N").slice(0, 1).toUpperCase()}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-foreground">
              {user?.restaurantName || "NEMA"}
            </p>
            <div className="mt-1">
              <StatusBadge status={status} />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
