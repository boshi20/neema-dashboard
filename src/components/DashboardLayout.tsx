import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "./LanguageSwitcher";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/", icon: LayoutDashboard, label: t("common.dashboard") },
    { path: "/meals", icon: UtensilsCrossed, label: t("common.meals") },
    { path: "/orders", icon: ShoppingBag, label: t("common.orders") },
    { path: "/analytics", icon: BarChart3, label: t("common.analytics") },
    { path: "/settings", icon: Settings, label: t("common.settings") },
  ];

  return (
    <div className={cn("flex min-h-screen bg-background", isRTL && "flex-row-reverse")}>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex w-64 flex-col border-border bg-card transition-transform duration-300 md:relative md:translate-x-0",
          isRTL ? "right-0 border-l" : "left-0 border-r",
          sidebarOpen
            ? "translate-x-0"
            : isRTL
            ? "translate-x-full md:translate-x-0"
            : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <UtensilsCrossed className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">SavePlate</span>
          <Button
            variant="ghost"
            size="icon"
            className={cn("md:hidden", isRTL ? "mr-auto" : "ml-auto")}
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border p-4">
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
            <LogOut className="h-5 w-5" />
            {t("common.logout")}
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card px-6">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className={cn("flex-1", isRTL ? "text-right" : "text-left")} />
          <LanguageSwitcher />
        </header>

        {/* Content */}
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
