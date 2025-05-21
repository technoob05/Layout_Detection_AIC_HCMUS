import { useRef, useEffect, useState, ReactNode, Children } from "react";
import { motion, useInView, useAnimation, Variant } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollAnimationProps {
  children: ReactNode;
  type?: "fade" | "slide-up" | "slide-down" | "slide-left" | "slide-right" | "zoom" | "flip" | "none";
  duration?: number;
  delay?: number;
  className?: string;
  threshold?: number;
  once?: boolean;
  stagger?: boolean;
  staggerChildren?: number;
  staggerDirection?: "forward" | "reverse";
}

export function ScrollAnimation({
  children,
  type = "fade",
  duration = 0.6,
  delay = 0,
  className,
  threshold = 0.1,
  once = true,
  stagger = false,
  staggerChildren = 0.1,
  staggerDirection = "forward",
  ...props
}: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    once, 
    amount: threshold 
  });
  const controls = useAnimation();
  
  // Get variants based on animation type
  const getVariants = () => {
    const variants: {
      hidden: Variant;
      visible: Variant;
    } = {
      hidden: {},
      visible: {}
    };
    
    // Base transition
    const transition = {
      duration,
      delay,
      ease: "easeOut"
    };
    
    switch (type) {
      case "fade":
        variants.hidden = { opacity: 0 };
        variants.visible = { 
          opacity: 1,
          transition
        };
        break;
        
      case "slide-up":
        variants.hidden = { y: 50, opacity: 0 };
        variants.visible = { 
          y: 0, 
          opacity: 1,
          transition
        };
        break;
        
      case "slide-down":
        variants.hidden = { y: -50, opacity: 0 };
        variants.visible = { 
          y: 0, 
          opacity: 1,
          transition
        };
        break;
        
      case "slide-left":
        variants.hidden = { x: 50, opacity: 0 };
        variants.visible = { 
          x: 0, 
          opacity: 1,
          transition
        };
        break;
        
      case "slide-right":
        variants.hidden = { x: -50, opacity: 0 };
        variants.visible = { 
          x: 0, 
          opacity: 1,
          transition
        };
        break;
        
      case "zoom":
        variants.hidden = { scale: 0.8, opacity: 0 };
        variants.visible = { 
          scale: 1, 
          opacity: 1,
          transition
        };
        break;
        
      case "flip":
        variants.hidden = { rotateY: 90, opacity: 0 };
        variants.visible = { 
          rotateY: 0, 
          opacity: 1,
          transition: {
            ...transition,
            type: "spring",
            stiffness: 100
          }
        };
        break;
        
      default:
        break;
    }
    
    // Add stagger effect if requested
    if (stagger) {
      variants.visible = {
        ...variants.visible,
        transition: {
          ...transition,
          staggerChildren,
          delayChildren: delay,
          staggerDirection: staggerDirection === "reverse" ? -1 : 1,
        }
      };
    }
    
    return variants;
  };
  
  // Create child variants if using stagger
  const getChildVariants = () => {
    if (!stagger) return {};
    
    // Base child animation - fade in
    const childVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1, 
        y: 0,
        transition: {
          duration: duration * 0.8
        }
      }
    };
    
    return childVariants;
  };
  
  // Trigger animation when in view
  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else if (!once) {
      controls.start("hidden");
    }
  }, [isInView, controls, once]);
  
  // Get variants based on animation type
  const variants = getVariants();
  const childVariants = getChildVariants();
  
  // For staggered children, we need to wrap each child
  const renderChildren = () => {
    if (!stagger || !Array.isArray(children)) {
      return children;
    }
    
    return Children.map(children, (child) => (
      <motion.div variants={childVariants} className="w-full">
        {child}
      </motion.div>
    ));
  };
  
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={variants}
      className={cn("w-full", className)}
      {...props}
    >
      {renderChildren()}
    </motion.div>
  );
} 