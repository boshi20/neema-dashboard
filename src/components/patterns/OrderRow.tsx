import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoneyValue } from "@/components/patterns/MoneyValue";
import { StatusBadge } from "@/components/patterns/StatusBadge";
import { useLanguage } from "@/hooks/useLanguage";
import type { OwnerOrder, ReservationStatus } from "@/lib/api";
import { cn } from "@/lib/utils";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0 || name === "—") return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface OrderActions {
  onAction: (order: OwnerOrder) => void;
  nextLabel: (status: ReservationStatus) => string | null;
  actionPending?: boolean;
}

interface OrderRowProps extends OrderActions {
  order: OwnerOrder;
}

export function OrderRow({ order, onAction, nextLabel, actionPending }: OrderRowProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";
  const mealName = isAr && order.mealNameAr ? order.mealNameAr : order.mealName;
  const label = nextLabel(order.status);

  return (
    <tr className="border-b border-border/60 last:border-0 hover:bg-muted/40 transition-colors">
      <td className="px-4 py-3">
        <span className="font-mono text-xs font-medium text-muted-foreground">
          #{order.id.slice(0, 8).toUpperCase()}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials(order.customerName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {order.customerName}
            </p>
            <p className="truncate text-xs text-muted-foreground" dir="ltr">
              {order.customerPhone}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="truncate text-sm text-foreground max-w-[180px]">{mealName}</p>
        <p className="text-xs text-muted-foreground">1 {t("orders.item")}</p>
      </td>
      <td className="px-4 py-3 text-sm tabular-nums text-muted-foreground">1</td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {new Date(order.createdAt).toLocaleString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </td>
      <td className="px-4 py-3">
        <MoneyValue value={order.total} size={12} />
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={order.status} />
      </td>
      <td className="px-4 py-3 text-end">
        {label ? (
          <Button
            size="sm"
            variant={order.status === "ready_for_pickup" ? "default" : "outline"}
            className={cn(
              order.status === "ready_for_pickup" &&
                "gradient-primary shadow-glow hover:opacity-90"
            )}
            disabled={actionPending}
            onClick={() => onAction(order)}
          >
            {label}
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </td>
    </tr>
  );
}

interface OrderCardProps extends OrderActions {
  order: OwnerOrder;
  className?: string;
}

export function OrderCard({
  order,
  onAction,
  nextLabel,
  actionPending,
  className,
}: OrderCardProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";
  const mealName = isAr && order.mealNameAr ? order.mealNameAr : order.mealName;
  const label = nextLabel(order.status);

  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card p-4 shadow-xs space-y-3",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs font-medium text-muted-foreground">
            #{order.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
            {mealName}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="flex items-center gap-2.5">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {initials(order.customerName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{order.customerName}</p>
          <p className="truncate text-xs text-muted-foreground" dir="ltr">
            {order.customerPhone}
          </p>
        </div>
        <div className="ms-auto shrink-0">
          <MoneyValue value={order.total} size={12} />
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {new Date(order.createdAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span>1 {t("orders.item")}</span>
      </div>

      {label ? (
        <Button
          size="sm"
          className={cn(
            "w-full",
            order.status === "ready_for_pickup" &&
              "gradient-primary shadow-glow hover:opacity-90"
          )}
          variant={order.status === "ready_for_pickup" ? "default" : "outline"}
          disabled={actionPending}
          onClick={() => onAction(order)}
        >
          {label}
        </Button>
      ) : null}
    </div>
  );
}

/** Compact row used on the Overview "Today's Orders" list. */
export function OrderListItem({
  order,
  className,
}: {
  order: OwnerOrder;
  className?: string;
}) {
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";
  const mealName = isAr && order.mealNameAr ? order.mealNameAr : order.mealName;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border/60 px-3 py-2.5",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground">
            #{order.id.slice(0, 8).toUpperCase()}
          </span>
          <span className="truncate text-sm font-medium text-foreground">
            {mealName}
          </span>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {order.customerName}
          {" · "}
          {new Date(order.createdAt).toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <StatusBadge status={order.status} />
    </div>
  );
}
