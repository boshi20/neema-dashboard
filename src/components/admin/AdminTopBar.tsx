import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Bell, LogOut, ScrollText, Search, Settings, Store, Users, UtensilsCrossed } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  fetchAdminOverview,
  listAdminListings,
  listAdminRestaurants,
  listAdminUsers,
} from "@/lib/adminApi";
import { cn } from "@/lib/utils";

function AdminSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: restaurants = [] } = useQuery({
    queryKey: ["admin-restaurants"],
    queryFn: listAdminRestaurants,
    enabled: open,
  });
  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: listAdminUsers,
    enabled: open,
  });
  const { data: listings = [] } = useQuery({
    queryKey: ["admin-listings"],
    queryFn: listAdminListings,
    enabled: open,
  });

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const go = useCallback(
    (path: string) => {
      setOpen(false);
      navigate(path);
    },
    [navigate]
  );

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="hidden gap-2 text-muted-foreground sm:inline-flex"
        onClick={() => setOpen(true)}
      >
        <Search className="h-4 w-4" />
        <span className="text-xs">{t("common.search")}</span>
        <kbd className="pointer-events-none ms-2 hidden rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline">
          ⌘K
        </kbd>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        onClick={() => setOpen(true)}
        aria-label={t("common.search")}
      >
        <Search className="h-5 w-5" />
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={t("admin.searchPlaceholder")} />
        <CommandList>
          <CommandEmpty>{t("common.noResults")}</CommandEmpty>
          <CommandGroup heading={t("admin.restaurants")}>
            {restaurants.slice(0, 6).map((r) => (
              <CommandItem
                key={r.id}
                value={`${r.name} ${r.city}`}
                onSelect={() => go(`/admin/restaurants?focus=${r.id}`)}
              >
                <Store className="me-2 h-4 w-4 text-muted-foreground" />
                {r.name}
                <span className="ms-2 text-xs text-muted-foreground">{r.city}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading={t("admin.users")}>
            {users.slice(0, 6).map((u) => (
              <CommandItem
                key={u.id}
                value={`${u.full_name} ${u.email}`}
                onSelect={() => go(`/admin/users?q=${encodeURIComponent(u.email)}`)}
              >
                <Users className="me-2 h-4 w-4 text-muted-foreground" />
                {u.full_name}
                <span className="ms-2 truncate text-xs text-muted-foreground">{u.email}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading={t("admin.listings")}>
            {listings.slice(0, 6).map((l) => (
              <CommandItem
                key={l.id}
                value={`${l.title} ${l.restaurantName}`}
                onSelect={() => go(`/admin/listings?q=${encodeURIComponent(l.title)}`)}
              >
                <UtensilsCrossed className="me-2 h-4 w-4 text-muted-foreground" />
                {l.title}
                <span className="ms-2 text-xs text-muted-foreground">{l.restaurantName}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}

function AdminPendingMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: fetchAdminOverview,
  });

  const pending = data?.pendingApprovals ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={t("admin.pendingActions")}
        >
          <Bell className="h-5 w-5" />
          {pending.length > 0 ? (
            <span
              className={cn(
                "absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card"
              )}
            />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{t("admin.pendingActions")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {pending.length === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            {t("admin.noPendingActions")}
          </div>
        ) : (
          pending.slice(0, 5).map((p) => (
            <DropdownMenuItem
              key={p.id}
              className="flex flex-col items-start gap-0.5 py-2.5"
              onClick={() => navigate(`/admin/restaurants?status=pending_review&focus=${p.id}`)}
            >
              <span className="text-sm font-medium">{p.name}</span>
              <span className="text-xs text-muted-foreground">
                {p.city} · {t("status.pendingReview")}
              </span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AdminAccountMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { admin, adminSignOut } = useAdminAuth();
  const initial = (admin?.name || "A").slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full" aria-label={t("admin.settings")}>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initial}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <p className="truncate text-sm font-semibold">{admin?.name}</p>
          <p className="truncate text-xs text-muted-foreground">{admin?.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/admin/audit")}>
          <ScrollText className="me-2 h-4 w-4" />
          {t("admin.auditLog")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
          <Settings className="me-2 h-4 w-4" />
          {t("admin.settings")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => {
            adminSignOut();
            navigate("/admin/login");
          }}
        >
          <LogOut className="me-2 h-4 w-4" />
          {t("common.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface AdminTopBarProps {
  title: string;
  leading?: React.ReactNode;
}

export function AdminTopBar({ title, leading }: AdminTopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/70 bg-card/90 px-4 backdrop-blur-md sm:px-6">
      {leading}
      <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground md:text-lg">
        {title}
      </h1>
      <div className="flex items-center gap-1 sm:gap-2">
        <AdminSearch />
        <AdminPendingMenu />
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
        <AdminAccountMenu />
      </div>
    </header>
  );
}
