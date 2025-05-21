import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import React from "react";

interface AnimatedIconProps {
  icon: LucideIcon;
  size?: number;
  color?: string;
  animationEffect?: "pulse" | "spin" | "bounce" | "shake" | "morph" | "none";
  className?: string;
  onClick?: () => void;
  isActive?: boolean;
}

export function AnimatedIcon({
  icon: Icon,
  size = 24,
  color,
  animationEffect = "none",
  className,
  onClick,
  isActive = false,
  ...props
}: AnimatedIconProps) {
  // Animation variants based on effect type
  const getAnimationProps = () => {
    switch (animationEffect) {
      case "pulse":
        return {
          animate: {
            scale: [1, 1.2, 1],
            opacity: [1, 0.8, 1],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }
        };
      case "spin":
        return {
          animate: {
            rotate: 360,
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "linear"
            }
          }
        };
      case "bounce":
        return {
          animate: {
            y: ["0%", "-20%", "0%"],
            transition: {
              duration: 0.6,
              repeat: Infinity,
              repeatType: "reverse" as const,
              ease: "easeInOut"
            }
          }
        };
      case "shake":
        return {
          animate: {
            x: [0, -5, 5, -5, 5, 0],
            transition: {
              duration: 0.5,
              repeat: Infinity,
              repeatType: "reverse" as const,
              ease: "easeInOut",
              repeatDelay: 1
            }
          }
        };
      case "morph":
        return {
          animate: {
            scale: [1, 1.1, 1, 0.9, 1],
            rotate: [0, 5, 0, -5, 0],
            transition: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }
        };
      default:
        return {};
    }
  };
  
  // Click animation variants
  const clickVariants = {
    initial: { scale: 1 },
    click: { scale: 0.85, transition: { duration: 0.1 } }
  };
  
  // Hover state
  const [isHovered, setIsHovered] = React.useState(false);
  
  return (
    <motion.div
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        {
          "cursor-pointer": onClick !== undefined
        },
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      initial="initial"
      whileTap={onClick ? "click" : undefined}
      variants={onClick ? clickVariants : undefined}
      {...getAnimationProps()}
      onClick={onClick}
      {...props}
    >
      <Icon
        size={size}
        className={cn({ 
          "text-primary": isActive && !color,
          "text-foreground": !isActive && !color
        })}
        style={{ 
          color: color,
          transition: "color 0.2s ease, transform 0.2s ease"
        }}
      />
      
      {/* Subtle glow effect on hover */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 rounded-full bg-primary/10 dark:bg-primary/20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1.5 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
} 