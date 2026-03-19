interface Avatar3DProps {
  src: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  glow?: string; // hex color for glow
  shape?: "circle" | "rounded" | "squircle";
  className?: string;
  objectPosition?: string;
}

const sizeMap = {
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-24 h-24",
  xl: "w-36 h-36",
};

export function Avatar3D({
  src,
  alt = "Avatar",
  size = "md",
  glow = "#3DFFC0",
  shape = "circle",
  className = "",
  objectPosition = "center top",
}: Avatar3DProps) {
  const shapeClass =
    shape === "circle"
      ? "rounded-full"
      : shape === "squircle"
      ? "rounded-[28%]"
      : "rounded-2xl";

  return (
    <div className={`relative inline-flex shrink-0 ${sizeMap[size]} ${className}`}>
      {/* Outer glow ring */}
      <div
        className={`absolute -inset-[3px] ${shapeClass} opacity-60 blur-[6px]`}
        style={{ background: `radial-gradient(circle, ${glow}60 0%, ${glow}00 70%)` }}
      />
      {/* Soft ring border */}
      <div
        className={`absolute inset-0 ${shapeClass} border`}
        style={{ borderColor: glow + "40" }}
      />
      {/* Image */}
      <img
        src={src}
        alt={alt}
        className={`relative z-10 w-full h-full ${shapeClass} object-cover`}
        style={{ objectPosition }}
      />
    </div>
  );
}
