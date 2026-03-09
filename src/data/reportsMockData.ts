export interface Report {
  id: string;
  type: "meal" | "user" | "restaurant" | "review";
  targetName: string;
  targetId: string;
  reportedBy: string;
  reason: string;
  description: string;
  date: string;
  status: "pending" | "resolved" | "dismissed";
  severity: "low" | "medium" | "high";
}

export const mockReports: Report[] = [
  { id: "RPT-001", type: "meal", targetName: "Chicken Shawarma", targetId: "M-001", reportedBy: "Yusuf Ali", reason: "Misleading description", description: "Meal photo doesn't match what was received", date: "2026-03-08", status: "pending", severity: "medium" },
  { id: "RPT-002", type: "user", targetName: "Hassan Omar", targetId: "u8", reportedBy: "Mariam Said", reason: "Abusive behavior", description: "Sent inappropriate messages to restaurant", date: "2026-03-08", status: "pending", severity: "high" },
  { id: "RPT-003", type: "restaurant", targetName: "Taste Rescue", targetId: "r4", reportedBy: "Layla Ahmed", reason: "Poor quality", description: "Meal was expired and made me sick", date: "2026-03-07", status: "pending", severity: "high" },
  { id: "RPT-004", type: "review", targetName: "Review by Nasser", targetId: "REV-102", reportedBy: "SavePlate Restaurant", reason: "Fake review", description: "This user never ordered from us", date: "2026-03-07", status: "resolved", severity: "low" },
  { id: "RPT-005", type: "meal", targetName: "Vegan Bowl", targetId: "M-002", reportedBy: "Amina Rashid", reason: "Not vegetarian", description: "Found meat in supposedly vegan meal", date: "2026-03-06", status: "resolved", severity: "high" },
  { id: "RPT-006", type: "user", targetName: "Salim Khamis", targetId: "u9", reportedBy: "Green Bites", reason: "No-show", description: "Didn't pick up order multiple times", date: "2026-03-06", status: "dismissed", severity: "low" },
];
