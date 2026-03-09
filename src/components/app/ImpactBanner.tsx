import { Card, CardContent } from "@/components/ui/card";
import { Leaf, Package, TrendingDown } from "lucide-react";

const ImpactBanner = () => {
  const impactStats = [
    { icon: Package, label: "Meals Saved", value: "127", color: "text-primary" },
    { icon: TrendingDown, label: "CO₂ Prevented", value: "45kg", color: "text-primary" },
    { icon: Leaf, label: "Impact Score", value: "A+", color: "text-primary" },
  ];

  return (
    <Card className="bg-gradient-primary border-none">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold text-primary-foreground mb-3">
          Your Environmental Impact
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {impactStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <Icon className="w-5 h-5 mx-auto mb-1 text-primary-foreground/90" />
                <div className="text-lg font-bold text-primary-foreground">
                  {stat.value}
                </div>
                <div className="text-[10px] text-primary-foreground/80">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ImpactBanner;
