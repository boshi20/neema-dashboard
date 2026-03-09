import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import MealCard from "@/components/app/MealCard";
import { mockMeals } from "@/data/mockData";
import { Search, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

const AppPreviewHome = () => {
  const { t } = useTranslation();

  const categories = [
    { id: "all", label: "All" },
    { id: "mainCourse", label: "Main Course" },
    { id: "appetizers", label: "Appetizers" },
    { id: "desserts", label: "Desserts" },
    { id: "beverages", label: "Beverages" },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass sticky top-0 z-40 border-b border-border/40 backdrop-blur-lg">
        <div className="p-4 space-y-3">
          <h1 className="text-2xl font-bold">SavePlate</h1>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("Search meals...")}
              className="pl-10 pr-4 h-12 rounded-full"
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <Button variant="outline" size="sm" className="gap-2 flex-shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </Button>
            {categories.map((category) => (
              <Badge
                key={category.id}
                variant={category.id === "all" ? "default" : "outline"}
                className="cursor-pointer flex-shrink-0 px-4 py-2"
              >
                {category.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Meals Grid */}
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Available Meals</h2>
          <span className="text-sm text-muted-foreground">
            {mockMeals.filter(m => m.available).length} meals
          </span>
        </div>

        <div className="space-y-4">
          {mockMeals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AppPreviewHome;
