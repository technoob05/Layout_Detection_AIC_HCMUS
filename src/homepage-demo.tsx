import { Button } from "@/components/ui/button";
import { Notification } from "@/components/ui/notification-toast";

export function NotificationDemo() {
  const showSuccessNotification = () => {
    Notification.success("Document translated successfully!", {
      description: "Translation has been saved to your history."
    });
  };
  
  const showInfoNotification = () => {
    Notification.info("New feature available", {
      description: "Try the new PDF Chat feature to interact with your documents.",
      action: {
        label: "Try it now",
        onClick: () => {
          console.log("Action clicked!");
          // Navigation would happen here in a real app
          window.location.href = "/chat";
        }
      }
    });
  };
  
  const showWarningNotification = () => {
    Notification.warning("Connection unstable", {
      description: "Your internet connection appears to be unstable. Some features may be limited."
    });
  };
  
  const showErrorNotification = () => {
    Notification.error("Failed to upload document", {
      description: "Please check your file format and try again.",
      action: {
        label: "Try again",
        onClick: () => console.log("Retry clicked!")
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={showSuccessNotification}
        className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300 dark:border-green-800/30"
      >
        Success Toast
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={showInfoNotification}
        className="bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800/30"
      >
        Info Toast
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={showWarningNotification}
        className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:hover:bg-amber-900/50 dark:text-amber-300 dark:border-amber-800/30"
      >
        Warning Toast
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={showErrorNotification}
        className="bg-red-100 hover:bg-red-200 text-red-800 border-red-300 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 dark:border-red-800/30"
      >
        Error Toast
      </Button>
    </div>
  );
} 