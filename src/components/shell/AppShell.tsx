import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AppSidebar } from "./AppSidebar";
import { TopHeader } from "./TopHeader";
import { MobileNav } from "./MobileNav";
import { useLanguage } from "@/hooks/useLanguage";
import { cn } from "@/lib/utils";

interface AppShellProps {
  children: React.ReactNode;
  title: string;
}

export function AppShell({ children, title }: AppShellProps) {
  const { isRTL } = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={cn("flex min-h-screen", isRTL && "flex-row-reverse")}>
      <div className="hidden md:flex">
        <AppSidebar />
      </div>

      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side={isRTL ? "right" : "left"}
          className="w-[280px] p-0"
        >
          <AppSidebar onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopHeader
          title={title}
          leading={
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          }
        />

        <main className="flex-1 overflow-auto pb-20 md:pb-0">
          <div className="mx-auto w-full max-w-[1400px] animate-fade-in p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      <MobileNav />
    </div>
  );
}

export default AppShell;
