import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import OmrSymbol from "@/components/OmrSymbol";
import FavoriteButton from "@/components/app/FavoriteButton";
import { Clock, MapPin, ShoppingCart } from "lucide-react";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
      className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer active:scale-[0.98] bg-card"
      onClick={() => navigate("/app/preview/detail")}
    >
      <AspectRatio ratio={16 / 10} className="relative">
        <img
          src="/placeholder.svg"
          alt={mealName}
          className="object-cover w-full h-full"
        />
        {/* Discount Badge - Larger, circular, prominent */}
        <Badge className="absolute top-3 right-3 bg-primary text-primary-foreground border-none h-16 w-16 rounded-full flex flex-col items-center justify-center p-0 shadow-lg">
          <span className="text-2xl font-bold leading-none">{discountPercent}%</span>
          <span className="text-[10px] font-medium">OFF</span>
        </Badge>
        
        {/* Stock Badge */}
        {meal.availableQuantity <= 3 && meal.availableQuantity > 0 && (
          <Badge className="absolute top-3 left-3 bg-orange-500 border-none">
            Only {meal.availableQuantity} left
          </Badge>
        )}

        {/* Favorite Button */}
        <div className="absolute bottom-3 right-3">
          <FavoriteButton mealId={meal.id} />
        </div>
      </AspectRatio>

      <CardContent className="p-4 space-y-3">
        {/* Restaurant Info with Avatar */}
        <div className="flex items-center gap-2">
          <Avatar className="w-8 h-8">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground line-clamp-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              Al Madina Restaurant
            </p>
          </div>
        </div>

        {/* Meal Name */}
        <h3 className="font-bold text-lg line-clamp-1 -mt-1">{mealName}</h3>

        {/* Pickup Time */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {meal.pickupFrom} - {meal.pickupTo}
          </span>
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-1 text-xs text-muted-foreground line-through">
              <OmrSymbol size={12} muted />
              <span>{meal.originalPrice}</span>
            </div>
            <div className="flex items-center gap-1 text-2xl font-bold text-primary">
              <OmrSymbol size={18} />
              <span>{meal.discountedPrice}</span>
            </div>
          </div>

          <Button
            size="lg"
            className="gap-2 rounded-full px-6"
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
