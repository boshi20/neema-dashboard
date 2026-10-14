import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MoreHorizontal, UtensilsCrossed } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/patterns/PageHeader";
import { SearchInput } from "@/components/patterns/SearchInput";
import { StatusBadge } from "@/components/patterns/StatusBadge";
import { EmptyState } from "@/components/patterns/EmptyState";
import { MoneyValue } from "@/components/patterns/MoneyValue";
import { TableSkeleton } from "@/components/patterns/skeletons";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import {
  listAdminListings,
  setListingStatusAdmin,
  type AdminListing,
  type ListingStatus,
} from "@/lib/adminApi";
import { formatDateTime } from "@/lib/format";

type ModerationStatus = "active" | "paused" | "archived";
type StatusFilter = "all" | ListingStatus;

const STATUS_OPTIONS: ListingStatus[] = [
  "active",
  "paused",
  "sold_out",
  "expired",
  "archived",
  "draft",
];

const AdminListingsPage = () => {
  const { t } = useTranslation();
  const { currentLanguage, isRTL } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [pendingAction, setPendingAction] = useState<{
    listing: AdminListing;
    status: ModerationStatus;
  } | null>(null);

  const { data: listings = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: listAdminListings,
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ModerationStatus }) =>
      setListingStatusAdmin(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      setPendingAction(null);
      toast({ title: t("admin.listingUpdated") });
    },
    onError: () => {
      toast({ title: t("admin.actionFailed"), variant: "destructive" });
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return listings.filter((l) => {
      if (statusFilter !== "all" && l.status !== statusFilter) return false;
      if (!q) return true;
      return (
        l.title.toLowerCase().includes(q) ||
        (l.title_ar ?? "").toLowerCase().includes(q) ||
        l.restaurantName.toLowerCase().includes(q)
      );
    });
  }, [listings, search, statusFilter]);

  const displayTitle = (l: AdminListing) =>
    currentLanguage === "ar" && l.title_ar ? l.title_ar : l.title;

  const availableActions = (l: AdminListing): ModerationStatus[] => {
    const actions: ModerationStatus[] = [];
    if (l.status === "paused" && l.quantity_remaining > 0) actions.push("active");
    if (l.status === "active") actions.push("paused");
    if (l.status !== "archived") actions.push("archived");
    return actions;
  };

  const actionLabel = (status: ModerationStatus) =>
    status === "active"
      ? t("admin.activate")
      : status === "paused"
        ? t("admin.pause")
        : t("admin.archive");

  const renderActionsMenu = (l: AdminListing) => {
    const actions = availableActions(l);
    if (actions.length === 0) return null;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t("common.actions")}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map((status) => (
            <DropdownMenuItem
              key={status}
              className={status === "archived" ? "text-destructive focus:text-destructive" : undefined}
              onClick={() => setPendingAction({ listing: l, status })}
            >
              {actionLabel(status)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const pickupLabel = (l: AdminListing) => {
    const start = formatDateTime(l.pickup_start, currentLanguage);
    const end = new Intl.DateTimeFormat(
      currentLanguage === "ar" ? "ar-OM-u-nu-latn" : "en-GB",
      { hour: "2-digit", minute: "2-digit" }
    ).format(new Date(l.pickup_end));
    return `${start} – ${end}`;
  };

  return (
    <AdminShell title={t("admin.listings")}>
      <div className="space-y-6">
        <PageHeader title={t("admin.listings")} description={t("admin.listingsSubtitle")} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            containerClassName="w-full sm:max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.searchListings")}
          />
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`status.${s === "sold_out" ? "soldOut" : s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : isError ? (
          <EmptyState
            title={t("admin.loadError")}
            actionLabel={t("analytics.retry")}
            onAction={() => refetch()}
          />
        ) : filtered.length === 0 ? (
          <EmptyState icon={UtensilsCrossed} title={t("admin.noListings")} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.listing")}</TableHead>
                    <TableHead>{t("admin.restaurant")}</TableHead>
                    <TableHead>{t("admin.price")}</TableHead>
                    <TableHead>{t("admin.remaining")}</TableHead>
                    <TableHead>{t("admin.pickupWindow")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead className="text-end">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {l.images[0] ? (
                            <img
                              src={l.images[0]}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                              <UtensilsCrossed className="h-4 w-4 text-primary" />
                            </div>
                          )}
                          <span className="max-w-[200px] truncate text-sm font-semibold text-foreground">
                            {displayTitle(l)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                        {l.restaurantName}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <MoneyValue value={Number(l.selling_price)} size={12} />
                          <span className="text-xs text-muted-foreground line-through tabular-nums">
                            {Number(l.original_price).toFixed(3)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {l.quantity_remaining}/{l.quantity}
                      </TableCell>
                      <TableCell
                        className="text-xs text-muted-foreground"
                        dir={isRTL ? "rtl" : "ltr"}
                      >
                        {pickupLabel(l)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={l.status} />
                      </TableCell>
                      <TableCell className="text-end">{renderActionsMenu(l)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {filtered.map((l) => (
                <div
                  key={l.id}
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-xs"
                >
                  {l.images[0] ? (
                    <img src={l.images[0]} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <UtensilsCrossed className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{displayTitle(l)}</p>
                    <p className="truncate text-xs text-muted-foreground">{l.restaurantName}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <StatusBadge status={l.status} />
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {l.quantity_remaining}/{l.quantity}
                      </span>
                    </div>
                  </div>
                  {renderActionsMenu(l)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AlertDialog
        open={Boolean(pendingAction)}
        onOpenChange={(open) => {
          if (!open) setPendingAction(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingAction ? actionLabel(pendingAction.status) : null}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingAction
                ? t("admin.confirmListingBody", {
                    name: displayTitle(pendingAction.listing),
                    status: t(`status.${pendingAction.status}`),
                  })
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={mutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (pendingAction) {
                  mutation.mutate({
                    id: pendingAction.listing.id,
                    status: pendingAction.status,
                  });
                }
              }}
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
};

export default AdminListingsPage;
