import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ScrollText, Store, UserCog, UtensilsCrossed } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/patterns/PageHeader";
import { EmptyState } from "@/components/patterns/EmptyState";
import { ListSkeleton } from "@/components/patterns/skeletons";
import { useLanguage } from "@/hooks/useLanguage";
import { listAuditLogs, type AdminAuditEntry } from "@/lib/adminApi";
import { formatDateTime } from "@/lib/format";

const ACTION_ICON: Record<string, LucideIcon> = {
  "restaurant.status_changed": Store,
  "listing.status_changed": UtensilsCrossed,
  "user.role_changed": UserCog,
};

const ACTION_KEY: Record<string, string> = {
  "restaurant.status_changed": "admin.auditRestaurantStatus",
  "listing.status_changed": "admin.auditListingStatus",
  "user.role_changed": "admin.auditUserRole",
};

const STATUS_LABEL_KEY: Record<string, string> = {
  pending_review: "status.pendingReview",
  approved: "status.approved",
  rejected: "status.rejected",
  suspended: "status.suspended",
  active: "status.active",
  paused: "status.paused",
  draft: "status.draft",
  sold_out: "status.soldOut",
  expired: "status.expired",
  archived: "status.archived",
};

const AdminAuditLogPage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();

  const { data: entries = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-audit"],
    queryFn: listAuditLogs,
  });

  const valueLabel = (entry: AdminAuditEntry, value: unknown): string => {
    if (typeof value !== "string" || value.length === 0) return "—";
    if (entry.action === "user.role_changed") {
      return t(`admin.roles.${value}`, { defaultValue: value });
    }
    const key = STATUS_LABEL_KEY[value];
    return key ? t(key) : value;
  };

  return (
    <AdminShell title={t("admin.auditLog")}>
      <div className="space-y-6">
        <PageHeader title={t("admin.auditLog")} description={t("admin.auditSubtitle")} />

        {isLoading ? (
          <ListSkeleton rows={6} />
        ) : isError ? (
          <EmptyState
            title={t("admin.loadError")}
            actionLabel={t("analytics.retry")}
            onAction={() => refetch()}
          />
        ) : entries.length === 0 ? (
          <EmptyState icon={ScrollText} title={t("admin.auditEmpty")} />
        ) : (
          <div className="divide-y divide-border/60 rounded-xl border border-border/70 bg-card shadow-xs">
            {entries.map((entry) => {
              const Icon = ACTION_ICON[entry.action] ?? ScrollText;
              const reason =
                typeof entry.details.reason === "string" && entry.details.reason.length > 0
                  ? entry.details.reason
                  : null;
              return (
                <div key={entry.id} className="flex items-start gap-3 p-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{entry.adminName}</span>{" "}
                      <span className="text-muted-foreground">
                        {t(ACTION_KEY[entry.action] ?? "admin.auditGeneric")}
                      </span>{" "}
                      <span className="font-medium">{entry.entityLabel ?? "—"}</span>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {valueLabel(entry, entry.details.from)}
                      {" → "}
                      {valueLabel(entry, entry.details.to)}
                    </p>
                    {reason ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("admin.reasonLabel")}: {reason}
                      </p>
                    ) : null}
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDateTime(entry.createdAt, currentLanguage)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminShell>
  );
};

export default AdminAuditLogPage;
