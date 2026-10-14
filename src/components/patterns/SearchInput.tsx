import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/hooks/useLanguage";

interface SearchInputProps extends React.ComponentProps<"input"> {
  containerClassName?: string;
}

export function SearchInput({ className, containerClassName, ...props }: SearchInputProps) {
  const { isRTL } = useLanguage();
  return (
    <div className={cn("relative", containerClassName)}>
      <Search
        className={cn(
          "pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
          isRTL ? "right-3" : "left-3"
        )}
      />
      <Input
        className={cn(isRTL ? "pr-9" : "pl-9", className)}
        {...props}
      />
    </div>
  );
}
