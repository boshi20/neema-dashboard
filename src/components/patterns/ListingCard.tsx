import { useTranslation } from "react-i18next";
import { MoreHorizontal, Pencil, Pause, Play, RotateCcw, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoneyValue } from "@/components/patterns/MoneyValue";
import { StatusBadge } from "@/components/patterns/StatusBadge";
import { useLanguage } from "@/hooks/useLanguage";
import type { Meal } from "@/types/meal";
import { cn } from "@/lib/utils";

interface ListingCardProps {
  meal: Meal;
  onEdit: (meal: Meal) => void;
  onToggle: (meal: Meal) => void;
  onRepost: (meal: Meal) => void;
  onArchive: (meal: Meal) => void;
  className?: string;
}

export function ListingCard({
  meal,
  onEdit,
  onToggle,
  onRepost,
  onArchive,
  className,
}: ListingCardProps) {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const isAr = currentLanguage === "ar";
  const name = isAr && meal.nameAr ? meal.nameAr : meal.name;
  const listingStatus = meal.available ? "active" : "paused";

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-xl border border-border/70 bg-card shadow-xs transition-shadow hover:shadow-sm",
        className
      )}
    >
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {meal.image ? (
          <img
            src={meal.image}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl">🍽️</div>
        )}
        <div className="absolute start-3 top-3">
          <StatusBadge status={listingStatus} />
        </div>
        <div className="absolute end-2 top-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-card/90 backdrop-blur-sm shadow-xs"
                aria-label={t("common.actions")}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => onEdit(meal)}>
                <Pencil className="me-2 h-4 w-4" />
                {t("common.edit")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onToggle(meal)}>
                {meal.available ? (
                  <>
                    <Pause className="me-2 h-4 w-4" />
                    {t("listings.pause")}
                  </>
                ) : (
                  <>
                    <Play className="me-2 h-4 w-4" />
                    {t("listings.resume")}
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRepost(meal)}>
                <RotateCcw className="me-2 h-4 w-4" />
                {t("meals.repost")}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onArchive(meal)}
              >
                <Archive className="me-2 h-4 w-4" />
                {t("listings.archive")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="space-y-2.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate text-card-title text-foreground">{name}</h3>
        </div>

        <div className="flex flex-wrap items-baseline gap-2">
          <MoneyValue value={meal.discountedPrice} size={13} />
          {meal.originalPrice > meal.discountedPrice ? (
            <span className="text-xs text-muted-foreground line-through tabular-nums">
              {meal.originalPrice.toFixed(3)}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>
            {meal.availableQuantity}/{meal.quantity} {t("listings.remaining")}
          </span>
          <span>
            {meal.pickupFrom} – {meal.pickupTo}
          </span>
        </div>

        <p className="text-meta text-muted-foreground">{meal.pickupDate}</p>
      </div>
    </article>
  );
}
