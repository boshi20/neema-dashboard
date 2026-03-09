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
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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
    <div className={cn("flex min-h-screen", isRTL && "flex-row-reverse")}>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex w-72 flex-col glass-sidebar transition-transform duration-300 md:relative md:translate-x-0",
          isRTL ? "right-0 border-l border-border/50" : "left-0 border-r border-border/50",
          sidebarOpen
            ? "translate-x-0"
            : isRTL
            ? "translate-x-full md:translate-x-0"
            : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-6">
          {user?.logo ? (
            <img src={user.logo} alt="Logo" className="h-9 w-9 rounded-xl object-cover ring-2 ring-primary/20" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <UtensilsCrossed className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <span className="text-lg font-bold text-foreground tracking-tight">{user?.restaurantName || "Neema"}</span>
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
        <nav className="flex-1 space-y-1 px-4 pt-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "gradient-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "drop-shadow-sm")} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="border-t border-border/50 p-4">
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            {t("common.logout")}
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 glass border-b border-border/50 px-6">
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
        <div className="p-6 animate-fade-in">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
