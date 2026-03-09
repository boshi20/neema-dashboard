import { Home, ShoppingCart, FileText, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const tabs = [
    { id: "home", icon: Home, label: t("Home"), path: "/app/preview/home" },
    { id: "cart", icon: ShoppingCart, label: t("Cart"), path: "/app/preview/cart", badge: 2 },
    { id: "orders", icon: FileText, label: t("Orders"), path: "/app/preview/home" },
    { id: "profile", icon: User, label: t("Profile"), path: "/app/preview/home" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-border/40 backdrop-blur-lg z-50">
      <div className="max-w-md mx-auto px-4 h-16 flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center gap-1 min-w-[60px] relative transition-colors"
            >
              <div className="relative">
                <Icon
                  className={`w-6 h-6 transition-all ${
                    isActive
                      ? "text-primary scale-110"
                      : "text-muted-foreground"
                  }`}
                  fill={isActive ? "currentColor" : "none"}
                />
                {tab.badge && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                    {tab.badge}
                  </Badge>
                )}
              </div>
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
