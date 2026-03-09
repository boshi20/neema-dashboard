import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/hooks/useLanguage";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useNavigate } from "react-router-dom";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  ShoppingBag,
  Users,
  BarChart3,
  Menu,
  X,
  LogOut,
  Shield,
  CreditCard,
  FileText,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "./LanguageSwitcher";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { admin, adminLogout } = useAdminAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: "/admin", icon: LayoutDashboard, label: t("admin.dashboard") },
    { path: "/admin/restaurants", icon: Store, label: t("admin.restaurants") },
    { path: "/admin/orders", icon: ShoppingBag, label: t("admin.orders") },
    { path: "/admin/users", icon: Users, label: t("admin.users") },
    { path: "/admin/payments", icon: CreditCard, label: t("admin.payments") },
    { path: "/admin/content", icon: FileText, label: t("admin.content") },
    { path: "/admin/reports", icon: AlertTriangle, label: t("admin.reports") },
    { path: "/admin/analytics", icon: BarChart3, label: t("admin.analytics") },
    { path: "/admin/settings", icon: Settings, label: t("admin.systemSettings") },
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
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-destructive/10">
            <Shield className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <span className="text-lg font-bold text-foreground tracking-tight">Neema</span>
            <span className="block text-xs text-muted-foreground">{t("admin.adminPanel")}</span>
          </div>
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
        <div className="border-t border-border/50 p-4 space-y-2">
          <button
            onClick={() => navigate("/")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-accent/80 hover:text-foreground"
          >
            <Store className="h-5 w-5" />
            {t("admin.restaurantView")}
          </button>
          <button
            onClick={() => { adminLogout(); navigate("/admin/login"); }}
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
          <div className={cn("flex-1 flex items-center gap-2", isRTL ? "text-right" : "text-left")}>
            <span className="text-sm text-muted-foreground hidden sm:inline">{admin?.name}</span>
          </div>
          <LanguageSwitcher />
        </header>

        {/* Content */}
        <div className="p-6 animate-fade-in">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
