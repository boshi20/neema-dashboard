import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FavoriteButtonProps {
  mealId: string;
  className?: string;
}

const FavoriteButton = ({ mealId, className }: FavoriteButtonProps) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite logic with backend
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "rounded-full bg-background/80 backdrop-blur-sm hover:bg-background transition-all",
        className
      )}
      onClick={handleToggle}
    >
      <Heart
        className={cn(
          "w-5 h-5 transition-all",
          isFavorite
            ? "fill-primary text-primary scale-110"
            : "text-foreground"
        )}
      />
    </Button>
  );
};

export default FavoriteButton;
