import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import MealCard from "@/components/app/MealCard";
import ImpactBanner from "@/components/app/ImpactBanner";
import TimeFilter from "@/components/app/TimeFilter";
import { mockMeals } from "@/data/mockData";
import { Search, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

const AppPreviewHome = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      {/* Header - Clean white background */}
      <div className="bg-card sticky top-0 z-40 border-b border-border backdrop-blur-lg">
        <div className="p-4 space-y-3">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            SavePlate
          </h1>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("Search meals...")}
              className="pl-10 pr-4 h-12 rounded-full border-border focus-visible:ring-primary"
            />
          </div>

          {/* Time Filters */}
          <TimeFilter />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Impact Banner */}
        <ImpactBanner />
        {/* Meals Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Meals Near You</h2>
            <span className="text-sm text-muted-foreground">
              {mockMeals.filter(m => m.available).length} available
            </span>
          </div>

          <div className="space-y-4">
            {mockMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppPreviewHome;
