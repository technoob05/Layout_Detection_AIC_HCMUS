import { KeyboardShortcut, useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Command, Keyboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/providers/theme-provider";
import { cn } from "@/lib/utils";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
  trigger,
}: KeyboardShortcutsDialogProps) {
  const { shortcuts, getShortcutDisplay } = useKeyboardShortcuts();
  const { theme } = useTheme();
  
  // Group shortcuts by scope
  const groupedShortcuts: Record<string, KeyboardShortcut[]> = {};
  
  shortcuts.forEach((shortcut) => {
    if (!groupedShortcuts[shortcut.scope]) {
      groupedShortcuts[shortcut.scope] = [];
    }
    groupedShortcuts[shortcut.scope].push(shortcut);
  });
  
  // Get scope label for display
  const getScopeLabel = (scope: string) => {
    switch (scope) {
      case "global":
        return "Global Shortcuts";
      case "editor":
        return "PDF Editor";
      case "viewer":
        return "PDF Viewer";
      case "chat":
        return "Chat Interface";
      default:
        return scope.charAt(0).toUpperCase() + scope.slice(1);
    }
  };
  
  // Custom styling based on theme
  const getThemeStyles = () => {
    switch (theme) {
      case "matrix":
        return {
          shortcutBg: "bg-primary/10 border-primary/30 text-primary",
          keyBg: "bg-primary/40 border-primary/50 text-primary"
        };
      case "synthwave":
        return {
          shortcutBg: "bg-primary/10 border-primary/30",
          keyBg: "bg-primary/30 border-primary/40"
        };
      case "cyberpunk":
        return {
          shortcutBg: "bg-yellow-950/30 border-yellow-800/30",
          keyBg: "bg-yellow-900/20 border-yellow-700/50"
        };
      default:
        return {
          shortcutBg: "bg-muted/50 border-border",
          keyBg: "bg-muted border-muted-foreground/20"
        };
    }
  };
  
  const themeStyles = getThemeStyles();
  
  // Render keyboard shortcut key
  const renderKey = (key: string) => {
    return (
      <kbd className={cn(
        "inline-block px-2 py-1 rounded text-xs font-mono border",
        themeStyles.keyBg
      )}>
        {key}
      </kbd>
    );
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Keyboard className="size-5 text-primary" />
            <DialogTitle>Keyboard Shortcuts</DialogTitle>
          </div>
          <DialogDescription>
            Use these keyboard shortcuts to work more efficiently
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {Object.keys(groupedShortcuts).map((scope) => (
            <div key={scope}>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className={cn(
                  "px-2 py-0.5 font-medium",
                  scope === "global" ? "bg-primary/10 text-primary" : ""
                )}>
                  {getScopeLabel(scope)}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {groupedShortcuts[scope].map((shortcut) => (
                  <div 
                    key={shortcut.id}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md border",
                      themeStyles.shortcutBg
                    )}
                  >
                    <span className="text-sm">{shortcut.label}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.withCtrl && renderKey("Ctrl")}
                      {shortcut.withAlt && renderKey("Alt")}
                      {shortcut.withShift && renderKey("Shift")}
                      {renderKey(shortcut.key.toUpperCase())}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => onOpenChange(false)}
          >
            <Command className="size-4" />
            <span>Got it</span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 