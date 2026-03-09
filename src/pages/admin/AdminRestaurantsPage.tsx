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
import { Search, Store, MoreVertical, Edit, Ban, CheckCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import OmrSymbol from "@/components/OmrSymbol";
import { mockRestaurants, type Restaurant } from "@/data/adminMockData";
import { toast } from "@/hooks/use-toast";

const AdminRestaurantsPage = () => {
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogState, setDialogState] = useState<{ open: boolean; action: string; restaurant: Restaurant | null }>({
    open: false, action: "", restaurant: null,
  });

  const handleAction = (action: string, restaurant: Restaurant) => {
    setDialogState({ open: true, action, restaurant });
  };

  const confirmAction = () => {
    const { action, restaurant } = dialogState;
    if (!restaurant) return;

    const actionMessages: Record<string, string> = {
      approve: `${restaurant.name} approved`,
      suspend: `${restaurant.name} suspended`,
      delete: `${restaurant.name} deleted`,
      edit: `${restaurant.name} details saved`,
    };

    toast({
      title: t("common.success"),
      description: actionMessages[action] || "Action completed",
    });
    setDialogState({ open: false, action: "", restaurant: null });
  };

  const statuses = ["all", "active", "pending", "suspended"];

  const filtered = mockRestaurants.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.owner.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusColors: Record<string, string> = {
    active: "bg-primary/15 text-primary border-primary/20",
    pending: "bg-chart-5/15 text-chart-5 border-chart-5/20",
    suspended: "bg-destructive/15 text-destructive border-destructive/20",
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground">{t("admin.restaurants")}</h1>
          <p className="text-muted-foreground mt-1">{t("admin.manageRestaurants")}</p>
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
                  {s === "all" ? t("common.all") : t(`admin.status.${s}`)}
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
                  <TableHead>{t("admin.restaurantName")}</TableHead>
                  <TableHead>{t("admin.owner")}</TableHead>
                  <TableHead>{t("admin.city")}</TableHead>
                  <TableHead>{t("admin.totalMeals")}</TableHead>
                  <TableHead>{t("admin.totalOrdersCol")}</TableHead>
                  <TableHead>{t("admin.revenue")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
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
                  filtered.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-accent/50 flex items-center justify-center">
                            <Store className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium">{isAr && r.nameAr ? r.nameAr : r.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{r.owner}</TableCell>
                      <TableCell>{r.city}</TableCell>
                      <TableCell>{r.totalMeals}</TableCell>
                      <TableCell>{r.totalOrders}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1">
                          <OmrSymbol size={13} /> {r.revenue}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("border", statusColors[r.status])} variant="secondary">
                          {t(`admin.status.${r.status}`)}
                        </Badge>
                      </TableCell>
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

export default AdminRestaurantsPage;
