import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  /** When provided, the selected file is uploaded and the resulting URL is
   *  passed to onChange. Falls back to an inline base64 data URL otherwise. */
  onUpload?: (file: File) => Promise<string>;
  className?: string;
  label?: string;
  aspectRatio?: "square" | "wide";
}

const ImageUpload = ({
  value,
  onChange,
  onUpload,
  className,
  label,
  aspectRatio = "wide",
}: ImageUploadProps) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (onUpload) {
      setUploading(true);
      try {
        const url = await onUpload(file);
        onChange(url);
      } catch (error) {
        console.error("Image upload failed", error);
      } finally {
        setUploading(false);
      }
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && <span className="text-sm font-medium">{label}</span>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFileChange(e)}
      />
      {value ? (
        <div className={cn("relative rounded-lg overflow-hidden", aspectRatio === "square" ? "h-32 w-32" : "h-32 w-full")}>
          <img src={value} alt="" className="h-full w-full object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6"
            onClick={() => onChange("")}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-accent/50 text-muted-foreground hover:bg-accent transition-colors cursor-pointer",
            aspectRatio === "square" ? "h-32 w-32" : "h-32 w-full"
          )}
        >
          {uploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-6 w-6" />
              <span className="text-xs">{t("common.uploadImage")}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default ImageUpload;
