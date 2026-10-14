import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/patterns/PageHeader";
import { SearchInput } from "@/components/patterns/SearchInput";
import { StatusBadge } from "@/components/patterns/StatusBadge";
import { EmptyState } from "@/components/patterns/EmptyState";
import { MoneyValue } from "@/components/patterns/MoneyValue";
import { TableSkeleton } from "@/components/patterns/skeletons";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useLanguage } from "@/hooks/useLanguage";
import { listAdminOrders, type AdminOrder, type ReservationStatus } from "@/lib/adminApi";
import { formatDateTime } from "@/lib/format";

type StatusFilter = "all" | ReservationStatus;

const STATUS_OPTIONS: { value: ReservationStatus; labelKey: string }[] = [
  { value: "pending_payment", labelKey: "status.pending" },
  { value: "confirmed", labelKey: "status.confirmed" },
  { value: "ready_for_pickup", labelKey: "status.readyForPickup" },
  { value: "picked_up", labelKey: "status.pickedUp" },
  { value: "cancelled_by_user", labelKey: "status.cancelled" },
  { value: "expired", labelKey: "status.expired" },
];

const AdminOrdersPage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: orders = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: listAdminOrders,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all") {
        // Both cancellation statuses collapse into the "cancelled" filter entry.
        const matches =
          statusFilter === "cancelled_by_user"
            ? o.status === "cancelled_by_user" || o.status === "cancelled_by_restaurant"
            : o.status === statusFilter;
        if (!matches) return false;
      }
      if (!q) return true;
      return (
        o.id.toLowerCase().startsWith(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.restaurantName.toLowerCase().includes(q) ||
        o.listingTitle.toLowerCase().includes(q) ||
        (o.listingTitleAr ?? "").toLowerCase().includes(q)
      );
    });
  }, [orders, search, statusFilter]);

  const listingLabel = (o: AdminOrder) =>
    currentLanguage === "ar" && o.listingTitleAr ? o.listingTitleAr : o.listingTitle;

  return (
    <AdminShell title={t("admin.orders")}>
      <div className="space-y-6">
        <PageHeader title={t("admin.orders")} description={t("admin.ordersSubtitle")} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            containerClassName="w-full sm:max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.searchOrders")}
          />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {t(s.labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <TableSkeleton rows={8} />
        ) : isError ? (
          <EmptyState
            title={t("admin.loadError")}
            actionLabel={t("analytics.retry")}
            onAction={() => refetch()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState icon={ShoppingBag} title={t("admin.noOrdersFound")} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.order")}</TableHead>
                    <TableHead>{t("admin.customer")}</TableHead>
                    <TableHead>{t("admin.restaurant")}</TableHead>
                    <TableHead>{t("orders.food")}</TableHead>
                    <TableHead>{t("orders.amount")}</TableHead>
                    <TableHead>{t("admin.created")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{o.id.slice(0, 8).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <p className="max-w-[160px] truncate text-sm font-medium text-foreground">
                          {o.customerName}
                        </p>
                        <p className="text-xs text-muted-foreground" dir="ltr">
                          {o.customerPhone}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                        {o.restaurantName}
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-sm">
                        {listingLabel(o)}
                      </TableCell>
                      <TableCell>
                        <MoneyValue value={o.amountPaid} size={12} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateTime(o.createdAt, currentLanguage)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={o.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {filtered.map((o) => (
                <div
                  key={o.id}
                  className="space-y-2 rounded-xl border border-border/70 bg-card p-3.5 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      #{o.id.slice(0, 8).toUpperCase()}
                    </span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{listingLabel(o)}</p>
                  <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    <span className="truncate">
                      {o.customerName} · {o.restaurantName}
                    </span>
                    <MoneyValue value={o.amountPaid} size={11} className="text-sm" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(o.createdAt, currentLanguage)}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminShell>
  );
};

export default AdminOrdersPage;
