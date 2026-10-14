import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DateRangePreset } from "@/lib/analytics";

const PRESETS: DateRangePreset[] = [
  "today",
  "last7",
  "last30",
  "thisMonth",
  "lastMonth",
  "custom",
];

interface DateRangeSelectorProps {
  preset: DateRangePreset;
  onPresetChange: (preset: DateRangePreset) => void;
  customFrom: string;
  customTo: string;
  onCustomFromChange: (value: string) => void;
  onCustomToChange: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function DateRangeSelector({
  preset,
  onPresetChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
  open,
  onOpenChange,
}: DateRangeSelectorProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="grid gap-1.5">
        <Label className="text-xs text-muted-foreground">
          {t("analytics.range.label")}
        </Label>
        <Select
          value={preset}
          onValueChange={(v) => onPresetChange(v as DateRangePreset)}
          open={open}
          onOpenChange={onOpenChange}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PRESETS.map((p) => (
              <SelectItem key={p} value={p}>
                {t(`analytics.range.${p}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {preset === "custom" ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">
              {t("analytics.range.from")}
            </Label>
            <Input
              type="date"
              value={customFrom}
              max={customTo}
              onChange={(e) => onCustomFromChange(e.target.value)}
              className="w-full sm:w-40"
            />
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs text-muted-foreground">
              {t("analytics.range.to")}
            </Label>
            <Input
              type="date"
              value={customTo}
              min={customFrom}
              onChange={(e) => onCustomToChange(e.target.value)}
              className="w-full sm:w-40"
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
