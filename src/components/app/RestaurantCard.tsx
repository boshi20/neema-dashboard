import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Star, UserPlus } from "lucide-react";
import { useState } from "react";

interface RestaurantCardProps {
  name: string;
  location: string;
  rating: number;
  totalReviews: number;
  image?: string;
}

const RestaurantCard = ({
  name,
  location,
  rating,
  totalReviews,
  image,
}: RestaurantCardProps) => {
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-14 h-14">
            <AvatarImage src={image || "/placeholder.svg"} alt={name} />
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base line-clamp-1">{name}</h3>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="line-clamp-1">{location}</span>
            </div>
            <div className="flex items-center gap-1 text-xs mt-1">
              <Star className="w-3 h-3 fill-primary text-primary" />
              <span className="font-medium">{rating}</span>
              <span className="text-muted-foreground">({totalReviews})</span>
            </div>
          </div>

          <Button
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            className="gap-1.5"
            onClick={() => setIsFollowing(!isFollowing)}
          >
            <UserPlus className="w-4 h-4" />
            {isFollowing ? "Following" : "Follow"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RestaurantCard;
