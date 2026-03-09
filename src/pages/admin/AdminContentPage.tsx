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
import { Search, CheckCircle, XCircle, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import OmrSymbol from "@/components/OmrSymbol";
import { mockPendingMeals, type PendingMeal } from "@/data/contentMockData";
import { toast } from "@/hooks/use-toast";

const AdminContentPage = () => {
  const { t } = useTranslation();
  const { isRTL, currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [dialogState, setDialogState] = useState<{ open: boolean; action: string; meal: PendingMeal | null }>({
    open: false, action: "", meal: null,
  });

  const statuses = ["all", "pending", "approved", "rejected"];

  const filtered = mockPendingMeals.filter((m) => {
    const matchSearch = m.mealName.toLowerCase().includes(search.toLowerCase()) || 
                        m.restaurantName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAction = (action: string, meal: PendingMeal) => {
    setDialogState({ open: true, action, meal });
  };

  const confirmAction = () => {
    const { action, meal } = dialogState;
    if (!meal) return;

    const actionMessages: Record<string, string> = {
      approve: `${meal.mealName} approved`,
      reject: `${meal.mealName} rejected`,
    };

    toast({
      title: t("common.success"),
      description: actionMessages[action] || "Action completed",
    });
    setDialogState({ open: false, action: "", meal: null });
  };

  const statusColors: Record<string, string> = {
    pending: "bg-chart-5/15 text-chart-5 border-chart-5/20",
    approved: "bg-chart-2/15 text-chart-2 border-chart-2/20",
    rejected: "bg-destructive/15 text-destructive border-destructive/20",
  };

  const pendingCount = mockPendingMeals.filter(m => m.status === "pending").length;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground">Content Moderation</h1>
          <p className="text-muted-foreground mt-1">Review and approve meals submitted by restaurants</p>
        </div>

        <Card className="animate-slide-up" style={{ animationDelay: "80ms", animationFillMode: "both" }}>
          <CardContent className="flex items-center gap-4 p-5">
            <div className="rounded-xl p-3 bg-chart-5/10">
              <UtensilsCrossed className="h-6 w-6 text-chart-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Approval</p>
              <p className="text-2xl font-bold text-foreground">{pendingCount} meals</p>
            </div>
          </CardContent>
        </Card>

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
            <CardTitle>Meal Submissions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meal</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[180px]">{t("common.actions")}</TableHead>
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
                  filtered.map((meal) => (
                    <TableRow key={meal.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-lg bg-accent/50 flex items-center justify-center">
                            <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{isAr && meal.mealNameAr ? meal.mealNameAr : meal.mealName}</p>
                            <p className="text-xs text-muted-foreground">ID: {meal.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{meal.restaurantName}</TableCell>
                      <TableCell className="capitalize">{meal.category.replace(/([A-Z])/g, ' $1').trim()}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1"><OmrSymbol size={13} /> {meal.price}</span>
                      </TableCell>
                      <TableCell>{meal.submittedDate}</TableCell>
                      <TableCell>
                        <Badge className={cn("border", statusColors[meal.status])} variant="secondary">
                          {meal.status.charAt(0).toUpperCase() + meal.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {meal.status === "pending" && (
                            <>
                              <Button size="sm" variant="default" onClick={() => handleAction("approve", meal)}>
                                <CheckCircle className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleAction("reject", meal)}>
                                <XCircle className="h-4 w-4 mr-1" /> Reject
                              </Button>
                            </>
                          )}
                        </div>
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
              <AlertDialogTitle>{dialogState.action === "approve" ? "Approve Meal" : "Reject Meal"}</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {dialogState.action} "{dialogState.meal?.mealName}"?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmAction}>
                {dialogState.action === "approve" ? "Approve" : "Reject"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminContentPage;
