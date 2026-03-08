import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Store, ShoppingBag, Users, TrendingUp, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import OmrSymbol from "@/components/OmrSymbol";
import { mockRestaurants, mockPlatformOrders } from "@/data/adminMockData";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const totalRestaurants = mockRestaurants.length;
  const activeRestaurants = mockRestaurants.filter((r) => r.status === "active").length;
  const totalOrders = mockPlatformOrders.length;
  const totalRevenue = mockRestaurants.reduce((s, r) => s + r.revenue, 0);
  const totalUsers = 2314; // Total platform users
  const newUsersToday = 18; // New users registered today

  const stats = [
    { title: t("admin.totalUsers"), value: totalUsers.toLocaleString(), icon: Users, bgClass: "bg-chart-4/10", iconClass: "text-chart-4" },
    { title: t("admin.platformRevenue"), value: totalRevenue.toLocaleString(), icon: TrendingUp, bgClass: "bg-chart-1/10", iconClass: "text-chart-1", showOmr: true },
    { title: t("admin.newUsersToday"), value: newUsersToday, icon: Users, bgClass: "bg-chart-2/10", iconClass: "text-chart-2" },
    { title: t("admin.totalRestaurants"), value: totalRestaurants, icon: Store, bgClass: "bg-primary/10", iconClass: "text-primary" },
  ];

  const statusColors: Record<string, string> = {
    pending: "bg-chart-5/15 text-chart-5 border-chart-5/20",
    confirmed: "bg-primary/15 text-primary border-primary/20",
    picked_up: "bg-chart-2/15 text-chart-2 border-chart-2/20",
    cancelled: "bg-destructive/15 text-destructive border-destructive/20",
  };

  const restaurantStatusColors: Record<string, string> = {
    active: "bg-primary/15 text-primary border-primary/20",
    pending: "bg-chart-5/15 text-chart-5 border-chart-5/20",
    suspended: "bg-destructive/15 text-destructive border-destructive/20",
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground">{t("admin.welcomeAdmin")} 🛡️</h1>
          <p className="text-muted-foreground mt-1">{t("admin.platformOverview")}</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Card key={stat.title} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}>
              <CardContent className="flex items-center gap-4 p-5">
                <div className={cn("rounded-xl p-3", stat.bgClass)}>
                  <stat.icon className={cn("h-6 w-6", stat.iconClass)} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground flex items-center gap-1">
                    {"showOmr" in stat && stat.showOmr && <OmrSymbol size={18} />}
                    {stat.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* System Status */}
          <Card className="animate-slide-up" style={{ animationDelay: "320ms", animationFillMode: "both" }}>
            <CardHeader>
              <CardTitle>{t("admin.systemStatus")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl glass-subtle p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-chart-2 animate-pulse"></div>
                    <span className="text-sm font-medium text-foreground">{t("admin.apiStatus")}</span>
                  </div>
                  <span className="text-xs text-chart-2">{t("admin.operational")}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl glass-subtle p-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-chart-2 animate-pulse"></div>
                    <span className="text-sm font-medium text-foreground">{t("admin.databaseStatus")}</span>
                  </div>
                  <span className="text-xs text-chart-2">{t("admin.operational")}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl glass-subtle p-3">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-4 w-4 text-chart-5" />
                    <span className="text-sm font-medium text-foreground">{t("admin.pendingReviews")}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">3 {t("admin.items")}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="animate-slide-up" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t("admin.recentActivity")}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/orders")} className="text-primary">
                <ArrowRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockPlatformOrders.slice(0, 4).map((order, i) => (
                  <div key={order.id} className="flex items-center gap-3 rounded-xl glass-subtle p-3 transition-all duration-200 hover:bg-accent/40">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("admin.ordered")} {order.items} · {order.restaurantName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground inline-flex items-center gap-1">
                        <OmrSymbol size={13} /> {order.total}
                      </p>
                      <p className="text-xs text-muted-foreground">{order.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
