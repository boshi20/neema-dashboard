import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import OmrSymbol from "@/components/OmrSymbol";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  UtensilsCrossed,
  ShoppingBag,
  TrendingUp,
  Leaf,
  Plus,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import { listMeals, listOrders } from "@/lib/api";

const Index = () => {
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";
  const navigate = useNavigate();
  const { restaurant } = useAuth();
  const restaurantId = restaurant?.id;

  const { data: meals = [] } = useQuery({
    queryKey: ["meals", restaurantId],
    queryFn: () => listMeals(restaurantId!),
    enabled: Boolean(restaurantId),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders", restaurantId],
    queryFn: () => listOrders(restaurantId!),
    enabled: Boolean(restaurantId),
  });

  const todayKey = new Date().toDateString();
  const activeMeals = meals.filter((m) => m.available).length;
  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === todayKey
  ).length;
  const totalSaved = orders.filter((o) => o.status === "picked_up").length;

  const stats = [
    {
      title: t("dashboard.totalMeals"),
      value: meals.length,
      icon: UtensilsCrossed,
      bgClass: "bg-primary/10",
      iconClass: "text-primary",
    },
    {
      title: t("dashboard.activeMeals"),
      value: activeMeals,
      icon: TrendingUp,
      bgClass: "bg-chart-1/10",
      iconClass: "text-chart-1",
    },
    {
      title: t("dashboard.todayOrders"),
      value: todayOrders,
      icon: ShoppingBag,
      bgClass: "bg-chart-2/10",
      iconClass: "text-chart-2",
    },
    {
      title: t("dashboard.savedMeals"),
      value: totalSaved,
      icon: Leaf,
      bgClass: "bg-chart-4/10",
      iconClass: "text-chart-4",
    },
  ];

  const statusColors: Record<string, string> = {
    pending_payment: "bg-chart-5/15 text-chart-5 border-chart-5/20",
    confirmed: "bg-primary/15 text-primary border-primary/20",
    ready_for_pickup: "bg-chart-1/15 text-chart-1 border-chart-1/20",
    picked_up: "bg-chart-2/15 text-chart-2 border-chart-2/20",
    cancelled_by_user: "bg-destructive/15 text-destructive border-destructive/20",
    cancelled_by_restaurant: "bg-destructive/15 text-destructive border-destructive/20",
    expired: "bg-muted text-muted-foreground border-border",
  };

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      pending_payment: t("orders.pending"),
      confirmed: t("orders.confirmed"),
      ready_for_pickup: t("orders.readyForPickup"),
      picked_up: t("orders.pickedUp"),
      cancelled_by_user: t("orders.cancelled"),
      cancelled_by_restaurant: t("orders.cancelled"),
      expired: t("orders.expired"),
    };
    return map[s] || s;
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground">
            {t("dashboard.welcome")} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            {t("dashboard.mealsOverview")}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={stat.title} className="animate-scale-in" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", stat.bgClass)}>
                  <stat.icon className={cn("h-6 w-6", stat.iconClass)} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions & Recent Orders */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t("dashboard.quickActions")}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Button
                className="justify-start gap-2 gradient-primary shadow-glow hover:opacity-90 transition-opacity"
                onClick={() => navigate("/meals")}
              >
                <Plus className="h-4 w-4" />
                {t("dashboard.addNewMeal")}
              </Button>
              <Button
                variant="outline"
                className="justify-start gap-2"
                onClick={() => navigate("/orders")}
              >
                <ShoppingBag className="h-4 w-4" />
                {t("dashboard.viewOrders")}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">{t("orders.title")}</CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/orders")}
                className="text-primary hover:text-primary/80"
              >
                <ArrowRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {orders.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">{t("orders.noOrders")}</p>
              ) : (
                orders.slice(0, 3).map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-xl border border-border/60 p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {isAr && order.mealNameAr ? order.mealNameAr : order.mealName}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">{order.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold">
                        <OmrSymbol size={12} /> {order.total}
                      </span>
                      <Badge className={statusColors[order.status] ?? ""} variant="outline">
                        {statusLabel(order.status)}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
