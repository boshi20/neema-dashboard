import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Leaf, DollarSign, Star, Users } from "lucide-react";

const AnalyticsPage = () => {
  const { t } = useTranslation();

  const stats = [
    { title: t("analytics.mealsSaved"), value: "1,247", icon: Leaf, color: "text-chart-4" },
    { title: t("analytics.totalRevenue"), value: "8,420", icon: DollarSign, color: "text-chart-1", showOmr: true },
    { title: t("analytics.avgRating"), value: "4.8", icon: Star, color: "text-chart-3" },
    { title: t("analytics.totalCustomers"), value: "342", icon: Users, color: "text-chart-2" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">{t("analytics.title")}</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-lg bg-accent p-3 ${stat.color}`}>
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
        <Card>
          <CardHeader>
            <CardTitle>{t("analytics.title")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-12 text-muted-foreground">
            Charts coming soon...
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
