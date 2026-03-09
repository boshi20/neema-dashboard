import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import OmrSymbol from "@/components/OmrSymbol";
import { Clock, MapPin, ShoppingCart } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Meal } from "@/types/meal";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

interface MealCardProps {
  meal: Meal;
}

const MealCard = ({ meal }: MealCardProps) => {
  const navigate = useNavigate();
  const { currentLanguage } = useLanguage();
  const isArabic = currentLanguage === "ar";

  const discountPercent = Math.round(
    ((meal.originalPrice - meal.discountedPrice) / meal.originalPrice) * 100
  );

  const mealName = isArabic ? meal.nameAr : meal.name;

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-[0.98]"
      onClick={() => navigate("/app/preview/detail")}
    >
      <AspectRatio ratio={16 / 10}>
        <img
          src="/placeholder.svg"
          alt={mealName}
          className="object-cover w-full h-full"
        />
        <Badge className="absolute top-2 right-2 bg-destructive">
          {discountPercent}% OFF
        </Badge>
        {meal.availableQuantity <= 3 && meal.availableQuantity > 0 && (
          <Badge className="absolute top-2 left-2 bg-orange-500">
            Only {meal.availableQuantity} left
          </Badge>
        )}
      </AspectRatio>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-1">{mealName}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            Al Madina Restaurant
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>
            {meal.pickupFrom} - {meal.pickupTo}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-2xl font-bold text-primary">
              <OmrSymbol size={20} />
              <span>{meal.discountedPrice}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground line-through">
              <OmrSymbol size={14} muted />
              <span>{meal.originalPrice}</span>
            </div>
          </div>

          <Button
            size="sm"
            className="gap-2"
            onClick={(e) => {
              e.stopPropagation();
              // Add to cart logic here
            }}
            disabled={!meal.available}
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MealCard;
