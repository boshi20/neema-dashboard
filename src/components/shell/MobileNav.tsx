import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  BarChart3,
  MoreHorizontal,
  Store,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [moreOpen, setMoreOpen] = useState(false);

  const items = [
    { path: "/", icon: LayoutDashboard, label: t("common.overview"), end: true },
    { path: "/listings", icon: UtensilsCrossed, label: t("common.listings") },
    { path: "/orders", icon: ShoppingBag, label: t("common.orders") },
    { path: "/analytics", icon: BarChart3, label: t("common.analytics") },
  ];

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-card/95 backdrop-blur-md md:hidden">
        <div className="flex h-16 items-stretch justify-around px-1 pb-[env(safe-area-inset-bottom)]">
          {items.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                  isActive ? "text-primary" : "text-muted-foreground"
                )
              }
            >
              <item.icon className="h-5 w-5" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
          <button
            type="button"
            className="flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-muted-foreground"
            onClick={() => setMoreOpen(true)}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span>{t("shell.more")}</span>
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl">
          <SheetHeader>
            <SheetTitle>{t("shell.more")}</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-1 pb-6">
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
              onClick={() => {
                setMoreOpen(false);
                navigate("/restaurant");
              }}
            >
              <Store className="h-5 w-5 text-muted-foreground" />
              {t("common.restaurant")}
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted"
              onClick={() => {
                setMoreOpen(false);
                navigate("/settings");
              }}
            >
              <Settings className="h-5 w-5 text-muted-foreground" />
              {t("common.settings")}
            </button>
            <div className="flex items-center justify-between rounded-lg px-3 py-3">
              <span className="text-sm font-medium">{t("common.language")}</span>
              <LanguageSwitcher />
            </div>
            <button
              type="button"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-destructive hover:bg-destructive/10"
              onClick={() => {
                setMoreOpen(false);
                logout();
                navigate("/login");
              }}
            >
              <LogOut className="h-5 w-5" />
              {t("common.logout")}
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
