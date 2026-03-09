import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import OmrSymbol from "@/components/OmrSymbol";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface CartItemProps {
  id: string;
  name: string;
  restaurant: string;
  price: number;
  initialQuantity: number;
  image?: string;
}

const CartItem = ({ name, restaurant, price, initialQuantity }: CartItemProps) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img
            src="/placeholder.svg"
            alt={name}
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
          />

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold line-clamp-1">{name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {restaurant}
            </p>

            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 font-bold text-primary">
                <OmrSymbol size={16} />
                <span>{price}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="w-8 text-center font-semibold">{quantity}</span>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CartItem;
