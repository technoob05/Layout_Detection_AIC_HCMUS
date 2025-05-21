import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  BookOpen, 
  Headphones,
  MessageSquare,
  GitBranch,
  Loader
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { SourceGuide, NotebookView } from "../types";

const iconMap: Record<string, React.ReactNode> = {
  'message-square': <MessageSquare className="size-4" />,
  'book-open': <BookOpen className="size-4" />,
  'headphones': <Headphones className="size-4" />,
  'git-branch': <GitBranch className="size-4" />
};

interface NotebookSidebarProps {
  expanded: boolean;
  onToggleExpand: () => void;
  sourceGuide: SourceGuide | null;
  isLoading: boolean;
  activeView: string;
  onChangeView: (view: NotebookView['type']) => void;
  availableViews: NotebookView[];
  className?: string;
}

export function NotebookSidebar({ 
  expanded, 
  onToggleExpand,
  sourceGuide,
  isLoading,
  activeView,
  onChangeView,
  availableViews,
  className 
}: NotebookSidebarProps) {
  const [activeSection, setActiveSection] = useState<number | null>(null);
  
  // Set the first section as active when sourceGuide loads
  useEffect(() => {
    if (sourceGuide && sourceGuide.sections.length > 0 && activeSection === null) {
      setActiveSection(0);
    }
  }, [sourceGuide, activeSection]);
  
  return (
    <div className={cn(
      "bg-muted/40 border-r flex flex-col transition-all duration-300 ease-in-out",
      expanded ? "w-80" : "w-14",
      className
    )}>
      {/* Sidebar Header with Views */}
      <div className="flex flex-col p-2 gap-1 border-b">
        {availableViews.map((view) => (
          <Button
            key={view.type}
            variant={activeView === view.type ? "secondary" : "ghost"}
            className={cn(
              "justify-start",
              !expanded && "justify-center px-2"
            )}
            onClick={() => onChangeView(view.type)}
          >
            {iconMap[view.icon] || <FileText className="size-4" />}
            {expanded && <span className="ml-2">{view.title}</span>}
          </Button>
        ))}
      </div>
      
      {/* Sidebar Content */}
      <div className="flex-1 overflow-auto">
        {expanded && activeView === 'sources' && (
          <div className="p-3 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-40">
                <Loader className="size-6 text-muted-foreground animate-spin" />
                <span className="ml-2 text-muted-foreground">Analyzing document...</span>
              </div>
            ) : sourceGuide ? (
              <>
                <h2 className="text-lg font-medium">Source Guide</h2>
                <div className="space-y-2">
                  {sourceGuide.sections.map((section, index) => (
                    <div 
                      key={index}
                      className={cn(
                        "p-3 rounded-md cursor-pointer transition-colors",
                        activeSection === index 
                          ? "bg-primary/10 border-l-2 border-primary" 
                          : "hover:bg-muted"
                      )}
                      onClick={() => setActiveSection(index)}
                    >
                      <h3 className="font-medium">{section.title}</h3>
                      {activeSection === index && (
                        <>
                          <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                            {section.content}
                          </p>
                          <div className="text-xs text-muted-foreground mt-2">
                            Pages: {section.pages.join(", ")}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground text-center py-6">
                No source information available
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Collapse/Expand Button */}
      <div className="p-2 border-t">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onToggleExpand}
        >
          {expanded ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />}
        </Button>
      </div>
    </div>
  );
} 