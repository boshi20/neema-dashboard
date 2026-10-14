import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { listMeals, listOrders } from "@/lib/api";
import { getProfileCompletion } from "@/lib/restaurantProfile";
import { cn } from "@/lib/utils";

type Notice = {
  id: string;
  title: string;
  body: string;
  href: string;
};

export function NotificationsMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { restaurant } = useAuth();
  const restaurantId = restaurant?.id;

  const { data: meals = [] } = useQuery({
    queryKey: ["meals", restaurantId],
    queryFn: () => listMeals(restaurantId!),
    enabled: Boolean(restaurantId),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["orders", restaurantId],
    queryFn: () => listOrders(restaurantId!),
    enabled: Boolean(restaurantId),
  });

  const notices = useMemo(() => {
    const items: Notice[] = [];
    const now = Date.now();
    const todayKey = new Date().toDateString();

    const awaiting = orders.filter((o) => o.status === "ready_for_pickup");
    if (awaiting.length > 0) {
      items.push({
        id: "awaiting-pickup",
        title: t("shell.notifyAwaitingTitle", { count: awaiting.length }),
        body: t("shell.notifyAwaitingBody"),
        href: "/orders",
      });
    }

    const todayOrders = orders.filter(
      (o) => new Date(o.createdAt).toDateString() === todayKey
    );
    if (todayOrders.length > 0) {
      items.push({
        id: "today-orders",
        title: t("shell.notifyTodayTitle", { count: todayOrders.length }),
        body: t("shell.notifyTodayBody"),
        href: "/orders",
      });
    }

    const expiringSoon = meals.filter((m) => {
      if (!m.available) return false;
      const end = new Date(`${m.pickupDate}T${m.pickupTo}:00`);
      const ms = end.getTime() - now;
      return ms > 0 && ms < 2 * 60 * 60 * 1000;
    });
    if (expiringSoon.length > 0) {
      items.push({
        id: "expiring",
        title: t("shell.notifyExpiringTitle", { count: expiringSoon.length }),
        body: t("shell.notifyExpiringBody"),
        href: "/listings",
      });
    }

    const completion = getProfileCompletion(restaurant);
    if (!completion.complete) {
      items.push({
        id: "profile",
        title: t("shell.notifyProfileTitle"),
        body: t("shell.notifyProfileBody", { percent: completion.percent }),
        href: "/restaurant",
      });
    }

    return items;
  }, [meals, orders, restaurant, t]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={t("shell.notifications")}>
          <Bell className="h-5 w-5" />
          {notices.length > 0 ? (
            <span
              className={cn(
                "absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-card"
              )}
            />
          ) : null}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>{t("shell.notifications")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notices.length === 0 ? (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            {t("shell.noNotifications")}
          </div>
        ) : (
          notices.map((n) => (
            <DropdownMenuItem
              key={n.id}
              className="flex flex-col items-start gap-0.5 py-2.5"
              onClick={() => navigate(n.href)}
            >
              <span className="text-sm font-medium">{n.title}</span>
              <span className="text-xs text-muted-foreground">{n.body}</span>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
