import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Leaf, Percent, Plus, ShoppingBag, Wallet, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import {
  KpiCard,
  SectionHeader,
  EmptyState,
  OrderListItem,
  KpiSkeleton,
  ListSkeleton,
  MoneyValue,
} from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { listOrders } from "@/lib/api";
import {
  fetchRestaurantAnalytics,
  formatCount,
  percentChange,
  resolveRange,
} from "@/lib/analytics";
import { getProfileCompletion } from "@/lib/restaurantProfile";
import { cn } from "@/lib/utils";

function greetingKey(): "greetingMorning" | "greetingAfternoon" | "greetingEvening" {
  const h = new Date().getHours();
  if (h < 12) return "greetingMorning";
  if (h < 17) return "greetingAfternoon";
  return "greetingEvening";
}

const Index = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const { currentLanguage } = useLanguage();
  const navigate = useNavigate();
  const { restaurant, user } = useAuth();
  const restaurantId = restaurant?.id;

  const todayRange = useMemo(() => resolveRange("today"), []);
  const rangeKey = `${todayRange.from.toISOString()}|${todayRange.to.toISOString()}`;

  const { data: analytics, isPending: analyticsLoading } = useQuery({
    queryKey: ["restaurant-analytics", rangeKey],
    queryFn: () => fetchRestaurantAnalytics(todayRange),
    staleTime: 60_000,
  });

  const { data: orders = [], isPending: ordersLoading } = useQuery({
    queryKey: ["orders", restaurantId],
    queryFn: () => listOrders(restaurantId!),
    enabled: Boolean(restaurantId),
  });

  const todayKey = new Date().toDateString();
  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === todayKey
  );

  const completion = getProfileCompletion(restaurant);
  const totals = analytics?.totals;
  const previous = analytics?.previous;

  return (
    <AppShell title={t("dashboard.title")}>
      <div className="space-y-8">
        {/* Hero */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1">
            <h2 className="text-page-title text-foreground">
              {t(`dashboard.${greetingKey()}`, {
                name: user?.restaurantName || "NEMA",
              })}{" "}
              👋
            </h2>
            <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>
          </div>
          <Button
            className="gradient-primary shadow-glow hover:opacity-90 gap-2 shrink-0"
            onClick={() => navigate("/listings")}
          >
            <Plus className="h-4 w-4" />
            {t("dashboard.createListing")}
          </Button>
        </div>

        {/* Profile completion */}
        {!completion.complete ? (
          <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 space-y-2 flex-1">
                <p className="font-semibold text-amber-950">
                  {t("dashboard.profileIncompleteTitle")}
                </p>
                <p className="text-sm text-amber-900/80">
                  {t("dashboard.profileIncompleteBody", { percent: completion.percent })}
                </p>
                <Progress value={completion.percent} className="h-2 max-w-md" />
                <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-amber-900/70">
                  <span className="font-medium">{t("dashboard.profileMissing")}:</span>
                  {completion.missing.map((key) => (
                    <li key={key}>• {t(`dashboard.missing.${key}`)}</li>
                  ))}
                </ul>
              </div>
              <Button
                variant="outline"
                className="border-amber-300 bg-white hover:bg-amber-50 shrink-0"
                onClick={() => navigate("/restaurant")}
              >
                {t("dashboard.completeProfile")}
              </Button>
            </div>
          </div>
        ) : null}

        {/* KPIs */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {analyticsLoading || !totals ? (
            Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
          ) : (
            <>
              <KpiCard
                label={t("dashboard.revenue")}
                value={<MoneyValue value={totals.revenue} size={16} />}
                icon={Wallet}
                iconBgClassName="bg-chart-1/15"
                iconClassName="text-chart-1"
                changePercent={percentChange(totals.revenue, previous?.revenue ?? 0)}
                context={t("dashboard.vsPrevious")}
                noPreviousLabel={previous ? undefined : t("dashboard.noPrevious")}
              />
              <KpiCard
                label={t("dashboard.orders")}
                value={formatCount(totals.reservations, currentLanguage)}
                icon={ShoppingBag}
                iconBgClassName="bg-chart-2/15"
                iconClassName="text-chart-2"
                changePercent={percentChange(
                  totals.reservations,
                  previous?.reservations ?? 0
                )}
                context={t("dashboard.vsPrevious")}
                noPreviousLabel={previous ? undefined : t("dashboard.noPrevious")}
              />
              <KpiCard
                label={t("dashboard.foodRescued")}
                value={formatCount(totals.foodRescued, currentLanguage)}
                icon={Leaf}
                iconBgClassName="bg-chart-4/15"
                iconClassName="text-chart-4"
                changePercent={percentChange(
                  totals.foodRescued,
                  previous?.foodRescued ?? 0
                )}
                context={t("dashboard.vsPrevious")}
                noPreviousLabel={previous ? undefined : t("dashboard.noPrevious")}
              />
              <KpiCard
                label={t("dashboard.pickupRate")}
                value={
                  totals.pickupRate == null
                    ? "—"
                    : `${formatCount(Math.round(totals.pickupRate), currentLanguage)}%`
                }
                icon={Percent}
                iconBgClassName="bg-chart-3/15"
                iconClassName="text-chart-3"
                changePercent={
                  totals.pickupRate == null || previous?.pickupRate == null
                    ? null
                    : percentChange(totals.pickupRate, previous.pickupRate)
                }
                context={t("dashboard.vsPrevious")}
                noPreviousLabel={
                  totals.pickupRate == null || previous?.pickupRate == null
                    ? t("dashboard.noPrevious")
                    : undefined
                }
              />
            </>
          )}
        </div>

        {/* Today's orders */}
        <section className="space-y-3">
          <SectionHeader
            title={t("dashboard.todayOrders")}
            action={
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-primary"
                onClick={() => navigate("/orders")}
              >
                {t("common.viewAll")}
                <ArrowRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
              </Button>
            }
          />

          {ordersLoading ? (
            <ListSkeleton rows={3} />
          ) : todayOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title={t("dashboard.noOrdersToday")}
              actionLabel={t("dashboard.createListing")}
              onAction={() => navigate("/listings")}
            />
          ) : (
            <div className="space-y-2 rounded-xl border border-border/70 bg-card p-2 shadow-xs">
              {todayOrders.slice(0, 6).map((order) => (
                <OrderListItem key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
};

export default Index;
