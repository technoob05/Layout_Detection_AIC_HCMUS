import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animationEffect?: "tilt" | "float" | "3d" | "scale" | "none";
  intensity?: "low" | "medium" | "high";
  className?: string;
}

export function AnimatedCard({
  children,
  animationEffect = "none",
  intensity = "medium",
  className,
  ...props
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  
  // Intensity multipliers
  const getIntensityMultiplier = () => {
    switch (intensity) {
      case "low": return 0.5;
      case "high": return 2;
      default: return 1;
    }
  };
  
  const intensityMultiplier = getIntensityMultiplier();
  
  // Track mouse position for 3D effect
  useEffect(() => {
    if (animationEffect !== "3d" || !isHovered) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      setPosition({ x, y });
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [animationEffect, isHovered]);
  
  // Animation variants based on effect type
  const getAnimationProps = () => {
    switch (animationEffect) {
      case "tilt":
        return {
          whileHover: { 
            rotateX: -5 * intensityMultiplier, 
            rotateY: 5 * intensityMultiplier,
            scale: 1.02
          },
          transition: { 
            type: "spring", 
            stiffness: 300, 
            damping: 15 
          }
        };
      case "float":
        return {
          animate: {
            y: [0, -10 * intensityMultiplier, 0],
            transition: {
              duration: 3,
              repeat: Infinity,
              repeatType: "mirror" as const
            }
          }
        };
      case "scale":
        return {
          whileHover: { 
            scale: 1.03, 
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)" 
          },
          transition: { 
            type: "spring", 
            stiffness: 400, 
            damping: 10 
          }
        };
      case "3d":
        return {
          animate: isHovered ? {
            rotateX: -position.y * 0.01 * intensityMultiplier,
            rotateY: position.x * 0.01 * intensityMultiplier,
            boxShadow: `
              ${position.x * 0.01 * intensityMultiplier}px 
              ${position.y * 0.01 * intensityMultiplier}px 
              20px rgba(0, 0, 0, 0.1)
            `,
            scale: 1.02
          } : {},
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 15,
          }
        };
      default:
        return {};
    }
  };
  
  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow",
        {
          "transform-gpu perspective-1000": animationEffect === "3d" || animationEffect === "tilt"
        },
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...getAnimationProps()}
      {...props}
    >
      {children}
    </motion.div>
  );
} 