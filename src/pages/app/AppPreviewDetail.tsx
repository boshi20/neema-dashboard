import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import OmrSymbol from "@/components/OmrSymbol";
import RestaurantCard from "@/components/app/RestaurantCard";
import FavoriteButton from "@/components/app/FavoriteButton";
import { ArrowLeft, Clock, MapPin, Minus, Plus, ShoppingCart, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { mockMeals } from "@/data/mockData";
import { useLanguage } from "@/hooks/useLanguage";
import { AspectRatio } from "@/components/ui/aspect-ratio";

const AppPreviewDetail = () => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const { currentLanguage } = useLanguage();
  const isArabic = currentLanguage === "ar";

  // Using first available meal as example
  const meal = mockMeals[0];
  const mealName = isArabic ? meal.nameAr : meal.name;
  const description = isArabic ? meal.descriptionAr : meal.description;

  const discountPercent = Math.round(
    ((meal.originalPrice - meal.discountedPrice) / meal.originalPrice) * 100
  );

  const total = meal.discountedPrice * quantity;

  return (
    <div className="min-h-screen pb-24">
      {/* Header - Clean background */}
      <div className="bg-card sticky top-0 z-40 border-b border-border backdrop-blur-lg">
        <div className="p-4 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/app/preview/home")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold line-clamp-1 flex-1">{mealName}</h1>
          <FavoriteButton mealId={meal.id} />
        </div>
      </div>

      {/* Hero Image - Larger */}
      <AspectRatio ratio={4 / 3}>
        <img
          src="/placeholder.svg"
          alt={mealName}
          className="object-cover w-full h-full"
        />
        {/* Larger circular discount badge */}
        <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground border-none h-20 w-20 rounded-full flex flex-col items-center justify-center p-0 shadow-xl">
          <span className="text-3xl font-bold leading-none">{discountPercent}%</span>
          <span className="text-xs font-medium">OFF</span>
        </Badge>
      </AspectRatio>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Restaurant Card with Follow */}
        <RestaurantCard
          name="Al Madina Restaurant"
          location="Muscat, Oman"
          rating={4.8}
          totalReviews={234}
        />

        {/* Meal Info */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <h2 className="text-xl font-bold">{mealName}</h2>
            <p className="text-sm text-muted-foreground">{description}</p>
            
            {/* Rating */}
            <div className="flex items-center gap-2 pt-2">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-primary text-primary"
                  />
                ))}
              </div>
              <span className="text-sm font-medium">4.9</span>
              <span className="text-sm text-muted-foreground">(127 reviews)</span>
            </div>
          </CardContent>
        </Card>

        {/* Pickup Time & Stock */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4 space-y-1">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Pickup Time</span>
              </div>
              <p className="font-semibold">
                {meal.pickupFrom} - {meal.pickupTo}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 space-y-1">
              <div className="text-xs text-muted-foreground">In Stock</div>
              <p className="font-semibold text-primary">
                {meal.availableQuantity} left
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Price Breakdown */}
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Original Price</span>
              <div className="flex items-center gap-1 line-through text-muted-foreground">
                <OmrSymbol size={16} muted />
                <span>{meal.originalPrice}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-semibold">Discounted Price</span>
              <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                <OmrSymbol size={20} />
                <span>{meal.discountedPrice}</span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-sm font-semibold text-green-600">
                You Save
              </span>
              <div className="flex items-center gap-1 font-bold text-green-600">
                <OmrSymbol size={16} />
                <span>{meal.originalPrice - meal.discountedPrice}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quantity Selector */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Quantity</span>
              <div className="flex items-center gap-3">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-12 text-center text-xl font-bold">
                  {quantity}
                </span>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() =>
                    setQuantity(Math.min(meal.availableQuantity, quantity + 1))
                  }
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Footer - Cleaner */}
      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-border backdrop-blur-lg p-4 shadow-lg">
        <div className="max-w-md mx-auto flex items-center gap-4">
          <div className="flex-1">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="flex items-center gap-1 text-2xl font-bold text-primary">
              <OmrSymbol size={20} />
              <span>{total}</span>
            </div>
          </div>
          <Button size="lg" className="gap-2 flex-1">
            <ShoppingCart className="w-5 h-5" />
            Add to Cart
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppPreviewDetail;
