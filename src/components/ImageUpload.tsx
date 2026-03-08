import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ImagePlus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
  label?: string;
  aspectRatio?: "square" | "wide";
}

const ImageUpload = ({ value, onChange, className, label, aspectRatio = "wide" }: ImageUploadProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <p className="text-sm font-medium">{label}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      {value ? (
        <div className="relative group">
          <img
            src={value}
            alt="Upload preview"
            className={cn(
              "w-full rounded-lg border border-border object-cover",
              aspectRatio === "square" ? "h-32 w-32" : "h-32"
            )}
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onChange("")}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-accent/50 text-muted-foreground hover:bg-accent transition-colors cursor-pointer",
            aspectRatio === "square" ? "h-32 w-32" : "h-32 w-full"
          )}
        >
          <ImagePlus className="h-6 w-6" />
          <span className="text-xs">{t("common.uploadImage")}</span>
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
