export interface Transaction {
  id: string;
  restaurantName: string;
  customerName: string;
  orderId: string;
  amount: number;
  fee: number;
  net: number;
  method: "card" | "wallet" | "cash";
  status: "completed" | "pending" | "refunded" | "failed";
  date: string;
}

export const mockTransactions: Transaction[] = [
  { id: "TXN-001", restaurantName: "Neema Restaurant", customerName: "Yusuf Ali", orderId: "PO-001", amount: 24, fee: 1.2, net: 22.8, method: "card", status: "completed", date: "2026-03-08 14:23" },
  { id: "TXN-002", restaurantName: "Green Bites", customerName: "Mariam Said", orderId: "PO-002", amount: 14, fee: 0.7, net: 13.3, method: "wallet", status: "pending", date: "2026-03-08 15:45" },
  { id: "TXN-003", restaurantName: "Zero Waste Kitchen", customerName: "Nasser Hamed", orderId: "PO-003", amount: 18, fee: 0.9, net: 17.1, method: "card", status: "completed", date: "2026-03-08 12:10" },
  { id: "TXN-004", restaurantName: "Neema Restaurant", customerName: "Layla Ahmed", orderId: "PO-004", amount: 27, fee: 1.35, net: 25.65, method: "card", status: "completed", date: "2026-03-07 18:30" },
  { id: "TXN-005", restaurantName: "Taste Rescue", customerName: "Hassan Omar", orderId: "PO-005", amount: 15, fee: 0.75, net: 14.25, method: "cash", status: "refunded", date: "2026-03-07 11:15" },
  { id: "TXN-006", restaurantName: "Green Bites", customerName: "Amina Rashid", orderId: "PO-006", amount: 22, fee: 1.1, net: 20.9, method: "wallet", status: "completed", date: "2026-03-07 09:20" },
  { id: "TXN-007", restaurantName: "Zero Waste Kitchen", customerName: "Salim Khamis", orderId: "PO-007", amount: 11, fee: 0.55, net: 10.45, method: "card", status: "pending", date: "2026-03-08 16:05" },
  { id: "TXN-008", restaurantName: "Neema Restaurant", customerName: "Khalid Nasser", orderId: "PO-008", amount: 19, fee: 0.95, net: 18.05, method: "wallet", status: "failed", date: "2026-03-06 20:40" },
];
