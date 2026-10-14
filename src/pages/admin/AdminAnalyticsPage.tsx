import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  Leaf,
  Percent,
  ShoppingBag,
  Store,
  UserPlus,
  Wallet,
} from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  PageHeader,
  DateRangeSelector,
  KpiCard,
  MoneyValue,
  EmptyState,
  KpiSkeleton,
  ChartSkeleton,
} from "@/components/patterns";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";
import {
  formatCount,
  formatKg,
  formatOmr,
  parseDateInputValue,
  percentChange,
  resolveRange,
  toDateInputValue,
  type AnalyticsRange,
  type DateRangePreset,
} from "@/lib/analytics";
import { fetchPlatformAnalytics, type PlatformAnalytics } from "@/lib/adminApi";

type ChartMetric = "reservations" | "foodRescued" | "revenue";

const AdminAnalyticsPage = () => {
  const { t } = useTranslation();
  const { currentLanguage, isRTL } = useLanguage();
  const isAr = currentLanguage === "ar";
  const navigate = useNavigate();

  const [preset, setPreset] = useState<DateRangePreset>("last30");
  const [customFrom, setCustomFrom] = useState(() =>
    toDateInputValue(resolveRange("last30").from)
  );
  const [customTo, setCustomTo] = useState(() => toDateInputValue(new Date()));
  const [metric, setMetric] = useState<ChartMetric>("reservations");
  const [rangeOpen, setRangeOpen] = useState(false);

  const range: AnalyticsRange = useMemo(() => {
    if (preset !== "custom") return resolveRange(preset);
    const from = parseDateInputValue(customFrom);
    const to = parseDateInputValue(customTo);
    if (!from || !to) return resolveRange("last30");
    return resolveRange("custom", { from, to: to < from ? from : to });
  }, [preset, customFrom, customTo]);

  const rangeKey = `${range.from.toISOString()}|${range.to.toISOString()}`;

  const { data, isPending, isError, refetch, isFetching } =
    useQuery<PlatformAnalytics>({
      queryKey: ["admin-analytics", rangeKey],
      queryFn: () => fetchPlatformAnalytics(range),
      staleTime: 60_000,
    });

  const chartConfig = {
    reservations: {
      label: t("analytics.metricReservations"),
      color: "hsl(var(--chart-1))",
    },
    foodRescued: {
      label: t("analytics.metricFoodRescued"),
      color: "hsl(var(--chart-2))",
    },
    revenue: {
      label: t("analytics.metricRevenue"),
      color: "hsl(var(--chart-3))",
    },
  } satisfies ChartConfig;

  const bucketLabel = (bucket: string) => {
    const date = parseDateInputValue(bucket);
    if (!date) return bucket;
    return date.toLocaleDateString(isAr ? "ar-OM-u-nu-latn" : "en-OM", {
      day: "2-digit",
      month: "short",
    });
  };

  const dateSelector = (
    <DateRangeSelector
      preset={preset}
      onPresetChange={setPreset}
      customFrom={customFrom}
      customTo={customTo}
      onCustomFromChange={setCustomFrom}
      onCustomToChange={setCustomTo}
      open={rangeOpen}
      onOpenChange={setRangeOpen}
    />
  );

  if (isPending) {
    return (
      <AdminShell title={t("admin.analytics")}>
        <div className="space-y-8">
          <PageHeader
            title={t("admin.analytics")}
            description={t("admin.analyticsSubtitle")}
            actions={dateSelector}
          />
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <KpiSkeleton key={i} />
            ))}
          </div>
          <ChartSkeleton />
        </div>
      </AdminShell>
    );
  }

  if (isError || !data) {
    return (
      <AdminShell title={t("admin.analytics")}>
        <div className="space-y-8">
          <PageHeader
            title={t("admin.analytics")}
            description={t("admin.analyticsSubtitle")}
            actions={dateSelector}
          />
          <EmptyState
            title={t("analytics.errorTitle")}
            actionLabel={t("analytics.retry")}
            onAction={() => void refetch()}
          />
        </div>
      </AdminShell>
    );
  }

  const { totals, previous, series, topRestaurants } = data;

  if (!data.hasAnyData) {
    return (
      <AdminShell title={t("admin.analytics")}>
        <div className="space-y-8">
          <PageHeader
            title={t("admin.analytics")}
            description={t("admin.analyticsSubtitle")}
            actions={dateSelector}
          />
          <EmptyState
            icon={ShoppingBag}
            title={t("admin.analyticsEmptyTitle")}
            description={t("admin.analyticsEmptyBody")}
          />
        </div>
      </AdminShell>
    );
  }

  const hasPeriodActivity = totals.reservations > 0;
  const isRevenueMetric = metric === "revenue";

  const orderBreakdown = [
    {
      key: "completed",
      label: t("analytics.completed"),
      value: totals.completed,
      barClass: "bg-emerald-500",
    },
    {
      key: "pending",
      label: t("analytics.pending"),
      value: totals.pending,
      barClass: "bg-amber-500",
    },
    {
      key: "cancelled",
      label: t("analytics.cancelled"),
      value: totals.cancelled,
      barClass: "bg-red-500",
    },
    {
      key: "expired",
      label: t("analytics.expired"),
      value: totals.expired,
      barClass: "bg-slate-400",
    },
  ];
  const breakdownTotal = orderBreakdown.reduce((sum, row) => sum + row.value, 0);

  return (
    <AdminShell title={t("admin.analytics")}>
      <div className={cn("space-y-8", isFetching && "opacity-95 transition-opacity")}>
        <PageHeader
          title={t("admin.analytics")}
          description={t("admin.analyticsSubtitle")}
          actions={dateSelector}
        />

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label={t("analytics.revenue")}
            value={<MoneyValue value={totals.revenue} size={16} />}
            icon={Wallet}
            iconBgClassName="bg-chart-1/15"
            iconClassName="text-chart-1"
            changePercent={percentChange(totals.revenue, previous?.revenue ?? 0)}
            context={t("analytics.vsPrevious")}
            noPreviousLabel={previous ? undefined : t("analytics.noPrevious")}
          />
          <KpiCard
            label={t("analytics.reservations")}
            value={formatCount(totals.reservations, currentLanguage)}
            icon={ShoppingBag}
            iconBgClassName="bg-chart-2/15"
            iconClassName="text-chart-2"
            changePercent={percentChange(totals.reservations, previous?.reservations ?? 0)}
            context={t("analytics.vsPrevious")}
            noPreviousLabel={previous ? undefined : t("analytics.noPrevious")}
          />
          <KpiCard
            label={t("analytics.foodRescued")}
            value={formatCount(totals.foodRescued, currentLanguage)}
            icon={Leaf}
            iconBgClassName="bg-chart-4/15"
            iconClassName="text-chart-4"
            changePercent={percentChange(totals.foodRescued, previous?.foodRescued ?? 0)}
            context={t("analytics.vsPrevious")}
            noPreviousLabel={previous ? undefined : t("analytics.noPrevious")}
          />
          <KpiCard
            label={t("analytics.pickupRate")}
            value={
              totals.pickupRate == null
                ? t("analytics.notEnoughData")
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
            context={t("analytics.vsPrevious")}
            noPreviousLabel={
              totals.pickupRate == null || previous?.pickupRate == null
                ? t("analytics.noPrevious")
                : undefined
            }
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <KpiCard
            label={t("admin.newUsers")}
            value={formatCount(totals.newUsers, currentLanguage)}
            icon={UserPlus}
            noPreviousLabel={t("admin.duringPeriod")}
          />
          <KpiCard
            label={t("admin.newRestaurants")}
            value={formatCount(totals.newRestaurants, currentLanguage)}
            icon={Store}
            noPreviousLabel={t("admin.duringPeriod")}
          />
        </div>

        <section className="space-y-4 rounded-xl border border-border/70 bg-card p-5 shadow-xs">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-section text-foreground">
              {t("analytics.performanceOverview")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {(["reservations", "foodRescued", "revenue"] as ChartMetric[]).map((m) => (
                <Button
                  key={m}
                  size="sm"
                  variant={metric === m ? "default" : "outline"}
                  onClick={() => setMetric(m)}
                  className={cn(
                    metric === m && "gradient-primary shadow-glow hover:opacity-90"
                  )}
                >
                  {t(`analytics.metric${m.charAt(0).toUpperCase()}${m.slice(1)}`)}
                </Button>
              ))}
            </div>
          </div>

          {!hasPeriodActivity ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm font-medium text-foreground">
                {t("analytics.noActivityTitle")}
              </p>
              <Button variant="outline" onClick={() => setRangeOpen(true)}>
                {t("analytics.noActivityCta")}
              </Button>
            </div>
          ) : (
            <ChartContainer config={chartConfig} className="aspect-auto h-[280px] w-full">
              {isRevenueMetric ? (
                <BarChart data={series} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="bucket"
                    tickFormatter={bucketLabel}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    reversed={isRTL}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    orientation={isRTL ? "right" : "left"}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent labelFormatter={(v) => bucketLabel(String(v))} />
                    }
                  />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={series} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="bucket"
                    tickFormatter={bucketLabel}
                    tickLine={false}
                    axisLine={false}
                    interval="preserveStartEnd"
                    reversed={isRTL}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    allowDecimals={false}
                    orientation={isRTL ? "right" : "left"}
                  />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent labelFormatter={(v) => bucketLabel(String(v))} />
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey={metric}
                    stroke={`var(--color-${metric})`}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              )}
            </ChartContainer>
          )}
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-5 shadow-xs">
            <h2 className="text-section text-foreground">{t("analytics.orders")}</h2>
            <div className="space-y-4">
              {orderBreakdown.map((row) => {
                const share = breakdownTotal > 0 ? (row.value / breakdownTotal) * 100 : 0;
                return (
                  <div key={row.key} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className="font-semibold tabular-nums text-foreground">
                        {formatCount(row.value, currentLanguage)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full", row.barClass)}
                        style={{ width: `${share}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="space-y-4 rounded-xl border border-border/70 bg-card p-5 shadow-xs">
            <h2 className="text-section text-foreground">{t("admin.topRestaurants")}</h2>
            {topRestaurants.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("analytics.noActivityTitle")}
              </p>
            ) : (
              <div className="space-y-3">
                {topRestaurants.map((r, index) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 rounded-xl border border-border/60 p-3"
                  >
                    <span className="w-4 shrink-0 text-sm font-semibold text-muted-foreground">
                      {index + 1}
                    </span>
                    <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {r.logoUrl ? (
                        <img src={r.logoUrl} alt={r.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                          {r.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {`${formatCount(r.reservations, currentLanguage)} ${t("analytics.reservations")} · ${r.city}`}
                      </p>
                      <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>
                          {r.pickupRate == null
                            ? t("analytics.notEnoughData")
                            : `${Math.round(r.pickupRate)}% ${t("analytics.pickupRate")}`}
                        </span>
                        <MoneyValue value={r.revenue} size={11} />
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      title={t("admin.review")}
                      aria-label={t("admin.review")}
                      onClick={() => navigate(`/admin/restaurants?focus=${r.id}`)}
                    >
                      <ArrowRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <section className="space-y-4 rounded-xl border border-border/70 bg-card p-5 shadow-xs">
          <h2 className="text-section text-foreground">{t("analytics.impact")}</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/60 p-4">
              <p className="text-2xl font-semibold tabular-nums text-foreground">
                🍽 {formatCount(totals.foodRescued, currentLanguage)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("analytics.portionsRescued")}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 p-4">
              <p className="text-2xl font-semibold tabular-nums text-foreground">
                🌱 {formatKg(totals.co2Avoided, currentLanguage)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("analytics.co2Avoided")}
              </p>
            </div>
            <div className="rounded-xl border border-border/60 p-4">
              <p className="text-2xl font-semibold tabular-nums text-foreground">
                💰 {formatOmr(totals.customerSavings, currentLanguage)}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("analytics.savedByCustomers")}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {t("analytics.co2Note", {
              value: formatKg(data.co2PerMeal, currentLanguage),
            })}
          </p>
        </section>
      </div>
    </AdminShell>
  );
};

export default AdminAnalyticsPage;
