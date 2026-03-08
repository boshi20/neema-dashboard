export interface Restaurant {
  id: string;
  name: string;
  nameAr: string;
  owner: string;
  email: string;
  phone: string;
  city: string;
  status: "active" | "suspended" | "pending";
  totalMeals: number;
  totalOrders: number;
  revenue: number;
  joinedDate: string;
  logo: string;
}

export interface PlatformOrder {
  id: string;
  restaurantName: string;
  customerName: string;
  items: string;
  total: number;
  status: "pending" | "confirmed" | "picked_up" | "cancelled";
  date: string;
}

export interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: "customer" | "restaurant_owner";
  status: "active" | "suspended";
  joinedDate: string;
  totalOrders: number;
}

export const mockRestaurants: Restaurant[] = [
  {
    id: "r1", name: "SavePlate Restaurant", nameAr: "مطعم سيف بليت",
    owner: "Ahmed Ali", email: "ahmed@saveplate.com", phone: "+968 9123 4567",
    city: "Muscat", status: "active", totalMeals: 12, totalOrders: 156, revenue: 2840,
    joinedDate: "2025-11-15", logo: "",
  },
  {
    id: "r2", name: "Green Bites", nameAr: "جرين بايتس",
    owner: "Sara Mohammed", email: "sara@greenbites.com", phone: "+968 9234 5678",
    city: "Salalah", status: "active", totalMeals: 8, totalOrders: 89, revenue: 1560,
    joinedDate: "2025-12-01", logo: "",
  },
  {
    id: "r3", name: "FreshMeal Hub", nameAr: "فريش ميل هب",
    owner: "Omar Hassan", email: "omar@freshmeal.com", phone: "+968 9345 6789",
    city: "Sohar", status: "pending", totalMeals: 0, totalOrders: 0, revenue: 0,
    joinedDate: "2026-03-05", logo: "",
  },
  {
    id: "r4", name: "Taste Rescue", nameAr: "تيست ريسكيو",
    owner: "Fatima Khalid", email: "fatima@tasterescue.com", phone: "+968 9456 7890",
    city: "Nizwa", status: "suspended", totalMeals: 5, totalOrders: 34, revenue: 620,
    joinedDate: "2026-01-10", logo: "",
  },
  {
    id: "r5", name: "Zero Waste Kitchen", nameAr: "مطبخ صفر هدر",
    owner: "Khalid Nasser", email: "khalid@zerowaste.com", phone: "+968 9567 8901",
    city: "Muscat", status: "active", totalMeals: 15, totalOrders: 210, revenue: 3920,
    joinedDate: "2025-10-20", logo: "",
  },
];

export const mockPlatformOrders: PlatformOrder[] = [
  { id: "PO-001", restaurantName: "SavePlate Restaurant", customerName: "Yusuf Ali", items: "Chicken Shawarma x2", total: 24, status: "confirmed", date: "2026-03-08" },
  { id: "PO-002", restaurantName: "Green Bites", customerName: "Mariam Said", items: "Vegan Bowl x1, Juice x1", total: 14, status: "pending", date: "2026-03-08" },
  { id: "PO-003", restaurantName: "Zero Waste Kitchen", customerName: "Nasser Hamed", items: "Grilled Fish Plate x1", total: 18, status: "picked_up", date: "2026-03-08" },
  { id: "PO-004", restaurantName: "SavePlate Restaurant", customerName: "Layla Ahmed", items: "Kunafa x3", total: 27, status: "confirmed", date: "2026-03-07" },
  { id: "PO-005", restaurantName: "Taste Rescue", customerName: "Hassan Omar", items: "Mixed Grill x1", total: 15, status: "cancelled", date: "2026-03-07" },
  { id: "PO-006", restaurantName: "Green Bites", customerName: "Amina Rashid", items: "Falafel Wrap x2, Lemonade x2", total: 22, status: "picked_up", date: "2026-03-07" },
  { id: "PO-007", restaurantName: "Zero Waste Kitchen", customerName: "Salim Khamis", items: "Biryani x1", total: 11, status: "pending", date: "2026-03-08" },
];

export const mockPlatformUsers: PlatformUser[] = [
  { id: "u1", name: "Yusuf Ali", email: "yusuf@email.com", role: "customer", status: "active", joinedDate: "2025-12-10", totalOrders: 23 },
  { id: "u2", name: "Mariam Said", email: "mariam@email.com", role: "customer", status: "active", joinedDate: "2026-01-05", totalOrders: 12 },
  { id: "u3", name: "Ahmed Ali", email: "ahmed@saveplate.com", role: "restaurant_owner", status: "active", joinedDate: "2025-11-15", totalOrders: 0 },
  { id: "u4", name: "Sara Mohammed", email: "sara@greenbites.com", role: "restaurant_owner", status: "active", joinedDate: "2025-12-01", totalOrders: 0 },
  { id: "u5", name: "Nasser Hamed", email: "nasser@email.com", role: "customer", status: "suspended", joinedDate: "2026-02-14", totalOrders: 5 },
  { id: "u6", name: "Layla Ahmed", email: "layla@email.com", role: "customer", status: "active", joinedDate: "2026-01-20", totalOrders: 18 },
  { id: "u7", name: "Omar Hassan", email: "omar@freshmeal.com", role: "restaurant_owner", status: "active", joinedDate: "2026-03-05", totalOrders: 0 },
  { id: "u8", name: "Hassan Omar", email: "hassan@email.com", role: "customer", status: "active", joinedDate: "2026-02-28", totalOrders: 7 },
];
