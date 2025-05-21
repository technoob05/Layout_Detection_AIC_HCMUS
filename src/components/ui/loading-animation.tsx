import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Define the variants for the loading animation
const loadingAnimationVariants = cva(
  "relative inline-flex justify-center items-center",
  {
    variants: {
      variant: {
        default: "text-primary",
        secondary: "text-secondary",
        destructive: "text-destructive",
        muted: "text-muted-foreground",
      },
      size: {
        default: "size-8",
        sm: "size-6",
        lg: "size-12",
        xl: "size-16",
        full: "w-full h-full min-h-[100px]",
      },
      type: {
        spinner: "",
        pulse: "",
        dots: "",
        skeleton: "bg-muted rounded-md animate-pulse",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      type: "spinner",
    },
  }
);

export interface LoadingAnimationProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loadingAnimationVariants> {
  text?: string;
}

export function LoadingAnimation({
  className,
  variant,
  size,
  type,
  text,
  ...props
}: LoadingAnimationProps) {
  return (
    <div className={cn(loadingAnimationVariants({ variant, size, type }), className)} {...props}>
      {type === 'spinner' && (
        <div className="animate-spin rounded-full border-4 border-muted border-t-current size-full"></div>
      )}
      
      {type === 'pulse' && (
        <div className="flex gap-2 items-center justify-center">
          <div className="size-3 bg-current rounded-full animate-pulse"></div>
          <div className="size-3 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="size-3 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )}
      
      {type === 'dots' && (
        <div className="flex gap-1">
          <div className="size-2 bg-current rounded-full animate-bounce"></div>
          <div className="size-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          <div className="size-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )}
      
      {type === 'skeleton' && (
        <div className="w-full h-full"></div>
      )}
      
      {text && (
        <span className="mt-2 text-xs text-muted-foreground">{text}</span>
      )}
    </div>
  );
}

// Skeleton loading component for convenient use
export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
} 