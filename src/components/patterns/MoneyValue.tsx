import { cn } from "@/lib/utils";
import OmrSymbol from "@/components/OmrSymbol";
import { formatOmr } from "@/lib/analytics";
import { useLanguage } from "@/hooks/useLanguage";

interface MoneyValueProps {
  value: number;
  size?: number;
  className?: string;
  muted?: boolean;
}

/** OMR amount with tabular digits — never rounds to whole numbers. */
export function MoneyValue({ value, size = 14, className, muted }: MoneyValueProps) {
  const { currentLanguage } = useLanguage();
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 tabular-nums font-semibold text-foreground",
        muted && "text-muted-foreground font-medium",
        className
      )}
    >
      <OmrSymbol size={size} muted={muted} />
      {formatOmr(value, currentLanguage)}
    </span>
  );
}
