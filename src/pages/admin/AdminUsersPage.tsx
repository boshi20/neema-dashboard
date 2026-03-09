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
import { Search, User, MoreVertical, Edit, Ban, Trash2, Key } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";
import { mockPlatformUsers, type PlatformUser } from "@/data/adminMockData";
import { toast } from "@/hooks/use-toast";

const AdminUsersPage = () => {
  const { t } = useTranslation();
  const { isRTL } = useLanguage();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dialogState, setDialogState] = useState<{ open: boolean; action: string; user: PlatformUser | null }>({
    open: false, action: "", user: null,
  });

  const handleAction = (action: string, user: PlatformUser) => {
    setDialogState({ open: true, action, user });
  };

  const confirmAction = () => {
    const { action, user } = dialogState;
    if (!user) return;

    const actionMessages: Record<string, string> = {
      suspend: `${user.name} suspended`,
      delete: `${user.name} deleted`,
      edit: `${user.name} details saved`,
      resetPassword: `Password reset link sent to ${user.email}`,
    };

    toast({
      title: t("common.success"),
      description: actionMessages[action] || "Action completed",
    });
    setDialogState({ open: false, action: "", user: null });
  };

  const roles = ["all", "customer", "restaurant_owner"];

  const filtered = mockPlatformUsers.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleColors: Record<string, string> = {
    customer: "bg-chart-2/15 text-chart-2 border-chart-2/20",
    restaurant_owner: "bg-primary/15 text-primary border-primary/20",
  };

  const statusColors: Record<string, string> = {
    active: "bg-primary/15 text-primary border-primary/20",
    suspended: "bg-destructive/15 text-destructive border-destructive/20",
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold text-foreground">{t("admin.userManagement")}</h1>
          <p className="text-muted-foreground mt-1">{t("admin.manageUsers")}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className={cn("absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
            <Input placeholder={t("common.search")} value={search} onChange={(e) => setSearch(e.target.value)} className={cn(isRTL ? "pr-10" : "pl-10")} />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              {roles.map((r) => (
                <SelectItem key={r} value={r}>
                  {r === "all" ? t("common.all") : t(`admin.roles.${r}`)}
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
                  <TableHead>{t("admin.userName")}</TableHead>
                  <TableHead>{t("settings.email")}</TableHead>
                  <TableHead>{t("admin.role")}</TableHead>
                  <TableHead>{t("admin.totalOrdersCol")}</TableHead>
                  <TableHead>{t("admin.joinedDate")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead className="w-[80px]">{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {t("common.noResults")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-accent/50 flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge className={cn("border", roleColors[user.role])} variant="secondary">
                          {t(`admin.roles.${user.role}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.totalOrders}</TableCell>
                      <TableCell>{user.joinedDate}</TableCell>
                      <TableCell>
                        <Badge className={cn("border", statusColors[user.status])} variant="secondary">
                          {t(`admin.status.${user.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleAction("edit", user)}>
                              <Edit className="h-4 w-4 mr-2" /> {t("common.edit")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleAction("resetPassword", user)}>
                              <Key className="h-4 w-4 mr-2" /> {t("common.resetPassword")}
                            </DropdownMenuItem>
                            {user.status !== "suspended" && (
                              <DropdownMenuItem onClick={() => handleAction("suspend", user)}>
                                <Ban className="h-4 w-4 mr-2" /> {t("common.suspend")}
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleAction("delete", user)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" /> {t("common.delete")}
                            </DropdownMenuItem>
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
              <AlertDialogTitle>{t(`common.${dialogState.action}`)}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("common.confirmAction", { name: dialogState.user?.name || "" })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmAction}>{t("common.confirm")}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AdminUsersPage;
