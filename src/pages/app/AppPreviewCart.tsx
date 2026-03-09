import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import OmrSymbol from "@/components/OmrSymbol";
import CartItem from "@/components/app/CartItem";
import { ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AppPreviewCart = () => {
  const navigate = useNavigate();

  // Mock cart data
  const cartItems = [
    {
      id: "1",
      name: "Chicken Shawarma Plate",
      restaurant: "Al Madina Restaurant",
      price: 12,
      quantity: 2,
    },
    {
      id: "2",
      name: "Falafel Wrap",
      restaurant: "Al Madina Restaurant",
      price: 7,
      quantity: 1,
    },
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const originalTotal = 55; // Mock original price
  const savings = originalTotal - subtotal;

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="glass sticky top-0 z-40 border-b border-border/40 backdrop-blur-lg">
        <div className="p-4">
          <h1 className="text-2xl font-bold">Shopping Cart</h1>
          <p className="text-sm text-muted-foreground">
            {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
          </p>
        </div>
      </div>

      {/* Cart Items */}
      <div className="p-4 space-y-3">
        {cartItems.map((item) => (
          <CartItem
            key={item.id}
            id={item.id}
            name={item.name}
            restaurant={item.restaurant}
            price={item.price}
            initialQuantity={item.quantity}
          />
        ))}
      </div>

      {/* Summary Card */}
      <div className="p-4">
        <Card>
          <CardContent className="p-4 space-y-3">
            <h3 className="font-semibold">Order Summary</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <div className="flex items-center gap-1 font-medium">
                  <OmrSymbol size={14} />
                  <span>{subtotal}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Original Price</span>
                <div className="flex items-center gap-1 line-through text-muted-foreground">
                  <OmrSymbol size={14} muted />
                  <span>{originalTotal}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-green-600">You Save</span>
                <div className="flex items-center gap-1 font-bold text-green-600">
                  <OmrSymbol size={14} />
                  <span>{savings}</span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="font-bold text-lg">Total</span>
              <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                <OmrSymbol size={20} />
                <span>{subtotal}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-16 left-0 right-0 glass border-t border-border/40 backdrop-blur-lg p-4">
        <div className="max-w-md mx-auto">
          <Button
            size="lg"
            className="w-full gap-2"
            onClick={() => alert("Proceeding to checkout...")}
          >
            <ShoppingBag className="w-5 h-5" />
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppPreviewCart;
