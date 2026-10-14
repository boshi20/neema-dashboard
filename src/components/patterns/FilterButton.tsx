import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterButtonProps extends React.ComponentProps<typeof Button> {
  active?: boolean;
}

export function FilterButton({
  active,
  className,
  children,
  ...props
}: FilterButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "gap-2",
        active && "border-primary/40 bg-primary/5 text-primary",
        className
      )}
      {...props}
    >
      <Filter className="h-3.5 w-3.5" />
      {children}
    </Button>
  );
}
