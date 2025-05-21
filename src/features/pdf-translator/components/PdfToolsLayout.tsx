import { Tabs, TabsList, TabsTrigger } from "@radix-ui/react-tabs";
import { PdfTranslatorPage } from "./PdfTranslatorPage";
import { TextTranslationPage } from "./TextTranslationPage";
import { TextExtractionPage } from "./TextExtractionPage";
import { FileText, Github, Home, Languages, Type } from "lucide-react";
import { ModeToggle as ThemeModeToggle } from "@/components/layout/mode-toggle";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PdfToolsLayout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentTab = 
    currentPath === "/extract" ? "extract" : 
    currentPath === "/text-translate" ? "text-translate" : 
    "translate";

  return (
    <div className="min-h-screen pb-16 bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-md z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:bg-primary/30 transition-colors"></div>
              <Languages className="size-7 text-primary relative z-10 group-hover:scale-110 transition-transform" />
              <div className="absolute -right-1 -top-1 z-20">
                <div className="size-2 rounded-full bg-primary group-hover:animate-ping"></div>
              </div>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              PolyLingo Hub
            </h1>
          </Link>
          
          <div className="flex items-center gap-3">
            <nav className="hidden md:flex">
              <ul className="flex items-center gap-2">
                <li>
                  <Button asChild variant="ghost" size="sm" className="group">
                    <Link to="/" className="flex items-center gap-1.5">
                      <Home className="size-4 group-hover:scale-110 transition-transform" />
                      <span>Home</span>
                    </Link>
                  </Button>
                </li>
                <li>
                  <Button 
                    asChild 
                    variant={currentTab === "translate" ? "secondary" : "ghost"} 
                    size="sm"
                    className={cn(
                      "group transition-all",
                      currentTab === "translate" ? "shadow-sm" : ""
                    )}
                  >
                    <Link to="/translate" className="flex items-center gap-1.5">
                      <FileText className="size-4 group-hover:scale-110 transition-transform" />
                      <span>PDF</span>
                    </Link>
                  </Button>
                </li>
                <li>
                  <Button 
                    asChild 
                    variant={currentTab === "text-translate" ? "secondary" : "ghost"} 
                    size="sm"
                    className={cn(
                      "group transition-all",
                      currentTab === "text-translate" ? "shadow-sm" : ""
                    )}
                  >
                    <Link to="/text-translate" className="flex items-center gap-1.5">
                      <Type className="size-4 group-hover:scale-110 transition-transform" />
                      <span>Text</span>
                    </Link>
                  </Button>
                </li>
                <li>
                  <Button 
                    asChild 
                    variant={currentTab === "extract" ? "secondary" : "ghost"} 
                    size="sm"
                    className={cn(
                      "group transition-all",
                      currentTab === "extract" ? "shadow-sm" : ""
                    )}
                  >
                    <Link to="/extract" className="flex items-center gap-1.5">
                      <FileText className="size-4 group-hover:scale-110 transition-transform" />
                      <span>Extract</span>
                    </Link>
                  </Button>
                </li>
              </ul>
            </nav>
            <Button 
              asChild 
              variant="outline" 
              size="icon" 
              className="hidden md:flex group hover:border-primary/50 hover:bg-primary/5"
            >
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                <Github className="size-4 group-hover:scale-110 transition-transform" />
              </a>
            </Button>
            <ThemeModeToggle />
          </div>
        </div>
      </header>

      {/* Tabs Navigation - Mobile Only */}
      <div className="md:hidden container mx-auto px-4 pt-6">
        <Tabs defaultValue={currentTab} value={currentTab} className="w-full" onValueChange={(value: string) => {
          if (value === "translate") {
            window.location.href = "/translate";
          } else if (value === "text-translate") {
            window.location.href = "/text-translate";
          } else {
            window.location.href = "/extract";
          }
        }}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="translate" className="flex items-center gap-2 data-[state=active]:shadow-sm">
              <FileText className="size-4" />
              <span>PDF</span>
            </TabsTrigger>
            <TabsTrigger value="text-translate" className="flex items-center gap-2 data-[state=active]:shadow-sm">
              <Type className="size-4" />
              <span>Text</span>
            </TabsTrigger>
            <TabsTrigger value="extract" className="flex items-center gap-2 data-[state=active]:shadow-sm">
              <FileText className="size-4" />
              <span>Extract</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 transition-all duration-300">
        {currentTab === "translate" ? <PdfTranslatorPage /> : 
         currentTab === "text-translate" ? <TextTranslationPage /> : 
         <TextExtractionPage />}
      </div>

      {/* Footer */}
      <footer className="border-t mt-16 py-6 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Languages className="size-5 text-primary" />
              <p className="text-sm font-medium">PolyLingo Hub</p>
            </div>
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} · Powered by React 19, Tailwind CSS v4, and Shadcn UI
            </p>
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
    </div>
  );
} 