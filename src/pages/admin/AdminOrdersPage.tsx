import { useState } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreVertical, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import OmrSymbol from "@/components/OmrSymbol";
import { mockPlatformOrders, type PlatformOrder } from "@/data/adminMockData";
import { toast } from "@/hooks/use-toast";

const AdminOrdersPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogState, setDialogState] = useState<{ open: boolean; action: string; order: PlatformOrder | null }>({
    open: false, action: "", order: null,
  });

  const handleAction = (action: string, order: PlatformOrder) => {
    setDialogState({ open: true, action, order });
  };

  const confirmAction = () => {
    const { action, order } = dialogState;
    if (!order) return;

    const actionMessages: Record<string, string> = {
      cancel: `Order ${order.id} cancelled`,
      confirm: `Order ${order.id} confirmed`,
    };

    toast({
      title: t("common.success"),
      description: actionMessages[action] || "Action completed",
    });
    setDialogState({ open: false, action: "", order: null });
  };

  const statuses = ["all", "pending", "confirmed", "picked_up", "cancelled"];

  const filtered = mockPlatformOrders.filter((o) => {
    const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) || o.restaurantName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColors: Record<string, string> = {
    pending: "bg-chart-5/15 text-chart-5 border-chart-5/20",
    confirmed: "bg-primary/15 text-primary border-primary/20",
    picked_up: "bg-chart-2/15 text-chart-2 border-chart-2/20",
    cancelled: "bg-destructive/15 text-destructive border-destructive/20",
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
    <AdminLayout>
      <div className="space-y-8">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground">{t("admin.allOrders")}</h1>
          <p className="text-muted-foreground mt-1">{t("admin.ordersAcrossPlatform")}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className={cn("absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
            <Input placeholder={t("common.search")} value={search} onChange={(e) => setSearch(e.target.value)} className={cn(isRTL ? "pr-10" : "pl-10")} />
          </div>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("orders.orderId")}</TableHead>
                  <TableHead>{t("admin.restaurantName")}</TableHead>
                  <TableHead>{t("orders.customer")}</TableHead>
                  <TableHead>{t("orders.items")}</TableHead>
                  <TableHead>{t("orders.total")}</TableHead>
                  <TableHead>{t("orders.status")}</TableHead>
                  <TableHead>{t("orders.date")}</TableHead>
                  <TableHead className="w-[80px]">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t("common.noResults")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.restaurantName}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{order.items}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1"><OmrSymbol size={13} /> {order.total}</span>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("border", statusColors[order.status])} variant="secondary">
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
    </AdminLayout>
  );
};

export default AdminOrdersPage;
