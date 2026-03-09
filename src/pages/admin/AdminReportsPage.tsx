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
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Search, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { mockReports, type Report } from "@/data/reportsMockData";
import { toast } from "@/hooks/use-toast";

const AdminReportsPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("pending");
  const [viewReport, setViewReport] = useState<Report | null>(null);
  const [dialogState, setDialogState] = useState<{ open: boolean; action: string; report: Report | null }>({
    open: false, action: "", report: null,
  });

  const statuses = ["all", "pending", "resolved", "dismissed"];

  const filtered = mockReports.filter((r) => {
    const matchSearch = r.targetName.toLowerCase().includes(search.toLowerCase()) || 
                        r.reportedBy.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAction = (action: string, report: Report) => {
    setDialogState({ open: true, action, report });
  };

  const confirmAction = () => {
    const { action, report } = dialogState;
    if (!report) return;

    const actionMessages: Record<string, string> = {
      resolve: `Report ${report.id} marked as resolved`,
      dismiss: `Report ${report.id} dismissed`,
    };

    toast({
      title: t("common.success"),
      description: actionMessages[action] || "Action completed",
    });
    setDialogState({ open: false, action: "", report: null });
  };

  const statusColors: Record<string, string> = {
    pending: "bg-chart-5/15 text-chart-5 border-chart-5/20",
    resolved: "bg-chart-2/15 text-chart-2 border-chart-2/20",
    dismissed: "bg-muted/50 text-muted-foreground border-border",
  };

  const severityColors: Record<string, string> = {
    low: "bg-chart-3/15 text-chart-3 border-chart-3/20",
    medium: "bg-chart-5/15 text-chart-5 border-chart-5/20",
    high: "bg-destructive/15 text-destructive border-destructive/20",
  };

  const pendingCount = mockReports.filter(r => r.status === "pending").length;
  const highSeverityCount = mockReports.filter(r => r.status === "pending" && r.severity === "high").length;

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground">Reports & Moderation</h1>
          <p className="text-muted-foreground mt-1">Review flagged content and user reports</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="animate-slide-up" style={{ animationDelay: "80ms", animationFillMode: "both" }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">Pending Reports</p>
                  <p className="text-3xl font-bold text-foreground">{pendingCount}</p>
                </div>
                <div className="rounded-xl p-3 bg-chart-5/10">
                  <AlertTriangle className="h-6 w-6 text-chart-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-slide-up" style={{ animationDelay: "160ms", animationFillMode: "both" }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground mb-2">High Priority</p>
                  <p className="text-3xl font-bold text-foreground">{highSeverityCount}</p>
                </div>
                <div className="rounded-xl p-3 bg-destructive/10">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>
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
            <CardTitle>Flagged Content</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Reported By</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[200px]">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {t("common.noResults")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.id}</TableCell>
                      <TableCell className="capitalize">{report.type}</TableCell>
                      <TableCell>{report.targetName}</TableCell>
                      <TableCell>{report.reportedBy}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{report.reason}</TableCell>
                      <TableCell>
                        <Badge className={cn("border", severityColors[report.severity])} variant="secondary">
                          {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.date}</TableCell>
                      <TableCell>
                        <Badge className={cn("border", statusColors[report.status])} variant="secondary">
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setViewReport(report)}>
                            View
                          </Button>
                          {report.status === "pending" && (
                            <>
                              <Button size="sm" variant="default" onClick={() => handleAction("resolve", report)}>
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => handleAction("dismiss", report)}>
                                <XCircle className="h-4 w-4" />
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

        <Dialog open={!!viewReport} onOpenChange={() => setViewReport(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Report Details - {viewReport?.id}</DialogTitle>
              <DialogDescription>Full information about this report</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">Type</p>
                <p className="text-sm text-muted-foreground capitalize">{viewReport?.type}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Target</p>
                <p className="text-sm text-muted-foreground">{viewReport?.targetName} (ID: {viewReport?.targetId})</p>
              </div>
              <div>
                <p className="text-sm font-medium">Reported By</p>
                <p className="text-sm text-muted-foreground">{viewReport?.reportedBy}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Reason</p>
                <p className="text-sm text-muted-foreground">{viewReport?.reason}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Description</p>
                <p className="text-sm text-muted-foreground">{viewReport?.description}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <p className="text-sm font-medium">Severity</p>
                  <Badge className={cn("border mt-1", severityColors[viewReport?.severity || "low"])} variant="secondary">
                    {viewReport?.severity?.charAt(0).toUpperCase()}{viewReport?.severity?.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge className={cn("border mt-1", statusColors[viewReport?.status || "pending"])} variant="secondary">
                    {viewReport?.status?.charAt(0).toUpperCase()}{viewReport?.status?.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <AlertDialog open={dialogState.open} onOpenChange={(open) => setDialogState({ ...dialogState, open })}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{dialogState.action === "resolve" ? "Resolve Report" : "Dismiss Report"}</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to {dialogState.action} report {dialogState.report?.id}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmAction}>
                {dialogState.action === "resolve" ? "Resolve" : "Dismiss"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminReportsPage;
