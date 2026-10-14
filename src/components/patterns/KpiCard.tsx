import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type TrendDirection = "higherIsBetter" | "lowerIsBetter" | "neutral";

interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;
  iconBgClassName?: string;
  /** Percent change vs previous period; null = no previous data. */
  changePercent?: number | null;
  direction?: TrendDirection;
  context?: string;
  noPreviousLabel?: string;
  className?: string;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  iconClassName = "text-primary",
  iconBgClassName = "bg-primary/10",
  changePercent,
  direction = "higherIsBetter",
  context,
  noPreviousLabel,
  className,
}: KpiCardProps) {
  const hasChange = changePercent != null && Number.isFinite(changePercent);
  const rising = hasChange && changePercent! > 0;
  const flat = hasChange && Math.abs(changePercent!) < 0.05;
  const good =
    direction === "neutral"
      ? true
      : direction === "higherIsBetter"
        ? rising
        : !rising;

  return (
    <div
      className={cn(
        "rounded-xl border border-border/70 bg-card p-4 shadow-xs",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="mt-1.5 text-2xl font-semibold tracking-tight text-foreground tabular-nums">
            {value}
          </div>
        </div>
        {Icon ? (
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
              iconBgClassName
            )}
          >
            <Icon className={cn("h-4 w-4", iconClassName)} />
          </div>
        ) : null}
      </div>

      {hasChange ? (
        <p
          className={cn(
            "mt-2 flex items-center gap-1 text-xs font-medium",
            flat
              ? "text-muted-foreground"
              : good
                ? "text-primary"
                : "text-destructive"
          )}
        >
          {!flat &&
            (rising ? (
              <ArrowUpRight className="h-3.5 w-3.5" />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" />
            ))}
          <span>
            {Math.abs(changePercent!).toFixed(1)}%
            {context ? ` ${context}` : ""}
          </span>
        </p>
      ) : noPreviousLabel ? (
        <p className="mt-2 text-xs text-muted-foreground">{noPreviousLabel}</p>
      ) : null}
    </div>
  );
}
