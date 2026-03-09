import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { useState } from "react";

const TimeFilter = () => {
  const [selectedTime, setSelectedTime] = useState<string>("all");

  const timeSlots = [
    { id: "all", label: "All", icon: null },
    { id: "now", label: "Available Now", icon: Clock },
    { id: "lunch", label: "Lunch", icon: null },
    { id: "dinner", label: "Dinner", icon: null },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {timeSlots.map((slot) => {
        const Icon = slot.icon;
        const isActive = selectedTime === slot.id;
        
        return (
          <Badge
            key={slot.id}
            variant={isActive ? "default" : "outline"}
            className="cursor-pointer flex-shrink-0 px-4 py-2 gap-1.5"
            onClick={() => setSelectedTime(slot.id)}
          >
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {slot.label}
          </Badge>
        );
      })}
    </div>
  );
};

export default TimeFilter;
