import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, Loader2 } from "lucide-react";
import { AppShell } from "@/components/shell/AppShell";
import {
  PageHeader,
  EmptyState,
  OrderRow,
  OrderCard,
  TableSkeleton,
} from "@/components/patterns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  completePickupWithCode,
  listOrders,
  updateOrderStatus,
  type OwnerOrder,
  type ReservationStatus,
} from "@/lib/api";

const OrdersPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { restaurant } = useAuth();
  const queryClient = useQueryClient();
  const restaurantId = restaurant?.id;
  const [statusFilter, setStatusFilter] = useState("all");
  const [pickupOrder, setPickupOrder] = useState<OwnerOrder | null>(null);
  const [pickupCode, setPickupCode] = useState("");

  const { data: orders = [], isLoading, error } = useQuery({
    queryKey: ["orders", restaurantId],
    queryFn: () => listOrders(restaurantId!),
    enabled: Boolean(restaurantId),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReservationStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: t("orders.loadError"),
        description: message,
        variant: "destructive",
      });
    },
  });

  const pickupMutation = useMutation({
    mutationFn: ({ id, code }: { id: string; code: string }) =>
      completePickupWithCode(id, code),
    onSuccess: () => {
      setPickupOrder(null);
      setPickupCode("");
      void queryClient.invalidateQueries({ queryKey: ["orders", restaurantId] });
      toast({ title: t("orders.pickupSuccess") });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : String(err);
      toast({
        title: t("orders.pickupFailed"),
        description: message,
        variant: "destructive",
      });
    },
  });

  const statuses: Array<"all" | ReservationStatus> = [
    "all",
    "pending_payment",
    "confirmed",
    "ready_for_pickup",
    "picked_up",
    "cancelled_by_user",
    "expired",
  ];

  const filtered = orders.filter(
    (o) => statusFilter === "all" || o.status === statusFilter
  );

  const nextLabel = (status: ReservationStatus): string | null => {
    if (status === "pending_payment") return t("orders.markConfirmed");
    if (status === "confirmed") return t("orders.markReady");
    if (status === "ready_for_pickup") return t("orders.markPickedUp");
    return null;
  };

  const handleAction = (order: OwnerOrder) => {
    if (order.status === "pending_payment") {
      statusMutation.mutate({ id: order.id, status: "confirmed" });
      return;
    }
    if (order.status === "confirmed") {
      statusMutation.mutate({ id: order.id, status: "ready_for_pickup" });
      return;
    }
    if (order.status === "ready_for_pickup") {
      setPickupOrder(order);
      setPickupCode("");
    }
  };

  const submitPickup = () => {
    if (!pickupOrder) return;
    if (!/^\d{4}$/.test(pickupCode)) {
      toast({ title: t("orders.invalidPickupCode"), variant: "destructive" });
      return;
    }
    pickupMutation.mutate({ id: pickupOrder.id, code: pickupCode });
  };

  const actionPending = statusMutation.isPending || pickupMutation.isPending;

  return (
    <AppShell title={t("orders.title")}>
      <div className="space-y-6">
        <PageHeader
          title={t("orders.title")}
          actions={
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s === "all"
                      ? t("common.all")
                      : s === "pending_payment"
                        ? t("orders.pending")
                        : s === "confirmed"
                          ? t("orders.confirmed")
                          : s === "ready_for_pickup"
                            ? t("orders.readyForPickup")
                            : s === "picked_up"
                              ? t("orders.pickedUp")
                              : s === "cancelled_by_user"
                                ? t("orders.cancelled")
                                : t("orders.expired")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        />

        {error ? (
          <EmptyState title={t("orders.loadError")} />
        ) : isLoading ? (
          <TableSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState icon={ShoppingBag} title={t("orders.noOrders")} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/70 bg-muted/40 text-start text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-3 text-start">{t("orders.orderId")}</th>
                      <th className="px-4 py-3 text-start">{t("orders.customer")}</th>
                      <th className="px-4 py-3 text-start">{t("orders.food")}</th>
                      <th className="px-4 py-3 text-start">{t("orders.qty")}</th>
                      <th className="px-4 py-3 text-start">{t("orders.pickup")}</th>
                      <th className="px-4 py-3 text-start">{t("orders.amount")}</th>
                      <th className="px-4 py-3 text-start">{t("orders.status")}</th>
                      <th className="px-4 py-3 text-end">{t("orders.action")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order) => (
                      <OrderRow
                        key={order.id}
                        order={order}
                        onAction={handleAction}
                        nextLabel={nextLabel}
                        actionPending={actionPending}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="grid gap-3 md:hidden">
              {filtered.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onAction={handleAction}
                  nextLabel={nextLabel}
                  actionPending={actionPending}
                />
              ))}
            </div>
          </>
        )}

        <Dialog
          open={Boolean(pickupOrder)}
          onOpenChange={(open) => {
            if (!open) {
              setPickupOrder(null);
              setPickupCode("");
            }
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("orders.enterPickupCodeTitle")}</DialogTitle>
              <DialogDescription>
                {t("orders.enterPickupCodeBody")}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2 py-2">
              <Label htmlFor="pickup-code">{t("orders.pickupCode")}</Label>
              <Input
                id="pickup-code"
                inputMode="numeric"
                maxLength={4}
                value={pickupCode}
                onChange={(e) =>
                  setPickupCode(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") submitPickup();
                }}
                className="text-center text-2xl font-semibold tracking-[0.4em] tabular-nums"
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setPickupOrder(null);
                  setPickupCode("");
                }}
              >
                {t("common.cancel")}
              </Button>
              <Button
                className="gradient-primary shadow-glow hover:opacity-90"
                disabled={pickupCode.length !== 4 || pickupMutation.isPending}
                onClick={submitPickup}
              >
                {pickupMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("common.confirm")
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
};

export default OrdersPage;
