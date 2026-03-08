import { useTranslation } from "react-i18next";
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
import { mockMeals, mockOrders } from "@/data/mockData";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

const Index = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const activeMeals = mockMeals.filter((m) => m.available).length;
  const todayOrders = mockOrders.filter((o) => o.date === "2026-03-08").length;
  const totalSaved = mockMeals.reduce((sum, m) => sum + (m.quantity - m.availableQuantity), 0);

  const stats = [
    {
      title: t("dashboard.totalMeals"),
      value: mockMeals.length,
      icon: UtensilsCrossed,
      color: "text-primary",
    },
    {
      title: t("dashboard.activeMeals"),
      value: activeMeals,
      icon: TrendingUp,
      color: "text-chart-1",
    },
    {
      title: t("dashboard.todayOrders"),
      value: todayOrders,
      icon: ShoppingBag,
      color: "text-chart-2",
    },
    {
      title: t("dashboard.savedMeals"),
      value: totalSaved,
      icon: Leaf,
      color: "text-chart-4",
    },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-chart-5/20 text-chart-5",
    confirmed: "bg-primary/20 text-primary",
    picked_up: "bg-chart-2/20 text-chart-2",
    cancelled: "bg-destructive/20 text-destructive",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {t("dashboard.welcome")} 👋
          </h1>
          <p className="text-muted-foreground">
            {t("dashboard.mealsOverview")}
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={cn("rounded-lg bg-accent p-3", stat.color)}>
                  <stat.icon className="h-6 w-6" />
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
              <CardTitle>{t("dashboard.quickActions")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start gap-2"
                onClick={() => navigate("/meals")}
              >
                <Plus className="h-4 w-4" />
                {t("dashboard.addNewMeal")}
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => navigate("/orders")}
              >
                <ShoppingBag className="h-4 w-4" />
                {t("dashboard.viewOrders")}
              </Button>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("orders.title")}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/orders")}
              >
                <ArrowRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockOrders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">{order.id}</p>
                    </div>
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <span className="text-sm font-semibold text-foreground">
                        <span className="inline-flex items-center gap-1.5"><OmrSymbol size={16} /> {order.total}</span>
                      </span>
                      <Badge className={statusColors[order.status]} variant="secondary">
                        {t(`orders.${order.status === "picked_up" ? "pickedUp" : order.status}`)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Index;
