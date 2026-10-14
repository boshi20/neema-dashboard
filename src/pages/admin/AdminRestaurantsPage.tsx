import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Loader2, Store } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/patterns/PageHeader";
import { SearchInput } from "@/components/patterns/SearchInput";
import { StatusBadge } from "@/components/patterns/StatusBadge";
import { EmptyState } from "@/components/patterns/EmptyState";
import { TableSkeleton } from "@/components/patterns/skeletons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  listAdminRestaurants,
  setRestaurantStatus,
  type AdminRestaurant,
  type RestaurantStatus,
} from "@/lib/adminApi";
import { formatDate } from "@/lib/format";

type StatusFilter = "all" | RestaurantStatus;

const STATUS_FILTERS: StatusFilter[] = [
  "all",
  "pending_review",
  "approved",
  "rejected",
  "suspended",
];

type ActionMode = "none" | "reject" | "suspend";

const AdminRestaurantsPage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const statusParam = searchParams.get("status");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    STATUS_FILTERS.includes(statusParam as StatusFilter)
      ? (statusParam as StatusFilter)
      : "all"
  );
  const [selected, setSelected] = useState<AdminRestaurant | null>(null);
  const [actionMode, setActionMode] = useState<ActionMode>("none");
  const [reason, setReason] = useState("");

  const { data: restaurants = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-restaurants"],
    queryFn: listAdminRestaurants,
  });

  // Deep link from the overview queue / command search (?focus=<id>).
  const focusId = searchParams.get("focus");
  useEffect(() => {
    if (!focusId || restaurants.length === 0) return;
    const match = restaurants.find((r) => r.id === focusId);
    if (match) {
      setSelected(match);
      setActionMode("none");
      setReason("");
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("focus");
        return next;
      },
      { replace: true }
    );
  }, [focusId, restaurants, setSearchParams]);

  const mutation = useMutation({
    mutationFn: ({
      id,
      status,
      note,
    }: {
      id: string;
      status: RestaurantStatus;
      note?: string;
    }) => setRestaurantStatus(id, status, note),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["admin-restaurants"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      setSelected((prev) =>
        prev && prev.id === updated.id ? { ...prev, ...updated } : prev
      );
      setActionMode("none");
      setReason("");
      toast({ title: t("admin.statusUpdated") });
    },
    onError: () => {
      toast({ title: t("admin.actionFailed"), variant: "destructive" });
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return restaurants.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.cuisine_type.toLowerCase().includes(q) ||
        r.ownerEmail.toLowerCase().includes(q) ||
        r.ownerName.toLowerCase().includes(q)
      );
    });
  }, [restaurants, search, statusFilter]);

  const openReview = (restaurant: AdminRestaurant) => {
    setSelected(restaurant);
    setActionMode("none");
    setReason("");
  };

  const act = (status: RestaurantStatus, note?: string) => {
    if (!selected) return;
    mutation.mutate({ id: selected.id, status, note });
  };

  const pending = mutation.isPending;

  return (
    <AdminShell title={t("admin.restaurants")}>
      <div className="space-y-6">
        <PageHeader
          title={t("admin.restaurants")}
          description={t("admin.restaurantsSubtitle")}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            containerClassName="w-full sm:max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.searchRestaurants")}
          />
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as StatusFilter);
              setSearchParams(
                (prev) => {
                  const next = new URLSearchParams(prev);
                  if (v === "all") next.delete("status");
                  else next.set("status", v);
                  return next;
                },
                { replace: true }
              );
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="pending_review">{t("status.pendingReview")}</SelectItem>
              <SelectItem value="approved">{t("status.approved")}</SelectItem>
              <SelectItem value="rejected">{t("status.rejected")}</SelectItem>
              <SelectItem value="suspended">{t("status.suspended")}</SelectItem>
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
          <EmptyState
            icon={Store}
            title={t("admin.noRestaurants")}
            description={t("admin.noRestaurantsBody")}
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.restaurant")}</TableHead>
                    <TableHead>{t("admin.owner")}</TableHead>
                    <TableHead>{t("admin.city")}</TableHead>
                    <TableHead>{t("admin.joined")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead className="text-end">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {r.logo_url ? (
                            <img
                              src={r.logo_url}
                              alt=""
                              className="h-9 w-9 shrink-0 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                              {r.name.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="max-w-[220px] truncate text-sm font-semibold text-foreground">
                              {r.name}
                            </p>
                            <p className="text-xs text-muted-foreground">{r.cuisine_type}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="max-w-[180px] truncate text-sm text-foreground">{r.ownerName}</p>
                        <p className="max-w-[180px] truncate text-xs text-muted-foreground">
                          {r.ownerEmail}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">{r.city}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(r.created_at, currentLanguage)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.status} />
                      </TableCell>
                      <TableCell className="text-end">
                        <Button size="sm" variant="outline" onClick={() => openReview(r)}>
                          {t("admin.review")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {filtered.map((r) => (
                <button
                  key={r.id}
                  onClick={() => openReview(r)}
                  className="flex w-full items-center gap-3 rounded-xl border border-border/70 bg-card p-3 text-start shadow-xs transition-colors hover:bg-muted/50"
                >
                  {r.logo_url ? (
                    <img src={r.logo_url} alt="" className="h-11 w-11 shrink-0 rounded-lg object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                      {r.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{r.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {r.city} · {r.cuisine_type}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Review dialog */}
      <Dialog
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            setActionMode("none");
            setReason("");
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          {selected ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selected.logo_url ? (
                    <img
                      src={selected.logo_url}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-base font-semibold text-primary">
                      {selected.name.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                  <span className="min-w-0">
                    <span className="block truncate">{selected.name}</span>
                    <span className="mt-1 block">
                      <StatusBadge status={selected.status} />
                    </span>
                  </span>
                </DialogTitle>
              </DialogHeader>

              <div className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
                <DetailItem label={t("admin.cuisine")} value={selected.cuisine_type} />
                <DetailItem label={t("admin.city")} value={selected.city} />
                <DetailItem
                  label={t("admin.address")}
                  value={selected.address}
                  className="sm:col-span-2"
                />
                <DetailItem label={t("settings.phone")} value={selected.phone || t("admin.notProvided")} />
                <DetailItem
                  label={t("admin.joined")}
                  value={formatDate(selected.created_at, currentLanguage)}
                />
                <DetailItem label={t("admin.owner")} value={selected.ownerName} />
                <DetailItem label={t("settings.email")} value={selected.ownerEmail} />
                <DetailItem
                  label={t("admin.crNumber")}
                  value={selected.cr_number || t("admin.notProvided")}
                />
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("admin.crDocument")}
                  </p>
                  {selected.cr_document_url ? (
                    <a
                      href={selected.cr_document_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                      {t("admin.viewDocument")}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ) : (
                    <p className="mt-0.5 text-sm text-foreground">{t("admin.notProvided")}</p>
                  )}
                </div>
                {selected.rejection_reason ? (
                  <DetailItem
                    label={t("admin.reasonLabel")}
                    value={selected.rejection_reason}
                    className="sm:col-span-2"
                  />
                ) : null}
              </div>

              <div className="mt-2 border-t border-border/70 pt-4">
                {actionMode === "none" ? (
                  <div className="flex flex-wrap justify-end gap-2">
                    {selected.status === "approved" ? (
                      <Button
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        disabled={pending}
                        onClick={() => setActionMode("suspend")}
                      >
                        {t("admin.suspend")}
                      </Button>
                    ) : null}
                    {selected.status === "pending_review" ? (
                      <Button
                        variant="outline"
                        className="text-destructive hover:text-destructive"
                        disabled={pending}
                        onClick={() => setActionMode("reject")}
                      >
                        {t("admin.reject")}
                      </Button>
                    ) : null}
                    {selected.status !== "approved" ? (
                      <Button
                        className="gradient-primary shadow-glow hover:opacity-90"
                        disabled={pending}
                        onClick={() => act("approved")}
                      >
                        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {selected.status === "suspended"
                          ? t("admin.reinstate")
                          : t("admin.approve")}
                      </Button>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="admin-reason">
                        {t("admin.reasonLabel")}
                        {actionMode === "reject" ? " *" : ""}
                      </Label>
                      <Textarea
                        id="admin-reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder={t("admin.reasonPlaceholder")}
                        rows={3}
                      />
                      {actionMode === "reject" && reason.trim().length === 0 ? (
                        <p className="text-xs text-destructive">{t("admin.reasonRequired")}</p>
                      ) : null}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        disabled={pending}
                        onClick={() => {
                          setActionMode("none");
                          setReason("");
                        }}
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={
                          pending || (actionMode === "reject" && reason.trim().length === 0)
                        }
                        onClick={() =>
                          act(
                            actionMode === "reject" ? "rejected" : "suspended",
                            reason.trim() || undefined
                          )
                        }
                      >
                        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {actionMode === "reject" ? t("admin.reject") : t("admin.suspend")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminShell>
  );
};

function DetailItem({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 break-words text-sm text-foreground">{value}</p>
    </div>
  );
}

export default AdminRestaurantsPage;
