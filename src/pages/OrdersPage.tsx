import { useState } from "react";
import OmrSymbol from "@/components/OmrSymbol";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { mockOrders } from "@/data/mockData";

const OrdersPage = () => {
  const { t } = useTranslation();
  const [statusFilter, setStatusFilter] = useState("all");

  const statuses = ["all", "pending", "confirmed", "picked_up", "cancelled"];

  const filtered = mockOrders.filter(
    (o) => statusFilter === "all" || o.status === statusFilter
  );

  const statusColors: Record<string, string> = {
    pending: "bg-chart-5/20 text-chart-5",
    confirmed: "bg-primary/20 text-primary",
    picked_up: "bg-chart-2/20 text-chart-2",
    cancelled: "bg-destructive/20 text-destructive",
  };

  const statusLabel = (s: string) => {
    const map: Record<string, string> = {
      pending: t("orders.pending"),
      confirmed: t("orders.confirmed"),
      picked_up: t("orders.pickedUp"),
      cancelled: t("orders.cancelled"),
    };
    return map[s] || s;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-foreground">{t("orders.title")}</h1>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("orders.orderId")}</TableHead>
                  <TableHead>{t("orders.customer")}</TableHead>
                  <TableHead>{t("orders.items")}</TableHead>
                  <TableHead>{t("orders.total")}</TableHead>
                  <TableHead>{t("orders.status")}</TableHead>
                  <TableHead>{t("orders.date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t("orders.noOrders")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        {order.items.map((i) => `${i.mealName} x${i.quantity}`).join(", ")}
                      </TableCell>
                      <TableCell>{order.total} <OmrSymbol size={14} /></TableCell>
                      <TableCell>
                        <Badge className={statusColors[order.status]} variant="secondary">
                          {statusLabel(order.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{order.date}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default OrdersPage;
