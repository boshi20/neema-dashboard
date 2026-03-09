import { Outlet } from "react-router-dom";
import BottomNav from "@/components/app/BottomNav";

const AppPreviewLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background pb-16">
      <div className="max-w-md mx-auto">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
};

export default AppPreviewLayout;
