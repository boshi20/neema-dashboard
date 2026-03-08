import omrSymbol from "@/assets/omr-symbol.png";

interface OmrSymbolProps {
  className?: string;
  size?: number;
}

const OmrSymbol = ({ className, size = 16 }: OmrSymbolProps) => (
  <img
    src={omrSymbol}
    alt="OMR"
    className={className}
    style={{
      width: size,
      height: size,
      display: "inline-block",
      verticalAlign: "middle",
      filter: "brightness(0) saturate(100%) invert(27%) sepia(96%) saturate(1200%) hue-rotate(150deg) brightness(92%) contrast(101%)",
    }}
  />
);

export default OmrSymbol;
