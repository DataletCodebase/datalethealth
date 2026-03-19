import { useRef, useState, type ReactNode, type MouseEvent } from "react";
import { motion, useSpring } from "motion/react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  intensity?: number; // degrees of max tilt, default 12
  glowColor?: string; // rgba string for spotlight
  onClick?: () => void;
}

export function TiltCard({
  children,
  className = "",
  style,
  intensity = 12,
  glowColor = "rgba(139,0,220,0.12)",
  onClick,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [spotX, setSpotX] = useState(50);
  const [spotY, setSpotY] = useState(50);
  const [hovered, setHovered] = useState(false);

  const springCfg = { damping: 20, stiffness: 260 };
  const rotateX = useSpring(0, springCfg);
  const rotateY = useSpring(0, springCfg);
  const scale = useSpring(1, { damping: 22, stiffness: 280 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    const rx = ((y / height) - 0.5) * -intensity;
    const ry = ((x / width) - 0.5) * intensity;
    rotateX.set(rx);
    rotateY.set(ry);
    setSpotX((x / width) * 100);
    setSpotY((y / height) * 100);
  };

  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
    setHovered(false);
  };

  const onEnter = () => {
    scale.set(1.015);
    setHovered(true);
  };

  return (
    <motion.div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: "preserve-3d",
        transformPerspective: 900,
        ...style,
      }}
      className={`relative cursor-pointer ${className}`}
    >
      {/* Spotlight glow */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none transition-opacity duration-300 z-10"
        style={{
          opacity: hovered ? 1 : 0,
          background: `radial-gradient(280px circle at ${spotX}% ${spotY}%, ${glowColor}, transparent 65%)`,
        }}
      />
      {children}
    </motion.div>
  );
}
