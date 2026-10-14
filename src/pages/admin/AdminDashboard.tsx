import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Store,
  UserPlus,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { KpiCard } from "@/components/patterns/KpiCard";
import { SectionHeader } from "@/components/patterns/PageHeader";
import { EmptyState } from "@/components/patterns/EmptyState";
import { KpiSkeleton, ListSkeleton } from "@/components/patterns/skeletons";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { fetchAdminOverview, type AdminActivityType } from "@/lib/adminApi";
import { formatCount } from "@/lib/analytics";
import { formatRelativeTime } from "@/lib/format";
import { cn } from "@/lib/utils";

const ACTIVITY_ICON: Record<AdminActivityType, LucideIcon> = {
  restaurant_submitted: Store,
  user_joined: UserPlus,
  listing_created: UtensilsCrossed,
  reservation_completed: CheckCircle2,
};

const ACTIVITY_LABEL_KEY: Record<AdminActivityType, string> = {
  restaurant_submitted: "admin.activityRestaurantSubmitted",
  user_joined: "admin.activityUserJoined",
  listing_created: "admin.activityListingCreated",
  reservation_completed: "admin.activityReservationCompleted",
};

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { currentLanguage, isRTL } = useLanguage();
  const navigate = useNavigate();
  const { admin } = useAdminAuth();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: fetchAdminOverview,
  });

  const totals = data?.totals;

  return (
    <AdminShell title={t("admin.overview")}>
      <div className="space-y-8">
        <div>
          <h2 className="text-page-title text-foreground">
            {t("admin.welcomeBack", { name: admin?.name || "Admin" })}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("admin.overviewSubtitle")}</p>
        </div>

        {isError ? (
          <EmptyState
            title={t("admin.loadError")}
            actionLabel={t("analytics.retry")}
            onAction={() => refetch()}
          />
        ) : (
          <>
            {isLoading || !totals ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <KpiSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <KpiCard
                  label={t("admin.totalRestaurants")}
                  value={formatCount(totals.totalRestaurants, currentLanguage)}
                  icon={Store}
                  noPreviousLabel={t("admin.pendingCount", {
                    count: totals.pendingRestaurants,
                  })}
                />
                <KpiCard
                  label={t("admin.pendingApprovals")}
                  value={formatCount(totals.pendingRestaurants, currentLanguage)}
                  icon={ClipboardCheck}
                  iconClassName={totals.pendingRestaurants > 0 ? "text-amber-600" : "text-primary"}
                  iconBgClassName={totals.pendingRestaurants > 0 ? "bg-amber-50" : "bg-primary/10"}
                  noPreviousLabel={t("admin.awaitingReview")}
                />
                <KpiCard
                  label={t("admin.totalUsers")}
                  value={formatCount(totals.totalUsers, currentLanguage)}
                  icon={Users}
                  noPreviousLabel={t("admin.usersBreakdown", {
                    customers: totals.customers,
                    owners: totals.restaurantOwners,
                  })}
                />
                <KpiCard
                  label={t("admin.activeListings")}
                  value={formatCount(totals.activeListings, currentLanguage)}
                  icon={UtensilsCrossed}
                  noPreviousLabel={t("admin.reservationsToday", {
                    count: totals.reservationsToday,
                  })}
                />
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="space-y-4">
                <SectionHeader
                  title={t("admin.pendingActions")}
                  action={
                    (data?.pendingApprovals.length ?? 0) > 0 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1 text-primary"
                        onClick={() => navigate("/admin/restaurants?status=pending_review")}
                      >
                        {t("common.viewAll")}
                        <ArrowRight className={cn("h-4 w-4", isRTL && "rotate-180")} />
                      </Button>
                    ) : undefined
                  }
                />
                {isLoading ? (
                  <ListSkeleton rows={3} />
                ) : (data?.pendingApprovals.length ?? 0) === 0 ? (
                  <EmptyState
                    icon={ClipboardCheck}
                    title={t("admin.noPendingActions")}
                    className="py-10"
                  />
                ) : (
                  <div className="divide-y divide-border/60 rounded-xl border border-border/70 bg-card shadow-xs">
                    {data!.pendingApprovals.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-3.5">
                        {p.logoUrl ? (
                          <img
                            src={p.logoUrl}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                            {p.name.slice(0, 1).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {p.city} · {p.cuisineType} ·{" "}
                            {formatRelativeTime(p.submittedAt, currentLanguage)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            navigate(`/admin/restaurants?status=pending_review&focus=${p.id}`)
                          }
                        >
                          {t("admin.review")}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <SectionHeader title={t("admin.recentActivity")} />
                {isLoading ? (
                  <ListSkeleton rows={5} />
                ) : (data?.recentActivity.length ?? 0) === 0 ? (
                  <EmptyState title={t("admin.noActivity")} className="py-10" />
                ) : (
                  <div className="divide-y divide-border/60 rounded-xl border border-border/70 bg-card shadow-xs">
                    {data!.recentActivity.map((a, i) => {
                      const Icon = ACTIVITY_ICON[a.type] ?? Store;
                      const subtitle =
                        a.type === "user_joined"
                          ? t(`admin.roles.${a.subtitle}`, { defaultValue: a.subtitle })
                          : a.subtitle;
                      return (
                        <div key={`${a.type}-${a.entityId}-${i}`} className="flex items-center gap-3 p-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                            <Icon className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-foreground">
                              {a.title}
                              {subtitle ? (
                                <span className="text-muted-foreground"> · {subtitle}</span>
                              ) : null}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {t(ACTIVITY_LABEL_KEY[a.type] ?? "admin.recentActivity")}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">
                            {formatRelativeTime(a.ts, currentLanguage)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
};

export default AdminDashboard;
