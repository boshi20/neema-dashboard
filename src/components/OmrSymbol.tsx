import omrSymbol from "@/assets/omr-symbol.png";

interface OmrSymbolProps {
  className?: string;
  size?: number;
  muted?: boolean;
}

const OmrSymbol = ({ className, size = 20, muted = false }: OmrSymbolProps) => (
  <img
    src={omrSymbol}
    alt="OMR"
    className={className}
    style={{
      width: size,
      height: size,
      display: "inline-block",
      verticalAlign: "middle",
      filter: muted
        ? "brightness(0) saturate(0%) invert(50%)"
        : "brightness(0) saturate(100%) invert(27%) sepia(96%) saturate(1200%) hue-rotate(150deg) brightness(92%) contrast(101%)",
      opacity: muted ? 0.7 : 1,
    }}
  />
);

export default OmrSymbol;
