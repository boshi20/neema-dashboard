import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { listMeals, listOrders } from "@/lib/api";
import { useLanguage } from "@/hooks/useLanguage";

export function CommandSearch() {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";
  const navigate = useNavigate();
  const { restaurant } = useAuth();
  const restaurantId = restaurant?.id;
  const [open, setOpen] = useState(false);

  const { data: meals = [] } = useQuery({
    queryKey: ["meals", restaurantId],
    queryFn: () => listMeals(restaurantId!),
    enabled: Boolean(restaurantId) && open,
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders", restaurantId],
    queryFn: () => listOrders(restaurantId!),
    enabled: Boolean(restaurantId) && open,
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

  const mealItems = useMemo(
    () =>
      meals.slice(0, 8).map((m) => ({
        id: m.id,
        label: isAr && m.nameAr ? m.nameAr : m.name,
      })),
    [meals, isAr]
  );

  const orderItems = useMemo(
    () =>
      orders.slice(0, 8).map((o) => ({
        id: o.id,
        label: `#${o.id.slice(0, 8).toUpperCase()} · ${
          isAr && o.mealNameAr ? o.mealNameAr : o.mealName
        }`,
      })),
    [orders, isAr]
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
        <CommandInput placeholder={t("shell.searchPlaceholder")} />
        <CommandList>
          <CommandEmpty>{t("common.noResults")}</CommandEmpty>
          <CommandGroup heading={t("common.listings")}>
            {mealItems.map((m) => (
              <CommandItem key={m.id} onSelect={() => go(`/listings?listing=${m.id}`)}>
                {m.label}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading={t("common.orders")}>
            {orderItems.map((o) => (
              <CommandItem key={o.id} onSelect={() => go("/orders")}>
                {o.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
