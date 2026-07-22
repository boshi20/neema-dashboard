import { useState } from "react";
import OmrSymbol from "@/components/OmrSymbol";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { useToast } from "@/hooks/use-toast";
import {
  listOrders,
  updateOrderStatus,
  type OwnerOrder,
  type ReservationStatus,
} from "@/lib/api";

const OrdersPage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";
  const { toast } = useToast();
  const { restaurant } = useAuth();
  const queryClient = useQueryClient();
  const restaurantId = restaurant?.id;
  const [statusFilter, setStatusFilter] = useState("all");

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
      toast({ title: t("orders.loadError"), description: message, variant: "destructive" });
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

  const statusColors: Record<string, string> = {
    pending_payment: "bg-chart-5/20 text-chart-5",
    confirmed: "bg-primary/20 text-primary",
    ready_for_pickup: "bg-chart-1/20 text-chart-1",
    picked_up: "bg-chart-2/20 text-chart-2",
    cancelled_by_user: "bg-destructive/20 text-destructive",
    cancelled_by_restaurant: "bg-destructive/20 text-destructive",
    expired: "bg-muted text-muted-foreground",
  };

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      pending_payment: t("orders.pending"),
      confirmed: t("orders.confirmed"),
      ready_for_pickup: t("orders.readyForPickup"),
      picked_up: t("orders.pickedUp"),
      cancelled_by_user: t("orders.cancelled"),
      cancelled_by_restaurant: t("orders.cancelled"),
      expired: t("orders.expired"),
    };
    return map[s] || s;
  };

  const nextAction = (order: OwnerOrder): { label: string; status: ReservationStatus } | null => {
    switch (order.status) {
      case "pending_payment":
        return { label: t("orders.markConfirmed"), status: "confirmed" };
      case "confirmed":
        return { label: t("orders.markReady"), status: "ready_for_pickup" };
      case "ready_for_pickup":
        return { label: t("orders.markPickedUp"), status: "picked_up" };
      default:
        return null;
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString(isAr ? "ar-OM" : "en-OM", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground">{t("orders.title")}</h1>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "all" ? t("common.all") : statusLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="py-12 text-center text-destructive">{t("orders.loadError")}</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("orders.orderId")}</TableHead>
                    <TableHead>{t("orders.customer")}</TableHead>
                    <TableHead>{t("orders.items")}</TableHead>
                    <TableHead>{t("orders.total")}</TableHead>
                    <TableHead>{t("orders.status")}</TableHead>
                    <TableHead>{t("orders.date")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                        {t("orders.noOrders")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((order) => {
                      const action = nextAction(order);
                      return (
                        <TableRow key={order.id}>
                          <TableCell className="font-mono text-xs">{order.id.slice(0, 8).toUpperCase()}</TableCell>
                          <TableCell className="font-mono text-xs">{order.customerRef}</TableCell>
                          <TableCell>{isAr && order.mealNameAr ? order.mealNameAr : order.mealName}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1">
                              <OmrSymbol size={12} /> {order.total}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={statusColors[order.status] ?? ""} variant="outline">
                              {statusLabel(order.status)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {formatDate(order.createdAt)}
                          </TableCell>
                          <TableCell>
                            {action ? (
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={statusMutation.isPending}
                                onClick={() => statusMutation.mutate({ id: order.id, status: action.status })}
                              >
                                {action.label}
                              </Button>
                            ) : null}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;
