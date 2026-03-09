export interface PendingMeal {
  id: string;
  restaurantId: string;
  restaurantName: string;
  mealName: string;
  mealNameAr: string;
  category: string;
  price: number;
  image: string;
  submittedDate: string;
  status: "pending" | "approved" | "rejected";
}

export const mockPendingMeals: PendingMeal[] = [
  { id: "M-001", restaurantId: "r1", restaurantName: "SavePlate Restaurant", mealName: "Chicken Shawarma Wrap", mealNameAr: "شاورما دجاج", category: "mainCourse", price: 12, image: "", submittedDate: "2026-03-08", status: "pending" },
  { id: "M-002", restaurantId: "r2", restaurantName: "Green Bites", mealName: "Vegan Buddha Bowl", mealNameAr: "بودا بول نباتي", category: "salads", price: 14, image: "", submittedDate: "2026-03-08", status: "pending" },
  { id: "M-003", restaurantId: "r3", restaurantName: "FreshMeal Hub", mealName: "Grilled Fish Plate", mealNameAr: "صحن سمك مشوي", category: "mainCourse", price: 18, image: "", submittedDate: "2026-03-07", status: "pending" },
  { id: "M-004", restaurantId: "r1", restaurantName: "SavePlate Restaurant", mealName: "Kunafa", mealNameAr: "كنافة", category: "desserts", price: 9, image: "", submittedDate: "2026-03-07", status: "approved" },
  { id: "M-005", restaurantId: "r5", restaurantName: "Zero Waste Kitchen", mealName: "Mixed Grill", mealNameAr: "مشاوي مشكلة", category: "mainCourse", price: 22, image: "", submittedDate: "2026-03-06", status: "rejected" },
];
