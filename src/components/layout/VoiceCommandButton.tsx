import { useState } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { VoiceCommandsDialog } from "@/components/layout/VoiceCommandsDialog";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

export function VoiceCommandButton() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { theme } = useTheme();
  
  // Add theme-specific styling
  const getButtonClasses = () => {
    switch(theme) {
      case "matrix":
        return "matrix-text";
      case "synthwave":
        return "gradient-text";
      case "cyberpunk":
        return "hover:text-yellow-500";
      case "nord":
        return "hover:text-blue-400";
      default:
        return "";
    }
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className={cn("relative", getButtonClasses())}
              onClick={() => setDialogOpen(true)}
            >
              <Mic className="size-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Voice Commands</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <VoiceCommandsDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
} 