import { CommandSearch } from "./CommandSearch";
import { NotificationsMenu } from "./NotificationsMenu";
import { AccountMenu } from "./AccountMenu";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { cn } from "@/lib/utils";

interface TopHeaderProps {
  title: string;
  className?: string;
  leading?: React.ReactNode;
}

export function TopHeader({ title, className, leading }: TopHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border/70 bg-card/90 px-4 backdrop-blur-md sm:px-6",
        className
      )}
    >
      {leading}
      <h1 className="min-w-0 flex-1 truncate text-base font-semibold text-foreground md:text-lg">
        {title}
      </h1>
      <div className="flex items-center gap-1 sm:gap-2">
        <CommandSearch />
        <NotificationsMenu />
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>
        <AccountMenu />
      </div>
    </header>
  );
}
