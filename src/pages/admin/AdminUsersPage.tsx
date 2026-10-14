import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, MoreHorizontal, Users } from "lucide-react";
import { AdminShell } from "@/components/admin/AdminShell";
import { PageHeader } from "@/components/patterns/PageHeader";
import { SearchInput } from "@/components/patterns/SearchInput";
import { EmptyState } from "@/components/patterns/EmptyState";
import { TableSkeleton } from "@/components/patterns/skeletons";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { listAdminUsers, setUserRole, type AdminUser, type UserRole } from "@/lib/adminApi";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const ROLES: UserRole[] = ["customer", "restaurant_owner", "admin"];

const ROLE_STYLES: Record<UserRole, string> = {
  customer: "bg-slate-100 text-slate-600 border-slate-200/80",
  restaurant_owner: "bg-sky-50 text-sky-800 border-sky-200/80",
  admin: "bg-primary/10 text-primary border-primary/20",
};

function RoleBadge({ role }: { role: UserRole }) {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        ROLE_STYLES[role]
      )}
    >
      {t(`admin.roles.${role}`)}
    </span>
  );
}

const AdminUsersPage = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const { toast } = useToast();
  const { admin } = useAdminAuth();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [pendingChange, setPendingChange] = useState<{
    user: AdminUser;
    role: UserRole;
  } | null>(null);

  const { data: users = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-users"],
    queryFn: listAdminUsers,
  });

  const mutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      setUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      setPendingChange(null);
      toast({ title: t("admin.roleUpdated") });
    },
    onError: () => {
      toast({ title: t("admin.actionFailed"), variant: "destructive" });
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (!q) return true;
      return (
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone ?? "").toLowerCase().includes(q)
      );
    });
  }, [users, search, roleFilter]);

  const renderRoleMenu = (user: AdminUser) => {
    if (user.id === admin?.id) return null;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={t("admin.changeRole")}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{t("admin.changeRole")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ROLES.map((role) => (
            <DropdownMenuItem
              key={role}
              disabled={role === user.role}
              onClick={() => setPendingChange({ user, role })}
            >
              {t(`admin.roles.${role}`)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <AdminShell title={t("admin.users")}>
      <div className="space-y-6">
        <PageHeader title={t("admin.users")} description={t("admin.usersSubtitle")} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            containerClassName="w-full sm:max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("admin.searchUsers")}
          />
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as "all" | UserRole)}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {ROLES.map((role) => (
                <SelectItem key={role} value={role}>
                  {t(`admin.roles.${role}`)}
                </SelectItem>
              ))}
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
          <EmptyState icon={Users} title={t("admin.noUsers")} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("admin.name")}</TableHead>
                    <TableHead>{t("settings.email")}</TableHead>
                    <TableHead>{t("settings.phone")}</TableHead>
                    <TableHead>{t("admin.role")}</TableHead>
                    <TableHead>{t("admin.joined")}</TableHead>
                    <TableHead className="text-end">{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                            {u.full_name.slice(0, 1).toUpperCase()}
                          </div>
                          <span className="max-w-[200px] truncate text-sm font-medium text-foreground">
                            {u.full_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">
                        {u.email}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {u.phone || "—"}
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={u.role} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(u.created_at, currentLanguage)}
                      </TableCell>
                      <TableCell className="text-end">{renderRoleMenu(u)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="space-y-3 md:hidden">
              {filtered.map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3 shadow-xs"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                    {u.full_name.slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{u.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                    <div className="mt-1">
                      <RoleBadge role={u.role} />
                    </div>
                  </div>
                  {renderRoleMenu(u)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AlertDialog
        open={Boolean(pendingChange)}
        onOpenChange={(open) => {
          if (!open) setPendingChange(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.confirmRoleTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingChange
                ? t("admin.confirmRoleBody", {
                    name: pendingChange.user.full_name,
                    role: t(`admin.roles.${pendingChange.role}`),
                  })
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={mutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (pendingChange) {
                  mutation.mutate({
                    userId: pendingChange.user.id,
                    role: pendingChange.role,
                  });
                }
              }}
            >
              {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminShell>
  );
};

export default AdminUsersPage;
