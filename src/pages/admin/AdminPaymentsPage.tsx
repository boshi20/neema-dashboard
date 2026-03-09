import { useState } from "react";
import { useTranslation } from "react-i18next";
import AdminLayout from "@/components/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Search, MoreVertical, RotateCcw, DollarSign, TrendingUp, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import OmrSymbol from "@/components/OmrSymbol";
import { mockTransactions, type Transaction } from "@/data/paymentsMockData";
import { toast } from "@/hooks/use-toast";

const AdminPaymentsPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogState, setDialogState] = useState<{ open: boolean; transaction: Transaction | null }>({
    open: false, transaction: null,
  });

  const statuses = ["all", "completed", "pending", "refunded", "failed"];

  const filtered = mockTransactions.filter((t) => {
    const matchSearch = t.restaurantName.toLowerCase().includes(search.toLowerCase()) || 
                        t.customerName.toLowerCase().includes(search.toLowerCase()) ||
                        t.orderId.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleRefund = (transaction: Transaction) => {
    setDialogState({ open: true, transaction });
  };

  const confirmRefund = () => {
    if (!dialogState.transaction) return;
    toast({
      title: t("common.success"),
      description: `Refund processed for ${dialogState.transaction.id}`,
    });
    setDialogState({ open: false, transaction: null });
  };

  const statusColors: Record<string, string> = {
    completed: "bg-chart-2/15 text-chart-2 border-chart-2/20",
    pending: "bg-chart-5/15 text-chart-5 border-chart-5/20",
    refunded: "bg-chart-4/15 text-chart-4 border-chart-4/20",
    failed: "bg-destructive/15 text-destructive border-destructive/20",
  };

  const totalRevenue = mockTransactions.filter(t => t.status === "completed").reduce((s, t) => s + t.amount, 0);
  const totalFees = mockTransactions.filter(t => t.status === "completed").reduce((s, t) => s + t.fee, 0);
  const pendingAmount = mockTransactions.filter(t => t.status === "pending").reduce((s, t) => s + t.amount, 0);

  const stats = [
    { title: "Total Revenue", value: totalRevenue.toFixed(1), icon: DollarSign, bgClass: "bg-chart-1/10", iconClass: "text-chart-1", showOmr: true },
    { title: "Platform Fees", value: totalFees.toFixed(1), icon: TrendingUp, bgClass: "bg-chart-2/10", iconClass: "text-chart-2", showOmr: true },
    { title: "Pending Payments", value: pendingAmount.toFixed(1), icon: CreditCard, bgClass: "bg-chart-5/10", iconClass: "text-chart-5", showOmr: true },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground">Payments & Billing</h1>
          <p className="text-muted-foreground mt-1">Manage transactions and refunds</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat, i) => (
            <Card key={stat.title} className="animate-slide-up" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "both" }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-2">{stat.title}</p>
                    <p className="text-3xl font-bold text-foreground flex items-baseline gap-1.5">
                      {stat.showOmr && <OmrSymbol size={20} />}
                      {stat.value}
                    </p>
                  </div>
                  <div className={cn("rounded-xl p-3", stat.bgClass)}>
                    <stat.icon className={cn("h-6 w-6", stat.iconClass)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
                  {s === "all" ? t("common.all") : s.charAt(0).toUpperCase() + s.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Net</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[80px]">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">
                      {t("common.noResults")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-medium">{txn.id}</TableCell>
                      <TableCell>{txn.restaurantName}</TableCell>
                      <TableCell>{txn.customerName}</TableCell>
                      <TableCell>{txn.orderId}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1"><OmrSymbol size={13} /> {txn.amount}</span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1"><OmrSymbol size={13} /> {txn.fee}</span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 font-medium"><OmrSymbol size={13} /> {txn.net}</span>
                      </TableCell>
                      <TableCell className="capitalize">{txn.method}</TableCell>
                      <TableCell>
                        <Badge className={cn("border", statusColors[txn.status])} variant="secondary">
                          {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{txn.date}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {txn.status === "completed" && (
                              <DropdownMenuItem onClick={() => handleRefund(txn)}>
                                <RotateCcw className="h-4 w-4 mr-2" /> Refund
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <AlertDialog open={dialogState.open} onOpenChange={(open) => setDialogState({ ...dialogState, open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Process Refund</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to refund transaction {dialogState.transaction?.id} for OMR {dialogState.transaction?.amount}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmRefund}>Refund</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminPaymentsPage;
