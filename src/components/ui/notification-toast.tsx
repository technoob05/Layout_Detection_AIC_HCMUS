import { Check, Info, AlertCircle, X, Bell } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type NotificationType = "success" | "info" | "warning" | "error";

interface NotificationAction {
  label: string;
  onClick: () => void;
}

interface NotificationOptions {
  type?: NotificationType;
  duration?: number;
  action?: NotificationAction;
  description?: string;
  position?: "top-center" | "bottom-center" | "top-right" | "bottom-right";
}

// Toast styling based on type
const getToastStyles = (type: NotificationType) => {
  switch (type) {
    case "success":
      return {
        icon: <Check className="size-4" />,
        className: "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/50 dark:text-green-200 dark:border-green-800/30"
      };
    case "info":
      return {
        icon: <Info className="size-4" />,
        className: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-800/30"
      };
    case "warning":
      return {
        icon: <Bell className="size-4" />,
        className: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800/30"
      };
    case "error":
      return {
        icon: <AlertCircle className="size-4" />,
        className: "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-200 dark:border-red-800/30"
      };
    default:
      return {
        icon: <Info className="size-4" />,
        className: "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-800/30"
      };
  }
};

export function showNotification(
  message: string,
  options: NotificationOptions = {}
) {
  const { 
    type = "info", 
    duration = 5000, 
    action, 
    description, 
    position = "top-center" 
  } = options;
  
  const { icon, className } = getToastStyles(type);
  
  toast(
    (data) => {
      // Safely destructure with fallbacks to prevent errors
      const id = data?.id ?? 'toast';
      const onClose = data?.onClose ?? (() => {});
      
      return (
        <div className={cn(
          "flex items-start gap-3 rounded-md border px-4 py-3 shadow-sm",
          className
        )}>
          <div className={cn(
            "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
            type === "success" ? "bg-green-100 dark:bg-green-900/50" : null,
            type === "info" ? "bg-blue-100 dark:bg-blue-900/50" : null,
            type === "warning" ? "bg-amber-100 dark:bg-amber-900/50" : null,
            type === "error" ? "bg-red-100 dark:bg-red-900/50" : null,
          )}>
            {icon}
          </div>
          
          <div className="flex-1">
            <div className="font-medium leading-none tracking-tight">
              {message}
            </div>
            {description && (
              <div className="mt-1 text-sm opacity-90">
                {description}
              </div>
            )}
            {action && (
              <button
                onClick={action.onClick}
                className="mt-2 text-xs font-medium underline underline-offset-4 opacity-90 hover:opacity-100"
              >
                {action.label}
              </button>
            )}
          </div>
          
          <button
            onClick={onClose}
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full opacity-50 transition-opacity hover:opacity-100"
          >
            <X className="size-4" />
          </button>
        </div>
      );
    },
    {
      duration,
      position,
    }
  );
}

// Export convenience functions for different notification types
export const Notification = {
  success: (message: string, options?: Omit<NotificationOptions, "type">) => 
    showNotification(message, { ...options, type: "success" }),
  
  info: (message: string, options?: Omit<NotificationOptions, "type">) => 
    showNotification(message, { ...options, type: "info" }),
  
  warning: (message: string, options?: Omit<NotificationOptions, "type">) => 
    showNotification(message, { ...options, type: "warning" }),
  
  error: (message: string, options?: Omit<NotificationOptions, "type">) => 
    showNotification(message, { ...options, type: "error" }),
}; 