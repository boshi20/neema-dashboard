import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, DollarSign, Star, Users } from "lucide-react";
import OmrSymbol from "@/components/OmrSymbol";
import { cn } from "@/lib/utils";

const AnalyticsPage = () => {
  const { t } = useTranslation();

  const stats = [
    { title: t("analytics.mealsSaved"), value: "1,247", icon: Leaf, bgClass: "bg-chart-4/10", iconClass: "text-chart-4" },
    { title: t("analytics.totalRevenue"), value: "8,420", icon: DollarSign, bgClass: "bg-chart-1/10", iconClass: "text-chart-1", showOmr: true },
    { title: t("analytics.avgRating"), value: "4.8", icon: Star, bgClass: "bg-chart-3/10", iconClass: "text-chart-3" },
    { title: t("analytics.totalCustomers"), value: "342", icon: Users, bgClass: "bg-chart-2/10", iconClass: "text-chart-2" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <h1 className="text-3xl font-bold text-foreground animate-slide-up">{t("analytics.title")}</h1>
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
            <CardTitle>{t("analytics.title")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-16 text-muted-foreground">
            <div className="text-center space-y-2">
              <div className="mx-auto h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <p className="font-medium">Charts coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
