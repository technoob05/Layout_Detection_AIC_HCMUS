import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import type { ButtonProps } from "react-dom";
import { Slot } from "@radix-ui/react-slot";
import { buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

type AnimatedButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    animationEffect?: "bounce" | "pulse" | "ripple" | "shine" | "none";
  };

export function AnimatedButton({
  className,
  variant,
  size,
  animationEffect = "none",
  asChild = false,
  ...props
}: AnimatedButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const Comp = asChild ? Slot : motion.button;

  // Ripple effect state
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);
  let rippleCount = 0;

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(true);
    
    // For ripple effect
    if (animationEffect === "ripple") {
      const button = e.currentTarget;
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newRipple = {
        x,
        y,
        id: rippleCount++,
      };
      
      setRipples([...ripples, newRipple]);
      
      // Clean up old ripples
      setTimeout(() => {
        setRipples(prevRipples => prevRipples.filter(ripple => ripple.id !== newRipple.id));
      }, 1000);
    }
    
    if (props.onMouseDown) {
      props.onMouseDown(e);
    }
  };

  // Animation variants based on effect type
  const getAnimationProps = () => {
    switch (animationEffect) {
      case "bounce":
        return {
          whileHover: { scale: 1.05 },
          whileTap: { scale: 0.95 },
          transition: { type: "spring", stiffness: 400, damping: 10 }
        };
      case "pulse":
        return {
          whileHover: { 
            scale: [1, 1.05, 1],
            transition: { 
              repeat: Infinity,
              repeatType: "reverse" as const,
              duration: 1
            }
          }
        };
      default:
        return {};
    }
  };

  const baseClassName = cn(
    buttonVariants({ variant, size }),
    {
      "overflow-hidden": animationEffect === "ripple" || animationEffect === "shine",
      "relative": animationEffect === "ripple" || animationEffect === "shine",
    },
    className
  );

  return (
    <Comp
      data-slot="button"
      className={baseClassName}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={() => setIsPressed(false)}
      {...getAnimationProps()}
      {...props}
    >
      {props.children}
      
      {/* Ripple effect */}
      {animationEffect === "ripple" && ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full bg-white/30 dark:bg-white/20 animate-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: "translate(-50%, -50%)",
            pointerEvents: "none"
          }}
        />
      ))}
      
      {/* Shine effect */}
      {animationEffect === "shine" && isHovered && (
        <motion.span
          className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ left: "-100%" }}
          animate={{ left: "100%" }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          style={{ pointerEvents: "none" }}
        />
      )}
    </Comp>
  );
} 