import { ReactNode, useState } from "react";
import { MainNav } from "@/components/layout/MainNav";
import { Languages, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { KeyboardShortcutsDialog } from "@/components/layout/KeyboardShortcutsDialog";
import { Notification } from "@/components/ui/notification-toast";

interface MainLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function MainLayout({ children, hideNav = false }: MainLayoutProps) {
  const { theme } = useTheme();
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  
  // Initialize keyboard shortcuts
  const { shortcuts } = useKeyboardShortcuts({
    // Add any specific keyboard shortcut handlers here if needed
  });
  
  // Theme-specific classes for the footer
  const getThemeSpecificClasses = () => {
    switch (theme) {
      case "matrix":
        return "matrix-text";
      case "synthwave":
        return "gradient-text";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen pb-16 bg-gradient-to-b from-background to-muted/30">
      {/* Navigation Header */}
      {!hideNav && <MainNav />}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Languages className={cn("size-5 text-primary", getThemeSpecificClasses())} />
              <p className={cn("text-sm font-medium", getThemeSpecificClasses())}>
                TranslatePDF AI
              </p>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm text-muted-foreground">
                &copy; {new Date().getFullYear()} · Powered by React 19, Tailwind CSS v4, and Shadcn UI
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 px-2 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => setShowShortcutsHelp(true)}
              >
                <Keyboard className="size-3" />
                <span>Keyboard Shortcuts</span>
                <kbd className="text-[10px] font-mono bg-muted px-1 rounded">?</kbd>
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm" className="hover:text-primary">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
              </Button>
              <Button asChild variant="ghost" size="sm" className="hover:text-primary">
                <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
              </Button>
            </div>
          </div>
        </div>
      </footer>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog 
        open={showShortcutsHelp} 
        onOpenChange={setShowShortcutsHelp}
      />
    </div>
  );
} 