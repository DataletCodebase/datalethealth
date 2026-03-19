import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, useSpring } from "motion/react";

interface ParallaxLayerProps {
  children: ReactNode;
  speed?: number;   // negative = slower (behind), positive = faster (ahead). default -0.15
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Wraps any element in a scroll-driven parallax layer.
 * Uses the parent container's scroll offset, smooth-spring'd.
 */
export function ParallaxLayer({
  children,
  speed = -0.15,
  className = "",
  style,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Map scroll 0→1 through speed factor → pixel offset
  const rawY = useTransform(scrollYProgress, [0, 1], [
    -speed * 200,
    speed * 200,
  ]);
  const y = useSpring(rawY, { damping: 30, stiffness: 120, mass: 0.5 });

  return (
    <motion.div ref={ref} style={{ y, ...style }} className={`relative ${className}`}>
      {children}
    </motion.div>
  );
}