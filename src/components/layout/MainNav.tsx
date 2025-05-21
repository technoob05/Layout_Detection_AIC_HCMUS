import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/layout/mode-toggle";
import {
  BarChart2,
  ChevronDown,
  FileText,
  Github,
  History,
  Home,
  Keyboard,
  Languages,
  Menu,
  MessageSquare,
  Mic,
  MoreHorizontal,
  NotebookPen,
  Settings,
  X,
  Brain,
  PencilRuler
} from "lucide-react";
import { useTheme } from "@/components/providers/theme-provider";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { KeyboardShortcutsDialog } from "@/components/layout/KeyboardShortcutsDialog";
import { VoiceCommandButton } from "@/components/layout/VoiceCommandButton";
import { VoiceCommandsDialog } from "@/components/layout/VoiceCommandsDialog";
import { UserNav } from "@/features/auth/components/UserNav";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  description?: string;
  isExternal?: boolean;
}

export function MainNav() {
  const location = useLocation();
  const { theme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [showVoiceCommandsDialog, setShowVoiceCommandsDialog] = useState(false);

  const mainNavItems: NavItem[] = [
    {
      label: "Home",
      href: "/",
      icon: <Home className="size-4" />
    },
    {
      label: "Translate",
      href: "/translate",
      icon: <Languages className="size-4" />
    },
    {
      label: "History",
      href: "/history",
      icon: <History className="size-4" />
    },
    {
      label: "Analytics",
      href: "/analytics",
      icon: <BarChart2 className="size-4" />
    }
  ];

  const resourceItems: NavItem[] = [
    {
      label: "Chat",
      href: "/chat",
      icon: <MessageSquare className="size-4" />,
      description: "Chat with your PDFs"
    },
    {
      label: "Notebook",
      href: "/notebook",
      icon: <NotebookPen className="size-4" />,
      description: "Take notes while translating"
    },
    {
      label: "Learning Materials",
      href: "/learning-materials",
      icon: <Brain className="size-4" />,
      description: "Generate AI study materials"
    },
    {
      label: "PDF Editor",
      href: "/pdf-editor",
      icon: <PencilRuler className="size-4" />,
      description: "Annotate and translate PDFs"
    }
  ];

  const externalItems: NavItem[] = [
    {
      label: "GitHub",
      href: "https://github.com",
      icon: <Github className="size-4" />,
      isExternal: true
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Theme-specific classes
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

  // Logo with theme-specific styling
  const Logo = () => (
    <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity group">
      <div className="relative">
        <div className={cn(
          "absolute inset-0 rounded-full blur-md transition-colors",
          theme === "synthwave" ? "bg-primary/60" : "bg-primary/20 group-hover:bg-primary/30"
        )}></div>
        <Languages className={cn(
          "size-7 relative z-10 group-hover:scale-110 transition-transform",
          theme === "matrix" ? "matrix-text text-primary" : "text-primary"
        )} />
        <div className="absolute -right-1 -top-1 z-20">
          <div className={cn(
            "size-2 rounded-full bg-primary",
            theme === "cyberpunk" ? "animate-pulse" : "group-hover:animate-ping"
          )}></div>
        </div>
      </div>
      <h1 className={cn(
        "text-xl font-bold",
        theme === "synthwave" 
          ? "gradient-text" 
          : "bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
      )}>
        TranslatePDF AI
      </h1>
    </Link>
  );

  return (
    <>
      <header 
        className={cn(
          "border-b sticky top-0 backdrop-blur-md z-10 transition-all duration-300",
          scrolled 
            ? "bg-background/95 shadow-md" 
            : "bg-background/80"
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Logo />
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {mainNavItems.map((item) => (
                <Button 
                  key={item.href}
                  asChild 
                  variant={isActive(item.href) ? "secondary" : "ghost"} 
                  size="sm" 
                  className={cn(
                    "group transition-all",
                    isActive(item.href) && "shadow-sm"
                  )}
                >
                  <Link to={item.href} className="flex items-center gap-1.5">
                    <span className={cn(
                      "group-hover:scale-110 transition-transform",
                      getThemeSpecificClasses()
                    )}>
                      {item.icon}
                    </span>
                    <span className={cn(getThemeSpecificClasses())}>
                      {item.label}
                    </span>
                  </Link>
                </Button>
              ))}

              {/* Resources dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="flex items-center gap-1.5 group"
                  >
                    <span>Resources</span>
                    <ChevronDown className="size-3.5 group-data-[state=open]:rotate-180 transition-transform" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Additional tools</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {resourceItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={item.href} className="flex gap-2 items-center cursor-pointer">
                        <span className="text-muted-foreground">{item.icon}</span>
                        <div className="flex flex-col">
                          <span>{item.label}</span>
                          {item.description && (
                            <span className="text-xs text-muted-foreground">{item.description}</span>
                          )}
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </nav>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {/* Desktop action buttons */}
              <div className="hidden md:flex items-center gap-2">
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="group hover:border-primary/50 hover:bg-primary/5"
                        onClick={() => setShowShortcutsHelp(true)}
                      >
                        <Keyboard className="size-4 group-hover:scale-110 transition-transform" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Keyboard Shortcuts</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Voice Command Button */}
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="group hover:border-primary/50 hover:bg-primary/5"
                        onClick={() => setShowVoiceCommandsDialog(true)}
                      >
                        <Mic className={cn("size-4 group-hover:scale-110 transition-transform", getThemeSpecificClasses())} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Voice Commands</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        asChild 
                        variant={isActive("/settings") ? "secondary" : "outline"}
                        size="icon" 
                        className="group hover:border-primary/50 hover:bg-primary/5"
                      >
                        <Link to="/settings">
                          <Settings className="size-4 group-hover:scale-110 transition-transform" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Settings</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                {externalItems.map((item) => (
                  <TooltipProvider delayDuration={300} key={item.href}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          asChild 
                          variant="outline" 
                          size="icon" 
                          className="group hover:border-primary/50 hover:bg-primary/5"
                        >
                          <a href={item.href} target="_blank" rel="noopener noreferrer">
                            {item.icon}
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{item.label}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
              
              {/* Mobile action buttons - More compact with dropdown */}
              <div className="md:hidden flex items-center gap-2">
                {/* Dropdown for additional actions on mobile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="group hover:border-primary/50 hover:bg-primary/5"
                    >
                      <MoreHorizontal className="size-4 group-hover:scale-110 transition-transform" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => setShowShortcutsHelp(true)}
                    >
                      <Keyboard className="size-4" />
                      <span>Keyboard Shortcuts</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => setShowVoiceCommandsDialog(true)}
                    >
                      <Mic className={cn("size-4", getThemeSpecificClasses())} />
                      <span>Voice Commands</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                        <Settings className="size-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {externalItems.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </a>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Theme toggle and User Avatar - always visible */}
              <ModeToggle />
              <UserNav />

              {/* Mobile menu button */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[80%] sm:w-[350px]">
                  <SheetHeader className="border-b pb-4">
                    <SheetTitle className={cn(getThemeSpecificClasses())}>
                      TranslatePDF AI
                    </SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-[calc(100vh-8rem)] py-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium text-muted-foreground px-1">
                          Main Navigation
                        </h3>
                        {mainNavItems.map((item) => (
                          <Button
                            key={item.href}
                            asChild
                            variant={isActive(item.href) ? "secondary" : "ghost"}
                            className={cn(
                              "justify-start",
                              isActive(item.href) && "font-medium"
                            )}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Link to={item.href} className="flex items-center gap-3">
                              <span className={getThemeSpecificClasses()}>{item.icon}</span>
                              <span className={getThemeSpecificClasses()}>{item.label}</span>
                            </Link>
                          </Button>
                        ))}
                      </div>

                      <div className="flex flex-col gap-2 pt-2 border-t">
                        <h3 className="text-sm font-medium text-muted-foreground px-1 mt-2">
                          Resources
                        </h3>
                        {resourceItems.map((item) => (
                          <Button
                            key={item.href}
                            asChild
                            variant={isActive(item.href) ? "secondary" : "ghost"}
                            className="justify-start"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <Link to={item.href} className="flex items-center gap-3">
                              <span className={getThemeSpecificClasses()}>{item.icon}</span>
                              <span>
                                <span className={getThemeSpecificClasses()}>{item.label}</span>
                                {item.description && (
                                  <span className="block text-xs text-muted-foreground">
                                    {item.description}
                                  </span>
                                )}
                              </span>
                            </Link>
                          </Button>
                        ))}
                      </div>

                      <div className="flex flex-col gap-2 pt-2 mt-4 border-t">
                        <h3 className="text-sm font-medium text-muted-foreground px-1 mt-2">
                          Settings & Links
                        </h3>
                        <Button
                          variant="ghost"
                          className="justify-start"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setShowShortcutsHelp(true);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Keyboard className="size-4" />
                            <span>Keyboard Shortcuts</span>
                          </div>
                        </Button>
                        
                        {/* Voice Commands in mobile menu */}
                        <Button
                          variant="ghost"
                          className="justify-start"
                          onClick={() => {
                            setIsMobileMenuOpen(false);
                            setShowVoiceCommandsDialog(true);
                          }}
                        >
                          <div className="flex items-center gap-3">
                            <Mic className={cn("size-4", getThemeSpecificClasses())} />
                            <span>Voice Commands</span>
                          </div>
                        </Button>
                        
                        <Button
                          asChild
                          variant={isActive("/settings") ? "secondary" : "ghost"}
                          className="justify-start"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Link to="/settings" className="flex items-center gap-3">
                            <Settings className="size-4" />
                            <span>Settings</span>
                          </Link>
                        </Button>

                        {externalItems.map((item) => (
                          <Button
                            key={item.href}
                            asChild
                            variant="ghost"
                            className="justify-start"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <a 
                              href={item.href} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-3"
                            >
                              {item.icon}
                              <span>{item.label}</span>
                            </a>
                          </Button>
                        ))}
                      </div>
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog 
        open={showShortcutsHelp} 
        onOpenChange={setShowShortcutsHelp}
      />
      
      {/* Voice Commands Dialog */}
      <VoiceCommandsDialog 
        open={showVoiceCommandsDialog} 
        onOpenChange={setShowVoiceCommandsDialog}
      />
    </>
  );
} 