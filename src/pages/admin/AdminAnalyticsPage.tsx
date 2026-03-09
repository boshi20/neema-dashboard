import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Store, ShoppingBag } from "lucide-react";
import OmrSymbol from "@/components/OmrSymbol";
import { cn } from "@/lib/utils";
import { mockRestaurants, mockPlatformOrders } from "@/data/adminMockData";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const AdminAnalyticsPage = () => {
  const { t } = useTranslation();

  const totalRevenue = mockRestaurants.reduce((s, r) => s + r.revenue, 0);
  const totalOrders = mockPlatformOrders.length;
  const avgOrderValue = Math.round(totalRevenue / totalOrders);

  const stats = [
    { title: t("admin.platformRevenue"), value: totalRevenue.toLocaleString(), icon: DollarSign, bgClass: "bg-chart-1/10", iconClass: "text-chart-1", showOmr: true },
    { title: t("admin.totalOrders"), value: totalOrders, icon: ShoppingBag, bgClass: "bg-chart-2/10", iconClass: "text-chart-2" },
    { title: t("admin.avgOrderValue"), value: avgOrderValue, icon: TrendingUp, bgClass: "bg-chart-3/10", iconClass: "text-chart-3", showOmr: true },
    { title: t("admin.totalRestaurants"), value: mockRestaurants.length, icon: Store, bgClass: "bg-primary/10", iconClass: "text-primary" },
  ];

  // Top restaurants by revenue
  const topRestaurants = [...mockRestaurants]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Revenue trend data (last 7 days)
  const revenueData = [
    { date: "Mar 2", revenue: 320, orders: 18 },
    { date: "Mar 3", revenue: 425, orders: 24 },
    { date: "Mar 4", revenue: 380, orders: 21 },
    { date: "Mar 5", revenue: 510, orders: 29 },
    { date: "Mar 6", revenue: 445, orders: 26 },
    { date: "Mar 7", revenue: 590, orders: 34 },
    { date: "Mar 8", revenue: 680, orders: 39 },
  ];

  // Orders by status
  const orderStatusData = [
    { status: "Pending", count: mockPlatformOrders.filter(o => o.status === "pending").length },
    { status: "Confirmed", count: mockPlatformOrders.filter(o => o.status === "confirmed").length },
    { status: "Picked Up", count: mockPlatformOrders.filter(o => o.status === "picked_up").length },
    { status: "Cancelled", count: mockPlatformOrders.filter(o => o.status === "cancelled").length },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground">{t("admin.platformAnalytics")}</h1>
          <p className="text-muted-foreground mt-1">{t("admin.analyticsOverview")}</p>
        </div>

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

        <Card className="animate-slide-up" style={{ animationDelay: "320ms", animationFillMode: "both" }}>
          <CardHeader>
            <CardTitle>{t("admin.topRestaurants")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topRestaurants.map((r, i) => (
                <div key={r.id} className="flex items-center gap-4">
                  <span className="text-lg font-bold text-muted-foreground w-6">{i + 1}</span>
                  <div className="h-10 w-10 rounded-xl bg-accent/50 flex items-center justify-center">
                    <Store className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.totalOrders} {t("admin.ordersLabel")} · {r.city}</p>
                  </div>
                  <span className="text-sm font-bold text-foreground inline-flex items-center gap-1">
                    <OmrSymbol size={14} /> {r.revenue}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="animate-slide-up" style={{ animationDelay: "400ms", animationFillMode: "both" }}>
            <CardHeader>
              <CardTitle>{t("admin.revenueOverTime")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: "480ms", animationFillMode: "both" }}>
            <CardHeader>
              <CardTitle>{t("admin.ordersByStatus")}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={orderStatusData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="status" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnalyticsPage;
