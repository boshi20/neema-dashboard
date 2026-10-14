import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export type StatusKind =
  | "pending_payment"
  | "confirmed"
  | "ready_for_pickup"
  | "picked_up"
  | "cancelled_by_user"
  | "cancelled_by_restaurant"
  | "expired"
  | "active"
  | "paused"
  | "draft"
  | "sold_out"
  | "archived"
  | "approved"
  | "pending_review"
  | "rejected"
  | "suspended";

const STYLES: Record<StatusKind, string> = {
  pending_payment: "bg-amber-50 text-amber-800 border-amber-200/80",
  confirmed: "bg-sky-50 text-sky-800 border-sky-200/80",
  ready_for_pickup: "bg-teal-50 text-teal-800 border-teal-200/80",
  picked_up: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  cancelled_by_user: "bg-red-50 text-red-800 border-red-200/80",
  cancelled_by_restaurant: "bg-red-50 text-red-800 border-red-200/80",
  expired: "bg-slate-100 text-slate-600 border-slate-200/80",
  active: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  paused: "bg-amber-50 text-amber-800 border-amber-200/80",
  draft: "bg-slate-100 text-slate-600 border-slate-200/80",
  sold_out: "bg-orange-50 text-orange-800 border-orange-200/80",
  archived: "bg-slate-100 text-slate-500 border-slate-200/80",
  approved: "bg-emerald-50 text-emerald-800 border-emerald-200/80",
  pending_review: "bg-amber-50 text-amber-800 border-amber-200/80",
  rejected: "bg-red-50 text-red-800 border-red-200/80",
  suspended: "bg-slate-100 text-slate-600 border-slate-200/80",
};

const DOT: Record<StatusKind, string> = {
  pending_payment: "bg-amber-500",
  confirmed: "bg-sky-500",
  ready_for_pickup: "bg-teal-500",
  picked_up: "bg-emerald-500",
  cancelled_by_user: "bg-red-500",
  cancelled_by_restaurant: "bg-red-500",
  expired: "bg-slate-400",
  active: "bg-emerald-500",
  paused: "bg-amber-500",
  draft: "bg-slate-400",
  sold_out: "bg-orange-500",
  archived: "bg-slate-400",
  approved: "bg-emerald-500",
  pending_review: "bg-amber-500",
  rejected: "bg-red-500",
  suspended: "bg-slate-400",
};

function labelKey(status: StatusKind): string {
  switch (status) {
    case "pending_payment":
      return "status.pending";
    case "confirmed":
      return "status.confirmed";
    case "ready_for_pickup":
      return "status.readyForPickup";
    case "picked_up":
      return "status.pickedUp";
    case "cancelled_by_user":
    case "cancelled_by_restaurant":
      return "status.cancelled";
    case "expired":
      return "status.expired";
    case "active":
      return "status.active";
    case "paused":
      return "status.paused";
    case "draft":
      return "status.draft";
    case "sold_out":
      return "status.soldOut";
    case "archived":
      return "status.archived";
    case "approved":
      return "status.approved";
    case "pending_review":
      return "status.pendingReview";
    case "rejected":
      return "status.rejected";
    case "suspended":
      return "status.suspended";
    default:
      return status;
  }
}

interface StatusBadgeProps {
  status: StatusKind | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const { t } = useTranslation();
  const kind = (status in STYLES ? status : "expired") as StatusKind;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        STYLES[kind],
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT[kind])} aria-hidden />
      {t(labelKey(kind))}
    </span>
  );
}
