export interface Meal {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  originalPrice: number;
  discountedPrice: number;
  quantity: number;
  availableQuantity: number;
  category: string;
  image: string;
  available: boolean;
  pickupDate: string;
  pickupFrom: string;
  pickupTo: string;
  createdAt: string;
}

export interface Order {
  id: string;
  customerName: string;
  items: { mealName: string; quantity: number }[];
  total: number;
  status: "pending" | "confirmed" | "picked_up" | "cancelled";
  date: string;
}
